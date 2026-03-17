using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PriceHistoryController : ControllerBase
{
    private readonly IPriceHistoryRepository _history;

    public PriceHistoryController(IPriceHistoryRepository history)
    {
        _history = history;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string productId, [FromQuery] string storeId) =>
        Ok(await _history.GetByProductAndStoreAsync(productId, storeId));
}
