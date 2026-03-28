using Microsoft.AspNetCore.Mvc;

namespace PriceRadar.FileStorage.Controllers;

[ApiController]
[Route("api/brands/{brandId:long}/image")]
public class BrandImagesController : ControllerBase
{
    private readonly string _imagesRoot;
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };

    public BrandImagesController(IConfiguration config, IWebHostEnvironment env)
    {
        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _imagesRoot = Path.Combine(webRoot, config["Storage:BrandImagesFolder"]!);
    }

    // POST /api/brands/{brandId}/image
    // Saves the image as BrandImages/{brandId}.{ext} — one file per brand.
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<ActionResult<string>> UploadImage(
        long brandId,
        [FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        var ext = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { error = $"File type '{ext}' is not allowed." });

        // Delete any existing image for this brand (any extension)
        foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{brandId}.*"))
            System.IO.File.Delete(old);

        var filename = $"{brandId}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(_imagesRoot, filename);

        await using var stream = System.IO.File.Create(fullPath);
        await file.CopyToAsync(stream);

        return Ok($"BrandImages/{filename}");
    }

    // DELETE /api/brands/{brandId}/image
    [HttpDelete]
    public IActionResult DeleteImage(long brandId)
    {
        foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{brandId}.*"))
            System.IO.File.Delete(old);

        return NoContent();
    }
}
