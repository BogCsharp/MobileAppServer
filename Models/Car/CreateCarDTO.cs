namespace MobileAppServer.Models.Car
{
    public class CreateCarDTO
    {
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string CarNumber { get; set; } = string.Empty;
        public long UserId { get; set; }
    }
}

