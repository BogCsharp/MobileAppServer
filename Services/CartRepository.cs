using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;

namespace MobileAppServer.Services
{
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _context;
        public CartRepository(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }

        public async Task<CartItemEntity> AddToCartAsync(long userId, long serviceId, int quantity)
        {
            using var transaction =await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await GetCartByUserAsync(userId);

                var services = await _context.Services.FirstOrDefaultAsync(s => s.Id == serviceId) ??
                    throw new ArgumentException($"Услуга с Id {serviceId} не найдена");
                var existingItem = cart.CartItems.FirstOrDefault(ex => ex.ServiceId == serviceId);

                if (existingItem != null)
                {
                    existingItem.Quantity += quantity;
                    existingItem.Price = services.Price;
                }
                else
                {
                    var cartItem = new CartItemEntity()
                    {
                        Name = services.Name,
                        ServiceId = serviceId,
                        Quantity = quantity,
                        Price = services.Price,
                        CartId = cart.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.CartItems.Add(cartItem);
                    existingItem = cartItem;
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return existingItem;

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ClearCartAsync(long userId)
        {
            var cart=await GetCartByUserAsync(userId);
            if (!cart.CartItems.Any()) return true;
            _context.CartItems.RemoveRange(cart.CartItems);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CartEntity> CreateCartAsync(long userId)
        {
            var cart = new CartEntity
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            return cart;
        }

        public async Task<CartEntity> GetCartByUserAsync(long userId)
        {
            return await _context.Carts.Include(c=>c.CartItems).FirstOrDefaultAsync(ci=>ci.UserId==userId)??await CreateCartAsync(userId);
        }

        public async Task<int> GetCartItemsCountAsync(long userId)
        {
            var cart= await GetCartByUserAsync(userId);
            return cart.CartItems.Sum(c=>c.Quantity);
        }

        public async Task<decimal> GetCartTotalAsync(long userId)
        {
            var cart = await GetCartByUserAsync(userId);
            return cart.CartItems.Sum(ci=>ci.Price*ci.Quantity);
        }

        public async Task<bool> RemoveFromCartAsync(long userId, long cartItemId)
        {
            var cart=await GetCartByUserAsync(userId);
            var cartItem=cart.CartItems.FirstOrDefault(c=>c.Id==cartItemId);
            if (cartItem == null) return false;
            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCartItemAsync(long userId, long cartItemId, int quantity)
        {
            if (quantity <= 0)
            {
                return await RemoveFromCartAsync(userId, cartItemId);
            }
            var cart = await GetCartByUserAsync(userId);
            var cartItem= cart.CartItems.FirstOrDefault(ci=>ci.Id==cartItemId);
            if (cartItem == null) return false;
            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
