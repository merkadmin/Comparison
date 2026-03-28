using Microsoft.AspNetCore.Mvc;

namespace PriceRadar.FileStorage.Controllers;

[ApiController]
[Route("api/categories/{categoryId:long}/image")]
public class CategoryImagesController : ControllerBase
{
	private readonly string _imagesRoot;
	private static readonly HashSet<string> AllowedExtensions =
		new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };

	public CategoryImagesController(IConfiguration config, IWebHostEnvironment env)
	{
		var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
		_imagesRoot = Path.Combine(webRoot, config["Storage:CategoryImagesFolder"]!);
	}

	// POST /api/categories/{categoryId}/image
	// Saves the image as CategoryImages/{categoryId}.{ext} — one file per category.
	[HttpPost]
	[RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
	public async Task<ActionResult<string>> UploadImage(
		long categoryId,
		[FromForm] IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest(new { error = "No file provided." });

		var ext = Path.GetExtension(file.FileName);
		if (!AllowedExtensions.Contains(ext))
			return BadRequest(new { error = $"File type '{ext}' is not allowed." });

		// Delete any existing image for this category (any extension)
		foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{categoryId}.*"))
			System.IO.File.Delete(old);

		var filename = $"{categoryId}{ext.ToLowerInvariant()}";
		var fullPath = Path.Combine(_imagesRoot, filename);

		await using var stream = System.IO.File.Create(fullPath);
		await file.CopyToAsync(stream);

		return Ok($"CategoryImages/{filename}");
	}

	// DELETE /api/categories/{categoryId}/image
	// Deletes the image for a category
	[HttpDelete]
	public IActionResult DeleteImage(long categoryId)
	{
		foreach (var old in Directory.EnumerateFiles(_imagesRoot, $"{categoryId}.*"))
			System.IO.File.Delete(old);

		return NoContent();
	}
}
