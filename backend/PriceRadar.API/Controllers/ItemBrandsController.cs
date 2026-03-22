using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ItemBrandsController : BaseController<ItemBrand, IItemBrandRepository>
{
	public ItemBrandsController(IItemBrandRepository repo) : base(repo) { }

	[HttpGet("export-template")]
	public IActionResult ExportTemplate()
	{
		var bytes = ExcelService.GetItemBrandTemplate();
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "item-brands-template.xlsx");
	}

	[HttpGet("export-list")]
	public async Task<IActionResult> ExportList()
	{
		var brands = await Repo.GetAllAsync();
		var bytes = ExcelService.ExportItemBrandList(brands);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "item-brands.xlsx");
	}

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		using var stream = file.OpenReadStream();
		var brands = ExcelService.ParseItemBrands(stream);
		foreach (var brand in brands)
			await Repo.CreateAsync(brand);

		return Ok(new { imported = brands.Count });
	}
}
