using MobileAppServer.Entities;

namespace MobileAppServer.Abstracts
{
    public interface ICartRepository
    {
        Task<CartEntity> GetCartByUserAsync(long userId);
        Task<CartItemEntity> AddToCartAsync(long userId,long serviceId,int quantity);
        Task<bool> RemoveFromCartAsync(long userId, long cartItemId);
        Task<bool> UpdateCartItemAsync(long userId, long cartItemId, int quantity);
        Task<bool>ClearCartAsync(long userId);
        Task<int>GetCartItemsCountAsync(long userId);
        Task<decimal>GetCartTotalAsync(long userId);
        Task<CartEntity> CreateCartAsync(long userId);
    }
}
