namespace MobileAppServer.Models.Booking
{
    public class TimeSlotDTO
    {
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
    }
}
