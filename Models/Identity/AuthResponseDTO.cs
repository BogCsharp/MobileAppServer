namespace MobileAppServer.Models.Identity
{
    public class AuthResponseDTO
    {
        public string Message { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken {  get; set; } = string.Empty;
        public DateTime TokenExpiry { get; set; }
        public UserDTO User { get; set; } = null!;
    }

}
