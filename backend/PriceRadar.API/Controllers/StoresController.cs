using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly IStoreRepository _stores;

    public StoresController(IStoreRepository stores)
    {
        _stores = stores;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _stores.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var store = await _stores.GetByIdAsync(id);
        return store is null ? NotFound() : Ok(store);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Store store)
    {
        var created = await _stores.CreateAsync(store);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Store store)
    {
        await _stores.UpdateAsync(id, store);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _stores.DeleteAsync(id);
        return NoContent();
    }
}
