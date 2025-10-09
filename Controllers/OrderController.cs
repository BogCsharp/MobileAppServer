using Microsoft.AspNetCore.Mvc;
using MobileAppServer.Abstracts;
using MobileAppServer.Entities;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Order;
using MobileAppServer.Models.Service;

namespace MobileAppServer.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo;

        public OrderController(IOrderRepository orderRepo)
        {
            _orderRepo = orderRepo;
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

        [HttpPut("{id:long}")]
        public async Task<ActionResult<OrderDTO>> Update(long id, OrderDTO dto)
        {
            try
            {
                var existingOrder = await _orderRepo.GetByIdAsync(id);
                
                existingOrder.Status = dto.Status;
                existingOrder.Notes = dto.Notes;
                existingOrder.DiscountAmount = dto.DiscountAmount;
                existingOrder.FinalAmount = dto.TotalAmount - dto.DiscountAmount;
                
                if (dto.Status == OrderStatus.Completed)
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

        [HttpDelete("{id:long}")]
        public async Task<ActionResult> Delete(long id)
        {
            var ok = await _orderRepo.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }

        [HttpPatch("{id:long}/status")]
        public async Task<ActionResult<OrderDTO>> UpdateStatus(long id, [FromBody] UpdateOrderStatusDTO dto)
        {
            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                order.Status = dto.Status;
                
                if (dto.Status == OrderStatus.Completed)
                {
                    order.CompletedAt = DateTime.Now;
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
    }

    public class UpdateOrderStatusDTO
    {
        public OrderStatus Status { get; set; }
    }
}