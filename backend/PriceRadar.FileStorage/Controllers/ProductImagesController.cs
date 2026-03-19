using Microsoft.AspNetCore.Mvc;

namespace PriceRadar.FileStorage.Controllers;

[ApiController]
[Route("api/items/{itemId:long}/images")]
public class ProductImagesController : ControllerBase
{
	private readonly string _imagesRoot;
	private static readonly HashSet<string> AllowedExtensions =
		new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };

	public ProductImagesController(IConfiguration config, IWebHostEnvironment env)
	{
		var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
		_imagesRoot = Path.Combine(webRoot, config["Storage:ProductImagesFolder"]!);
	}

	// GET /api/items/{itemId}/images
	// Returns relative URLs for all images stored under ProductImages/{itemId}/
	[HttpGet]
	public ActionResult<IEnumerable<string>> GetImages(long itemId)
	{
		var folder = ItemFolder(itemId);
		if (!Directory.Exists(folder))
			return Ok(Array.Empty<string>());

		var urls = Directory
			.EnumerateFiles(folder)
			.Select(f => $"ProductImages/{itemId}/{Path.GetFileName(f)}")
			.ToList();

		return Ok(urls);
	}

	// POST /api/items/{itemId}/images?categoryId={categoryId}
	// Accepts one or more image files; saves them and returns their relative URLs.
	// Filename pattern: {categoryId}-{itemId}-{yyyyMMdd}{serial:D3}.{ext}
	// e.g. 1-1-20260319001.jpg, 1-1-20260319002.jpg
	[HttpPost]
	[RequestSizeLimit(50 * 1024 * 1024)] // 50 MB per request
	public async Task<ActionResult<IEnumerable<string>>> UploadImages(
		long itemId,
		[FromQuery] long categoryId,
		[FromForm] IFormFileCollection files)
	{
		if (files.Count == 0)
			return BadRequest(new { error = "No files were provided." });

		var folder = ItemFolder(itemId);
		Directory.CreateDirectory(folder);

		var today     = DateTime.UtcNow;
		var datePart  = today.ToString("yyyyMMdd");
		var prefix    = $"{categoryId}-{itemId}-{datePart}";

		// Count existing files that already carry today's prefix to determine starting serial
		int existingCount = Directory.EnumerateFiles(folder)
			.Count(f => Path.GetFileNameWithoutExtension(f).StartsWith(prefix, StringComparison.Ordinal));

		var savedUrls = new List<string>();

		foreach (var file in files)
		{
			var ext = Path.GetExtension(file.FileName);
			if (!AllowedExtensions.Contains(ext))
				return BadRequest(new { error = $"File type '{ext}' is not allowed." });

			existingCount++;
			var filename  = $"{prefix}{existingCount:D3}{ext.ToLowerInvariant()}";
			var fullPath  = Path.Combine(folder, filename);

			await using var stream = System.IO.File.Create(fullPath);
			await file.CopyToAsync(stream);

			savedUrls.Add($"ProductImages/{itemId}/{filename}");
		}

		return Ok(savedUrls);
	}

	// DELETE /api/items/{itemId}/images/{filename}
	// Deletes a single image file
	[HttpDelete("{filename}")]
	public IActionResult DeleteImage(long itemId, string filename)
	{
		// Prevent path traversal
		if (filename.Contains('/') || filename.Contains('\\') || filename.Contains(".."))
			return BadRequest(new { error = "Invalid filename." });

		var fullPath = Path.Combine(ItemFolder(itemId), filename);
		if (!System.IO.File.Exists(fullPath))
			return NotFound();

		System.IO.File.Delete(fullPath);
		return NoContent();
	}

	// DELETE /api/items/{itemId}/images
	// Deletes the entire folder for an item (called when item is deleted)
	[HttpDelete]
	public IActionResult DeleteAllImages(long itemId)
	{
		var folder = ItemFolder(itemId);
		if (Directory.Exists(folder))
			Directory.Delete(folder, recursive: true);

		return NoContent();
	}

	private string ItemFolder(long itemId) => Path.Combine(_imagesRoot, itemId.ToString());
}
