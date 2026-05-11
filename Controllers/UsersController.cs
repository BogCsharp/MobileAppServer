using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAppServer.Data;
using MobileAppServer.Models.Identity;
using System.Security.Claims;

namespace MobileAppServer.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<UserDTO>>> SearchClients([FromQuery] string email)
        {
            if (!await IsAdminAsync())
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return Ok(new List<UserDTO>());
            }

            var users = await _context.Users
                .AsNoTracking()
                .Where(u => u.RoleId == (int)Entities.UserRoleType.Client)
                .Where(u => u.Email.Contains(email))
                .OrderBy(u => u.Email)
                .Take(20)
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    Surname = u.Surname,
                    Email = u.Email,
                    Phone = u.Phone,
                    RoleId = u.RoleId,
                    Birthday = u.Birthday
                })
                .ToListAsync();

            return Ok(users);
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
            return user?.RoleId == (int)Entities.UserRoleType.Admin;
        }
    }
}
