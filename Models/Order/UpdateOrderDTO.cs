using MobileAppServer.Entities;

namespace MobileAppServer.Models.Order
{
    public class UpdateOrderDTO
    {
        public OrderStatus Status { get; set; }
        public string Notes { get; set; } = string.Empty;
        public decimal? DiscountAmount { get; set; }
    }
}
