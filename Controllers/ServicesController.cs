using Microsoft.AspNetCore.Mvc;
using MobileAppServer.Abstracts;
using MobileAppServer.Entities;
using MobileAppServer.Mappers;
using MobileAppServer.Models.Service;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IServiceRepository _repo;

    public ServicesController(IServiceRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CreateServiceDTO>> Get(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        return Ok(entity.ToDto());
    }

    [HttpGet]
    public async Task<ActionResult<List<CreateServiceDTO>>> GetAll()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.Select(s => s.ToDto()).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<CreateServiceDTO>> Create(CreateServiceDTO model)
    {
        var entity = model.ToEntity();
        var created = await _repo.CreateAsync(entity);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created.ToDto());
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CreateServiceDTO>> Update(int id, CreateServiceDTO model)
    {
        model.Id = id;
        var updated = await _repo.UpdateAsync(model.ToEntity());
        return Ok(updated.ToDto());
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}