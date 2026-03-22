using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ItemPackagesController : BaseController<ItemPackage, IItemPackageRepository>
{
	public ItemPackagesController(IItemPackageRepository repo) : base(repo) { }

	[HttpGet("active")]
	public async Task<IActionResult> GetActive() =>
		Ok(await Repo.GetActiveAsync());

	[HttpGet("export-template")]
	public IActionResult ExportTemplate()
	{
		var bytes = ExcelService.GetItemPackageTemplate();
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "item-packages-template.xlsx");
	}

	[HttpGet("export-list")]
	public async Task<IActionResult> ExportList()
	{
		var packages = await Repo.GetAllAsync();
		var bytes = ExcelService.ExportItemPackageList(packages);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "item-packages.xlsx");
	}

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		using var stream = file.OpenReadStream();
		var packages = ExcelService.ParseItemPackages(stream);
		foreach (var pkg in packages)
			await Repo.CreateAsync(pkg);

		return Ok(new { imported = packages.Count });
	}
}
