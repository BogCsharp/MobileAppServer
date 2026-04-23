namespace MobileAppServer.Models.Employee
{
    public class EmployeeEarningsDTO
    {
        public long? EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int CompletedOrdersCount { get; set; }
        public decimal TotalOrderAmount { get; set; }   
        public decimal Earnings { get; set; }
    }
}
