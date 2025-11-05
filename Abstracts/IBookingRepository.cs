using MobileAppServer.Entities;
using MobileAppServer.Models.Booking;

namespace MobileAppServer.Abstracts
{
    public interface IBookingRepository
    {
        Task<List<TimeSlotDTO>> GetAvailableSlotsAsync(AvailableSlotsDTO availableSlotsDTO);
        Task<BookingEntity> CreateAsync(long userId, long carId, long? employeeId, DateTime bookingDate, TimeSpan startTime, int totalDurationMinutes, string? notes);
        Task<BookingEntity> AttachOrderAsync(long bookingId, long orderId);
        Task<List<BookingEntity>> GetByUserIdAsync(long userId);
        Task<BookingEntity> GetByIdAsync(long id);
        Task<BookingEntity> UpdateAsync(BookingEntity booking);
        Task<bool> DeleteAsync(long id);
    }
}
