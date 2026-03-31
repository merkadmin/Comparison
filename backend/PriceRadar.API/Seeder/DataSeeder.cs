using MongoDB.Bson;
using MongoDB.Driver;
using PriceRadar.Core.enums;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.API.Seeder;

// DataSeeder runs once at startup to populate the database with initial data.
// Each method checks if the collection already has documents before inserting,
// so re-seeding only happens on a fresh/empty database.
// IDs are generated using a MongoDB counter collection (_sequences) that
// atomically increments a long value per entity type, replacing ObjectId.
public class DataSeeder
{
	private readonly MongoDbContext _context;

	public DataSeeder(MongoDbContext context)
	{
		_context = context;
	}

	// Entry point — runs all seed methods in dependency order:
	// categories and brands must exist before items, items before packages.
	public async Task SeedAsync()
	{
		await MigrateDefaultFieldsAsync();
		await SeedStaticLookupsAsync();
		await SeedTableNames();
		//await SeedCategoriesAsync();
		//await SeedBrandsAsync();
		//await SeedItemsAsync();
		//await SeedPackagesAsync();
	}

	// ─── Migration ────────────────────────────────────────────────────────────
	// Backfills IsActive/IsDeleted on existing documents that predate these fields.
	private async Task MigrateDefaultFieldsAsync()
	{
		var missing = Builders<MongoDB.Bson.BsonDocument>.Filter.Exists("IsActive", false);
		var defaults = Builders<MongoDB.Bson.BsonDocument>.Update
			.Set("IsActive", true)
			.Set("IsDeleted", false);

		await Task.WhenAll(
			_context.ItemCategories.Database.GetCollection<MongoDB.Bson.BsonDocument>("ItemCategory").UpdateManyAsync(missing, defaults),
			_context.ItemBrands.Database.GetCollection<MongoDB.Bson.BsonDocument>("ItemBrand").UpdateManyAsync(missing, defaults),
			_context.ProductItems.Database.GetCollection<MongoDB.Bson.BsonDocument>("ProductItem").UpdateManyAsync(missing, defaults),
			_context.ItemPackages.Database.GetCollection<MongoDB.Bson.BsonDocument>("ItemPackage").UpdateManyAsync(missing, defaults),
			_context.Stores.Database.GetCollection<MongoDB.Bson.BsonDocument>("stores").UpdateManyAsync(missing, defaults),
			_context.TableNames.Database.GetCollection<MongoDB.Bson.BsonDocument>("TableName_s").UpdateManyAsync(missing, defaults)
		);

		Console.WriteLine("[Migration] IsActive/IsDeleted backfilled on all collections.");
	}

	// ─── Categories ───────────────────────────────────────────────────────────
	private async Task SeedCategoriesAsync()
	{
		// Skip if the collection already has data (idempotent guard)
		//if (await _context.ItemCategories.CountDocumentsAsync(_ => true) > 0) return;

		// ── Pass 1: top-level (root) categories — ParentCategoryId = null ──────
		/*
		var parents = new List<ItemCategoryDocument>
		{
			new() {
				Name = new()
				{
					En = "Mobiles, Tablets & Accessories", 
					Ar = "الهواتف المحمولة والأجهزة اللوحية والإكسسوارات",
					Fr = "Mobiles, Tablettes et Accessoires"
				},
				Description = new()
				{
					En = "All mobile devices, tablets, and related accessories", 
					Ar = "جميع الأجهزة المحمولة والأجهزة اللوحية والإكسسوارات ذات الصلة", 
					Fr = "Tous les appareils mobiles, tablettes et accessoires associés"
				}
			},

		};

		foreach (var cat in parents)
			cat.Id = await _context.GetNextSequenceAsync("itemcategories");

		await _context.ItemCategories.InsertManyAsync(parents);

		// Build a name → ID lookup so child categories can reference parents
		long ParentId(string name) => parents.FirstOrDefault(p => p.Name.En == name)?.Id
			?? throw new InvalidOperationException($"[Seeder] Parent category '{name}' not found.");
		*/

		// ── Pass 2: child categories — ParentCategoryId set from Pass 1 IDs ────
		/*
		var children = new List<ItemCategoryDocument>
		{
			new() 
			{
				Name = new()
				{
					En = "All Mobile Phones", 
					Ar = "جميع أجهزة الموبايل", 
					Fr = "Tous les téléphones mobiles"
				},
				Description = new()
				{
					En = "All Mobile Phones & Smart phones", 
					Ar = "جميع الهواتف المحمولة والهواتف الذكية", 
					Fr = "Tous les téléphones mobiles et smartphones"
				},
				ParentCategoryId = ParentId("Mobiles, Tablets & Accessories"),
			},
			new() {
				Name        = new() { En = "Tablets",                   Ar = "الأجهزة اللوحية",              Fr = "Tablettes" },
				Description = new() { En = "Tablet computers and e-readers", Ar = "الحواسيب اللوحية وأجهزة القراءة الإلكترونية", Fr = "Tablettes et liseuses" },
				ParentCategoryId = ParentId("Mobiles, Tablets & Accessories"),
			},
			new() {
				Name        = new() { En = "Wearable Technology",       Ar = "التقنية القابلة للارتداء",      Fr = "Technologie portable" },
				Description = new() { En = "Smartwatches, fitness bands, and wearable devices", Ar = "الساعات الذكية وأساور اللياقة والأجهزة القابلة للارتداء", Fr = "Montres intelligentes, bracelets de fitness et appareils portables" },
				ParentCategoryId = ParentId("Mobiles, Tablets & Accessories"),
			},
			new() {
				Name        = new() { En = "Cases & Covers",            Ar = "الأغطية والحافظات",             Fr = "Coques et housses" },
				Description = new() { En = "Protective cases and covers for phones and tablets", Ar = "أغطية وحافظات واقية للهواتف والأجهزة اللوحية", Fr = "Coques et housses de protection pour téléphones et tablettes" },
				ParentCategoryId = ParentId("Mobiles, Tablets & Accessories"),
			},
			new() {
				Name        = new() { En = "Power Banks & Chargers",    Ar = "البطاريات المحمولة والشواحن",   Fr = "Batteries portables et chargeurs" },
				Description = new() { En = "Portable chargers, power banks, and charging cables", Ar = "الشواحن المحمولة والبطاريات الاحتياطية وكابلات الشحن", Fr = "Chargeurs portables, batteries et câbles de charge" },
				ParentCategoryId = ParentId("Mobiles, Tablets & Accessories"),
			},
			new() {
				Name        = new() { En = "All Mobile Accessories",    Ar = "جميع إكسسوارات الجوال",        Fr = "Tous les accessoires mobiles" },
				Description = new() { En = "All accessories for mobile phones and tablets", Ar = "جميع الإكسسوارات الخاصة بالهواتف المحمولة والأجهزة اللوحية", Fr = "Tous les accessoires pour téléphones mobiles et tablettes" },
				ParentCategoryId = ParentId("Mobiles, Tablets & Accessories"),
			},
		};
		
		foreach (var cat in children)
			cat.Id = await _context.GetNextSequenceAsync("itemcategories");

		await _context.ItemCategories.InsertManyAsync(children);

		Console.WriteLine($"[Seeder] Inserted {parents.Count} parent + {children.Count} child categories.");
		*/
	}

	// ─── Brands ───────────────────────────────────────────────────────────────
	private async Task SeedBrandsAsync()
	{
		// Skip if the collection already has data (idempotent guard)
		if (await _context.ItemBrands.CountDocumentsAsync(_ => true) > 0) return;

		var brands = new List<ItemBrandDocument>
		{
			new() { Name = "Apple",   Country = "USA" },
			new() { Name = "Samsung", Country = "South Korea" },
			new() { Name = "Dell",    Country = "USA" },
			new() { Name = "Sony",    Country = "Japan" },
			new() { Name = "Lenovo",  Country = "China" },
			new() { Name = "HP",      Country = "USA" },
			new() { Name = "Sharp",      Country = "USA" },
		};

		// Assign auto-increment long IDs before bulk insert
		foreach (var brand in brands)
			brand.Id = await _context.GetNextSequenceAsync("itembrands");

		await _context.ItemBrands.InsertManyAsync(brands);
		Console.WriteLine($"[Seeder] Inserted {brands.Count} brands.");
	}

	// ─── Items ────────────────────────────────────────────────────────────────
	private async Task SeedItemsAsync()
	{
		// Skip if the collection already has data (idempotent guard)
		if (await _context.ProductItems.CountDocumentsAsync(_ => true) > 0) return;

		// Load already-seeded categories and brands so we can reference their IDs
		var categories = await _context.ItemCategories.Find(_ => true).ToListAsync();
		var brands = await _context.ItemBrands.Find(_ => true).ToListAsync();

		// Helper functions to look up the long ID by name
		long CategoryId(string name) => categories.FirstOrDefault(c => c.Name.En == name)?.Id
			?? throw new InvalidOperationException($"[Seeder] Category '{name}' not found. Drop the ItemCategory collection and restart.");
		long BrandId(string name) => brands.FirstOrDefault(b => b.Name == name)?.Id
			?? throw new InvalidOperationException($"[Seeder] Brand '{name}' not found. Drop the ItemBrand collection and restart.");

		// Each item is linked to a brand and a category via their long IDs (foreign keys)
		var items = new List<ProductItemDocument>
		{
			new()
			{
				Name           = "iPhone 15 Pro",
				Description    = "A17 Pro chip, 256GB, Titanium",
				BrandId        = BrandId("Apple"),
				ItemCategoryId = CategoryId("All Mobile Phones"),
				Barcode        = "APL-IP15PRO",
			},
			new()
			{
				Name           = "Samsung Galaxy S24 Ultra",
				Description    = "Snapdragon 8 Gen 3, 12GB RAM, 256GB",
				BrandId        = BrandId("Samsung"),
				ItemCategoryId = CategoryId("All Mobile Phones"),
				Barcode        = "SAM-S24U-256",
			},
			new()
			{
				Name           = "Galaxy Tab S9",
				Description    = "11\" AMOLED, Snapdragon 8 Gen 2, 128GB",
				BrandId        = BrandId("Samsung"),
				ItemCategoryId = CategoryId("Tablets"),
				Barcode        = "SAM-TABS9-128",
			},
			new()
			{
				Name           = "Apple iPad Pro 12.9\"",
				Description    = "M2 chip, 256GB, Liquid Retina XDR display",
				BrandId        = BrandId("Apple"),
				ItemCategoryId = CategoryId("Tablets"),
				Barcode        = "APL-IPADPRO-M2",
			},
			new()
			{
				Name           = "Apple Watch Series 9",
				Description    = "GPS + Cellular, 45mm, Always-On Retina display",
				BrandId        = BrandId("Apple"),
				ItemCategoryId = CategoryId("Wearable Technology"),
				Barcode        = "APL-WATCH9-45",
			},
			new()
			{
				Name           = "Samsung Galaxy Watch 6",
				Description    = "40mm, Health monitoring, BioActive Sensor",
				BrandId        = BrandId("Samsung"),
				ItemCategoryId = CategoryId("Wearable Technology"),
				Barcode        = "SAM-GW6-40",
			},
			new()
			{
				Name           = "Sony WH-1000XM5 Case",
				Description    = "Protective carrying case for Sony headphones",
				BrandId        = BrandId("Sony"),
				ItemCategoryId = CategoryId("Cases & Covers"),
				Barcode        = "SNY-WH5-CASE",
			},
			new()
			{
				Name           = "Samsung 25W Super Fast Charger",
				Description    = "USB-C 25W fast charging adapter",
				BrandId        = BrandId("Samsung"),
				ItemCategoryId = CategoryId("Power Banks & Chargers"),
				Barcode        = "SAM-CHG-25W",
			},
		};

		// Assign auto-increment long IDs before bulk insert
		foreach (var item in items)
			item.Id = await _context.GetNextSequenceAsync("items");

		await _context.ProductItems.InsertManyAsync(items);
		Console.WriteLine($"[Seeder] Inserted {items.Count} items.");
	}

	// ─── Packages / Offers ────────────────────────────────────────────────────
	private async Task SeedPackagesAsync()
	{
		// Skip if the collection already has data (idempotent guard)
		if (await _context.ItemPackages.CountDocumentsAsync(_ => true) > 0) return;

		// Load already-seeded items so we can reference their IDs inside packages
		var items = await _context.ProductItems.Find(_ => true).ToListAsync();

		// Helper function to look up an item's long ID by a name substring
		long ItemId(string name) => items.FirstOrDefault(i => i.Name.Contains(name))?.Id
			?? throw new InvalidOperationException($"[Seeder] Item containing '{name}' not found. Drop the ProductItem collection and restart.");

		// Each package groups multiple items with a discounted offer price.
		// DiscountPercentage is computed on the fly from OriginalPrice and OfferPrice.
		var packages = new List<ItemPackageDocument>
		{
			new()
			{
				Name          = "Apple Mobile Bundle",
				Description   = "iPhone 15 Pro + Apple Watch Series 9 — save 10%",
				OriginalPrice = 1_598m,
				OfferPrice    = 1_438m,
				StartDate     = DateTime.UtcNow,
				EndDate       = DateTime.UtcNow.AddDays(30),
				IsActive      = true,
				Items         = new()
				{
					new() { ItemId = ItemId("iPhone 15"),      Quantity = 1 },
					new() { ItemId = ItemId("Apple Watch"),    Quantity = 1 },
				}
			},
			new()
			{
				Name          = "Samsung Galaxy Combo",
				Description   = "Galaxy S24 Ultra + Galaxy Tab S9 — save 8%",
				OriginalPrice = 2_097m,
				OfferPrice    = 1_929m,
				StartDate     = DateTime.UtcNow,
				IsActive      = true,
				Items         = new()
				{
					new() { ItemId = ItemId("Galaxy S24"),  Quantity = 1 },
					new() { ItemId = ItemId("Galaxy Tab"),  Quantity = 1 },
				}
			},
			new()
			{
				Name          = "Apple Tablet Starter Kit",
				Description   = "iPad Pro + Apple Watch Series 9 — save 5%",
				OriginalPrice = 1_698m,
				OfferPrice    = 1_613m,
				StartDate     = DateTime.UtcNow.AddDays(-10),
				EndDate       = DateTime.UtcNow.AddDays(-1), // already expired
				IsActive      = false,
				Items         = new()
				{
					new() { ItemId = ItemId("iPad Pro"),    Quantity = 1 },
					new() { ItemId = ItemId("Apple Watch"), Quantity = 1 },
				}
			},
		};

		// Assign auto-increment long IDs before bulk insert
		foreach (var pkg in packages)
			pkg.Id = await _context.GetNextSequenceAsync("itempackages");

		await _context.ItemPackages.InsertManyAsync(packages);
		Console.WriteLine($"[Seeder] Inserted {packages.Count} packages/offers.");
	}

	private async Task SeedTableNames()
	{
		// Always upsert — ensures column metadata stays current across restarts.
		foreach (var (name, endpoint, columns) in TableMetadata())
		{
			var existing = await _context.TableNames
				.Find(t => t.Name == name).FirstOrDefaultAsync();

			if (existing is null)
			{
				await _context.TableNames.InsertOneAsync(new TableNameDocument
				{
					Id = await _context.GetNextSequenceAsync("tablenames"),
					Name = name,
					Endpoint = endpoint,
					Columns = columns
				});
			}
			else
			{
				await _context.TableNames.UpdateOneAsync(
					t => t.Id == existing.Id,
					Builders<TableNameDocument>.Update
						.Set(t => t.Endpoint, endpoint)
						.Set(t => t.Columns, columns));
			}
		}

		Console.WriteLine("[Seeder] Table metadata seeded/updated.");
	}

	// Column definitions for every known entity table.
	// ─── Static Lookups ───────────────────────────────────────────────────────
	private async Task SeedStaticLookupsAsync()
	{
		await SeedLookup(_context.StoreTypes, Enum.GetValues<DBStoreType>()
			.Select(v => StaticLookupDocument.From((long)v, v.ToString())));

		await SeedLookup(_context.DBStores, Enum.GetValues<DBStore>()
			.Select(v => StaticLookupDocument.From((long)v, v.ToString())));

		await SeedLookup(_context.PriceHistoryTypes, Enum.GetValues<DBPriceHistoryType>()
			.Select(v => StaticLookupDocument.From((long)v, v.ToString())));

		await SeedLookup(_context.UserPrivileges, Enum.GetValues<DBUserPrivilege>()
			.Select(v => StaticLookupDocument.From((long)v, v.ToString())));

		// ── Specification category lookups (JSON-based) ───────────────────────
		await SeedSpecificationLookups();

		Console.WriteLine("[Seeder] Static lookups seeded.");
	}

	private static async Task SeedLookup(
		IMongoCollection<StaticLookupDocument> col,
		IEnumerable<StaticLookupDocument> items)
	{
		var enumItems = items.ToList();
		var existing = await col.Find(_ => true).ToListAsync();
		var existingById = existing.ToDictionary(e => e.Id);
		var enumIds = new HashSet<long>(enumItems.Select(e => e.Id));

		// Insert new entries
		var toInsert = enumItems.Where(e => !existingById.ContainsKey(e.Id)).ToList();
		if (toInsert.Count > 0)
			await col.InsertManyAsync(toInsert);

		// Update existing entries whose name changed
		foreach (var item in enumItems)
		{
			if (existingById.TryGetValue(item.Id, out var ex) && ex.Name != item.Name)
			{
				await col.UpdateOneAsync(
					d => d.Id == item.Id,
					Builders<StaticLookupDocument>.Update.Set(d => d.Name, item.Name));
			}
		}

		// Delete entries that no longer exist in the enum
		var toDelete = existing.Where(e => !enumIds.Contains(e.Id)).Select(e => e.Id).ToList();
		if (toDelete.Count > 0)
			await col.DeleteManyAsync(d => toDelete.Contains(d.Id));
	}

	private async Task SeedSpecificationLookups()
	{
		var col = _context.SpecificationCategories;
		var specItems = SpecificationCategoryFields().ToList();
		var existing = await col.Find(_ => true).ToListAsync();
		var existingById = existing.ToDictionary(e => e.Id);
		var enumIds = new HashSet<long>(specItems.Select(e => e.Id));

		// Insert new entries
		var toInsert = specItems.Where(e => !existingById.ContainsKey(e.Id)).ToList();
		if (toInsert.Count > 0)
			await col.InsertManyAsync(toInsert);

		// Update existing entries whose name or json changed
		foreach (var item in specItems)
		{
			if (existingById.TryGetValue(item.Id, out var ex)
				&& (ex.Name != item.Name || ex.Json != item.Json))
			{
				await col.UpdateOneAsync(
					d => d.Id == item.Id,
					Builders<SpecificationLookupDocument>.Update
						.Set(d => d.Name, item.Name)
						.Set(d => d.Json, item.Json));
			}
		}

		// Delete entries that no longer exist in the enum
		var toDelete = existing.Where(e => !enumIds.Contains(e.Id)).Select(e => e.Id).ToList();
		if (toDelete.Count > 0)
			await col.DeleteManyAsync(d => toDelete.Contains(d.Id));
	}

	private static IEnumerable<SpecificationLookupDocument> SpecificationCategoryFields() =>
		Enum.GetValues<DBSpecificationCategory>().Select(v =>
		{
			var json = v switch
			{
				DBSpecificationCategory.Network => new BsonDocument
				{
					{ "technology", new BsonDocument { { "label", "Technology" }, { "type", "string[]" },
						{ "values", new BsonArray(Enum.GetValues<DBNetworkTechnology>().Select(e => e.ToString())) } } },
					{ "bands2G", new BsonDocument { { "label", "2G Bands" }, { "type", "string[]" },
						{ "values", new BsonArray(Enum.GetValues<DBNetworkBand2G>().Select(e => e.ToString())) } } },
					{ "bands3G", new BsonDocument { { "label", "3G Bands" }, { "type", "string[]" },
						{ "values", new BsonArray(Enum.GetValues<DBNetworkBand3G>().Select(e => e.ToString())) } } },
					{ "bands4G", new BsonDocument { { "label", "4G LTE Bands" }, { "type", "string[]" },
						{ "values", new BsonArray(Enum.GetValues<DBNetworkBand4G>().Select(e => e.ToString())) } } },
					{ "bands5G", new BsonDocument { { "label", "5G Bands" }, { "type", "string[]" },
						{ "values", new BsonArray(Enum.GetValues<DBNetworkBand5G>().Select(e => e.ToString())) } } },
					{ "speed", new BsonDocument { { "label", "Speed" }, { "type", "string[]" },
						{ "values", new BsonArray(Enum.GetValues<DBNetworkSpeed>().Select(e => e.ToString())) } } },
					{ "gprs", new BsonDocument { { "label", "GPRS" }, { "type", "string" } } },
					{ "edge", new BsonDocument { { "label", "EDGE" }, { "type", "string" } } },
				},
				DBSpecificationCategory.Launch => new BsonDocument
				{
					{ "announcedDate", new BsonDocument { { "label", "Announced" }, { "type", "string" } } },
					{ "status", new BsonDocument { { "label", "Status" }, { "type", "select" },
						{ "values", new BsonArray { "Available", "Coming soon", "Discontinued", "Rumoured" } } } },
					{ "releaseDate", new BsonDocument { { "label", "Release Date" }, { "type", "date" } } },
				},
				DBSpecificationCategory.Body => new BsonDocument
				{
					{ "dimensions", new BsonDocument { { "label", "Dimensions" }, { "type", "string" } } },
					{ "weight", new BsonDocument { { "label", "Weight" }, { "type", "string" } } },
					{ "build", new BsonDocument { { "label", "Build" }, { "type", "string" } } },
					{ "sim", new BsonDocument { { "label", "SIM" }, { "type", "select" },
						{ "values", new BsonArray {
							"Nano-SIM", "Micro-SIM", "Mini-SIM",
							"eSIM only",
							"Nano-SIM + eSIM",
							"Dual Nano-SIM", "Dual Nano-SIM (or eSIM)", "Dual Nano-SIM + eSIM",
						} } } },
					{ "esim", new BsonDocument { { "label", "eSIM" }, { "type", "boolean" } } },
					{ "dualSim", new BsonDocument { { "label", "Dual SIM" }, { "type", "boolean" } } },
					{ "durability", new BsonDocument { { "label", "Durability / IP Rating" }, { "type", "select" },
						{ "values", new BsonArray {
							"IP52", "IP53", "IP54", "IP55", "IP58",
							"IP65", "IP67", "IP68", "IP69K",
							"MIL-STD-810H",
						} } } },
					{ "milStd", new BsonDocument { { "label", "MIL-STD Rating" }, { "type", "select" },
						{ "values", new BsonArray {
							"MIL-STD-810G", "MIL-STD-810H",
						} } } },
					{ "stylusSupport", new BsonDocument { { "label", "Stylus / S Pen" }, { "type", "string" } } },
					{ "keyboardSupport", new BsonDocument { { "label", "Keyboard Support" }, { "type", "string" } } },
					{ "foldable", new BsonDocument { { "label", "Foldable" }, { "type", "boolean" } } },
					{ "hingeType", new BsonDocument { { "label", "Hinge Type" }, { "type", "select" },
						{ "values", new BsonArray {
							"Inward fold", "Outward fold", "Dual fold (Z-fold)", "Book fold (tent fold)",
						} } } },
					{ "coverDisplay", new BsonDocument { { "label", "Cover Display" }, { "type", "string" } } },
				},
				DBSpecificationCategory.Display => new BsonDocument
				{
					// ── Panel type ───────────────────────────────────────────────────
					{ "type", new BsonDocument { { "label", "Type" }, { "type", "select" },
						{ "values", new BsonArray {
							"IPS LCD", "TFT LCD", "PLS LCD", "LTPS IPS LCD",
							"AMOLED", "Super AMOLED", "Super AMOLED Plus",
							"Dynamic AMOLED", "Dynamic AMOLED 2X",
							"Foldable Dynamic AMOLED 2X",
							"Fluid AMOLED", "Quantum dot AMOLED",
							"OLED", "LTPO OLED", "LTPO2 OLED", "LTPO3 OLED",
							"P-OLED", "pOLED", "QD-OLED",
							"ProMotion OLED",
							"Super Retina XDR OLED", "Liquid Retina XDR OLED",
							"Retina IPS LCD", "Liquid Retina IPS LCD",
							"E Ink Carta", "E Ink Carta 1200",
						} } } },

					// ── Screen size ──────────────────────────────────────────────────
					{ "size", new BsonDocument { { "label", "Size" }, { "type", "select" },
						{ "values", new BsonArray {
							"4.0 inches", "4.3 inches", "4.7 inches",
							"5.0 inches", "5.1 inches", "5.2 inches", "5.4 inches",
							"5.5 inches", "5.6 inches", "5.7 inches", "5.8 inches", "5.9 inches",
							"6.0 inches", "6.1 inches", "6.2 inches", "6.3 inches", "6.4 inches",
							"6.5 inches", "6.6 inches", "6.67 inches", "6.7 inches",
							"6.73 inches", "6.78 inches", "6.8 inches", "6.9 inches",
							"7.0 inches", "7.1 inches", "7.2 inches", "7.3 inches",
							"7.6 inches", "7.9 inches",
							"8.0 inches", "8.3 inches", "8.7 inches",
							"9.0 inches",
							"10.1 inches", "10.4 inches", "10.5 inches",
							"10.9 inches", "11.0 inches",
							"12.4 inches", "12.9 inches", "13.0 inches",
						} } } },

					// ── Resolution ───────────────────────────────────────────────────
					{ "resolution", new BsonDocument { { "label", "Resolution" }, { "type", "select" },
						{ "values", new BsonArray {
							// Low / HD
							"480 x 854 pixels", "480 x 960 pixels", "540 x 960 pixels",
							// HD+
							"720 x 1280 pixels", "720 x 1520 pixels", "720 x 1560 pixels",
							"720 x 1600 pixels", "720 x 1640 pixels",
							// FHD / FHD+
							"1080 x 1920 pixels", "1080 x 2160 pixels", "1080 x 2220 pixels",
							"1080 x 2240 pixels", "1080 x 2280 pixels", "1080 x 2340 pixels",
							"1080 x 2400 pixels", "1080 x 2408 pixels", "1080 x 2412 pixels",
							"1080 x 2460 pixels", "1080 x 2520 pixels", "1080 x 2532 pixels",
							"1080 x 2556 pixels", "1080 x 2778 pixels", "1080 x 2796 pixels",
							// Apple (Super Retina XDR / Dynamic Island)
							"1170 x 2532 pixels", "1179 x 2556 pixels",
							"1206 x 2622 pixels", "1320 x 2868 pixels",
							"1284 x 2778 pixels", "1290 x 2796 pixels",
							// Google Pixel
							"1344 x 2992 pixels",
							// QHD / QHD+
							"1260 x 2800 pixels",
							"1440 x 2560 pixels", "1440 x 2960 pixels",
							"1440 x 3040 pixels", "1440 x 3088 pixels",
							"1440 x 3120 pixels", "1440 x 3200 pixels",
							"1440 x 3216 pixels",
							// Tablets
							"1600 x 2560 pixels", "2048 x 2732 pixels",
						} } } },

					// ── Screen-to-body ratio (free text — too device-specific for a fixed list) ──
					{ "screenToBodyRatio", new BsonDocument { { "label", "Screen-to-Body Ratio" }, { "type", "string" } } },

					// ── Glass protection ─────────────────────────────────────────────
					{ "protection", new BsonDocument { { "label", "Protection" }, { "type", "select" },
						{ "values", new BsonArray {
							// Corning Gorilla Glass
							"Corning Gorilla Glass 3",
							"Corning Gorilla Glass 4",
							"Corning Gorilla Glass 5",
							"Corning Gorilla Glass 6",
							"Corning Gorilla Glass 7",
							"Corning Gorilla Glass Victus",
							"Corning Gorilla Glass Victus 2",
							"Corning Gorilla Glass Victus+",
							"Corning Gorilla Glass Armor",
							"Corning Gorilla Glass Armor 2",
							// Asahi Dragontrail
							"Dragontrail Pro",
							"Dragontrail X",
							"Asahi Dragontrail",
							// Schott Xensation
							"Schott Xensation Cover",
							"Schott Xensation Alpha",
							// AGC
							"AGC DT-Star2",
							"AGC DT-Star3",
							// Other
							"Sapphire crystal",
							"Unknown glass protection",
							"No protection",
						} } } },

					// ── Refresh rate ─────────────────────────────────────────────────
					{ "refreshRate", new BsonDocument { { "label", "Refresh Rate" }, { "type", "select" },
						{ "values", new BsonArray {
							"60Hz", "90Hz", "120Hz", "144Hz", "165Hz", "240Hz", "480Hz",
						} } } },

					{ "ltpo", new BsonDocument { { "label", "LTPO" }, { "type", "boolean" } } },

					// ── Adaptive refresh rate ────────────────────────────────────────
					{ "adaptiveRefreshRate", new BsonDocument { { "label", "Adaptive Refresh Rate" }, { "type", "select" },
						{ "values", new BsonArray {
							"1-60Hz", "1-90Hz", "1-120Hz", "1-144Hz", "1-165Hz",
							"10-120Hz", "10-144Hz",
							"24-120Hz", "24-240Hz",
							"48-120Hz", "60-120Hz", "60-144Hz",
						} } } },

					{ "brightnessTypical", new BsonDocument { { "label", "Brightness (typical)" }, { "type", "string" } } },
					{ "brightnessPeak",    new BsonDocument { { "label", "Brightness (peak)" },    { "type", "string" } } },

					// ── HDR standard ─────────────────────────────────────────────────
					{ "hdr", new BsonDocument { { "label", "HDR Support" }, { "type", "select" },
						{ "values", new BsonArray {
							"HDR10", "HDR10+", "Dolby Vision", "HLG",
							"HDR500", "HDR1000", "HDR Vivid", "DisplayP3",
						} } } },

					{ "alwaysOnDisplay", new BsonDocument { { "label", "Always-On Display" }, { "type", "boolean" } } },

					// ── Touch sampling rate ──────────────────────────────────────────
					{ "touchSamplingRate", new BsonDocument { { "label", "Touch Sampling Rate" }, { "type", "select" },
						{ "values", new BsonArray {
							"120Hz", "180Hz", "240Hz", "300Hz",
							"360Hz", "480Hz", "720Hz",
							"1000Hz", "1200Hz", "2000Hz",
						} } } },

					// ── Color depth ──────────────────────────────────────────────────
					{ "colorDepth", new BsonDocument { { "label", "Color Depth" }, { "type", "select" },
						{ "values", new BsonArray {
							"8-bit", "10-bit", "10-bit (1B colors)", "12-bit",
						} } } },

					{ "ppi", new BsonDocument { { "label", "PPI Density" }, { "type", "string" } } },
				},
				DBSpecificationCategory.Platform => new BsonDocument
				{
					{ "os", new BsonDocument { { "label", "Operating System" }, { "type", "select" },
						{ "values", new BsonArray {
							"Android 10", "Android 11", "Android 12", "Android 13", "Android 14", "Android 15",
							"iOS 15", "iOS 16", "iOS 17", "iOS 18",
							"iPadOS 16", "iPadOS 17", "iPadOS 18",
							"HarmonyOS 3", "HarmonyOS 4", "HarmonyOS 5",
							"Windows 11",
							"KaiOS",
						} } } },
					{ "chipset", new BsonDocument { { "label", "Chipset" }, { "type", "string" } } },
					{ "cpu", new BsonDocument { { "label", "CPU" }, { "type", "string" } } },
					{ "gpu", new BsonDocument { { "label", "GPU" }, { "type", "string" } } },
					{ "processNode", new BsonDocument { { "label", "Process Node" }, { "type", "select" },
						{ "values", new BsonArray {
							"3 nm", "4 nm", "5 nm", "6 nm", "7 nm", "8 nm", "10 nm", "12 nm", "14 nm",
						} } } },
				},
				DBSpecificationCategory.Memory => new BsonDocument
				{
					{ "ram", new BsonDocument { { "label", "RAM" }, { "type", "select" },
						{ "values", new BsonArray {
							"1 GB", "2 GB", "3 GB", "4 GB", "6 GB",
							"8 GB", "10 GB", "12 GB", "16 GB", "18 GB", "24 GB",
						} } } },
					{ "ramOptions", new BsonDocument { { "label", "RAM Options" }, { "type", "string[]" },
						{ "values", new BsonArray {
							"1 GB", "2 GB", "3 GB", "4 GB", "6 GB",
							"8 GB", "10 GB", "12 GB", "16 GB", "18 GB", "24 GB",
						} } } },
					{ "internalStorage", new BsonDocument { { "label", "Internal Storage" }, { "type", "select" },
						{ "values", new BsonArray {
							"16 GB", "32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB",
						} } } },
					{ "storageOptions", new BsonDocument { { "label", "Storage Options" }, { "type", "string[]" },
						{ "values", new BsonArray {
							"16 GB", "32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB",
						} } } },
					{ "storageType", new BsonDocument { { "label", "Storage Type" }, { "type", "select" },
						{ "values", new BsonArray {
							"eMMC 5.1", "UFS 2.0", "UFS 2.1", "UFS 2.2", "UFS 3.0", "UFS 3.1", "UFS 4.0", "NVMe",
						} } } },
					{ "cardSlot", new BsonDocument { { "label", "Card Slot" }, { "type", "boolean" } } },
					{ "cardSlotType", new BsonDocument { { "label", "Card Slot Type" }, { "type", "select" },
						{ "values", new BsonArray {
							"microSD", "microSDHC", "microSDXC", "NanoMemory",
						} } } },
				},
				DBSpecificationCategory.MainCamera => new BsonDocument
				{
					{ "setup", new BsonDocument { { "label", "Camera Setup" }, { "type", "select" },
						{ "values", new BsonArray { "Single", "Dual", "Triple", "Quad", "Penta" } } } },
					{ "primary", new BsonDocument { { "label", "Primary" }, { "type", "string" } } },
					{ "ultrawide", new BsonDocument { { "label", "Ultrawide" }, { "type", "string" } } },
					{ "telephoto", new BsonDocument { { "label", "Telephoto" }, { "type", "string" } } },
					{ "telephoto2", new BsonDocument { { "label", "Telephoto 2" }, { "type", "string" } } },
					{ "macro", new BsonDocument { { "label", "Macro" }, { "type", "string" } } },
					{ "depthSensor", new BsonDocument { { "label", "Depth Sensor" }, { "type", "string" } } },
					{ "tofSensor", new BsonDocument { { "label", "ToF / LiDAR" }, { "type", "string" } } },
					{ "nightVision", new BsonDocument { { "label", "Night Vision / IR" }, { "type", "string" } } },
					{ "thermalCamera", new BsonDocument { { "label", "Thermal Camera" }, { "type", "string" } } },
					{ "features", new BsonDocument { { "label", "Features" }, { "type", "string" } } },
					{ "video", new BsonDocument { { "label", "Video Recording" }, { "type", "string" } } },
					{ "opticalZoom", new BsonDocument { { "label", "Optical Zoom" }, { "type", "select" },
						{ "values", new BsonArray {
							"2x", "3x", "3.5x", "4x", "5x", "6x", "10x", "12x", "15x",
						} } } },
					{ "digitalZoom", new BsonDocument { { "label", "Digital Zoom" }, { "type", "string" } } },
				},
				DBSpecificationCategory.SelfieCamera => new BsonDocument
				{
					{ "setup", new BsonDocument { { "label", "Camera Setup" }, { "type", "select" },
						{ "values", new BsonArray { "Single", "Dual" } } } },
					{ "primary", new BsonDocument { { "label", "Primary" }, { "type", "string" } } },
					{ "secondary", new BsonDocument { { "label", "Secondary" }, { "type", "string" } } },
					{ "features", new BsonDocument { { "label", "Features" }, { "type", "string" } } },
					{ "video", new BsonDocument { { "label", "Video Recording" }, { "type", "string" } } },
				},
				DBSpecificationCategory.Sound => new BsonDocument
				{
					{ "loudspeaker", new BsonDocument { { "label", "Loudspeaker" }, { "type", "select" },
						{ "values", new BsonArray {
							"Mono", "Stereo", "Stereo (2 speakers)",
							"Stereo (3 speakers)", "Stereo (4 speakers)", "Quad speaker",
						} } } },
					{ "headphoneJack", new BsonDocument { { "label", "3.5mm Jack" }, { "type", "boolean" } } },
					{ "audioCodecs", new BsonDocument { { "label", "Audio Codecs" }, { "type", "string" } } },
					{ "tuning", new BsonDocument { { "label", "Tuning / Brand" }, { "type", "select" },
						{ "values", new BsonArray {
							"Dolby Atmos", "Harman Kardon", "AKG", "Bang & Olufsen",
							"Bose", "JBL", "Yamaha", "Sony 360 Reality Audio",
							"Hi-Res Audio", "Dirac",
						} } } },
				},
				DBSpecificationCategory.Comms => new BsonDocument
				{
					{ "wlan", new BsonDocument { { "label", "Wi-Fi" }, { "type", "string" } } },
					{ "bluetooth", new BsonDocument { { "label", "Bluetooth" }, { "type", "select" },
						{ "values", new BsonArray {
							"4.0", "4.1", "4.2", "5.0", "5.1", "5.2", "5.3", "5.4",
						} } } },
					{ "positioning", new BsonDocument { { "label", "Positioning / GPS" }, { "type", "string" } } },
					{ "nfc", new BsonDocument { { "label", "NFC" }, { "type", "boolean" } } },
					{ "infraredPort", new BsonDocument { { "label", "Infrared Port" }, { "type", "boolean" } } },
					{ "fmRadio", new BsonDocument { { "label", "FM Radio" }, { "type", "boolean" } } },
					{ "usb", new BsonDocument { { "label", "USB" }, { "type", "select" },
						{ "values", new BsonArray {
							"microUSB 2.0",
							"USB 2.0 Type-C", "USB 3.1 Type-C", "USB 3.2 Type-C", "USB 4.0 Type-C",
							"Lightning",
							"Thunderbolt 3 (USB-C)", "Thunderbolt 4 (USB-C)",
						} } } },
					{ "thunderbolt", new BsonDocument { { "label", "Thunderbolt" }, { "type", "select" },
						{ "values", new BsonArray {
							"Thunderbolt 3", "Thunderbolt 4", "Thunderbolt 5",
						} } } },
					{ "uwb", new BsonDocument { { "label", "Ultra-Wideband (UWB)" }, { "type", "boolean" } } },
					{ "satelliteConnectivity", new BsonDocument { { "label", "Satellite Connectivity" }, { "type", "string" } } },
				},
				DBSpecificationCategory.Features => new BsonDocument
				{
					{ "sensors", new BsonDocument { { "label", "Sensors" }, { "type", "string[]" } } },
					{ "fingerprintType", new BsonDocument { { "label", "Fingerprint Type" }, { "type", "select" },
						{ "values", new BsonArray {
							"In-display (optical)", "In-display (ultrasonic)",
							"Side-mounted", "Rear-mounted", "None",
						} } } },
					{ "faceRecognition", new BsonDocument { { "label", "Face Recognition" }, { "type", "select" },
						{ "values", new BsonArray { "2D", "3D (Face ID)", "No" } } } },
					{ "aiFeatures", new BsonDocument { { "label", "AI Features" }, { "type", "string[]" } } },
					{ "samsungDex", new BsonDocument { { "label", "Samsung DeX" }, { "type", "boolean" } } },
					{ "desktopMode", new BsonDocument { { "label", "Desktop Mode" }, { "type", "string" } } },
					{ "multitasking", new BsonDocument { { "label", "Multitasking" }, { "type", "string" } } },
				},
				DBSpecificationCategory.Battery => new BsonDocument
				{
					{ "type", new BsonDocument { { "label", "Type" }, { "type", "select" },
						{ "values", new BsonArray {
							"Li-Ion", "Li-Po", "Si-C (Silicon-Carbon)",
							"Dual-cell Li-Ion", "Dual-cell Li-Po",
						} } } },
					{ "capacity", new BsonDocument { { "label", "Capacity" }, { "type", "string" } } },
					{ "wiredCharging", new BsonDocument { { "label", "Wired Charging" }, { "type", "select" },
						{ "values", new BsonArray {
							"5W", "10W", "15W", "18W", "25W", "33W", "45W",
							"65W", "80W", "100W", "120W", "150W", "200W", "240W",
						} } } },
					{ "wirelessCharging", new BsonDocument { { "label", "Wireless Charging" }, { "type", "select" },
						{ "values", new BsonArray {
							"5W", "7.5W", "10W", "15W", "30W", "50W", "67W", "80W",
						} } } },
					{ "reverseWireless", new BsonDocument { { "label", "Reverse Wireless Charging" }, { "type", "boolean" } } },
					{ "reverseWired", new BsonDocument { { "label", "Reverse Wired Charging" }, { "type", "boolean" } } },
					{ "removable", new BsonDocument { { "label", "Removable" }, { "type", "boolean" } } },
					{ "enduranceRating", new BsonDocument { { "label", "Endurance Rating" }, { "type", "string" } } },
					{ "chargingCycles", new BsonDocument { { "label", "Charging Cycles" }, { "type", "string" } } },
				},
				_ => new BsonDocument()
			};

			return SpecificationLookupDocument.From((long)v, v.ToString(), json);
		});

	private static List<(string Name, string Endpoint, List<ColumnMeta> Columns)> TableMetadata() =>
	[
		("ItemCategory", "/itemcategories",
		[
			new() { Field = "name",             LabelKey = "common.name",              Type = "localized", Order = 1 },
			new() { Field = "parentCategoryId", LabelKey = "category.parentCategory",  Type = "number",    Order = 2 },
			new() { Field = "description",      LabelKey = "common.description",        Type = "localized", Order = 3 },
			new() { Field = "createdAt",        LabelKey = "common.created",            Type = "date",      Order = 4 },
			new() { Field = "isActive",         LabelKey = "common.status",             Type = "boolean",   Order = 5 },
		]),
		("ItemBrand", "/itembrands",
		[
			new() { Field = "name",     LabelKey = "common.name",    Type = "text",    Order = 1 },
			new() { Field = "country",  LabelKey = "common.country", Type = "text",    Order = 2 },
			new() { Field = "logoUrl",  LabelKey = "common.logo",    Type = "image",   Order = 3 },
			new() { Field = "createdAt",LabelKey = "common.created", Type = "date",    Order = 4 },
			new() { Field = "isActive", LabelKey = "common.status",  Type = "boolean", Order = 5 },
		]),
		("Item", "/items",
		[
			new() { Field = "name",          LabelKey = "common.name",        Type = "text",    Order = 1 },
			new() { Field = "images",        LabelKey = "common.images",      Type = "images",  Order = 2 },
			new() { Field = "imageUrl",      LabelKey = "common.imageUrl",    Type = "image",   Order = 3, Visible = false },
			new() { Field = "description",   LabelKey = "common.description", Type = "text",    Order = 4 },
			new() { Field = "barcode",       LabelKey = "common.barcode",     Type = "text",    Order = 5 },
			new() { Field = "createdAt",     LabelKey = "common.created",     Type = "date",    Order = 6 },
			new() { Field = "isActive",      LabelKey = "common.status",      Type = "boolean", Order = 7 },
		]),
		("ItemPackage", "/itempackages",
		[
			new() { Field = "name",               LabelKey = "common.name",            Type = "text",    Order = 1 },
			new() { Field = "originalPrice",      LabelKey = "package.originalPrice",  Type = "number",  Order = 2 },
			new() { Field = "offerPrice",         LabelKey = "package.offerPrice",     Type = "number",  Order = 3 },
			new() { Field = "discountPercentage", LabelKey = "package.discount",       Type = "number",  Order = 4 },
			new() { Field = "startDate",          LabelKey = "package.startDate",      Type = "date",    Order = 5 },
			new() { Field = "endDate",            LabelKey = "package.endDate",        Type = "date",    Order = 6 },
			new() { Field = "isActive",           LabelKey = "common.status",          Type = "boolean", Order = 7 },
		]),
		("Diagnostics", "/diagnostics",
		[
			new() { Field = "tableName", LabelKey = "diagnostics.tableName", Type = "badge", Order = 1 },
			new() { Field = "action",    LabelKey = "diagnostics.action",    Type = "badge", Order = 2 },
			new() { Field = "entityId",  LabelKey = "diagnostics.entityId",  Type = "number",Order = 3 },
			new() { Field = "timestamp", LabelKey = "diagnostics.timestamp", Type = "date",  Order = 4 },
		]),
	];
}
