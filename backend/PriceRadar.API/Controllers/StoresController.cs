using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

// All standard CRUD endpoints inherited from BaseController.
public class StoresController : BaseController<Store, IStoreRepository>
{
	public StoresController(IStoreRepository repo) : base(repo) { }
}
