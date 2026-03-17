using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

// Standard CRUD inherited — only the by-product filter is defined here.
public class PriceListingsController : BaseController<PriceListing, IPriceListingRepository>
{
	public PriceListingsController(IPriceListingRepository repo) : base(repo) { }

	[HttpGet("product/{productId}")]
	public async Task<IActionResult> GetByProduct(string productId) =>
		Ok(await Repo.GetByProductIdAsync(productId));
}
