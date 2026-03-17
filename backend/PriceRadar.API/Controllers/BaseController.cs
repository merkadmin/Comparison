using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;

namespace PriceRadar.API.Controllers;

/// <summary>
/// Generic base controller providing standard CRUD endpoints for any model + repository pair.
///
/// Inherit from this and pass your model type and repository interface:
///   public class ItemCategoriesController : BaseController&lt;ItemCategory, IItemCategoryRepository&gt;
///
/// Endpoints provided automatically:
///   GET    /api/[controller]       → GetAll()
///   GET    /api/[controller]/{id}  → GetById(id)
///   POST   /api/[controller]       → Create(body)
///   PUT    /api/[controller]/{id}  → Update(id, body)
///   DELETE /api/[controller]/{id}  → Delete(id)
///
/// Override any method in the child controller to customise behaviour.
/// Add extra endpoints in the child controller without touching the base.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public abstract class BaseController<TModel, TRepo> : ControllerBase
	where TRepo : IBaseRepository<TModel>
{
	protected readonly TRepo Repo;

	protected BaseController(TRepo repo)
	{
		Repo = repo;
	}

	// ── GET /api/[controller] ────────────────────────────────────────────────
	[HttpGet]
	public virtual async Task<IActionResult> GetAll()
	{
		var items = await Repo.GetAllAsync();
		return Ok(items);
	}

	// ── GET /api/[controller]/{id} ───────────────────────────────────────────
	[HttpGet("{id}")]
	public virtual async Task<IActionResult> GetById(string id)
	{
		var item = await Repo.GetByIdAsync(id);
		return item is null ? NotFound() : Ok(item);
	}

	// ── POST /api/[controller] ───────────────────────────────────────────────
	[HttpPost]
	public virtual async Task<IActionResult> Create([FromBody] TModel entity)
	{
		var created = await Repo.CreateAsync(entity);
		return CreatedAtAction(nameof(GetById), new { id = GetId(created) }, created);
	}

	// ── PUT /api/[controller]/{id} ───────────────────────────────────────────
	[HttpPut("{id}")]
	public virtual async Task<IActionResult> Update(string id, [FromBody] TModel entity)
	{
		if (await Repo.GetByIdAsync(id) is null)
			return NotFound();

		await Repo.UpdateAsync(id, entity);
		return NoContent();
	}

	// ── DELETE /api/[controller]/{id} ────────────────────────────────────────
	[HttpDelete("{id}")]
	public virtual async Task<IActionResult> Delete(string id)
	{
		if (await Repo.GetByIdAsync(id) is null)
			return NotFound();

		await Repo.DeleteAsync(id);
		return NoContent();
	}

	// ── Helper: extract Id from any model via reflection ────────────────────
	// All Core models have a string? Id property — this avoids a separate
	// IIdentifiable interface while keeping the base generic.
	private static string? GetId(TModel entity) =>
		typeof(TModel).GetProperty("Id")?.GetValue(entity) as string;
}
