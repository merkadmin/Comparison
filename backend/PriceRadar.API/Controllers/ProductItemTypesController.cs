using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ProductItemTypesController : BaseController<ProductItemType, IProductItemTypeRepository>
{
    public ProductItemTypesController(IProductItemTypeRepository repo) : base(repo) { }
}
