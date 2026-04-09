using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ItemsController : BaseController<ProductItem, IProductItemRepository>
{
	private readonly IItemBrandRepository _brands;
	private readonly IBaseRepository<ItemCategory> _categories;
	private readonly IProductItem_VariantRepository _variantMaps;

	public ItemsController(
		IProductItemRepository repo,
		IItemBrandRepository brands,
		IBaseRepository<ItemCategory> categories,
		IProductItem_VariantRepository variantMaps)
		: base(repo)
	{
		_brands      = brands;
		_categories  = categories;
		_variantMaps = variantMaps;
	}

	[HttpGet("search")]
	public async Task<IActionResult> Search([FromQuery] string q)
	{
		if (string.IsNullOrWhiteSpace(q)) return Ok(Array.Empty<ProductItem>());
		var all = await Repo.GetAllAsync();
		return Ok(all
			.Where(i => i.IsActive && i.Name.Contains(q, StringComparison.OrdinalIgnoreCase))
			.Take(10));
	}

	[HttpGet("by-category/{categoryId:long}")]
	public async Task<IActionResult> GetByCategory(long categoryId) =>
		Ok(await Repo.GetByCategoryAsync(categoryId));

	[HttpGet("by-brand/{brandId:long}")]
	public async Task<IActionResult> GetByBrand(long brandId) =>
		Ok(await Repo.GetByBrandAsync(brandId));

	[HttpGet("by-type/{typeId:long}")]
	public async Task<IActionResult> GetByType(long typeId) =>
		Ok(await Repo.GetByTypeAsync(typeId));

	/// <summary>
	/// Returns the single best (minimum) selling price per item across all stores.
	/// </summary>
	[HttpGet("best-prices")]
	public async Task<IActionResult> GetBestPrices()
	{
		var maps = await _variantMaps.GetAllAsync();
		var best = new Dictionary<long, BestPriceDto>();
		foreach (var vm in maps.Where(vm => vm.IsActive && !vm.IsDeleted))
		{
			if (!best.TryGetValue(vm.ProductItemId, out var cur) || vm.SellingPrice < cur.SellingPrice)
				best[vm.ProductItemId] = new BestPriceDto(vm.ProductItemId, vm.StoreId, vm.SellingPrice);
		}
		return Ok(best.Values);
	}

	/// <summary>
	/// Returns the best selling price per item for all items in a given category.
	/// </summary>
	[HttpGet("best-prices/by-category/{categoryId:long}")]
	public async Task<IActionResult> GetBestPricesByCategory(long categoryId)
	{
		var itemIds = (await Repo.GetByCategoryAsync(categoryId))
			.Select(i => i.Id).ToHashSet();
		if (itemIds.Count == 0)
			return Ok(Array.Empty<BestPriceDto>());

		var maps = await _variantMaps.GetAllAsync();
		var best = new Dictionary<long, BestPriceDto>();
		foreach (var vm in maps.Where(vm => vm.IsActive && !vm.IsDeleted && itemIds.Contains(vm.ProductItemId)))
		{
			if (!best.TryGetValue(vm.ProductItemId, out var cur) || vm.SellingPrice < cur.SellingPrice)
				best[vm.ProductItemId] = new BestPriceDto(vm.ProductItemId, vm.StoreId, vm.SellingPrice);
		}
		return Ok(best.Values);
	}

	public record BestPriceDto(long ItemId, long StoreId, decimal SellingPrice);

	[HttpGet("export-template")]
	public IActionResult ExportTemplate()
	{
		var bytes = ExcelService.GetItemTemplate();
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "items-template.xlsx");
	}

	[HttpGet("export-list")]
	public async Task<IActionResult> ExportList()
	{
		var items      = await Repo.GetAllAsync();
		var brands     = await _brands.GetAllAsync();
		var categories = await _categories.GetAllAsync();
		var bytes = ExcelService.ExportItemList(items, brands, categories);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "items.xlsx");
	}

	[HttpPost("parse-dom")]
	public async Task<IActionResult> ParseDom([FromBody] ParseDomRequest request)
	{
		if (string.IsNullOrWhiteSpace(request?.Html))
			return BadRequest("Html is required.");
		var brands = await _brands.GetAllAsync();
		var result = DomParserService.Parse(request.Html, brands);
		return Ok(result);
	}

	public record ParseDomRequest(string Html);

	[HttpPost("parse-text")]
	public async Task<IActionResult> ParseText([FromBody] ParseTextRequest request)
	{
		if (string.IsNullOrWhiteSpace(request?.Text))
			return BadRequest("Text is required.");
		var brands = await _brands.GetAllAsync();
		var result = ProductTextParserService.Parse(request.Text, brands);
		return Ok(result);
	}

	public record ParseTextRequest(string Text);

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		using var ms = new MemoryStream();
		await file.CopyToAsync(ms);
		ms.Position = 0;

		var parsed     = ExcelService.ParseItems(ms);
		var brands     = (await _brands.GetAllAsync()).ToList();
		var categories = (await _categories.GetAllAsync()).ToList();

		foreach (var (item, brandName, categoryName) in parsed)
		{
			if (brandName is not null)
			{
				var brand = brands.FirstOrDefault(b => string.Equals(b.Name, brandName, StringComparison.OrdinalIgnoreCase));
				if (brand is not null) item.BrandId = brand.Id;
			}
			if (categoryName is not null)
			{
				var cat = categories.FirstOrDefault(c => string.Equals(c.Name.En, categoryName, StringComparison.OrdinalIgnoreCase));
				if (cat is not null) item.CategoryIds = new List<long> { cat.Id };
			}
			await Repo.CreateAsync(item);
		}

		return Ok(new { imported = parsed.Count });
	}
}
