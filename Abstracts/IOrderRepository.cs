using MobileAppServer.Entities;
using MobileAppServer.Models.Employee;
using MobileAppServer.Models.Order;

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
        Task<ResponceReportDTO> GetRevenueReportAsync(DateTime startDate, DateTime endDate);
        Task<EmployeeEarningsDTO> GetEmployeeEarningsByIdAsync(long employeeId, DateTime startDate, DateTime endDate);
    }
}