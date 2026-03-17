using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

// Standard CRUD inherited — only the active-filter endpoint is defined here.
public class ItemPackagesController : BaseController<ItemPackage, IItemPackageRepository>
{
	public ItemPackagesController(IItemPackageRepository repo) : base(repo) { }

	[HttpGet("active")]
	public async Task<IActionResult> GetActive() =>
		Ok(await Repo.GetActiveAsync());
}
