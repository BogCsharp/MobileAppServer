namespace MobileAppServer.Models.Identity
{
    public class UserDTO
    {
        public long Id { get; set; }
        public string Name { get; set; }        = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; }        = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string RoleName { get; set; } =string.Empty;
        public long RoleId { get; set; }

    }
}
