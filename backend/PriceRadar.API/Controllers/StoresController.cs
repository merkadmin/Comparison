using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class StoresController : BaseController<Store, IStoreRepository>
{
	private readonly IStore_ItemRepository _storeItems;

	public StoresController(IStoreRepository repo, IStore_ItemRepository storeItems) : base(repo)
	{
		_storeItems = storeItems;
	}

	// ── Duplicate-name check ──────────────────────────────────────────────────

	private async Task<bool> NameExistsAsync(string name, long excludeId = 0)
	{
		var all = await Repo.GetAllAsync();
		return all.Any(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase) && s.Id != excludeId);
	}

	// ── Overrides ─────────────────────────────────────────────────────────────

	public override async Task<IActionResult> Create([FromBody] Store entity)
	{
		if (await NameExistsAsync(entity.Name))
			return Conflict(new { message = $"A store named '{entity.Name}' already exists." });

		var created = await Repo.CreateAsync(entity);
		return StatusCode(201, created);
	}

	public override async Task<IActionResult> Update(long id, [FromBody] Store entity)
	{
		if (await Repo.GetByIdAsync(id) is null)
			return NotFound();

		if (await NameExistsAsync(entity.Name, excludeId: id))
			return Conflict(new { message = $"A store named '{entity.Name}' already exists." });

		await Repo.UpdateAsync(id, entity);
		return NoContent();
	}

	public override async Task<IActionResult> Delete(long id)
	{
		if (await Repo.GetByIdAsync(id) is null)
			return NotFound();

		await Repo.HardDeleteAsync(id);
		await HardDeleteStoreItemsAsync(id);
		return NoContent();
	}

	public override async Task<IActionResult> DeleteMany([FromBody] IEnumerable<long> ids)
	{
		var idList = ids.ToList();
		await Repo.HardDeleteManyAsync(idList);
		foreach (var id in idList)
			await HardDeleteStoreItemsAsync(id);
		return NoContent();
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	private async Task HardDeleteStoreItemsAsync(long storeId)
	{
		var items = await _storeItems.GetAllAsync();
		var ids = items.Where(i => i.StoreId == storeId).Select(i => i.Id).ToList();
		if (ids.Count > 0)
			await _storeItems.HardDeleteManyAsync(ids);
	}

	// ── Excel endpoints ───────────────────────────────────────────────────────

	[HttpGet("export-template")]
	public IActionResult ExportTemplate()
	{
		var bytes = ExcelService.GetStoreTemplate();
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "stores-template.xlsx");
	}

	[HttpGet("export-list")]
	public async Task<IActionResult> ExportList()
	{
		var stores = await Repo.GetAllAsync();
		var bytes = ExcelService.ExportStoreList(stores);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "stores.xlsx");
	}

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		using var stream = file.OpenReadStream();
		var stores = ExcelService.ParseStores(stream);
		foreach (var store in stores)
			await Repo.CreateAsync(store);

		return Ok(new { imported = stores.Count });
	}
}
