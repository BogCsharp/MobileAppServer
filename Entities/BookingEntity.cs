namespace MobileAppServer.Entities
{
	public class BookingEntity : BaseEntity
	{
		public DateTime BookingDate { get; set; }
		public TimeSpan StartTime { get; set; }
		public TimeSpan EndTime { get; set; }
		public int TotalDurationMinutes { get; set; }
		public string Notes { get; set; } = string.Empty;

		public long UserId { get; set; }
		public UserEntity User { get; set; } = null!;
		public long CarId { get; set; }
		public CarEntity Car { get; set; } = null!;
		public long? EmployeeId { get; set; }
		public EmployeeEntity? Employee { get; set; }

		public long? OrderId { get; set; }
		public OrderEntity? Order { get; set; }
	}
}


