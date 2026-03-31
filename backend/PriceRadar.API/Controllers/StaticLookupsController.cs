using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/static")]
public class StaticLookupsController(MongoDbContext context) : ControllerBase
{
	[HttpGet("store-types")]
	public Task<IActionResult> GetStoreTypes() => GetAll(context.StoreTypes);

	[HttpGet("db-stores")]
	public Task<IActionResult> GetDBStores() => GetAll(context.DBStores);

	[HttpGet("price-history-types")]
	public Task<IActionResult> GetPriceHistoryTypes() => GetAll(context.PriceHistoryTypes);

	[HttpGet("selling-price-types")]
	public Task<IActionResult> GetSellingPriceTypes() => GetAll(context.SellingPriceTypes);

	[HttpGet("user-privileges")]
	public Task<IActionResult> GetUserPrivileges() => GetAll(context.UserPrivileges);

	[HttpGet("specification-categories")]
	public async Task<IActionResult> GetSpecificationCategories()
	{
		var notDeleted = Builders<SpecificationLookupDocument>.Filter.Eq(d => d.IsDeleted, false);
		var docs = await context.SpecificationCategories.Find(notDeleted).SortBy(d => d.Id).ToListAsync();
		return Ok(docs.Select(d => d.ToDto()));
	}

	private async Task<IActionResult> GetAll(IMongoCollection<StaticLookupDocument> col)
	{
		var notDeleted = Builders<StaticLookupDocument>.Filter.Eq(d => d.IsDeleted, false);
		var docs = await col.Find(notDeleted).SortBy(d => d.Id).ToListAsync();
		return Ok(docs.Select(d => d.ToModel()));
	}
}
