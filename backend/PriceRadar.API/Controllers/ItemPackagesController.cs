using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemPackagesController : ControllerBase
{
    private readonly IItemPackageRepository _repo;

    public ItemPackagesController(IItemPackageRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _repo.GetAllAsync());

    [HttpGet("active")]
    public async Task<IActionResult> GetActive() =>
        Ok(await _repo.GetActiveAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var package = await _repo.GetByIdAsync(id);
        return package is null ? NotFound() : Ok(package);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ItemPackage package)
    {
        var created = await _repo.CreateAsync(package);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ItemPackage package)
    {
        await _repo.UpdateAsync(id, package);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }
}
