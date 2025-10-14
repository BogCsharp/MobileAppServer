namespace MobileAppServer.Models.Service
{
    public class ServiceDTO
    {

        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public long CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
