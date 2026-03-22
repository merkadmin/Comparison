using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ItemsController : BaseController<Item, IItemRepository>
{
	public ItemsController(IItemRepository repo) : base(repo) { }

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
		var items = await Repo.GetAllAsync();
		var bytes = ExcelService.ExportItemList(items);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "items.xlsx");
	}

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		using var stream = file.OpenReadStream();
		var items = ExcelService.ParseItems(stream);
		foreach (var item in items)
			await Repo.CreateAsync(item);

		return Ok(new { imported = items.Count });
	}
}
