using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CartItemsController : ControllerBase
{
    private readonly ICartItemRepository _repo;

    public CartItemsController(ICartItemRepository repo) => _repo = repo;

    private long CurrentUserId =>
        long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub")
                   ?? throw new UnauthorizedAccessException());

    [HttpGet]
    [HttpGet("getAll")]
    public async Task<IActionResult> GetMine()
    {
        var items = await _repo.GetByUserIdAsync(CurrentUserId);
        return Ok(items);
    }

    [HttpPost("{productItemId:long}")]
    public async Task<IActionResult> Add(long productItemId)
    {
        if (await _repo.ExistsAsync(CurrentUserId, productItemId))
            return Conflict();

        await _repo.CreateAsync(new CartItem
        {
            UserId        = CurrentUserId,
            ProductItemId = productItemId,
        });
        return Ok();
    }

    [HttpDelete("{productItemId:long}")]
    public async Task<IActionResult> Remove(long productItemId)
    {
        await _repo.RemoveByUserItemAsync(CurrentUserId, productItemId);
        return NoContent();
    }
}
