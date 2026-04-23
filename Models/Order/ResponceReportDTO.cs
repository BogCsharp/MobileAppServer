namespace MobileAppServer.Models.Order
{
    public class ResponceReportDTO
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public int OrdersCount { get; set; }
        public List<DailyRevenueDTO> DailyBreakdown { get; set; }
    }
    public class DailyRevenueDTO
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrdersCount { get; set; }
    }
}
