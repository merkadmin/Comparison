using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class TableNamesController : BaseController<TableName, ITableNameRepository>
{
	public TableNamesController(ITableNameRepository repo) : base(repo) { }

	/// <summary>Returns table metadata by exact name (case-insensitive).</summary>
	[HttpGet("by-name/{name}")]
	public async Task<IActionResult> GetByName(string name)
	{
		var all = await Repo.GetAllAsync();
		var match = all.FirstOrDefault(t =>
			string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));
		return match is null ? NotFound() : Ok(match);
	}
}
