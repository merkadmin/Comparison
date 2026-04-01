using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ItemBrandsController : BaseController<ItemBrand, IItemBrandRepository>
{
	private readonly BrandWebImportService _webImporter;

	public ItemBrandsController(IItemBrandRepository repo, BrandWebImportService webImporter)
		: base(repo)
	{
		_webImporter = webImporter;
	}

	[HttpGet("export-template")]

	public IActionResult ExportTemplate()
	{
		var bytes = ExcelService.GetItemBrandTemplate();
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "item-brands-template.xlsx");
	}

	[HttpGet("export-list")]
	public async Task<IActionResult> ExportList()
	{
		var brands = await Repo.GetAllAsync();
		var bytes = ExcelService.ExportItemBrandList(brands);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "item-brands.xlsx");
	}

	[HttpPost("import")]
	[Consumes("multipart/form-data")]
	public async Task<IActionResult> Import(IFormFile file)
	{
		if (file is null || file.Length == 0)
			return BadRequest("No file provided.");

		using var stream = file.OpenReadStream();
		var brands = ExcelService.ParseItemBrands(stream);
		foreach (var brand in brands)
			await Repo.CreateAsync(brand);

		return Ok(new { imported = brands.Count });
	}

	// ── Shared scrape helper ─────────────────────────────────────────────────

	private async Task<(List<ItemBrand>? brands, IActionResult? error)> ScrapeAsync(string source)
	{
		try
		{
			var brands = source.ToLowerInvariant() switch
			{
				"gsmarena"   => await _webImporter.ImportFromGsmArenaAsync(),
				"phonearena" => await _webImporter.ImportFromPhoneArenaAsync(),
				"nanoreview" => await _webImporter.ImportFromNanoReviewAsync(),
				"kimovil"    => await _webImporter.ImportFromKimovilAsync(),
				"gizchina"   => await _webImporter.ImportFromGizChinaAsync(),
				_            => null,
			};
			if (brands is null) return (null, BadRequest($"Unknown source '{source}'."));
			return (brands, null);
		}
		catch (HttpRequestException ex)
		{
			var status = ex.StatusCode.HasValue ? $" (HTTP {(int)ex.StatusCode})" : string.Empty;
			var detail = ex.StatusCode switch
			{
				System.Net.HttpStatusCode.Forbidden       => "The website blocked the request (403 Forbidden). Try a different source.",
				System.Net.HttpStatusCode.TooManyRequests => "Rate-limited by the website (429). Wait a moment and retry.",
				System.Net.HttpStatusCode.NotFound        => "The brand listing page was not found on this website (404).",
				_                                         => ex.Message,
			};
			return (null, StatusCode(502, $"{detail}{status}"));
		}
	}

	// ── Fetch only (no import) ────────────────────────────────────────────────

	/// <summary>
	/// Returns brands scraped from a website with an <c>exists</c> flag for each,
	/// without writing anything to the database.
	/// </summary>
	[HttpGet("from-web/{source}")]
	public async Task<IActionResult> GetFromWeb(string source)
	{
		var (scraped, err) = await ScrapeAsync(source);
		if (err is not null) return err;

		var existing = (await Repo.GetAllAsync())
			.Select(b => b.Name.ToLowerInvariant())
			.ToHashSet();

		var result = scraped!.Select(b => new
		{
			name    = b.Name,
			logoUrl = b.LogoUrl,
			exists  = existing.Contains(b.Name.ToLowerInvariant()),
		});

		return Ok(result);
	}

	// ── Import specific names ─────────────────────────────────────────────────

	public record BrandImportItem(string Name, string? LogoUrl = null);

	/// <summary>
	/// Imports a caller-supplied list of brands (name + optional logo URL),
	/// skipping any that already exist.
	/// </summary>
	[HttpPost("import-names")]
	public async Task<IActionResult> ImportNames([FromBody] BrandImportItem[] items)
	{
		if (items is null || items.Length == 0)
			return BadRequest("No items provided.");

		var existing = (await Repo.GetAllAsync())
			.Select(b => b.Name.ToLowerInvariant())
			.ToHashSet();

		int imported = 0;
		foreach (var item in items.Where(i =>
			!string.IsNullOrWhiteSpace(i.Name) &&
			!existing.Contains(i.Name.ToLowerInvariant())))
		{
			await Repo.CreateAsync(new ItemBrand
			{
				Name     = item.Name.Trim(),
				LogoUrl  = item.LogoUrl,
				IsActive = true,
			});
			imported++;
		}

		return Ok(new { imported });
	}

	// ── Import all new brands from a source ───────────────────────────────────

	/// <summary>
	/// Scrapes brands from a supported mobile-phone website and inserts any that
	/// don't already exist in the database (matched case-insensitively by name).
	/// </summary>
	/// <param name="source">One of: gsmarena | phonearena | nanoreview | kimovil | gizchina</param>
	[HttpPost("import-from-web/{source}")]
	public async Task<IActionResult> ImportFromWeb(string source)
	{
		var (scraped, err) = await ScrapeAsync(source);
		if (err is not null) return err;

		var existing = (await Repo.GetAllAsync())
			.Select(b => b.Name.ToLowerInvariant())
			.ToHashSet();

		int imported = 0;
		foreach (var brand in scraped!.Where(b => !existing.Contains(b.Name.ToLowerInvariant())))
		{
			await Repo.CreateAsync(brand);
			imported++;
		}

		return Ok(new { scraped = scraped.Count, imported, skipped = scraped.Count - imported });
	}
}
