using System.Text.RegularExpressions;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Services;

/// <summary>
/// Scrapes brand names from popular mobile-phone databases.
/// Each method returns a deduplicated list of <see cref="ItemBrand"/> objects
/// that can be bulk-inserted by the controller.
/// </summary>
public class BrandWebImportService(IHttpClientFactory httpClientFactory)
{
	// ── Shared ────────────────────────────────────────────────────────────────

	private HttpClient CreateClient()
	{
		var client = httpClientFactory.CreateClient("BrandScraper");
		var h = client.DefaultRequestHeaders;
		h.Clear();
		h.UserAgent.ParseAdd(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
			"(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
		h.Accept.ParseAdd("text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8");
		h.AcceptLanguage.ParseAdd("en-US,en;q=0.9");
		h.Add("Accept-Encoding", "gzip, deflate, br");
		h.Add("Cache-Control", "no-cache");
		h.Add("Pragma", "no-cache");
		h.Add("Upgrade-Insecure-Requests", "1");
		h.Add("Sec-Fetch-Dest", "document");
		h.Add("Sec-Fetch-Mode", "navigate");
		h.Add("Sec-Fetch-Site", "none");
		h.Add("Sec-Fetch-User", "?1");
		client.Timeout = TimeSpan.FromSeconds(45);
		return client;
	}

	private static List<ItemBrand> Deduplicate(IEnumerable<string> names) =>
		names
			.Where(n => !string.IsNullOrWhiteSpace(n))
			.Select(n => n.Trim())
			.DistinctBy(n => n.ToLowerInvariant())
			.OrderBy(n => n)
			.Select(n => new ItemBrand { Name = n, IsActive = true })
			.ToList();

	// ── GSMArena ──────────────────────────────────────────────────────────────

	/// <summary>
	/// Fetches all brands listed on GSMArena's makers page
	/// (https://www.gsmarena.com/makers.php3).
	/// The brand slug from the href (e.g. "apple" from "apple-phones-48.php")
	/// is used to build a Clearbit logo URL — no extra requests needed.
	/// </summary>
	public async Task<List<ItemBrand>> ImportFromGsmArenaAsync()
	{
		var client = CreateClient();
		var html = await client.GetStringAsync("https://www.gsmarena.com/makers.php3");

		// Each brand appears as: <a href="apple-phones-48.php">Apple</a>
		// Group 1 = slug before "-phones-", Group 2 = display name.
		return Regex
			.Matches(html,
				@"<a\s+href=""([a-z0-9_-]+)-phones-\d+\.php""[^>]*>([^<]+)</a>",
				RegexOptions.IgnoreCase)
			.Select(m => (slug: m.Groups[1].Value, name: m.Groups[2].Value.Trim()))
			.Where(t => !string.IsNullOrWhiteSpace(t.name))
			.DistinctBy(t => t.name.ToLowerInvariant())
			.OrderBy(t => t.name)
			.Select(t => new ItemBrand
			{
				Name = t.name,
				IsActive = true,
				LogoUrl = $"https://logo.clearbit.com/{t.slug}.com",
			})
			.ToList();
	}

	// ── PhoneArena ────────────────────────────────────────────────────────────

	/// <summary>
	/// Fetches all brands from PhoneArena's manufacturer listing
	/// (https://www.phonearena.com/phones/manufacturers).
	/// </summary>
	public async Task<List<ItemBrand>> ImportFromPhoneArenaAsync()
	{
		var client = CreateClient();
		var html = await client.GetStringAsync("https://www.phonearena.com/phones/manufacturers");

		// Links look like: <a href="/phones/Apple_id18" ...>Apple</a>
		var names = Regex
			.Matches(html,
				@"<a\s+href=""/phones/[^""_]+_id\d+""[^>]*>\s*([^<]+?)\s*</a>",
				RegexOptions.Singleline | RegexOptions.IgnoreCase)
			.Select(m => m.Groups[1].Value);

		return Deduplicate(names);
	}

	// ── NanoReview ────────────────────────────────────────────────────────────

	/// <summary>
	/// Fetches all brands from NanoReview's brand listing
	/// (https://nanoreview.net/en/brand/list).
	/// </summary>
	public async Task<List<ItemBrand>> ImportFromNanoReviewAsync()
	{
		var client = CreateClient();
		var html = await client.GetStringAsync("https://nanoreview.net/en/brand/list");

		// Links look like: <a href="/en/brand/apple">Apple</a>
		var names = Regex
			.Matches(html,
				@"<a\s+href=""/en/brand/[^""]+""[^>]*>\s*([^<]+?)\s*</a>",
				RegexOptions.Singleline | RegexOptions.IgnoreCase)
			.Select(m => m.Groups[1].Value);

		return Deduplicate(names);
	}

	// ── Kimovil ───────────────────────────────────────────────────────────────

	/// <summary>
	/// Fetches all brands from Kimovil's brand listing
	/// (https://www.kimovil.com/en/all-brands).
	/// </summary>
	public async Task<List<ItemBrand>> ImportFromKimovilAsync()
	{
		var client = CreateClient();
		var html = await client.GetStringAsync("https://www.kimovil.com/en/all-brands");

		// Links look like: <a href="/en/frequency-checker/apple" ...>Apple</a>
		var names = Regex
			.Matches(html,
				@"<a\s+href=""/en/frequency-checker/[^""]+""[^>]*>\s*([^<]+?)\s*</a>",
				RegexOptions.Singleline | RegexOptions.IgnoreCase)
			.Select(m => m.Groups[1].Value);

		return Deduplicate(names);
	}

	// ── GizmoChina ────────────────────────────────────────────────────────────

	/// <summary>
	/// Fetches all smartphone brands listed on GizmoChina's manufacturer page
	/// (https://www.gizchina.com/brands/).
	/// </summary>
	public async Task<List<ItemBrand>> ImportFromGizChinaAsync()
	{
		var client = CreateClient();
		var html = await client.GetStringAsync("https://www.gizchina.com/brands/");

		// Headings or links like: <a href="/tag/apple/">Apple</a>
		var names = Regex
			.Matches(html,
				@"<a\s+href=""/brands/[^/""]+/""[^>]*>\s*([^<]+?)\s*</a>",
				RegexOptions.Singleline | RegexOptions.IgnoreCase)
			.Select(m => m.Groups[1].Value);

		return Deduplicate(names);
	}
}
