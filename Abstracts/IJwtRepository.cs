using MobileAppServer.Entities;

namespace MobileAppServer.Abstracts
{
    public interface IJwtRepository
    {
        string GenerateToken(UserEntity user);

        Task<long?> ValidateToken(string token);
        string GetEmailFromToken(string token);
        long GetUserIdFromToken(string token);
        Task StoreTokensAsync(long userId, string accessToken, string refreshToken, TimeSpan expiry);
        Task RevokeTokenAsync(string token);
        Task<bool> IsTokenRevokedAsync(string token);
        Task<bool> RevokeAllUserTokensAsync(long userId);


    }
}
