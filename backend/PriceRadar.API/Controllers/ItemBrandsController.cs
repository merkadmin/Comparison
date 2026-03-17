using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemBrandsController : ControllerBase
{
    private readonly IItemBrandRepository _repo;

    public ItemBrandsController(IItemBrandRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _repo.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var brand = await _repo.GetByIdAsync(id);
        return brand is null ? NotFound() : Ok(brand);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ItemBrand brand)
    {
        var created = await _repo.CreateAsync(brand);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ItemBrand brand)
    {
        await _repo.UpdateAsync(id, brand);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }
}
