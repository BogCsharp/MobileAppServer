using MobileAppServer.Abstracts;
using System.Security.Cryptography;

namespace MobileAppServer.Services
{
    public class PasswordRepository : IPasswordRepository
    {
        public string CreatePasswordHash(string password)
        {
            return BCrypt.Net.BCrypt.EnhancedHashPassword(password);
        }

        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }
    }
}
