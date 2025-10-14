namespace MobileAppServer.Entities
{
    public class OrderService:BaseEntity
    {
        public decimal Price { get; set; } 
        public int Quantity { get; set; } = 1;

      
        public long OrderId { get; set; }
        public OrderEntity Order { get; set; } = null!;
        public long ServiceId { get; set; }
        public ServiceEntity Service { get; set; } = null!;
    }
}
