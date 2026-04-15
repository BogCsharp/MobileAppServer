namespace MobileAppServer.Abstracts
{
    public interface IEmailRepository
    {
        Task SendWelcomeEmailAsync(string email,string userName);
        Task SendOrderStatusChangedAsync(string email,string orderNumber,string newStatus);
    }
}
