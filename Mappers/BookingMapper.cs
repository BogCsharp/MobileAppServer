using MobileAppServer.Entities;
using MobileAppServer.Models.Booking;

namespace MobileAppServer.Mappers
{
	public static class BookingMapper
	{
		public static BookingDTO ToDto(this BookingEntity entity)
		{
			return new BookingDTO
			{
				Id = entity.Id,
				BookingDate = entity.BookingDate,
				StartTime = entity.StartTime,
				EndTime = entity.EndTime,
				TotalDurationMinutes = entity.TotalDurationMinutes,
				Notes = entity.Notes,
				UserId = entity.UserId,
				CarId = entity.CarId,
				EmployeeId = entity.EmployeeId,
				OrderId = entity.OrderId
			};
		}
	}
}


