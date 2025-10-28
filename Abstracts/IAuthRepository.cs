using MobileAppServer.Models.Identity;

namespace MobileAppServer.Abstracts
{
    public interface IAuthRepository
    {
        Task<AuthResponseDTO>RegisterAsync(RegisterDTO registerDTO);
        Task<AuthResponseDTO>LoginAsync(LoginDTO loginDTO);
        Task LogoutAsync(string accessToken);
        Task<AuthResponseDTO>RefreshTokenAsync(RefreshTokenDTO refreshTokenDTO);
        Task<bool>ValidateSessionAsync(string accessToken);
    }
}
