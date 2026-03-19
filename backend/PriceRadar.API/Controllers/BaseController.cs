using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;

namespace PriceRadar.API.Controllers;

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

	[HttpGet]
	public virtual async Task<IActionResult> GetAll()
	{
		var items = await Repo.GetAllAsync();
		return Ok(items);
	}

	[HttpGet("{id:long}")]
	public virtual async Task<IActionResult> GetById(long id)
	{
		var item = await Repo.GetByIdAsync(id);
		return item is null ? NotFound() : Ok(item);
	}

	[HttpPost]
	public virtual async Task<IActionResult> Create([FromBody] TModel entity)
	{
		var created = await Repo.CreateAsync(entity);
		return CreatedAtAction(nameof(GetById), new { id = GetId(created) }, created);
	}

	[HttpPut("{id:long}")]
	public virtual async Task<IActionResult> Update(long id, [FromBody] TModel entity)
	{
		if (await Repo.GetByIdAsync(id) is null)
			return NotFound();

		await Repo.UpdateAsync(id, entity);
		return NoContent();
	}

	[HttpDelete("{id:long}")]
	public virtual async Task<IActionResult> Delete(long id)
	{
		if (await Repo.GetByIdAsync(id) is null)
			return NotFound();

		await Repo.DeleteAsync(id);
		return NoContent();
	}

	[HttpDelete("bulk")]
	public virtual async Task<IActionResult> DeleteMany([FromBody] IEnumerable<long> ids)
	{
		await Repo.DeleteManyAsync(ids);
		return NoContent();
	}

	[HttpPatch("{id:long}/active")]
	public virtual async Task<IActionResult> SetActive(long id, [FromBody] bool isActive)
	{
		await Repo.SetActiveAsync(id, isActive);
		return NoContent();
	}

	private static long GetId(TModel entity) =>
		(long)(typeof(TModel).GetProperty("Id")?.GetValue(entity) ?? 0L);
}
