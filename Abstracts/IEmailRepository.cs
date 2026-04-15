using MobileAppServer.Entities;

namespace MobileAppServer.Abstracts
{
    public interface IEmailRepository
    {
        Task SendWelcomeEmailAsync(string email,string userName);
        Task SendOrderStatusChangedAsync(string email,string orderNumber,string newStatus);
        Task SendBookingConfirmationAsync(string email, string userName, OrderEntity order,  BookingEntity bookingEntity, CarEntity carEntity, EmployeeEntity employeeEntity);
    }
}
