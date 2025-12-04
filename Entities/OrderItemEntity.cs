namespace MobileAppServer.Entities
{
    public class OrderItemEntity : BaseEntity
    {
        public long OrderId { get; set; }
        public OrderEntity Order { get; set; } = null!;

        public long ServiceId { get; set; }
        public ServiceEntity Service { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}


