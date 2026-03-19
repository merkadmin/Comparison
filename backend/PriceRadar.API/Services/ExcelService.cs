using ClosedXML.Excel;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Services;

public static class ExcelService
{
	// ── Items ────────────────────────────────────────────────────────────────

	public static byte[] GetItemTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("Items");
		string[] headers = { "Name*", "Description", "Barcode", "ImageUrl", "BrandId*", "ItemCategoryId*" };
		WriteHeaders(ws, headers);

		// Example row
		ws.Cell(2, 1).Value = "iPhone 15 Pro";
		ws.Cell(2, 2).Value = "A17 Pro chip, 256GB";
		ws.Cell(2, 3).Value = "APL-IP15PRO-256";
		ws.Cell(2, 4).Value = "https://store.storeimages.cdn-apple.com/iphone15pro.jpg";
		ws.Cell(2, 5).Value = 1;   // BrandId
		ws.Cell(2, 6).Value = 1;   // ItemCategoryId
		ws.Row(2).Style.Fill.BackgroundColor = XLColor.FromHtml("#FFF2CC");
		ws.Row(2).Style.Font.Italic = true;

		// Note row
		ws.Cell(3, 1).Value = "↑ Example row — delete before importing";
		ws.Cell(3, 1).Style.Font.FontColor = XLColor.Gray;
		ws.Cell(3, 1).Style.Font.Italic = true;
		ws.Range(3, 1, 3, headers.Length).Merge();

		ws.Columns().AdjustToContents();
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

	public static List<Item> ParseItems(Stream stream)
	{
		using var wb = new XLWorkbook(stream);
		var ws = wb.Worksheet(1);
		var list = new List<Item>();
		int lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;
		for (int r = 2; r <= lastRow; r++)
		{
			var name = ws.Cell(r, 1).GetString().Trim();
			if (string.IsNullOrEmpty(name)) continue;
			list.Add(new Item
			{
				Name = name,
				Description = NullIfEmpty(ws.Cell(r, 2).GetString()),
				Barcode = NullIfEmpty(ws.Cell(r, 3).GetString()),
				ImageUrl = NullIfEmpty(ws.Cell(r, 4).GetString()),
				BrandId = ws.Cell(r, 5).TryGetValue<long>(out var bid) ? bid : 0,
				ItemCategoryId = ws.Cell(r, 6).TryGetValue<long>(out var cid) ? cid : 0,
			});
		}
		return list;
	}

	// ── Item Categories ──────────────────────────────────────────────────────

	public static byte[] GetItemCategoryTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("ItemCategories");
		string[] headers = { "Name_En*", "Name_Ar", "Name_Fr", "Description_En", "Description_Ar", "Description_Fr", "Parent Category Name" };
		WriteHeaders(ws, headers);
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

	/// <summary>
	/// Returns each parsed category paired with the raw ParentCategory cell value
	/// (may be a numeric ID string or a name string). The controller resolves it against the DB.
	/// </summary>
	public static List<(ItemCategory Category, string? ParentRef)> ParseItemCategories(Stream stream)
	{
		using var wb = new XLWorkbook(stream);
		var ws = wb.Worksheet(1);
		var list = new List<(ItemCategory, string?)>();
		int lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;
		for (int r = 2; r <= lastRow; r++)
		{
			var nameEn = ws.Cell(r, 1).GetString().Trim();
			if (string.IsNullOrEmpty(nameEn)) continue;
			var parentRef = NullIfEmpty(ws.Cell(r, 7).GetString().Trim());
			list.Add((new ItemCategory
			{
				Name = new LocalizedString
				{
					En = nameEn,
					Ar = ws.Cell(r, 2).GetString(),
					Fr = ws.Cell(r, 3).GetString(),
				},
				Description = new LocalizedString
				{
					En = ws.Cell(r, 4).GetString(),
					Ar = ws.Cell(r, 5).GetString(),
					Fr = ws.Cell(r, 6).GetString(),
				},
			}, parentRef));
		}
		return list;
	}

	// ── Item Brands ──────────────────────────────────────────────────────────

	public static byte[] GetItemBrandTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("ItemBrands");
		string[] headers = ["Name*", "LogoUrl", "Country"];
		WriteHeaders(ws, headers);
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

	public static List<ItemBrand> ParseItemBrands(Stream stream)
	{
		using var wb = new XLWorkbook(stream);
		var ws = wb.Worksheet(1);
		var list = new List<ItemBrand>();
		int lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;
		for (int r = 2; r <= lastRow; r++)
		{
			var name = ws.Cell(r, 1).GetString().Trim();
			if (string.IsNullOrEmpty(name)) continue;
			list.Add(new ItemBrand
			{
				Name = name,
				LogoUrl = NullIfEmpty(ws.Cell(r, 2).GetString()),
				Country = NullIfEmpty(ws.Cell(r, 3).GetString()),
			});
		}
		return list;
	}

	// ── Item Packages ────────────────────────────────────────────────────────

	public static byte[] GetItemPackageTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("ItemPackages");
		string[] headers = ["Name*", "Description", "OriginalPrice*", "OfferPrice*", "StartDate", "EndDate", "IsActive"];
		WriteHeaders(ws, headers);
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

	public static List<ItemPackage> ParseItemPackages(Stream stream)
	{
		using var wb = new XLWorkbook(stream);
		var ws = wb.Worksheet(1);
		var list = new List<ItemPackage>();
		int lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;
		for (int r = 2; r <= lastRow; r++)
		{
			var name = ws.Cell(r, 1).GetString().Trim();
			if (string.IsNullOrEmpty(name)) continue;

			bool isActive = ws.Cell(r, 7).TryGetValue<bool>(out var activeBool)
				? activeBool
				: ws.Cell(r, 7).GetString().Equals("true", StringComparison.OrdinalIgnoreCase);

			list.Add(new ItemPackage
			{
				Name = name,
				Description = NullIfEmpty(ws.Cell(r, 2).GetString()),
				OriginalPrice = ws.Cell(r, 3).TryGetValue<decimal>(out var orig) ? orig : 0,
				OfferPrice = ws.Cell(r, 4).TryGetValue<decimal>(out var offer) ? offer : 0,
				StartDate = ws.Cell(r, 5).TryGetValue<DateTime>(out var sd) ? sd : DateTime.UtcNow,
				EndDate = ws.Cell(r, 6).TryGetValue<DateTime>(out var ed) ? ed : null,
				IsActive = isActive,
			});
		}
		return list;
	}

	// ── Helpers ──────────────────────────────────────────────────────────────

	private static void WriteHeaders(IXLWorksheet ws, string[] headers)
	{
		for (int i = 0; i < headers.Length; i++)
			ws.Cell(1, i + 1).Value = headers[i];

		var range = ws.Range(1, 1, 1, headers.Length);
		range.Style.Font.Bold = true;
		range.Style.Fill.BackgroundColor = XLColor.FromHtml("#C6EFCE");
		ws.Columns().AdjustToContents();
	}

	private static string? NullIfEmpty(string s) =>
		string.IsNullOrWhiteSpace(s) ? null : s;
}
