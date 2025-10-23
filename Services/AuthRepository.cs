using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Identity;
using StackExchange.Redis;
using System.Runtime.InteropServices;

namespace MobileAppServer.Services
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;
        private readonly IJwtRepository _jwtService;
        private readonly IConnectionMultiplexer _redis;
        private readonly IPasswordRepository _passwordRepository;
        private readonly IAuthRepository _authRepository;
        private readonly IDatabase _db;

        public AuthRepository(AppDbContext context, IJwtRepository jwtService, IPasswordRepository passwordRepository,IAuthRepository authRepository,IConnectionMultiplexer connectionMultiplexer)
        {
            _authRepository= authRepository;
            _context = context;
            _redis= connectionMultiplexer;
            _jwtService = jwtService;
            _passwordRepository = passwordRepository;
            _db = connectionMultiplexer.GetDatabase();
        }

        public async Task<AuthResponseDTO> LoginAsync(LoginDTO loginDTO)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDTO.Email);
            if (user == null || !BCrypt.Net.BCrypt.EnhancedVerify(loginDTO.Password, user.Password))
            {
                throw new UnauthorizedAccessException("Неверный логин или пароль!");
            }
            var accessToken = _jwtService.GenerateToken(user);
            var refreshToken = _passwordRepository.GenerateRefreshToken();
            var expiry = TimeSpan.FromHours(1); 
            await _jwtService.StoreTokensAsync(user.Id, accessToken, refreshToken, expiry);
            return new AuthResponseDTO
            {
                Message = "Вход выполнен успешно!",
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    Phone = user.Phone,
                    Name = user.Name,
                    Surname = user.Surname,
                    RoleId=user.RoleId
                }
            };
        }

        public async Task LogoutAsync(string accessToken)
        {
            if (string.IsNullOrEmpty(accessToken))
                return;

            await _jwtService.RevokeTokenAsync(accessToken);
        }

        public async Task<AuthResponseDTO> RefreshTokenAsync(RefreshTokenDTO refreshTokenDTO)
        {
            var refreshTokenKey = $"refresh_token:{refreshTokenDTO.RefreshToken}";
            var userIdString = await _db.StringGetAsync(refreshTokenKey);


            if (userIdString.IsNull)
            {
                return new AuthResponseDTO { Message = "Неверный refresh_token " };
            }

            var userId = long.Parse(userIdString);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new AuthResponseDTO { Message = "Пользователь не найден" };
            }

            await _db.KeyDeleteAsync(refreshTokenKey);

            var newAccessToken = _jwtService.GenerateToken(user);
            var newRefreshToken = _passwordRepository.GenerateRefreshToken();
            var expiry = TimeSpan.FromHours(1);

            await _jwtService.StoreTokensAsync(userId, newAccessToken, newRefreshToken, expiry);

            return new AuthResponseDTO
            {
                Message = "Токен успешно обновлен",
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    Phone = user.Phone,
                    Name = user.Name,
                    Surname = user.Surname,
                    RoleId = user.RoleId
                }
            };
        }

        public async Task<AuthResponseDTO> RegisterAsync(RegisterDTO registerDTO)
        {
            if (await _context.Users.AnyAsync(c => c.Email == registerDTO.Email))
            {
                return new AuthResponseDTO { Message = "Пользователь с таким Email уже есть!" };
            }
            if (registerDTO.Password != registerDTO.ConfirmPassword)
            {
                return new AuthResponseDTO { Message = "Пароли не совпадают!" };
            }
            var user = new UserEntity
            {
                Phone = registerDTO.Phone,
                Email = registerDTO.Email,
                Name = registerDTO.Name,
                Surname = registerDTO.Surname,
                Password = _passwordRepository.CreatePasswordHash(registerDTO.Password),
                //Роль User
                RoleId=1,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            var accessToken = _jwtService.GenerateToken(user);
            var refreshToken=_passwordRepository.GenerateRefreshToken();
            var expiry = TimeSpan.FromHours(1);
            await _jwtService.StoreTokensAsync(user.Id, accessToken, refreshToken, expiry);
            return new AuthResponseDTO
            {
                Message = "Регистрация успешна!",
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = user.ToDto()
            };
        }

        public async Task<bool> ValidateSessionAsync(long userId)
        {
            var userTokensKey = $"user_tokens:{userId}";
            var tokens =await _db.SetMembersAsync(userTokensKey);
            return tokens!=null&&tokens.Length>0;
            
        }
    }
}
