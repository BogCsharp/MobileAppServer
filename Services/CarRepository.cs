using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;

namespace MobileAppServer.Services
{
    public class CarRepository : ICarRepository
    {
        private readonly AppDbContext _context;

        public CarRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CarEntity> GetByIdAsync(long id)
        {
            return await _context.Cars
                .FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new KeyNotFoundException($"Машина с Id {id} не найдена");
        }

        public async Task<List<CarEntity>> GetByUserIdAsync(long userId)
        {
            return await _context.Cars
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CarEntity> CreateAsync(CarEntity car)
        {
            car.CreatedAt = DateTime.UtcNow;
            _context.Cars.Add(car);
            await _context.SaveChangesAsync();
            return car;
        }

        public async Task<CarEntity> UpdateAsync(CarEntity car)
        {
            var existing = await GetByIdAsync(car.Id);
            existing.Brand = car.Brand;
            existing.Model = car.Model;
            existing.Year = car.Year;
            existing.Color = car.Color;
            existing.CarNumber = car.CarNumber;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var car = await _context.Cars
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(c => c.Id == id);
            
            if (car == null)
                return false;


            if (car.Orders != null && car.Orders.Any())
            {
                throw new InvalidOperationException("Невозможно удалить машину, так как с ней связаны заказы");
            }

            var hasBookings = await _context.Set<Entities.BookingEntity>()
                .AnyAsync(b => b.CarId == id);
            
            if (hasBookings)
            {
                throw new InvalidOperationException("Невозможно удалить машину, так как с ней связаны бронирования");
            }

            _context.Cars.Remove(car);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

