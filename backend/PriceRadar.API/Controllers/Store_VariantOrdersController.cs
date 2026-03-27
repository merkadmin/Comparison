using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Route("api/store-variant-orders")]
public class Store_VariantOrdersController : BaseController<Store_VariantOrder, IStore_VariantOrderRepository>
{
    public Store_VariantOrdersController(IStore_VariantOrderRepository repo) : base(repo) { }

    [HttpPatch("bulk/active")]
    public async Task<IActionResult> SetActiveMany([FromBody] SetActiveManyRequest request)
    {
        await Repo.SetActiveManyAsync(request.Ids, request.IsActive);
        return NoContent();
    }

    [HttpGet("export-template")]
    public IActionResult ExportTemplate()
    {
        var bytes = ExcelService.GetStoreVariantOrderTemplate();
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "store-variant-orders-template.xlsx");
    }

    [HttpGet("export-list")]
    public async Task<IActionResult> ExportList()
    {
        var orders = await Repo.GetAllAsync();
        var bytes = ExcelService.ExportStoreVariantOrderList(orders);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "store-variant-orders.xlsx");
    }

    [HttpPost("import")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Import(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        using var stream = file.OpenReadStream();
        var orders = ExcelService.ParseStoreVariantOrders(stream);
        foreach (var order in orders)
            await Repo.CreateAsync(order);

        return Ok(new { imported = orders.Count });
    }

    public record SetActiveManyRequest(IEnumerable<long> Ids, bool IsActive);
}
