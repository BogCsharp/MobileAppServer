using MobileAppServer.Entities;

namespace MobileAppServer.Abstracts
{
    public interface IOrderRepository
    {
        Task<OrderEntity> GetByIdAsync(long id);
        Task<List<OrderEntity>> GetAllAsync();
        Task<List<OrderEntity>> GetByUserIdAsync(long userId);
        Task<OrderEntity> CreateAsync(OrderEntity order);
        Task<OrderEntity> UpdateAsync(OrderEntity order);
        Task<bool> DeleteAsync(long id);
        Task<OrderEntity> CreateFromCartAsync(long userId, long carId, long? employeeId, string notes, decimal? discountAmount);
    }
}