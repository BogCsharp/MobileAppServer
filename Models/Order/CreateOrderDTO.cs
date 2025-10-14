using MobileAppServer.Entities;
using System.ComponentModel.DataAnnotations;

namespace MobileAppServer.Models.Service
{
    public class CreateOrderDTO
    {
        public long UserId { get; set; }
        public long CarId { get; set; }
        public long? EmployeeId { get; set; }

        public string Notes { get; set; } = string.Empty;
      
        public decimal? DiscountAmount { get; set; } 

    }
}
