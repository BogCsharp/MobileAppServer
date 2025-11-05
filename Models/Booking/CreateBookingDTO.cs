namespace MobileAppServer.Models.Booking
{
	public class CreateBookingDTO
	{
		public long UserId { get; set; }
		public long CarId { get; set; }
		public long? EmployeeId { get; set; }
		public DateTime BookingDate { get; set; }
		public TimeSpan StartTime { get; set; }
		public int TotalDurationMinutes { get; set; }
		public string? Notes { get; set; }
	}
}


