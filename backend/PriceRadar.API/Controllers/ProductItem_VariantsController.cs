using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Route("api/item-variant-map")]
public class ProductItem_VariantsController : BaseController<ProductItem_Variant, IProductItem_VariantRepository>
{
    public ProductItem_VariantsController(IProductItem_VariantRepository repo) : base(repo) { }

    [HttpGet("by-item/{itemId:long}")]
    public async Task<IActionResult> GetByItem(long itemId)
    {
        var all = await Repo.GetAllAsync();
        return Ok(all.Where(v => v.ProductItemId == itemId));
    }

    [HttpGet("by-variant/{variantId:long}")]
    public async Task<IActionResult> GetByVariant(long variantId)
    {
        var all = await Repo.GetAllAsync();
        return Ok(all.Where(v => v.VariantId == variantId));
    }

    [HttpPatch("bulk/active")]
    public async Task<IActionResult> SetActiveMany([FromBody] SetActiveManyRequest request)
    {
        await Repo.SetActiveManyAsync(request.Ids, request.IsActive);
        return NoContent();
    }

    public record SetActiveManyRequest(IEnumerable<long> Ids, bool IsActive);
}
