using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;
using MobileAppServer.Models.Service;
using MobileAppServer.Models;

namespace MobileAppServer.Services
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly AppDbContext _dbcontext;
        public ServiceRepository(AppDbContext context)
        {
            _dbcontext = context;
        }
        public async Task<ServiceEntity> CreateAsync(ServiceEntity service)
        {
            _dbcontext.Set<ServiceEntity>().Add(service);
            await _dbcontext.SaveChangesAsync();
            return service;
        }

        

        public async Task<bool> DeleteAsync(long id)
        {
            var entity=await _dbcontext.Set<ServiceEntity>().FirstOrDefaultAsync(x=>x.Id==id);
            if (entity == null)
            {
                return false;
            }
            _dbcontext.Set<ServiceEntity>().Remove(entity);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<List<ServiceEntity>> GetAllAsync()
        {
            return await _dbcontext.Set<ServiceEntity>()
                .AsNoTracking()
                .Include(s => s.Category)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<ServiceEntity> GetByIdAsync(long id)
        {
            var entity = await _dbcontext.Set<ServiceEntity>()
                .AsNoTracking()
                .Include(s => s.Category)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"Услуга {id} не найдена");
            }
            return entity;
        }

      

        public async Task<ServiceEntity> UpdateAsync(ServiceEntity service)
        {
            var entity = await _dbcontext.Set<ServiceEntity>().FirstOrDefaultAsync(x => x.Id == service.Id);
            if (entity == null)
            {
                throw new ArgumentException($"Услуга {service.Name} не найдена");
            }
            entity.Name = service.Name;
            entity.Description = service.Description;
            entity.Price = service.Price;
            entity.Duration = service.Duration;
            entity.CategoryId = service.CategoryId;
            await _dbcontext.SaveChangesAsync();
            return entity;
        }

       
    }
}
