using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

// All standard CRUD endpoints (GET all, GET by id, POST, PUT, DELETE)
// are inherited from BaseController — nothing extra needed here.
public class ItemCategoriesController : BaseController<ItemCategory, IItemCategoryRepository>
{
	public ItemCategoriesController(IItemCategoryRepository repo) : base(repo) { }
}
