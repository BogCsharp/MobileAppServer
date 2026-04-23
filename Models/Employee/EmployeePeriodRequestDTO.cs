namespace MobileAppServer.Models.Employee
{
    public class EmployeePeriodRequestDTO
    {
        public DateTime StartDate {  get; set; }
        public DateTime EndDate { get; set; }
        public long EmployeeId {  get; set; }
    }
}
