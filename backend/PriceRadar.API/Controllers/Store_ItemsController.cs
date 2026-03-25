using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Route("api/store-items")]
public class Store_ItemsController : BaseController<Store_Item, IStore_ItemRepository>
{
	public Store_ItemsController(IStore_ItemRepository repo) : base(repo) { }

	[HttpGet("by-store/{storeId:long}")]
	public async Task<IActionResult> GetByStore(long storeId)
	{
		var all = await Repo.GetAllAsync();
		return Ok(all.Where(x => x.StoreId == storeId));
	}

	[HttpPatch("bulk/active")]
	public async Task<IActionResult> SetActiveMany([FromBody] SetActiveManyRequest request)
	{
		await Repo.SetActiveManyAsync(request.Ids, request.IsActive);
		return NoContent();
	}

	public record SetActiveManyRequest(IEnumerable<long> Ids, bool IsActive);
}
