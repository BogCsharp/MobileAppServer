namespace MobileAppServer.Models.Booking
{
	public class BookingDTO
	{
		public long Id { get; set; }
		public DateTime BookingDate { get; set; }
		public TimeSpan StartTime { get; set; }
		public TimeSpan EndTime { get; set; }
		public int TotalDurationMinutes { get; set; }
		public string Notes { get; set; } = string.Empty;
		public long UserId { get; set; }
		public long CarId { get; set; }
		public long? EmployeeId { get; set; }
		public long? OrderId { get; set; }
	}
}


