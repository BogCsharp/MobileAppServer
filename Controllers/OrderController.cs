using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;
using MobileAppServer.Extensions;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Employee;
using MobileAppServer.Models.Order;
using MobileAppServer.Models.Service;
using MobileAppServer.Queue;
using MobileAppServer.Services;
using System.Security.Claims;

namespace MobileAppServer.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IEmailRepository _emailRepo;
        private readonly AppDbContext _context;

        public OrderController(IOrderRepository orderRepo, IEmailRepository emailRepo,IBackgroundTaskQueue backgroundTaskQueue,AppDbContext appDbContext)
        {
            _backgroundTaskQueue = backgroundTaskQueue;
            _orderRepo = orderRepo;
            _emailRepo = emailRepo;
            _context = appDbContext;
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<OrderDTO>> Get(long id)
        {
            try
            {
                var entity = await _orderRepo.GetByIdAsync(id);
                return Ok(entity.ToDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderDTO>>> GetAll()
        {
            var items = await _orderRepo.GetAllAsync();
            return Ok(items.Select(o => o.ToDto()).ToList());
        }

        [HttpGet("user/{userId:long}")]
        public async Task<ActionResult<List<OrderDTO>>> GetByUser(long userId)
        {
            var items = await _orderRepo.GetByUserIdAsync(userId);
            return Ok(items.Select(o => o.ToDto()).ToList());
        }

        [HttpPost("from-cart")]
        public async Task<ActionResult<OrderDTO>> CreateFromCart(CreateOrderDTO dto)
        {
            try
            {
                var order = await _orderRepo.CreateFromCartAsync(
                    dto.UserId,
                    dto.CarId,
                    dto.EmployeeId,
                    dto.Notes,
                    dto.DiscountAmount
                );
                return CreatedAtAction(nameof(Get), new { id = order.Id }, order.ToDto());
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPost("revenue")]
        public async Task<ActionResult<ResponceReportDTO>> GetRevenueReport([FromBody]PeriodReportRequestDTO request)
        {
            if (request.StartDate > request.EndDate)
                return BadRequest("StartDate must be less than or equal to EndDate");

            var report = await _orderRepo.GetRevenueReportAsync(request.StartDate, request.EndDate);
            return Ok(report);
        }
        [HttpPost("employee-earn")]//route для мастеров
        [Authorize]
        public async Task<ActionResult<EmployeeEarningsDTO>> GetEmployeeEarnings([FromBody]EmployeePeriodRequestDTO request)
        {
            if (request.StartDate > request.EndDate)
                return BadRequest("StartDate must be less than or equal to EndDate");

            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var employee = await _context.Employee.FirstOrDefaultAsync(e => e.UserId == userId);
            if (employee == null) return Forbid(); // этот пользователь не мастер

            var report = await _orderRepo.GetEmployeeEarningsByIdAsync(employee.Id, request.StartDate, request.EndDate);
            return Ok(report);
        }
        [HttpPost("employee-earn-admin")]//route для админа
        [Authorize]
        public async Task<ActionResult<EmployeeEarningsDTO>> GetEarningsForEmployee([FromBody] EmployeePeriodRequestDTO request)
        {
            if (!await IsAdminAsync())
            {
                return Forbid();
            }

            if (request.StartDate > request.EndDate)
                return BadRequest("StartDate must be less than or equal to EndDate");

            var report = await _orderRepo.GetEmployeeEarningsByIdAsync(request.EmployeeId, request.StartDate, request.EndDate);
            return Ok(report);
        }
        [HttpPut("{id:long}")]
        public async Task<ActionResult<OrderDTO>> Update(long id, OrderDTO dto)
        {
            try
            {
                var existingOrder = await _orderRepo.GetByIdAsync(id);

                if (existingOrder == null)
                {
                    return NotFound($"Order with ID {id} not found");
                }

                existingOrder.Status = dto.Status;
                existingOrder.Notes = dto.Notes;

                if (dto.DiscountAmount>0)
                {
                    existingOrder.DiscountAmount = dto.DiscountAmount;
                    existingOrder.FinalAmount = existingOrder.TotalAmount - dto.DiscountAmount;
                }

                if (dto.Status == OrderStatus.Completed && existingOrder.CompletedAt == null)
                {
                    existingOrder.CompletedAt = DateTime.Now;
                }

                var updated = await _orderRepo.UpdateAsync(existingOrder);
                return Ok(updated.ToDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id:long}/admin-status")]
        [Authorize]
        public async Task<ActionResult<OrderDTO>> UpdateStatusAsAdmin(long id, [FromBody] UpdateOrderStatusDTO dto)
        {
            try
            {
                if (!await IsAdminAsync())
                {
                    return Forbid();
                }

                var order = await _orderRepo.GetByIdAsync(id);
                order.Status = dto.Status;

                if (dto.Status == OrderStatus.Completed && !order.CompletedAt.HasValue)
                {
                    order.CompletedAt = DateTime.Now;
                }

                if (dto.Status != OrderStatus.Completed)
                {
                    order.CompletedAt = null;
                }

                var updated = await _orderRepo.UpdateAsync(order);
                return Ok(updated.ToDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id:long}")]
        public async Task<ActionResult> Delete(long id)
        {
            var ok = await _orderRepo.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }

        [HttpPatch("{id:long}/status")]
        [Authorize]
        public async Task<ActionResult<OrderDTO>> UpdateStatus(long id, [FromBody] UpdateOrderStatusDTO dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized("Пользователь не определен");
                }

                var userId = long.Parse(userIdClaim);
                var employee = await _context.Employee.FirstOrDefaultAsync(e => e.UserId == userId);
                if (employee == null)
                {
                    return Forbid();
                }

                var order = await _orderRepo.GetByIdAsync(id);
                if (order.EmployeeId != employee.Id)
                {
                    return Forbid();
                }

                var isActiveOrder =
                    order.Status == OrderStatus.Pending ||
                    order.Status == OrderStatus.Confirmed ||
                    order.Status == OrderStatus.InProgress;
                if (!isActiveOrder)
                {
                    return BadRequest("Можно менять статус только у активных заказов");
                }

                var allowedTargetStatus =
                    dto.Status == OrderStatus.InProgress ||
                    dto.Status == OrderStatus.Completed ||
                    dto.Status == OrderStatus.Cancelled;
                if (!allowedTargetStatus)
                {
                    return BadRequest("Недопустимый статус для мастера");
                }

                order.Status = dto.Status;
                
                if (dto.Status == OrderStatus.Completed)
                {
                    order.CompletedAt = DateTime.Now;
                }

                var updated = await _orderRepo.UpdateAsync(order);
                var user = await _context.Users.FindAsync(order.UserId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
                    {
                        await _emailRepo.SendOrderStatusChangedAsync(
                            user.Email,
                            order.OrderNumber,
                            dto.Status.GetDisplayName());
                    });
                }
                return Ok(updated.ToDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id:long}/cancel")]
        [Authorize]
        public async Task<ActionResult<OrderDTO>> CancelByClient(long id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(userIdClaim))
                {
                    return Unauthorized("Пользователь не определен");
                }

                var userId = long.Parse(userIdClaim);
                var order = await _orderRepo.GetByIdAsync(id);

                if (order.UserId != userId)
                {
                    return Forbid();
                }

                if (order.Status == OrderStatus.Completed || order.Status == OrderStatus.Paid)
                {
                    return BadRequest("Нельзя отменить завершенный или оплаченный заказ");
                }

                if (order.Status == OrderStatus.Cancelled)
                {
                    return Ok(order.ToDto());
                }

                order.Status = OrderStatus.Cancelled;
                var updated = await _orderRepo.UpdateAsync(order);
                return Ok(updated.ToDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private async Task<bool> IsAdminAsync()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                return false;
            }

            var userId = long.Parse(userIdClaim);
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            return user?.RoleId == (int)UserRoleType.Admin;
        }
    }

    public class UpdateOrderStatusDTO
    {
        public OrderStatus Status { get; set; }
    }

}