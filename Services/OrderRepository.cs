using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;

namespace MobileAppServer.Services
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _dbContext;
        private readonly ICartRepository _cart;

        public OrderRepository(AppDbContext dbContext,ICartRepository cart)
        {
            _dbContext = dbContext;
            _cart = cart;
        }

        public async Task<OrderEntity> GetByIdAsync(long id)
        {
            var entity = await _dbContext.Set<OrderEntity>()
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Car)
                .Include(o => o.Employee)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Service)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
            {
                throw new KeyNotFoundException($"Order with id {id} not found");
            }

            return entity;
        }

        public async Task<List<OrderEntity>> GetAllAsync()
        {
            return await _dbContext.Set<OrderEntity>()
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Car)
                .Include(o => o.Employee)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Service)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<OrderEntity>> GetByUserIdAsync(long userId)
        {
            return await _dbContext.Set<OrderEntity>()
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Car)
                .Include(o => o.Employee)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Service)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<OrderEntity> CreateAsync(OrderEntity order)
        {
            _dbContext.Set<OrderEntity>().Add(order);
            await _dbContext.SaveChangesAsync();
            return order;
        }

        public async Task<OrderEntity> UpdateAsync(OrderEntity order)
        {
            var entity = await _dbContext.Set<OrderEntity>().FirstOrDefaultAsync(x => x.Id == order.Id);
            if (entity == null)
            {
                throw new ArgumentException($"Order with id {order.Id} not found");
            }

            entity.Status = order.Status;
            entity.TotalAmount = order.TotalAmount;
            entity.DiscountAmount = order.DiscountAmount;
            entity.FinalAmount = order.FinalAmount;
            entity.CompletedAt = order.CompletedAt;
            entity.Notes = order.Notes;
            entity.EmployeeId = order.EmployeeId;

            await _dbContext.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var entity = await _dbContext.Set<OrderEntity>().FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return false;
            }

            _dbContext.Set<OrderEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<OrderEntity> CreateFromCartAsync(long userId, long carId, long? employeeId, string notes, decimal? discountAmount)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var cartTotal = await _cart.GetCartTotalAsync(userId);
                var cart = await _dbContext.Set<CartEntity>()
                    .Include(c => c.CartItems).FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || !cart.CartItems.Any())
                {
                    throw new InvalidOperationException("Корзина пуста");
                }

                var order = new OrderEntity
                {
                    UserId = userId,
                    CarId = carId,
                    EmployeeId = employeeId,
                    Notes = notes,
                    DiscountAmount = discountAmount ?? 0,
                    Status = OrderStatus.Pending,
                    OrderNumber = GenerateOrderNumber(),
                    TotalAmount = cartTotal,
                    FinalAmount = cartTotal- (discountAmount ?? 0),
                    CreatedAt = DateTime.UtcNow
                    
                };

                _dbContext.Set<OrderEntity>().Add(order);
                await _dbContext.SaveChangesAsync();

                // создаём позиции заказа из корзины
                var orderItems = cart.CartItems.Select(ci => new OrderItemEntity
                {
                    OrderId = order.Id,
                    ServiceId = ci.ServiceId,
                    Name = ci.Name,
                    Price = ci.Price,
                    Quantity = ci.Quantity
                }).ToList();

                _dbContext.Set<OrderItemEntity>().AddRange(orderItems);

                _dbContext.Set<CartItemEntity>().RemoveRange(cart.CartItems);

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return order;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}