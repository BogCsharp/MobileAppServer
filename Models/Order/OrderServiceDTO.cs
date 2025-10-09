namespace MobileAppServer.Models.Order
{
    public class OrderServiceDTO
    {

        public long Id { get; set; }
        public long ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice => Price * Quantity;
    }
}
