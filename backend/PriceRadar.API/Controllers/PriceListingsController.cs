using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PriceListingsController : ControllerBase
{
    private readonly IPriceListingRepository _listings;

    public PriceListingsController(IPriceListingRepository listings)
    {
        _listings = listings;
    }

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(string productId) =>
        Ok(await _listings.GetByProductIdAsync(productId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var listing = await _listings.GetByIdAsync(id);
        return listing is null ? NotFound() : Ok(listing);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PriceListing listing)
    {
        var created = await _listings.CreateAsync(listing);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] PriceListing listing)
    {
        await _listings.UpdateAsync(id, listing);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _listings.DeleteAsync(id);
        return NoContent();
    }
}
