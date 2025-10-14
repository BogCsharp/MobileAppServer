namespace MobileAppServer.Models.Cart
{
    public class CartItemDTO
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public long ServiceId { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Total => Price * Quantity;
    }
}
