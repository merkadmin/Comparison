using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Route("api/store-items")]
public class Store_ItemsController : BaseController<Store_Item, IStore_ItemRepository>
{
	public Store_ItemsController(IStore_ItemRepository repo) : base(repo) { }

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
}
