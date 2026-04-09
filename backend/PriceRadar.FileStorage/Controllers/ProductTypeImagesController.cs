using Microsoft.AspNetCore.Mvc;

namespace PriceRadar.FileStorage.Controllers;

[ApiController]
[Route("api/product-types/{typeId:long}/image")]
public class ProductTypeImagesController : ControllerBase
{
    private readonly string _imagesRoot;
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };

    public ProductTypeImagesController(IConfiguration config, IWebHostEnvironment env)
    {
        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _imagesRoot = Path.Combine(webRoot, config["Storage:ProductTypeImagesFolder"]!);
    }

    // POST /api/product-types/{typeId}/image
    // Saves the image in ProductTypeImages/{typeId}/{typeId}.{ext} — one image per type.
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<ActionResult<string>> UploadImage(
        long typeId,
        [FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        var ext = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { error = $"File type '{ext}' is not allowed." });

        // Delete any existing image for this type (any extension)
        foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{typeId}.*"))
            System.IO.File.Delete(old);

        var filename = $"{typeId}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(_imagesRoot, filename);

        await using var stream = System.IO.File.Create(fullPath);
        await file.CopyToAsync(stream);

        return Ok($"ProductTypeImages/{filename}");
    }

    // DELETE /api/product-types/{typeId}/image
    [HttpDelete]
    public IActionResult DeleteImage(long typeId)
    {
        foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{typeId}.*"))
            System.IO.File.Delete(old);
        return NoContent();
    }
}
