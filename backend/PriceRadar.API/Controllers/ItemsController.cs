using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

// Standard CRUD inherited — only the extra filter endpoints are defined here.
public class ItemsController : BaseController<Item, IItemRepository>
{
	public ItemsController(IItemRepository repo) : base(repo) { }

	[HttpGet("by-category/{categoryId}")]
	public async Task<IActionResult> GetByCategory(string categoryId) =>
		Ok(await Repo.GetByCategoryAsync(categoryId));

	[HttpGet("by-brand/{brandId}")]
	public async Task<IActionResult> GetByBrand(string brandId) =>
		Ok(await Repo.GetByBrandAsync(brandId));
}
