using MobileAppServer.Entities;
using MobileAppServer.Models.Identity;

namespace MobileAppServer.Mappers
{
    public static class IdentityMapper
    {
        public static UserDTO ToDto(this UserEntity user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                Phone = user.Phone,
                RoleId = user.RoleId,
                Birthday= user.Birthday,
                Age=user.Age,
                RoleName = user.Role?.RoleName ?? string.Empty

            };
        }
        public static AuthResponseDTO ToAuthResponse(this UserEntity user, string token, string refreshToken,TimeSpan expiry,string message)
        {
            return new AuthResponseDTO
            {
                Message = message,
                AccessToken=token,
                RefreshToken=refreshToken,
                TokenExpiry= DateTime.UtcNow.Add(expiry),
                User= user.ToDto()

            };
        }
    }
}
