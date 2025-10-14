namespace MobileAppServer.Entities
{
    public class CarEntity:BaseEntity
    {
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;

        public long UserId { get; set; }
        public UserEntity User { get; set; } = null!;
        public List<OrderEntity> Orders { get; set; } = new();
    }
}
