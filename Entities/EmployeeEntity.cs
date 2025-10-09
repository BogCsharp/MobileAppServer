namespace MobileAppServer.Entities
{
    public class EmployeeEntity:BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;

        public List<OrderEntity> Orders { get; set; } = new();

    }
}
