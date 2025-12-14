using Microsoft.AspNetCore.Mvc;
using MobileAppServer.Abstracts;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Car;

namespace MobileAppServer.Controllers
{
    [ApiController]
    [Route("api/cars")]
    public class CarController : ControllerBase
    {
        private readonly ICarRepository _carRepository;

        public CarController(ICarRepository carRepository)
        {
            _carRepository = carRepository;
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<CarDTO>> GetById(long id)
        {
            try
            {
                var entity = await _carRepository.GetByIdAsync(id);
                return Ok(entity.ToDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("user/{userId:long}")]
        public async Task<ActionResult<List<CarDTO>>> GetByUserId(long userId)
        {
            var cars = await _carRepository.GetByUserIdAsync(userId);
            return Ok(cars.Select(c => c.ToDto()).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<CarDTO>> Create(CreateCarDTO dto)
        {
            var entity = dto.ToEntity();
            var created = await _carRepository.CreateAsync(entity);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToDto());
        }

        [HttpPut("{id:long}")]
        public async Task<ActionResult<CarDTO>> Update(long id, CreateCarDTO dto)
        {
            try
            {
                var entity = dto.ToEntity();
                entity.Id = id;
                var updated = await _carRepository.UpdateAsync(entity);
                return Ok(updated.ToDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id:long}")]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var ok = await _carRepository.DeleteAsync(id);
                return ok ? NoContent() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при удалении машины: {ex.Message}");
            }
        }
    }
}

