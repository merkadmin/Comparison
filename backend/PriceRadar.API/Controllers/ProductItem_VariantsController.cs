using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Route("api/item-variant-map")]
public class ProductItem_VariantsController : BaseController<ProductItem_Variant, IProductItem_VariantRepository>
{
    private readonly IStore_ItemRepository _storeItems;

    public ProductItem_VariantsController(IProductItem_VariantRepository repo, IStore_ItemRepository storeItems)
        : base(repo)
    {
        _storeItems = storeItems;
    }

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

    /// <summary>
    /// Returns selling prices and store IDs for a product item.
    /// If any variant-map records for this item have SellingPrice + StoreId set,
    /// those are returned. Otherwise falls back to Store_Item records.
    /// </summary>
    [HttpGet("prices/{itemId:long}")]
    public async Task<IActionResult> GetPrices(long itemId)
    {
        var allMaps = await Repo.GetAllAsync();
        var itemMaps = allMaps.Where(v => v.ProductItemId == itemId && v.IsActive && !v.IsDeleted).ToList();

        var variantPrices = itemMaps
            .Where(v => v.SellingPrice.HasValue && v.StoreId.HasValue)
            .Select(v => new ItemPriceDto(
                StoreId:      v.StoreId!.Value,
                SellingPrice: v.SellingPrice!.Value,
                VariantId:    v.VariantId,
                Description:  v.Description,
                About:        v.About,
                Source:       "variant"))
            .ToList();

        if (variantPrices.Count > 0)
            return Ok(variantPrices);

        // Fallback: use Store_Item records for this item
        var storeItems = await _storeItems.GetAllAsync();
        var fallback = storeItems
            .Where(s => s.ItemId == itemId && s.IsActive && !s.IsDeleted)
            .Select(s => new ItemPriceDto(
                StoreId:      s.StoreId,
                SellingPrice: s.SellingPrice,
                VariantId:    null,
                Description:  null,
                About:        null,
                Source:       "store_item"))
            .ToList();

        return Ok(fallback);
    }

    [HttpPatch("bulk/active")]
    public async Task<IActionResult> SetActiveMany([FromBody] SetActiveManyRequest request)
    {
        await Repo.SetActiveManyAsync(request.Ids, request.IsActive);
        return NoContent();
    }

    public record SetActiveManyRequest(IEnumerable<long> Ids, bool IsActive);
    public record ItemPriceDto(long StoreId, decimal SellingPrice, long? VariantId, string? Description, string? About, string Source);
}
