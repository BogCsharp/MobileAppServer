using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAppServer.Data;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Employee;
using MobileAppServer.Models.Service;
using System.Security.Claims;

namespace MobileAppServer.Controllers
{
    [ApiController]
    [Route("api/employee")]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmployeeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<ActionResult<EmployeeMeDTO>> GetMe()
        {
            var employee = await GetCurrentEmployeeAsync();
            if (employee == null)
            {
                return Forbid();
            }

            return Ok(new EmployeeMeDTO
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                Phone = employee.Phone,
                Position = employee.Position,
                IsActive = employee.isActive,
                UserId = employee.UserId
            });
        }

        [HttpPatch("me/active")]
        public async Task<ActionResult<EmployeeMeDTO>> UpdateMyActiveStatus([FromBody] UpdateEmployeeActiveDTO dto)
        {
            var employee = await GetCurrentEmployeeAsync();
            if (employee == null)
            {
                return Forbid();
            }

            employee.isActive = dto.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new EmployeeMeDTO
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                Phone = employee.Phone,
                Position = employee.Position,
                IsActive = employee.isActive,
                UserId = employee.UserId
            });
        }

        [HttpGet("me/orders")]
        public async Task<ActionResult<List<OrderDTO>>> GetMyOrders()
        {
            var employee = await GetCurrentEmployeeAsync();
            if (employee == null)
            {
                return Forbid();
            }

            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.EmployeeId == employee.Id)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Service)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders.Select(o => o.ToDto()).ToList());
        }

        private async Task<Entities.EmployeeEntity?> GetCurrentEmployeeAsync()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                return null;
            }

            var userId = long.Parse(userIdClaim);
            return await _context.Employee.FirstOrDefaultAsync(e => e.UserId == userId);
        }
    }
}
