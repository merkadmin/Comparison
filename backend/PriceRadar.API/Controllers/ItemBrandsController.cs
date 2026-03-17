using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

// All standard CRUD endpoints inherited from BaseController.
public class ItemBrandsController : BaseController<ItemBrand, IItemBrandRepository>
{
	public ItemBrandsController(IItemBrandRepository repo) : base(repo) { }
}
