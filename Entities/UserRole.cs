namespace MobileAppServer.Entities
{
    public class UserRole
    {
        public int Id { get; set; }
        public string RoleName { get; set; }=string.Empty;

        public List<UserEntity> Users { get; set; } = new();

    }
    public enum UserRoleType
    {
        Client = 1,     
        Employee = 2,   
        Admin = 3       
    }
}
