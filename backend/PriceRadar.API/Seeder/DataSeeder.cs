using MongoDB.Driver;
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
			_context.Items.Database.GetCollection<MongoDB.Bson.BsonDocument>("ProductItem").UpdateManyAsync(missing, defaults),
			_context.ItemPackages.Database.GetCollection<MongoDB.Bson.BsonDocument>("ItemPackage").UpdateManyAsync(missing, defaults),
			_context.Stores.Database.GetCollection<MongoDB.Bson.BsonDocument>("stores").UpdateManyAsync(missing, defaults),
			_context.Products.Database.GetCollection<MongoDB.Bson.BsonDocument>("products").UpdateManyAsync(missing, defaults),
			_context.PriceListings.Database.GetCollection<MongoDB.Bson.BsonDocument>("priceListings").UpdateManyAsync(missing, defaults),
			_context.PriceHistories.Database.GetCollection<MongoDB.Bson.BsonDocument>("priceHistories").UpdateManyAsync(missing, defaults),
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
		if (await _context.Items.CountDocumentsAsync(_ => true) > 0) return;

		// Load already-seeded categories and brands so we can reference their IDs
		var categories = await _context.ItemCategories.Find(_ => true).ToListAsync();
		var brands = await _context.ItemBrands.Find(_ => true).ToListAsync();

		// Helper functions to look up the long ID by name
		long CategoryId(string name) => categories.FirstOrDefault(c => c.Name.En == name)?.Id
			?? throw new InvalidOperationException($"[Seeder] Category '{name}' not found. Drop the ItemCategory collection and restart.");
		long BrandId(string name) => brands.FirstOrDefault(b => b.Name == name)?.Id
			?? throw new InvalidOperationException($"[Seeder] Brand '{name}' not found. Drop the ItemBrand collection and restart.");

		// Each item is linked to a brand and a category via their long IDs (foreign keys)
		var items = new List<ItemDocument>
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

		await _context.Items.InsertManyAsync(items);
		Console.WriteLine($"[Seeder] Inserted {items.Count} items.");
	}

	// ─── Packages / Offers ────────────────────────────────────────────────────
	private async Task SeedPackagesAsync()
	{
		// Skip if the collection already has data (idempotent guard)
		if (await _context.ItemPackages.CountDocumentsAsync(_ => true) > 0) return;

		// Load already-seeded items so we can reference their IDs inside packages
		var items = await _context.Items.Find(_ => true).ToListAsync();

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
			new() { Field = "imageUrl",      LabelKey = "common.image",       Type = "image",   Order = 2 },
			new() { Field = "description",   LabelKey = "common.description", Type = "text",    Order = 3 },
			new() { Field = "barcode",       LabelKey = "common.barcode",     Type = "text",    Order = 4 },
			new() { Field = "createdAt",     LabelKey = "common.created",     Type = "date",    Order = 5 },
			new() { Field = "isActive",      LabelKey = "common.status",      Type = "boolean", Order = 6 },
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
