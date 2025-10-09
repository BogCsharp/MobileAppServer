using MobileAppServer.Entities;

namespace MobileAppServer.Abstracts
{
    public interface IServiceRepository
    {
        Task<ServiceEntity> GetByIdAsync(long id);
        Task<List<ServiceEntity>> GetAllAsync();
        Task<ServiceEntity> CreateAsync(ServiceEntity service);
        Task<ServiceEntity> UpdateAsync(ServiceEntity service);
        Task<bool> DeleteAsync(int id);

        
    }
}
