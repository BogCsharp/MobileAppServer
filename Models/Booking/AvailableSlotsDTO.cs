namespace MobileAppServer.Models.Booking
{
    public class AvailableSlotsDTO
    {
        public DateTime Date { get; set; }
        public List<long> ServiceIds { get; set; } = new();
    }
}
