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
        return Ok(all.Where(v => v.Variants.Any(e => e.VariantId == variantId)));
    }

    /// <summary>
    /// Returns selling prices and store IDs for a product item from variant-map records.
    /// </summary>
    [HttpGet("prices/{itemId:long}")]
    public async Task<IActionResult> GetPrices(long itemId)
    {
        var all = await Repo.GetAllAsync();
        var prices = all
            .Where(v => v.ProductItemId == itemId && v.IsActive && !v.IsDeleted)
            .Select(v => new ItemPriceDto(
                StoreId:      v.StoreId,
                SellingPrice: v.SellingPrice,
                VariantIds:   v.Variants.Select(e => e.VariantId).ToList(),
                Description:  v.Description,
                About:        v.About,
                Source:       "variant"))
            .ToList();

        return Ok(prices);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulk([FromBody] List<ProductItem_Variant> items)
    {
        var results = new List<ProductItem_Variant>();
        foreach (var item in items)
            results.Add(await Repo.CreateAsync(item));
        return Ok(results);
    }

    [HttpPatch("bulk/active")]
    public async Task<IActionResult> SetActiveMany([FromBody] SetActiveManyRequest request)
    {
        await Repo.SetActiveManyAsync(request.Ids, request.IsActive);
        return NoContent();
    }

    public record SetActiveManyRequest(IEnumerable<long> Ids, bool IsActive);
    public record ItemPriceDto(long StoreId, decimal SellingPrice, List<long> VariantIds, string? Description, string? About, string Source);
}
