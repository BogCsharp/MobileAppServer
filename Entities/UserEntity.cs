namespace MobileAppServer.Entities
{
    public class UserEntity:BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int DiscountPercent { get; set; }
        public decimal TotalSpent { get; set; }
        public string? Password { get; set; }
        public int? Age { get; set; }
        public DateTime Birthday { get; set; }

        public List<OrderEntity> Orders { get; set; } = new();
        public List<CarEntity> Cars { get; set; } = new();
    }
}
