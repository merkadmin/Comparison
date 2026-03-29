using Microsoft.AspNetCore.Mvc;

namespace PriceRadar.FileStorage.Controllers;

[ApiController]
[Route("api/stores/{storeId:long}/image")]
public class StoreImagesController : ControllerBase
{
    private readonly string _imagesRoot;
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };

    public StoreImagesController(IConfiguration config, IWebHostEnvironment env)
    {
        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _imagesRoot = Path.Combine(webRoot, config["Storage:StoreImagesFolder"]!);
    }

    // POST /api/stores/{storeId}/image
    // Saves the image as StoreImages/{storeId}.{ext} — one file per store.
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<ActionResult<string>> UploadImage(
        long storeId,
        [FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        var ext = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { error = $"File type '{ext}' is not allowed." });

        // Delete any existing image for this store (any extension)
        foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{storeId}.*"))
            System.IO.File.Delete(old);

        var filename = $"{storeId}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(_imagesRoot, filename);

        await using var stream = System.IO.File.Create(fullPath);
        await file.CopyToAsync(stream);

        return Ok($"StoreImages/{filename}");
    }

    // DELETE /api/stores/{storeId}/image
    [HttpDelete]
    public IActionResult DeleteImage(long storeId)
    {
        foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{storeId}.*"))
            System.IO.File.Delete(old);

        return NoContent();
    }
}
