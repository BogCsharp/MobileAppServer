using MobileAppServer.Entities;
using MobileAppServer.Models.Service;
using System.Runtime.CompilerServices;

namespace MobileAppServer.Mappers
{
    public static class ServiceMapper
    {
        public static CreateServiceDTO ToDto(this ServiceEntity serviceEntity)
        {
            return new CreateServiceDTO
            {
                Id = serviceEntity.Id,
                Name=serviceEntity.Name,
                Description=serviceEntity.Description,
                Price=serviceEntity.Price,
                Duration=serviceEntity.Duration,
                CategoryId = serviceEntity.CategoryId
            };
        }
        public static ServiceEntity ToEntity(this CreateServiceDTO createServiceDTO)
        {
            return new ServiceEntity
            {
                Id = createServiceDTO.Id,
                Name = createServiceDTO.Name,
                Description = createServiceDTO.Description,
                Price = createServiceDTO.Price,
                Duration = createServiceDTO.Duration,
                CategoryId = createServiceDTO.CategoryId
            };
        }
    }
}
