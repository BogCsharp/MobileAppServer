using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Models;
using MobileAppServer.Services;
using StackExchange.Redis;
using System.Text;
namespace MobileAppServer.Extensions
{
    public static class ServiceExtensions
    {
        public static WebApplicationBuilder AddData(this WebApplicationBuilder builder)
        {
            builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), new MySqlServerVersion(new Version(8, 0, 34))));
            return builder;
        }
        public static WebApplicationBuilder AddServices(this WebApplicationBuilder builder)
        {
            builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<ICartRepository, CartRepository>();
            builder.Services.AddScoped<IJwtRepository, JwtRepository>();
            builder.Services.AddSingleton<IPasswordRepository, PasswordRepository>();
            return builder;
        }
        public static WebApplicationBuilder AddJwtAuthentication(this WebApplicationBuilder builder)
        {
            var jwtSettings = new JwtSettings();
            builder.Configuration.GetSection("JwtSettings").Bind(jwtSettings);
            builder.Services.AddSingleton(jwtSettings);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var accessToken = context.HttpContext.Request.Headers["Authorization"]
                            .FirstOrDefault()?
                            .Replace("Bearer ", "");

                        if (string.IsNullOrEmpty(accessToken))
                        {
                            context.Fail("Authorization header is missing");
                            return;
                        }
                        var tokenService = context.HttpContext.RequestServices.GetRequiredService<IJwtRepository>();

                        if (await tokenService.IsTokenRevokedAsync(accessToken))
                        {
                            context.Fail("Token has been revoked");
                            return;
                        }

                    }
                };
            });
            builder.Services.AddAuthorization();

            return builder;
        }
        public static WebApplicationBuilder AddRedis(this WebApplicationBuilder builder)
        {
            builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
                ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")));
            return builder;
        }
    }
}
