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
                Phone = user.Phone
            };
        }
        public static AuthResponseDTO ToAuthResponse(this UserEntity user, string token, string refreshToken)
        {
            return new AuthResponseDTO
            {
                Message = "Success",
                AccessToken=token,
                RefreshToken=refreshToken,
                TokenExpiry=DateTime.UtcNow.AddMinutes(60),
                User=user.ToDto()

            };
        }
    }
}
