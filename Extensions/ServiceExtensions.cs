using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Services;
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
            builder.Services.AddScoped<IServiceRepository,ServiceRepository>();
            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<ICartRepository, CartRepository>();
            return builder;
        }
    }
}
