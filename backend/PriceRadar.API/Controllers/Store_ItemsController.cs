using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Route("api/store-items")]
public class Store_ItemsController : BaseController<Store_Item, IStore_ItemRepository>
{
	private readonly IProductItem_VariantRepository _variantMaps;
	private readonly IProductItemRepository _productItems;

	public Store_ItemsController(
		IStore_ItemRepository repo,
		IProductItem_VariantRepository variantMaps,
		IProductItemRepository productItems)
		: base(repo)
	{
		_variantMaps = variantMaps;
		_productItems = productItems;
	}

	/// <summary>
	/// Returns all active store items with selling prices overridden by variant-map prices where applicable.
	/// Per-item, per-store: if a variant map exists with SellingPrice + StoreId, the minimum such price wins.
	/// </summary>
	[HttpGet("effective-prices")]
	public async Task<IActionResult> GetEffectivePrices()
	{
		var storeItems = await Repo.GetAllAsync();
		var variantMaps = await _variantMaps.GetAllAsync();

		// Build override map: (itemId, storeId) → min SellingPrice from variant maps
		var overrides = new Dictionary<(long, long), decimal>();
		foreach (var vm in variantMaps)
		{
			if (!vm.IsActive || vm.IsDeleted || vm.SellingPrice == null || vm.StoreId == null) continue;
			var key = (vm.ProductItemId, vm.StoreId.Value);
			if (!overrides.TryGetValue(key, out var cur) || vm.SellingPrice.Value < cur)
				overrides[key] = vm.SellingPrice.Value;
		}

		var result = storeItems
			.Where(si => si.IsActive && !si.IsDeleted)
			.Select(si =>
			{
				if (overrides.TryGetValue((si.ItemId, si.StoreId), out var price))
					return new Store_Item
					{
						Id = si.Id,
						ItemId = si.ItemId,
						StoreId = si.StoreId,
						SellingPrice = price,
						SellingPriceTypeId = si.SellingPriceTypeId,
						IsActive = si.IsActive,
						IsDeleted = si.IsDeleted,
						CreatedAt = si.CreatedAt,
					};
				return si;
			});

		return Ok(result);
	}

	/// <summary>
	/// Returns the single best (minimum effective) price per item across all stores.
	/// Variant-map prices take precedence over store-item prices.
	/// </summary>
	[HttpGet("best-prices")]
	public async Task<IActionResult> GetBestPrices()
	{
		var storeItems = await Repo.GetAllAsync();
		var variantMaps = await _variantMaps.GetAllAsync();

		// Build override map: (itemId, storeId) → min SellingPrice from variant maps
		var overrides = new Dictionary<(long, long), decimal>();
		foreach (var vm in variantMaps)
		{
			if (!vm.IsActive || vm.IsDeleted || vm.SellingPrice == null || vm.StoreId == null) continue;
			var key = (vm.ProductItemId, vm.StoreId.Value);
			if (!overrides.TryGetValue(key, out var cur) || vm.SellingPrice.Value < cur)
				overrides[key] = vm.SellingPrice.Value;
		}

		// Compute effective price per active store-item, then keep min per item
		var best = new Dictionary<long, BestPriceDto>();
		foreach (var si in storeItems.Where(si => si.IsActive && !si.IsDeleted))
		{
			var price = overrides.TryGetValue((si.ItemId, si.StoreId), out var ov) ? ov : si.SellingPrice;
			if (!best.TryGetValue(si.ItemId, out var cur) || price < cur.SellingPrice)
				best[si.ItemId] = new BestPriceDto(si.ItemId, si.StoreId, price);
		}

		return Ok(best.Values);
	}

	/// <summary>
	/// Returns the best effective price per item for all items in a given category.
	/// Variant-map prices take precedence over store-item prices.
	/// </summary>
	[HttpGet("best-prices/by-category/{categoryId:long}")]
	public async Task<IActionResult> GetBestPricesByCategory(long categoryId)
	{
		var itemIds = (await _productItems.GetByCategoryAsync(categoryId))
			.Select(i => i.Id).ToHashSet();
		if (itemIds.Count == 0)
			return Ok(Array.Empty<BestPriceDto>());

		var storeItems  = await Repo.GetAllAsync();
		var variantMaps = await _variantMaps.GetAllAsync();

		// Step 1 — variant prices: (itemId, storeId) → min price from ProductItem_Variant
		var variantPrices = new Dictionary<(long, long), decimal>();
		foreach (var vm in variantMaps)
		{
			if (!vm.IsActive || vm.IsDeleted || !itemIds.Contains(vm.ProductItemId)) continue;
			if (vm.SellingPrice == null || vm.StoreId == null) continue;
			var key = (vm.ProductItemId, vm.StoreId.Value);
			if (!variantPrices.TryGetValue(key, out var cur) || vm.SellingPrice.Value < cur)
				variantPrices[key] = vm.SellingPrice.Value;
		}

		// Step 2 — store-item prices: (itemId, storeId) → min price from Store_Item
		var storePrices = new Dictionary<(long, long), decimal>();
		foreach (var si in storeItems.Where(si => si.IsActive && !si.IsDeleted && itemIds.Contains(si.ItemId)))
		{
			var key = (si.ItemId, si.StoreId);
			if (!storePrices.TryGetValue(key, out var cur) || si.SellingPrice < cur)
				storePrices[key] = si.SellingPrice;
		}

		// Step 3 — union all (itemId, storeId) pairs:
		//   use ProductItem_Variant price if available, otherwise fall back to Store_Item price.
		//   then keep the minimum price per item.
		var allKeys = new HashSet<(long, long)>(variantPrices.Keys);
		allKeys.UnionWith(storePrices.Keys);

		var best = new Dictionary<long, BestPriceDto>();
		foreach (var (itemId, storeId) in allKeys)
		{
			var price = variantPrices.TryGetValue((itemId, storeId), out var vp)
				? vp
				: storePrices[(itemId, storeId)];

			if (!best.TryGetValue(itemId, out var cur) || price < cur.SellingPrice)
				best[itemId] = new BestPriceDto(itemId, storeId, price);
		}

		return Ok(best.Values);
	}

	[HttpPatch("bulk/active")]
	public async Task<IActionResult> SetActiveMany([FromBody] BulkActiveRequest request)
	{
		await Repo.SetActiveManyAsync(request.Ids, request.IsActive);
		return NoContent();
	}

	[HttpGet("export-template")]
	public IActionResult ExportTemplate()
	{
		var bytes = ExcelService.GetStoreItemTemplate();
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "store-items-template.xlsx");
	}

	[HttpGet("export-list")]
	public async Task<IActionResult> ExportList()
	{
		var storeItems = await Repo.GetAllAsync();
		var bytes = ExcelService.ExportStoreItemList(storeItems);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "store-items.xlsx");
	}

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		using var stream = file.OpenReadStream();
		var storeItems = ExcelService.ParseStoreItems(stream);
		foreach (var si in storeItems)
			await Repo.CreateAsync(si);

		return Ok(new { imported = storeItems.Count });
	}

	public record BulkActiveRequest(IEnumerable<long> Ids, bool IsActive);
	public record BestPriceDto(long ItemId, long StoreId, decimal SellingPrice);
}
