using MobileAppServer.Entities;

namespace MobileAppServer.Models.Service
{
    public class OrderDTO
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public DateTime CreatedAt { get; set; }= DateTime.Now;

        public DateTime? CompletedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
    

        public long? UserId { get; set; }
        public long? CarId { get; set; }
        public long? EmployeeId { get; set; }

    }
}
