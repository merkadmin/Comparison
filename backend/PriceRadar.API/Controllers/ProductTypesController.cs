using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ProductTypesController : BaseController<ProductType, IProductTypeRepository>
{
    public ProductTypesController(IProductTypeRepository repo) : base(repo) { }
}
