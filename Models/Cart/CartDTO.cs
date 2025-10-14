namespace MobileAppServer.Models.Cart
{
    public class CartDTO
    {
        public long CartId { get; set; }
        public long UserId { get; set; }
        public List<CartItemDTO> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
