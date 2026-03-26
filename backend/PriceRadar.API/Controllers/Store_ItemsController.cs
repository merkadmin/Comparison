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
        return Ok(all.Where(i => i.StoreId == storeId));
    }

    /// <summary>
    /// Replaces all items for a store: deletes existing ones and inserts the new list.
    /// </summary>
    [HttpPut("by-store/{storeId:long}")]
    public async Task<IActionResult> ReplaceByStore(long storeId, [FromBody] List<Store_Item> items)
    {
        var existing = await Repo.GetAllAsync();
        var ids = existing.Where(i => i.StoreId == storeId).Select(i => i.Id).ToList();
        if (ids.Count > 0)
            await Repo.DeleteManyAsync(ids);

        var created = new List<Store_Item>();
        foreach (var item in items)
        {
            item.StoreId = storeId;
            created.Add(await Repo.CreateAsync(item));
        }
        return Ok(created);
    }
}
