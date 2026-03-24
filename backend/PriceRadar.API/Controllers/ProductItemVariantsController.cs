using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Route("api/product-item-variants")]
public class ProductItemVariantsController : BaseController<Variant, IVariantRepository>
{
    public ProductItemVariantsController(IVariantRepository repo) : base(repo) { }

    [HttpPatch("bulk/active")]
    public async Task<IActionResult> SetActiveMany([FromBody] SetActiveManyRequest request)
    {
        await Repo.SetActiveManyAsync(request.Ids, request.IsActive);
        return NoContent();
    }

    public record SetActiveManyRequest(IEnumerable<long> Ids, bool IsActive);
}
