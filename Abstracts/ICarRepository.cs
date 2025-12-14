using MobileAppServer.Entities;

namespace MobileAppServer.Abstracts
{
    public interface ICarRepository
    {
        Task<CarEntity> GetByIdAsync(long id);
        Task<List<CarEntity>> GetByUserIdAsync(long userId);
        Task<CarEntity> CreateAsync(CarEntity car);
        Task<CarEntity> UpdateAsync(CarEntity car);
        Task<bool> DeleteAsync(long id);
    }
}

