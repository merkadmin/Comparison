using Microsoft.AspNetCore.Mvc;

namespace PriceRadar.FileStorage.Controllers;

[ApiController]
[Route("api/items/images")]
public class BulkProductImagesController : ControllerBase
{
	private readonly string _imagesRoot;

	// Number of item IDs processed per bulk request (configurable via appsettings "Storage:ImageBatchSize")
	private const int DefaultBatchSize = 10;

	public BulkProductImagesController(IConfiguration config, IWebHostEnvironment env)
	{
		var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
		_imagesRoot = Path.Combine(webRoot, config["Storage:ProductImagesFolder"]!);
	}

	// POST /api/items/images/bulk
	// Body: array of item IDs  e.g. [1, 2, 3, 4, 5]
	// Returns: { "1": ["ProductImages/1/file.jpg", ...], "2": [], ... }
	[HttpPost("getImagesBulk")]
	public ActionResult<Dictionary<long, List<string>>> GetImagesBulk([FromBody] long[] itemIds)
	{
		Dictionary<long, List<string>> result = new Dictionary<long, List<string>>();
		foreach (var itemId in itemIds)
		{
			string folder = Path.Combine(_imagesRoot, itemId.ToString());
			if (Directory.Exists(folder))
				result[itemId] = Directory.EnumerateFiles(folder)
					.Select(f => $"ProductImages/{itemId}/{Path.GetFileName(f)}").ToList();
		}
		return Ok(result);
	}
}
