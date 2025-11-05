namespace MobileAppServer.Models.Booking
{
    public class BookingRequestDTO
    {
        public DateTime BookingDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public string? Notes { get; set; }
    }
}
