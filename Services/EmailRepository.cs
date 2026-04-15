using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MobileAppServer.Abstracts;
using MobileAppServer.Entities;
using MobileAppServer.Models.SMTP;

namespace MobileAppServer.Services
{
    public class EmailRepository : IEmailRepository
    {
        private readonly SmtpSettings _smtpSettings;
        public EmailRepository(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings= smtpSettings.Value;
        }
        private async Task SendEmailAsync(string to, string subject, string body)
        {
            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(_smtpSettings.Server, _smtpSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_smtpSettings.SenderName, _smtpSettings.SenderEmail));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;
                message.Body = new TextPart("plain") { Text = body };

                await client.SendAsync(message);
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
        public async Task SendOrderStatusChangedAsync(string email, string orderNumber, string newStatus)
        {
            var order = $"Статус заказа {orderNumber} изменён";
            var body = $@"
Уважаемый клиент!

Статус вашего заказа {orderNumber} обновлён: {newStatus}.

Если у вас есть вопросы, свяжитесь с нами.

Спасибо, что выбираете нас.";

            await SendEmailAsync(email, order, body);
        }

        public async Task SendWelcomeEmailAsync(string email, string userName)
        {
            var subject = "Добро пожаловать!";
            var body = $@"
Здравствуйте, {userName}!

Спасибо за регистрацию в нашем сервисе.
Рады видеть вас среди наших клиентов.

С уважением,
Команда поддержки";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendBookingConfirmationAsync(string email, string userName, OrderEntity orderEntity, BookingEntity bookingEntity, CarEntity carEntity,EmployeeEntity employeeEntity)
        {
            var subject = $"Ваш заказ {orderEntity.OrderNumber} создан";
            var body = $@"
Здравствуйте, {userName}!

Ваше бронирование успешно создано.

Детали:
- Дата: {bookingEntity.BookingDate:dd.MM.yyyy}
- Время: {bookingEntity.StartTime.ToString():hh\\:mm} - {bookingEntity.EndTime.ToString():hh\\:mm}
- Длительность: {bookingEntity.TotalDurationMinutes} мин.
- Сотрудник: {employeeEntity.FirstName}
- Автомобиль: {carEntity.Brand} {carEntity.Model} (госномер {carEntity.CarNumber})

Номер заказа: {orderEntity.OrderNumber}

С уважением,
Команда DetailPro
";
            await SendEmailAsync(email, subject, body);
        }
    }
}
