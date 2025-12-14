using MobileAppServer.Entities;
using MobileAppServer.Models.Car;

namespace MobileAppServer.Mappers
{
    public static class CarMapper
    {
        public static CarDTO ToDto(this CarEntity carEntity)
        {
            return new CarDTO
            {
                Id = carEntity.Id,
                Brand = carEntity.Brand,
                Model = carEntity.Model,
                Year = carEntity.Year,
                Color = carEntity.Color,
                CarNumber = carEntity.CarNumber,
                UserId = carEntity.UserId,
                CreatedAt = carEntity.CreatedAt,
            };
        }

        public static CarEntity ToEntity(this CreateCarDTO createCarDto)
        {
            return new CarEntity
            {
                Brand = createCarDto.Brand,
                Model = createCarDto.Model,
                Year = createCarDto.Year,
                Color = createCarDto.Color,
                CarNumber = createCarDto.CarNumber,
                UserId = createCarDto.UserId,
            };
        }
    }
}

