using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
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

    [HttpGet("export-template")]
    public IActionResult ExportTemplate()
    {
        var bytes = ExcelService.GetVariantTemplate();
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "variants-template.xlsx");
    }

    [HttpGet("export-list")]
    public async Task<IActionResult> ExportList()
    {
        var variants = await Repo.GetAllAsync();
        var bytes = ExcelService.ExportVariantList(variants);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "variants.xlsx");
    }

    [HttpPost("import")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Import(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");

        using var stream = file.OpenReadStream();
        var variants = ExcelService.ParseVariants(stream);
        foreach (var v in variants)
            await Repo.CreateAsync(v);

        return Ok(new { imported = variants.Count });
    }

    public record SetActiveManyRequest(IEnumerable<long> Ids, bool IsActive);
}
