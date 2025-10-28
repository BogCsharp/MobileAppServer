using MobileAppServer.Entities;

namespace MobileAppServer.Models.Identity
{
    public class RegisterDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Surname {  get; set; } = string.Empty;
        public string Email {  get; set; } = string.Empty;
        public string Phone {  get; set; } = string.Empty;
        public string? Password {  get; set; } = string.Empty;
        public DateTime Birthday { get; set; }
        public string ConfirmPassword {  get; set; } = string.Empty;
        public UserRoleType Role { get; set; } = UserRoleType.Client;

    }
}
