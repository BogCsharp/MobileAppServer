namespace MobileAppServer.Models.Identity
{
    public class RefreshTokenDTO
    {
        public string AcessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
