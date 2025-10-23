namespace MobileAppServer.Models
{
    public class JwtSettings
    {
        public string Secret { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpiresMinutes { get; set; } = 120;
        public int RefreshTokenExpiresDays { get; set; } = 30;
    }
}
