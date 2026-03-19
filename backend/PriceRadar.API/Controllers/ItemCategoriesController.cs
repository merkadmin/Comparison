using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ItemCategoriesController : BaseController<ItemCategory, IBaseRepository<ItemCategory>>
{
	public ItemCategoriesController(IBaseRepository<ItemCategory> repo) : base(repo) { }

	[HttpGet("export-template")]
	public IActionResult ExportTemplate()
	{
		var bytes = ExcelService.GetItemCategoryTemplate();
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "item-categories-template.xlsx");
	}

	[HttpDelete("{id:long}")]
	public override async Task<IActionResult> Delete(long id)
	{
		if (await Repo.GetByIdAsync(id) is null)
			return NotFound();

		// Collect the target + all descendants so children are removed together
		var all = (await Repo.GetAllAsync()).ToList();
		var toDelete = new List<long> { id };
		CollectDescendants(id, all, toDelete);

		await Repo.DeleteManyAsync(toDelete);
		return NoContent();
	}

	[HttpDelete("bulk")]
	public async Task<IActionResult> DeleteMany([FromBody] IEnumerable<long> ids)
	{
		// Expand each requested ID to include all its descendants (cascade)
		var all = (await Repo.GetAllAsync()).ToList();
		var toDelete = new List<long>(ids);
		foreach (var id in ids)
			CollectDescendants(id, all, toDelete);

		await Repo.DeleteManyAsync(toDelete.Distinct());
		return NoContent();
	}

	[HttpGet("{id:long}/descendant-count")]
	public async Task<IActionResult> GetDescendantCount(long id)
	{
		var all         = (await Repo.GetAllAsync()).ToList();
		var descendants = new List<long>();
		CollectDescendants(id, all, descendants);
		return Ok(descendants.Count);
	}

	[HttpPatch("{id:long}/active")]
	public override async Task<IActionResult> SetActive(long id, [FromBody] bool isActive)
	{
		var all     = (await Repo.GetAllAsync()).ToList();
		var targets = new List<long> { id };
		CollectDescendants(id, all, targets);

		await Repo.SetActiveManyAsync(targets, isActive);
		return NoContent();
	}

	// Recursively collects the IDs of all descendants of parentId into result.
	private static void CollectDescendants(long parentId, List<ItemCategory> all, List<long> result)
	{
		foreach (var child in all.Where(c => c.ParentCategoryId == parentId))
		{
			result.Add(child.Id);
			CollectDescendants(child.Id, all, result);
		}
	}

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		// Load existing categories; use a mutable list so newly inserted rows
		// can also serve as parents for later rows in the same file.
		var existing = (await Repo.GetAllAsync()).ToList();

		// ClosedXML requires a seekable stream; IFormFile.OpenReadStream() is not seekable.
		using var ms = new MemoryStream();
		await file.CopyToAsync(ms);
		ms.Position = 0;

		List<(ItemCategory Category, string? ParentRef)> parsed;
		try
		{
			parsed = ExcelService.ParseItemCategories(ms);
		}
		catch (Exception ex)
		{
			return BadRequest($"Failed to parse Excel file: {ex.Message}");
		}

		foreach (var (cat, parentRef) in parsed)
		{
			// Resolve parent by name (En / Ar / Fr), case-insensitive.
			// Use string.Equals() instead of instance .Equals() to handle null Ar/Fr gracefully.
			if (parentRef is not null)
			{
				var match = existing.FirstOrDefault(c =>
					string.Equals(c.Name.En, parentRef, StringComparison.OrdinalIgnoreCase) ||
					string.Equals(c.Name.Ar, parentRef, StringComparison.OrdinalIgnoreCase) ||
					string.Equals(c.Name.Fr, parentRef, StringComparison.OrdinalIgnoreCase));

				if (match is not null)
					cat.ParentCategoryId = match.Id;
			}

			cat.CreatedAt = DateTime.UtcNow;
			var created = await Repo.CreateAsync(cat);
			// Add to existing so later rows in the same file can reference this as a parent
			existing.Add(created);
		}

		return Ok(new { imported = parsed.Count });
	}
}
