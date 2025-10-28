using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MobileAppServer.Abstracts;
using MobileAppServer.Models.Identity;
using MobileAppServer.Services;

namespace MobileAppServer.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        public AuthController(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            var result = await _authRepository.RegisterAsync(registerDTO);
            if (result.Message.Contains("Пользователь с таким Email уже есть") || result.Message.Contains("Пароли не совпадают"))
            {
                return BadRequest(result); 
            }
            return Ok(result);
        }
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody]LoginDTO loginDTO)
        {
            var result =await _authRepository.LoginAsync(loginDTO);
            return Ok(result);
        }
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new { Message = "Нужен токен" });
                }
                await _authRepository.LogoutAsync(token);
                return Ok(new { Message = "Выход успешен" });

            }
            catch (Exception ex) 
            {
                return StatusCode(500, new { Message =  $"Вход не успешен:{ex.Message}" }); 
            }

        }
        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult>RefreshToken([FromBody]RefreshTokenDTO refreshTokenDTO)
        {
            try
            {
                var result = await _authRepository.RefreshTokenAsync(refreshTokenDTO);
                if (result.Message.Contains("Неверный") || result.Message.Contains("не найден"))
                {
                    return Unauthorized(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponseDTO {
                    Message = $"Ошибка обновления токена {ex.Message}" }
                );
            }
        }
        //[HttpGet("profile")]
        //[Authorize]
        //public async Task<IActionResult> GetProfile()
        //{

        //}
        [HttpGet("session")]
        [Authorize]
        public async Task<IActionResult> ValidateSession()
        {
            try
            {
                var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (string.IsNullOrEmpty(token))
                {
                    return Ok(new { HasActiveSession = false, Message = "Токен не найден" });
                }
                var hasActiveSession = await _authRepository.ValidateSessionAsync(token);

                return Ok(new
                {
                    HasActiveSession = hasActiveSession,
                    Message = hasActiveSession ? "Сессия активна" : "Сессия окончена"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Сессия не валидна {ex.Message}" });
            }
        }
    }
}
