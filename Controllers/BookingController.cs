using Microsoft.AspNetCore.Mvc;
using MobileAppServer.Abstracts;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Booking;

namespace MobileAppServer.Controllers
{
	[ApiController]
	[Route("api/bookings")]
	public class BookingController : ControllerBase
	{
		private readonly IBookingRepository _bookingRepo;

		public BookingController(IBookingRepository bookingRepo)
		{
			_bookingRepo = bookingRepo;
		}

		[HttpGet("available-slots")]
		public async Task<ActionResult<List<TimeSlotDTO>>> GetAvailableSlots([FromQuery] DateTime date, [FromQuery] List<long> serviceIds)
		{
			var slots = await _bookingRepo.GetAvailableSlotsAsync(new AvailableSlotsDTO
			{
				Date = date,
				ServiceIds = serviceIds
			});
			return Ok(slots);
		}

		[HttpPost]
		public async Task<ActionResult<BookingDTO>> Create(CreateBookingDTO dto)
		{
			var created = await _bookingRepo.CreateAsync(
				dto.UserId,
				dto.CarId,
				dto.EmployeeId,
				dto.BookingDate,
				dto.StartTime,
				dto.TotalDurationMinutes,
				dto.Notes
			);
			return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToDto());
		}

		[HttpGet("{id:long}")]
		public async Task<ActionResult<BookingDTO>> GetById(long id)
		{
			var entity = await _bookingRepo.GetByIdAsync(id);
			return Ok(entity.ToDto());
		}

		[HttpGet("user/{userId:long}")]
		public async Task<ActionResult<List<BookingDTO>>> GetByUser(long userId)
		{
			var list = await _bookingRepo.GetByUserIdAsync(userId);
			return Ok(list.Select(b => b.ToDto()).ToList());
		}

		[HttpPut("{id:long}")]
		public async Task<ActionResult<BookingDTO>> Update(long id, BookingDTO dto)
		{
			var existing = await _bookingRepo.GetByIdAsync(id);
			existing.BookingDate = dto.BookingDate;
			existing.StartTime = dto.StartTime;
			existing.EndTime = dto.EndTime;
			existing.TotalDurationMinutes = dto.TotalDurationMinutes;
			existing.Notes = dto.Notes;
			existing.EmployeeId = dto.EmployeeId;
			var updated = await _bookingRepo.UpdateAsync(existing);
			return Ok(updated.ToDto());
		}

		[HttpDelete("{id:long}")]
		public async Task<ActionResult> Delete(long id)
		{
			var ok = await _bookingRepo.DeleteAsync(id);
			return ok ? NoContent() : NotFound();
		}
	}
}


