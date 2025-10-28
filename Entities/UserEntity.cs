using System.ComponentModel.DataAnnotations;

namespace MobileAppServer.Entities
{
    public class UserEntity:BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int DiscountPercent { get; set; }
        public decimal TotalSpent { get; set; }
        
        public string? Password { get; set; }
        public int? Age
        {
            get
            {
                var today = DateTime.Today;
                var age = today.Year - Birthday.Year;
                if (Birthday.Date > today.AddYears(-age)) age--;
                return age;
            } }
        public DateTime Birthday { get; set; }

        public int RoleId { get; set; }
        public UserRole Role { get; set; } = null!;

        public List<OrderEntity> Orders { get; set; } = new();
        public List<CarEntity> Cars { get; set; } = new();
    }
}
