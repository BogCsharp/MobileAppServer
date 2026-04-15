namespace MobileAppServer.Models.SMTP
{
    public class SmtpSettings
    {
        public string Server { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } =  string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } =  string.Empty;
    }
}
