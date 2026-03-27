using ClosedXML.Excel;
using PriceRadar.Core.enums;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Services;

public static class ExcelService
{
	// ── Items ────────────────────────────────────────────────────────────────

	public static byte[] GetItemTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("Items");
		// Col:  1       2             3                  4               5           6          7          8          9            10               11
		string[] headers = { "Name*", "Description", "BriefDescription", "AboutThisItem", "ModelName", "Barcode", "ImageUrl", "BrandId", "BrandName", "ItemCategoryId", "CategoryName_En" };
		WriteHeaders(ws, headers);

		// Example row
		ws.Cell(2, 1).Value  = "iPhone 15 Pro";
		ws.Cell(2, 2).Value  = "A17 Pro chip, 256GB";
		ws.Cell(2, 3).Value  = "The ultimate iPhone experience.";
		ws.Cell(2, 4).Value  = "Titanium design, A17 Pro chip, Pro camera system.";
		ws.Cell(2, 5).Value  = "A3293";
		ws.Cell(2, 6).Value  = "APL-IP15PRO-256";
		ws.Cell(2, 7).Value  = "https://store.storeimages.cdn-apple.com/iphone15pro.jpg";
		ws.Cell(2, 8).Value  = "";           // BrandId (optional if BrandName provided)
		ws.Cell(2, 9).Value  = "Apple";      // BrandName (optional if BrandId provided)
		ws.Cell(2, 10).Value = "";           // ItemCategoryId (optional if CategoryName_En provided)
		ws.Cell(2, 11).Value = "Smartphones"; // CategoryName_En (optional if ItemCategoryId provided)
		ws.Row(2).Style.Fill.BackgroundColor = XLColor.FromHtml("#FFF2CC");
		ws.Row(2).Style.Font.Italic = true;

		// Note row
		ws.Cell(3, 1).Value = "↑ Example row — delete before importing. Fill BrandId OR BrandName (name takes priority). Same for CategoryId/Name.";
		ws.Cell(3, 1).Style.Font.FontColor = XLColor.Gray;
		ws.Cell(3, 1).Style.Font.Italic = true;
		ws.Range(3, 1, 3, headers.Length).Merge();

		ws.Columns().AdjustToContents();
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

	public static List<(ProductItem Item, string? BrandName, string? CategoryName)> ParseItems(Stream stream)
	{
		using var wb = new XLWorkbook(stream);
		var ws = wb.Worksheet(1);
		var list = new List<(ProductItem, string?, string?)>();
		int lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;
		for (int r = 2; r <= lastRow; r++)
		{
			var name = ws.Cell(r, 1).GetString().Trim();
			if (string.IsNullOrEmpty(name)) continue;
			list.Add((new ProductItem
			{
				Name             = name,
				Description      = NullIfEmpty(ws.Cell(r, 2).GetString()),
				BriefDescription = NullIfEmpty(ws.Cell(r, 3).GetString()),
				AboutThisItem    = NullIfEmpty(ws.Cell(r, 4).GetString()),
				ModelName        = NullIfEmpty(ws.Cell(r, 5).GetString()),
				Barcode          = NullIfEmpty(ws.Cell(r, 6).GetString()),
				ImageUrl         = NullIfEmpty(ws.Cell(r, 7).GetString()),
				BrandId        = ws.Cell(r, 8).TryGetValue<long>(out var bid) ? bid : 0,
				ItemCategoryId = ws.Cell(r, 10).TryGetValue<long>(out var cid) ? cid : 0,
			},
			NullIfEmpty(ws.Cell(r, 9).GetString().Trim()),
			NullIfEmpty(ws.Cell(r, 11).GetString().Trim())));
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
	public static byte[] ExportItemCategoryList(IEnumerable<ItemCategory> categories)
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("ItemCategories");
		string[] headers = { "Id", "Name_En", "Name_Ar", "Name_Fr", "Description_En", "Description_Ar", "Description_Fr", "ParentCategoryId", "IsActive" };
		WriteHeaders(ws, headers);

		int row = 2;
		foreach (var c in categories)
		{
			ws.Cell(row, 1).Value = c.Id;
			ws.Cell(row, 2).Value = c.Name.En;
			ws.Cell(row, 3).Value = c.Name.Ar;
			ws.Cell(row, 4).Value = c.Name.Fr;
			ws.Cell(row, 5).Value = c.Description?.En ?? string.Empty;
			ws.Cell(row, 6).Value = c.Description?.Ar ?? string.Empty;
			ws.Cell(row, 7).Value = c.Description?.Fr ?? string.Empty;
			ws.Cell(row, 8).Value = c.ParentCategoryId.HasValue ? (XLCellValue)c.ParentCategoryId.Value : string.Empty;
			ws.Cell(row, 9).Value = c.IsActive;
			row++;
		}

		ws.Columns().AdjustToContents();
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

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

	// ── Items ─────────────────────────────────────────────────────────────────

	public static byte[] ExportItemList(IEnumerable<ProductItem> items, IEnumerable<ItemBrand> brands, IEnumerable<ItemCategory> categories)
	{
		var brandMap    = brands.ToDictionary(b => b.Id, b => b.Name);
		var categoryMap = categories.ToDictionary(c => c.Id, c => c.Name.En);

		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("Items");
		// Col:  1     2       3              4                  5               6           7          8          9           10              11             12               13          14
		string[] headers = { "Id", "Name", "Description", "BriefDescription", "AboutThisItem", "ModelName", "Barcode", "ImageUrl", "BrandId", "BrandName", "ItemCategoryId", "CategoryName", "IsActive", "CreatedAt" };
		WriteHeaders(ws, headers);

		int row = 2;
		foreach (var i in items)
		{
			ws.Cell(row, 1).Value  = i.Id;
			ws.Cell(row, 2).Value  = i.Name;
			ws.Cell(row, 3).Value  = i.Description ?? string.Empty;
			ws.Cell(row, 4).Value  = i.BriefDescription ?? string.Empty;
			ws.Cell(row, 5).Value  = i.AboutThisItem ?? string.Empty;
			ws.Cell(row, 6).Value  = i.ModelName ?? string.Empty;
			ws.Cell(row, 7).Value  = i.Barcode ?? string.Empty;
			ws.Cell(row, 8).Value  = i.ImageUrl ?? string.Empty;
			ws.Cell(row, 9).Value  = i.BrandId;
			ws.Cell(row, 10).Value = brandMap.TryGetValue(i.BrandId, out var bn) ? bn : string.Empty;
			ws.Cell(row, 11).Value = i.ItemCategoryId;
			ws.Cell(row, 12).Value = categoryMap.TryGetValue(i.ItemCategoryId, out var cn) ? cn : string.Empty;
			ws.Cell(row, 13).Value = i.IsActive;
			ws.Cell(row, 14).Value = i.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
			row++;
		}

		ws.Columns().AdjustToContents();
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
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

	public static byte[] ExportItemBrandList(IEnumerable<ItemBrand> brands)
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("ItemBrands");
		string[] headers = { "Id", "Name", "LogoUrl", "Country", "IsActive" };
		WriteHeaders(ws, headers);

		int row = 2;
		foreach (var b in brands)
		{
			ws.Cell(row, 1).Value = b.Id;
			ws.Cell(row, 2).Value = b.Name;
			ws.Cell(row, 3).Value = b.LogoUrl ?? string.Empty;
			ws.Cell(row, 4).Value = b.Country ?? string.Empty;
			ws.Cell(row, 5).Value = b.IsActive;
			row++;
		}

		ws.Columns().AdjustToContents();
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

	public static byte[] ExportItemPackageList(IEnumerable<ItemPackage> packages)
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("ItemPackages");
		string[] headers = { "Id", "Name", "Description", "OriginalPrice", "OfferPrice", "Discount%", "StartDate", "EndDate", "IsActive" };
		WriteHeaders(ws, headers);

		int row = 2;
		foreach (var p in packages)
		{
			ws.Cell(row, 1).Value = p.Id;
			ws.Cell(row, 2).Value = p.Name;
			ws.Cell(row, 3).Value = p.Description ?? string.Empty;
			ws.Cell(row, 4).Value = p.OriginalPrice;
			ws.Cell(row, 5).Value = p.OfferPrice;
			ws.Cell(row, 6).Value = p.DiscountPercentage;
			ws.Cell(row, 7).Value = p.StartDate.ToString("yyyy-MM-dd");
			ws.Cell(row, 8).Value = p.EndDate.HasValue ? (XLCellValue)p.EndDate.Value.ToString("yyyy-MM-dd") : string.Empty;
			ws.Cell(row, 9).Value = p.IsActive;
			row++;
		}

		ws.Columns().AdjustToContents();
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

	// ── Store Items ──────────────────────────────────────────────────────────

	public static byte[] GetStoreItemTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("StoreItems");
		string[] headers = ["ItemId*", "StoreId*", "SellingPrice*", "PriceType (Regular/Premium/Offer)*"];
		WriteHeaders(ws, headers);

		// Example row
		ws.Cell(2, 1).Value = 1;
		ws.Cell(2, 2).Value = 1;
		ws.Cell(2, 3).Value = 99.99;
		ws.Cell(2, 4).Value = "Regular";
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

	// ── Stores ───────────────────────────────────────────────────────────────

	public static byte[] GetStoreTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("Stores");
		string[] headers = ["Name*", "Type (Online/Physical)*", "Country", "WebsiteUrl", "LogoUrl"];
		WriteHeaders(ws, headers);

		// Example row
		ws.Cell(2, 1).Value = "Amazon";
		ws.Cell(2, 2).Value = "Online";
		ws.Cell(2, 3).Value = "USA";
		ws.Cell(2, 4).Value = "https://www.amazon.com";
		ws.Cell(2, 5).Value = "https://logo.amazon.com/logo.png";
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

	public static byte[] ExportStoreList(IEnumerable<Store> stores)
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("Stores");
		string[] headers = { "Id", "Name", "Type", "Country", "WebsiteUrl", "LogoUrl", "IsActive" };
		WriteHeaders(ws, headers);

		int row = 2;
		foreach (var s in stores)
		{
			ws.Cell(row, 1).Value = s.Id;
			ws.Cell(row, 2).Value = s.Name;
			ws.Cell(row, 3).Value = s.StoreTypeId.ToString();
			ws.Cell(row, 4).Value = s.Country;
			ws.Cell(row, 5).Value = s.WebsiteUrl ?? string.Empty;
			ws.Cell(row, 6).Value = s.LogoUrl ?? string.Empty;
			ws.Cell(row, 7).Value = s.IsActive;
			row++;
		}

		ws.Columns().AdjustToContents();
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

	public static List<Store> ParseStores(Stream stream)
	{
		using var wb = new XLWorkbook(stream);
		var ws = wb.Worksheet(1);
		var list = new List<Store>();
		int lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;
		for (int r = 2; r <= lastRow; r++)
		{
			var name = ws.Cell(r, 1).GetString().Trim();
			if (string.IsNullOrEmpty(name)) continue;

			var typeStr = ws.Cell(r, 2).GetString().Trim();
			var storeType = typeStr.Equals("Physical", StringComparison.OrdinalIgnoreCase)
				? DBStoreType.Physical
				: DBStoreType.Online;

			list.Add(new Store
			{
				Name       = name,
				StoreTypeId = storeType,
				Country    = NullIfEmpty(ws.Cell(r, 3).GetString()) ?? string.Empty,
				WebsiteUrl = NullIfEmpty(ws.Cell(r, 4).GetString()),
				LogoUrl    = NullIfEmpty(ws.Cell(r, 5).GetString()),
			});
		}
		return list;
	}

	// ── Store Variant Orders ─────────────────────────────────────────────────

	public static byte[] GetStoreVariantOrderTemplate()
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("StoreVariantOrders");
		string[] headers = ["StoreId*", "VariantId*", "OrderIndex*"];
		WriteHeaders(ws, headers);

		// Example row
		ws.Cell(2, 1).Value = 1;
		ws.Cell(2, 2).Value = 1;
		ws.Cell(2, 3).Value = 0;
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

	public static byte[] ExportStoreVariantOrderList(IEnumerable<Store_VariantOrder> orders)
	{
		using var wb = new XLWorkbook();
		var ws = wb.AddWorksheet("StoreVariantOrders");
		string[] headers = { "Id", "StoreId", "VariantId", "OrderIndex", "IsActive", "CreatedAt" };
		WriteHeaders(ws, headers);

		int row = 2;
		foreach (var o in orders)
		{
			ws.Cell(row, 1).Value = o.Id;
			ws.Cell(row, 2).Value = o.StoreId;
			ws.Cell(row, 3).Value = o.VariantId;
			ws.Cell(row, 4).Value = o.OrderIndex;
			ws.Cell(row, 5).Value = o.IsActive;
			ws.Cell(row, 6).Value = o.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
			row++;
		}

		ws.Columns().AdjustToContents();
		using var ms = new MemoryStream();
		wb.SaveAs(ms);
		return ms.ToArray();
	}

	public static List<Store_VariantOrder> ParseStoreVariantOrders(Stream stream)
	{
		using var wb = new XLWorkbook(stream);
		var ws = wb.Worksheet(1);
		var list = new List<Store_VariantOrder>();
		int lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;
		for (int r = 2; r <= lastRow; r++)
		{
			if (!ws.Cell(r, 1).TryGetValue<long>(out var storeId) || storeId == 0) continue;
			if (!ws.Cell(r, 2).TryGetValue<long>(out var variantId) || variantId == 0) continue;
			ws.Cell(r, 3).TryGetValue<int>(out var orderIndex);
			list.Add(new Store_VariantOrder
			{
				StoreId    = storeId,
				VariantId  = variantId,
				OrderIndex = orderIndex,
			});
		}
		return list;
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

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
