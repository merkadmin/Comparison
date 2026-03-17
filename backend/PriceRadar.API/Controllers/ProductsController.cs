using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

// Standard CRUD inherited — only the search endpoint is defined here.
public class ProductsController : BaseController<Product, IProductRepository>
{
	public ProductsController(IProductRepository repo) : base(repo) { }

	[HttpGet("search")]
	public async Task<IActionResult> Search([FromQuery] string keyword) =>
		Ok(await Repo.SearchAsync(keyword));
}
