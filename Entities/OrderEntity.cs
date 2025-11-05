namespace MobileAppServer.Entities
{
    public class OrderEntity:BaseEntity
    {
        public string OrderNumber { get; set; } = string.Empty;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Notes { get; set; } = string.Empty;

     

        public long UserId { get; set; }
        public UserEntity User { get; set; } = null!;
        public long CarId { get; set; }
        public CarEntity Car { get; set; } = null!;
        
        public long? EmployeeId { get; set; }
        public EmployeeEntity Employee { get; set; } = null!;
        
    }
    public enum OrderStatus
    {
        Pending,        
        Confirmed,      
        InProgress,     
        Completed,     
        Cancelled,     
        Paid           
    }
}
