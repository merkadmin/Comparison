using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ProductItemSpecificationsController
    : BaseController<ProductItemSpecificationRecord, IProductItemSpecificationRepository>
{
    public ProductItemSpecificationsController(IProductItemSpecificationRepository repo) : base(repo) { }

    [HttpGet("by-item/{productItemId:long}")]
    public async Task<IActionResult> GetByProductItem(long productItemId)
    {
        var spec = await Repo.GetByProductItemIdAsync(productItemId);
        return spec is null ? NotFound() : Ok(spec);
    }
}
