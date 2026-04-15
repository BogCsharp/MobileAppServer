using Microsoft.EntityFrameworkCore;
using MobileAppServer.Abstracts;
using MobileAppServer.Data;
using MobileAppServer.Entities;
using MobileAppServer.Models.Booking;
using MobileAppServer.Queue;

namespace MobileAppServer.Services
{
    public class BookingRepository : IBookingRepository
    {
		private readonly AppDbContext _context;
		private readonly IOrderRepository _orderRepository;
		private readonly IBackgroundTaskQueue _taskQueue;
		private readonly IEmailRepository _emailRepository;

		public BookingRepository(AppDbContext context, IOrderRepository orderRepository,IBackgroundTaskQueue backgroundTaskQueue,IEmailRepository emailRepository)
        {
			_context = context;
			_orderRepository = orderRepository;
			_taskQueue = backgroundTaskQueue;
			_emailRepository=emailRepository;
		}

		public async Task<List<TimeSlotDTO>> GetAvailableSlotsAsync(AvailableSlotsDTO availableSlotsDTO)
		{
			// Загружаем уникальные услуги и строим словарь длительностей
			var uniqueServiceIds = availableSlotsDTO.ServiceIds.Distinct().ToList();
			var services = await _context.Services
				.Where(s => uniqueServiceIds.Contains(s.Id))
				.ToDictionaryAsync(s => s.Id, s => s.Duration);

			// Суммарная длительность с учётом количества одинаковых услуг
			var totalDuration = availableSlotsDTO.ServiceIds
				.Where(id => services.ContainsKey(id))
				.Sum(id => services[id]);

			var date = availableSlotsDTO.Date.Date;
			var dayStart = date;
			var dayEnd = date.AddDays(1);
			var employess = await _context.Employee
				.Where(e=>e.isActive)
				.ToListAsync();
			var existing = await _context.Bookings
				.AsNoTracking()
				.Where(b => b.BookingDate >= dayStart && b.BookingDate < dayEnd)
				.ToListAsync();
			return CalculateAvailableSlots(date, totalDuration, existing,employess);
		}

		public async Task<BookingEntity> CreateAsync(long userId, long carId, long? employeeId, DateTime bookingDate, TimeSpan startTime, int totalDurationMinutes, string? notes)
		{
			var endTime = startTime + TimeSpan.FromMinutes(totalDurationMinutes);
			var dayStart = bookingDate.Date;
			var dayEnd = dayStart.AddDays(1);
            var employees = await _context.Employee
				.Where(e => e.isActive)
				.ToListAsync();
            EmployeeEntity targetEmployee = null;
            if (employeeId.HasValue)
            {
                // Если клиент выбрал конкретного сотрудника – проверяем, что он существует и свободен
                targetEmployee = employees.FirstOrDefault(e => e.Id == employeeId.Value);
                if (targetEmployee == null)
                    throw new InvalidOperationException("Указанный сотрудник не найден или неактивен");

                // Проверяем, свободен ли этот сотрудник
                bool isBusy = await _context.Bookings
                    .AnyAsync(b => b.EmployeeId == employeeId.Value &&
                                   b.BookingDate >= dayStart && b.BookingDate < dayEnd &&
                                   startTime < b.EndTime && endTime > b.StartTime);
                if (isBusy)
                    throw new InvalidOperationException("Выбранный сотрудник занят в это время");
            }
            else
            {
                // Автоматически ищем любого свободного сотрудника
                var bookingsForDay = await _context.Bookings
                    .Where(b => b.BookingDate >= dayStart && b.BookingDate < dayEnd)
                    .ToListAsync();

                targetEmployee = employees.FirstOrDefault(emp =>
                {
                    var empBookings = bookingsForDay.Where(b => b.EmployeeId == emp.Id).ToList();
                    return !empBookings.Any(b => startTime < b.EndTime && endTime > b.StartTime);
                });

                if (targetEmployee == null)
                    throw new InvalidOperationException("Нет свободных сотрудников на выбранное время");
            }
			var composedNotes = BuildBookingNote(dayStart, startTime, totalDurationMinutes, notes);
			var order = await _orderRepository.CreateFromCartAsync(userId, carId, targetEmployee.Id, composedNotes, null);

			var booking = new BookingEntity
			{
				UserId = userId,
				CarId = carId,
				EmployeeId = targetEmployee.Id,
				BookingDate = dayStart,
				StartTime = startTime,
				EndTime = endTime,
				TotalDurationMinutes = totalDurationMinutes,
				Notes = notes ?? string.Empty,
				OrderId = order.Id
			};
			_context.Set<BookingEntity>().Add(booking);
			await _context.SaveChangesAsync();
            var user = await _context.Users.FindAsync(userId);
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                var car = await _context.Cars.FindAsync(carId);
                var employee = await _context.Employee.FindAsync(targetEmployee.Id);
				var orderNumber = await _context.Orders.FindAsync(booking.OrderId);

                _taskQueue.QueueBackgroundWorkItem(async token =>
                {
                    await _emailRepository.SendBookingConfirmationAsync(user.Email, user.Name, orderNumber, booking, car, employee);
                });
            }
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

		private static List<TimeSlotDTO> CalculateAvailableSlots(DateTime date, int totalDuration, List<BookingEntity> existingBookings,List<EmployeeEntity>employees)
		{
			var availableSlots = new List<TimeSlotDTO>();
			var workStart = TimeSpan.FromHours(9);
			var workEnd = TimeSpan.FromHours(18);
			var interval = TimeSpan.FromMinutes(15);
			var bookingsByEmployee=existingBookings
				.Where(b=>b.EmployeeId.HasValue)
				.GroupBy(b=>b.EmployeeId.Value)
				.ToDictionary(g=>g.Key,g=>g.ToList());
			for (var start = workStart; start <= workEnd - TimeSpan.FromMinutes(totalDuration); start += interval)
			{
				var end = start + TimeSpan.FromMinutes(totalDuration);
                bool isAvailable = employees.Any(emp =>
                {
                    if (bookingsByEmployee.TryGetValue(emp.Id, out var empBookings))
                    {
                        
                        return !empBookings.Any(b =>
                            b.BookingDate.Date == date &&
                            start < b.EndTime &&
                            end > b.StartTime);
                    }
                    return true; 
                });

				availableSlots.Add(new TimeSlotDTO { StartTime = start, EndTime = end, IsAvailable = isAvailable });
			}
			return availableSlots;
        }
    }
}
