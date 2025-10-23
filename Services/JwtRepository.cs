using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MobileAppServer.Abstracts;
using MobileAppServer.Entities;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MobileAppServer.Services
{
    public class JwtRepository : IJwtRepository
    {
        private readonly IConfiguration _configuration;
        private readonly IConnectionMultiplexer _redis;
        private readonly JwtSecurityTokenHandler _tokenHandler;
        private readonly IDatabase _db;

        public JwtRepository(IConfiguration configuration, IConnectionMultiplexer connectionMultiplexer)
        {
            _configuration = configuration;
            _redis = connectionMultiplexer;
            _db = connectionMultiplexer.GetDatabase();
            _tokenHandler = new JwtSecurityTokenHandler();

        }
        public string GenerateToken(UserEntity user)
        {
            
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!));
                var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub,user.Id.ToString()),
                    new Claim("phone",user.Phone),
                    new Claim(JwtRegisteredClaimNames.Email,user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())
                };

                var token=new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience:_configuration["JwtSettings:Audience"],
                claims:claims,
                expires:DateTime.UtcNow.AddHours(1),
                signingCredentials:credentials
                );
            return _tokenHandler.WriteToken(token);

        }

        public string GetEmailFromToken(string token)
        {
            if(string.IsNullOrEmpty(token))
                    return string.Empty;
            try
            {
                var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true, 
                    ValidateAudience = true, 
                    ValidateLifetime = false 
                };

                var principal = _tokenHandler.ValidateToken(token, validationParameters, out _);
                return principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        public long GetUserIdFromToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                throw new ArgumentException("Токен не может быть пустым");
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false 
            };

            var principal = _tokenHandler.ValidateToken(token, validationParameters, out _);
            var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub);

            if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
                throw new SecurityTokenException("Invalid token");

            return userId;
        }

        public async Task<bool> IsTokenRevokedAsync(string token)
        {
            var accessTokenKey = $"access_token:{token}";
            return !await _db.KeyExistsAsync(accessTokenKey);
        }

        public async Task RevokeTokenAsync(string token)
        {
            var transaction = _db.CreateTransaction();

            var accessTokenKey = $"access_token:{token}";
            var userId = await _db.StringGetAsync(accessTokenKey);

            if (!userId.IsNull)
            {
                var userTokensKey = $"user_tokens:{userId}";
                await transaction.SetRemoveAsync(userTokensKey, token);
            }

            transaction.KeyDeleteAsync(accessTokenKey);

            await transaction.ExecuteAsync();
        }
        public async Task<bool> RevokeAllUserTokensAsync(long userId)
        {
            try
            {
                var transaction = _db.CreateTransaction();
                var userTokensKey = $"user_tokens:{userId}";

                var tokenEntries = await _db.SetMembersAsync(userTokensKey);

                if (tokenEntries.Any())
                {
                    foreach (var tokenEntry in tokenEntries)
                    {
                        var token = tokenEntry.ToString();

                        transaction.KeyDeleteAsync($"access_token:{token}");
                        transaction.KeyDeleteAsync($"refresh_token:{token}");
                    }
                }

                transaction.KeyDeleteAsync(userTokensKey);

                bool committed = await transaction.ExecuteAsync();
                return committed;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Не удалось выполнить  {userId}: {ex.Message}");
                return false;
            }
        }
        public async Task StoreTokensAsync(long userId, string accessToken, string refreshToken, TimeSpan expiry)
        {
            var accessTokenKey = $"access_token:{accessToken}";
            var refreshTokenKey = $"refresh_token:{refreshToken}";
            var userTokensKey = $"user_tokens:{userId}";

            var transaction = _db.CreateTransaction();

            transaction.StringSetAsync(accessTokenKey, userId.ToString(), expiry);
            var refreshExpiry = expiry.Add(TimeSpan.FromDays(7));
            transaction.StringSetAsync(refreshTokenKey, userId.ToString(), refreshExpiry);
            transaction.SetAddAsync(userTokensKey, accessToken);
            transaction.SetAddAsync(userTokensKey, refreshToken);

            transaction.KeyExpireAsync(userTokensKey, TimeSpan.FromDays(30));

            await transaction.ExecuteAsync();
        }

        public async Task<long?> ValidateToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var revokedKey = $"revoked_token:{token}";
            var isRevoked = await _db.KeyExistsAsync(revokedKey);
            if (isRevoked)
                return null;

      
                var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = _tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

                var userIdClaim = principal.FindFirst("userId") ??
                                principal.FindFirst(ClaimTypes.NameIdentifier) ??
                                principal.FindFirst(JwtRegisteredClaimNames.Sub);

                if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
                    return null;
                var accessTokenKey = $"access_token:{token}";
                var storedUserId = await _db.StringGetAsync(accessTokenKey);
                if (storedUserId.IsNull || !storedUserId.ToString().Equals(userId.ToString()))
                    return null;

                return userId;
            }
       
        }
    }

