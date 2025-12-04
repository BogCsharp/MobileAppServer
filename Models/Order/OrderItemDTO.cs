using MobileAppServer.Models.Service;

namespace MobileAppServer.Models.Order
{
    public class OrderItemDTO
    {
        public long Id { get; set; }
        public long ServiceId { get; set; }
        public ServiceDTO Service { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}


