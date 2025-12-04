using MobileAppServer.Entities;
using MobileAppServer.Models.Order;
using MobileAppServer.Models.Service;

namespace MobileAppServer.Mappers
{
    public static class OrderMapper
    {
        public static OrderDTO ToDto(this OrderEntity entity)
        {
            var dto = new OrderDTO
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
                OrderItems = new List<OrderItemDTO>()
            };

            if (entity.OrderItems != null && entity.OrderItems.Any())
            {
                foreach (var item in entity.OrderItems)
                {
                    dto.OrderItems.Add(new OrderItemDTO
                    {
                        Id = item.Id,
                        ServiceId = item.ServiceId,
                        Quantity = item.Quantity,
                        Price = item.Price,
                        Service = new ServiceDTO
                        {
                            Id = item.ServiceId,
                            Name = item.Name,
                            Description = item.Service?.Description ?? string.Empty,
                            Price = item.Price,
                            Duration = item.Service?.Duration ?? 0,
                            CategoryId = item.Service?.CategoryId ?? 0,
                            CategoryName = item.Service?.Category?.Name ?? string.Empty
                        }
                    });
                }
            }

            return dto;
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