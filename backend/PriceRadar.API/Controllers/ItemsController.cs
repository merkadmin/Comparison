using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ItemsController : BaseController<Item, IItemRepository>
{
	private readonly IItemBrandRepository _brands;
	private readonly IBaseRepository<ItemCategory> _categories;

	public ItemsController(IItemRepository repo, IItemBrandRepository brands, IBaseRepository<ItemCategory> categories)
		: base(repo)
	{
		_brands     = brands;
		_categories = categories;
	}

	[HttpGet("by-category/{categoryId:long}")]
	public async Task<IActionResult> GetByCategory(long categoryId) =>
		Ok(await Repo.GetByCategoryAsync(categoryId));

	[HttpGet("by-brand/{brandId:long}")]
	public async Task<IActionResult> GetByBrand(long brandId) =>
		Ok(await Repo.GetByBrandAsync(brandId));

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
				if (cat is not null) item.ItemCategoryId = cat.Id;
			}
			await Repo.CreateAsync(item);
		}

		return Ok(new { imported = parsed.Count });
	}
}
