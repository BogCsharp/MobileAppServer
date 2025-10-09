namespace MobileAppServer.Entities
{
    public class CartEntity:BaseEntity
    {
        public long UserId { get; set; }
        public UserEntity User { get; set; } = null!;
        public List<CartItemEntity>? CartItems { get; set; }
    }
}
