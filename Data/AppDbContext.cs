using Microsoft.EntityFrameworkCore;
using MobileAppServer.Entities;

namespace MobileAppServer.Data
{
    public sealed class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<UserEntity> Users { get; set; }
        public DbSet<CarEntity> Cars { get; set; }
        public DbSet<CategoryEntity> Categories { get; set; }
        public DbSet<ServiceEntity> Services { get; set; }
        public DbSet<CartEntity> Carts { get; set; }
        public DbSet<CartItemEntity> CartItems { get; set; }
        public DbSet<OrderEntity> Orders { get; set; }
        public DbSet<OrderItemEntity> OrderItems { get; set; }
        public DbSet<EmployeeEntity> Employee { get; set; }
        public DbSet<UserRole> UserRole { get; set; }
		public DbSet<BookingEntity> Bookings { get; set; }
    }
}