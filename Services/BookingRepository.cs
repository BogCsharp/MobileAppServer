using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;
using MobileAppServer.Models.Booking;

namespace MobileAppServer.Services
{
    public class BookingRepository : IBookingRepository
    {
		private readonly AppDbContext _context;
		private readonly IOrderRepository _orderRepository;

		public BookingRepository(AppDbContext context, IOrderRepository orderRepository)
        {
			_context = context;
			_orderRepository = orderRepository;
		}

		public async Task<List<TimeSlotDTO>> GetAvailableSlotsAsync(AvailableSlotsDTO availableSlotsDTO)
		{
			var services = await _context.Services
				.Where(s => availableSlotsDTO.ServiceIds.Contains(s.Id))
				.ToListAsync();
			var totalDuration = services.Sum(s => s.Duration);
			var date = availableSlotsDTO.Date.Date;
			var dayStart = date;
			var dayEnd = date.AddDays(1);
			var existing = await _context.Bookings
				.AsNoTracking()
				.Where(b => b.BookingDate >= dayStart && b.BookingDate < dayEnd)
				.ToListAsync();
			return CalculateAvailableSlots(date, totalDuration, existing);
		}

		public async Task<BookingEntity> CreateAsync(long userId, long carId, long? employeeId, DateTime bookingDate, TimeSpan startTime, int totalDurationMinutes, string? notes)
		{
			var endTime = startTime + TimeSpan.FromMinutes(totalDurationMinutes);
			var dayStart = bookingDate.Date;
			var dayEnd = dayStart.AddDays(1);
			var overlap = await _context.Bookings
				.AsNoTracking()
				.AnyAsync(b => b.BookingDate >= dayStart && b.BookingDate < dayEnd &&
					(startTime < b.EndTime && endTime > b.StartTime));
			if (overlap)
			{
				throw new InvalidOperationException("Выбранный слот уже занят");
			}

			var composedNotes = BuildBookingNote(dayStart, startTime, totalDurationMinutes, notes);
			var order = await _orderRepository.CreateFromCartAsync(userId, carId, employeeId, composedNotes, null);

			var booking = new BookingEntity
			{
				UserId = userId,
				CarId = carId,
				EmployeeId = employeeId,
				BookingDate = dayStart,
				StartTime = startTime,
				EndTime = endTime,
				TotalDurationMinutes = totalDurationMinutes,
				Notes = notes ?? string.Empty,
				OrderId = order.Id
			};
			_context.Set<BookingEntity>().Add(booking);
			await _context.SaveChangesAsync();
			return booking;
		}


		public async Task<List<BookingEntity>> GetByUserIdAsync(long userId)
		{
			return await _context.Set<BookingEntity>()
				.AsNoTracking()
				.Where(b => b.UserId == userId)
				.OrderByDescending(b => b.BookingDate)
				.ThenByDescending(b => b.StartTime)
				.ToListAsync();
		}

		public async Task<BookingEntity> GetByIdAsync(long id)
		{
			var entity = await _context.Set<BookingEntity>()
				.AsNoTracking()
				.FirstOrDefaultAsync(b => b.Id == id);
			if (entity == null)
			{
				throw new KeyNotFoundException($"Booking with id {id} not found");
			}
			return entity;
		}

		public async Task<BookingEntity> UpdateAsync(BookingEntity booking)
		{
			var entity = await _context.Set<BookingEntity>().FirstOrDefaultAsync(b => b.Id == booking.Id);
			if (entity == null)
			{
				throw new KeyNotFoundException($"Booking with id {booking.Id} not found");
			}
			entity.BookingDate = booking.BookingDate;
			entity.StartTime = booking.StartTime;
			entity.EndTime = booking.EndTime;
			entity.TotalDurationMinutes = booking.TotalDurationMinutes;
			entity.Notes = booking.Notes;
			entity.EmployeeId = booking.EmployeeId;
			await _context.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteAsync(long id)
		{
			var entity = await _context.Set<BookingEntity>().FirstOrDefaultAsync(b => b.Id == id);
			if (entity == null)
			{
            return false;
        }
			_context.Set<BookingEntity>().Remove(entity);
			await _context.SaveChangesAsync();
			return true;
		}

		private static string BuildBookingNote(DateTime bookingDate, TimeSpan startTime, int totalDurationMinutes, string? baseNotes)
		{
			var bookingNote = $"Бронь (Дата: {bookingDate:yyyy-MM-dd}, Начало: {startTime:hh\\:mm}, Длительность: {totalDurationMinutes} мин)";
			return string.IsNullOrWhiteSpace(baseNotes) ? bookingNote : $"{baseNotes} | {bookingNote}";
		}

		private static List<TimeSlotDTO> CalculateAvailableSlots(DateTime date, int totalDuration, List<BookingEntity> existingBookings)
		{
			var availableSlots = new List<TimeSlotDTO>();
			var workStart = TimeSpan.FromHours(9);
			var workEnd = TimeSpan.FromHours(18);
			var interval = TimeSpan.FromMinutes(15);

			for (var start = workStart; start <= workEnd - TimeSpan.FromMinutes(totalDuration); start += interval)
			{
				var end = start + TimeSpan.FromMinutes(totalDuration);
				bool isAvailable = !existingBookings.Any(b =>
					b.BookingDate.Date == date && start < b.EndTime && end > b.StartTime);
				availableSlots.Add(new TimeSlotDTO { StartTime = start, EndTime = end, IsAvailable = isAvailable });
			}
			return availableSlots;
        }
    }
}
