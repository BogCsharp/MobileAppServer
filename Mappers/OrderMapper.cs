using MobileAppServer.Entities;
using MobileAppServer.Models.Service;

namespace MobileAppServer.Mappers
{
    public static class OrderMapper
    {
        public static OrderDTO ToDto(this OrderEntity entity)
        {
            return new OrderDTO
            {
                Id = entity.Id,
                OrderNumber = entity.OrderNumber,
                Status = entity.Status,
                TotalAmount = entity.TotalAmount,
                DiscountAmount = entity.DiscountAmount,
                FinalAmount = entity.FinalAmount,
                CreatedAt = entity.CreatedAt,
                CompletedAt = entity.CompletedAt,
                Notes = entity.Notes,
                UserId = entity.UserId,
                CarId = entity.CarId,
                EmployeeId = entity.EmployeeId,
            };
        }

        public static OrderEntity ToEntity(this CreateOrderDTO dto)
        {
            return new OrderEntity
            {
                UserId = dto.UserId,
                CarId = dto.CarId,
                EmployeeId = dto.EmployeeId,
                Notes = dto.Notes,
                DiscountAmount = dto.DiscountAmount ?? 0,
                Status = OrderStatus.Pending,
                OrderNumber = GenerateOrderNumber(), 
                TotalAmount = 0, 
                FinalAmount = 0
            };
        }


        private static string GenerateOrderNumber()
        {
            
            return $"ORD-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}