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
		await SeedCategoriesAsync();
		await SeedBrandsAsync();
		await SeedItemsAsync();
		await SeedPackagesAsync();
	}

	// ─── Categories ───────────────────────────────────────────────────────────
	private async Task SeedCategoriesAsync()
	{
		// Skip if the collection already has data (idempotent guard)
		if (await _context.ItemCategories.CountDocumentsAsync(_ => true) > 0) return;

		// Each category has a localized name and description (En / Ar / Fr)
		var categories = new List<ItemCategoryDocument>
		{
			new() {
				Name        = new() { En = "Laptops",      Ar = "أجهزة لابتوب",     Fr = "Ordinateurs portables" },
				Description = new() { En = "Portable computers", Ar = "حواسيب محمولة", Fr = "Ordinateurs portables" }
			},
			new() {
				Name        = new() { En = "Smartphones",  Ar = "الهواتف الذكية",    Fr = "Smartphones" },
				Description = new() { En = "Mobile phones and smart devices", Ar = "الهواتف المحمولة والأجهزة الذكية", Fr = "Téléphones mobiles et appareils intelligents" }
			},
			new() {
				Name        = new() { En = "Tablets",      Ar = "الأجهزة اللوحية",   Fr = "Tablettes" },
				Description = new() { En = "Tablet computers and e-readers", Ar = "الحواسيب اللوحية وأجهزة القراءة الإلكترونية", Fr = "Tablettes et liseuses" }
			},
			new() {
				Name        = new() { En = "Accessories",  Ar = "الإكسسوارات",       Fr = "Accessoires" },
				Description = new() { En = "Cables, bags, chargers, and more", Ar = "كابلات وحقائب وشواحن والمزيد", Fr = "Câbles, sacs, chargeurs et plus" }
			},
			new() {
				Name        = new() { En = "Audio",        Ar = "الصوتيات",          Fr = "Audio" },
				Description = new() { En = "Headphones, speakers, and earbuds", Ar = "سماعات الرأس والمكبرات وسماعات الأذن", Fr = "Casques, enceintes et écouteurs" }
			},
		};

		// Assign auto-increment long IDs before bulk insert
		// (MongoDB does not auto-generate long IDs like it does for ObjectId)
		foreach (var cat in categories)
			cat.Id = await _context.GetNextSequenceAsync("itemcategories");

		await _context.ItemCategories.InsertManyAsync(categories);
		Console.WriteLine($"[Seeder] Inserted {categories.Count} categories.");
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
		var brands     = await _context.ItemBrands.Find(_ => true).ToListAsync();

		// Helper functions to look up the long ID by name
		long CategoryId(string name) => categories.FirstOrDefault(c => c.Name.En == name)?.Id
			?? throw new InvalidOperationException($"[Seeder] Category '{name}' not found. Drop the ItemCategory collection and restart.");
		long BrandId(string name) => brands.FirstOrDefault(b => b.Name == name)?.Id
			?? throw new InvalidOperationException($"[Seeder] Brand '{name}' not found. Drop the Item_Brand_sc collection and restart.");

		// Each item is linked to a brand and a category via their long IDs (foreign keys)
		var items = new List<ItemDocument>
		{
			new()
			{
				Name           = "MacBook Pro 14\"",
				Description    = "Apple M3 Pro chip, 18GB RAM, 512GB SSD",
				BrandId        = BrandId("Apple"),
				ItemCategoryId = CategoryId("Laptops"),
				Barcode        = "APL-MBP14-M3",
			},
			new()
			{
				Name           = "iPhone 15 Pro",
				Description    = "A17 Pro chip, 256GB, Titanium",
				BrandId        = BrandId("Apple"),
				ItemCategoryId = CategoryId("Smartphones"),
				Barcode        = "APL-IP15PRO",
			},
			new()
			{
				Name           = "Samsung Galaxy S24 Ultra",
				Description    = "Snapdragon 8 Gen 3, 12GB RAM, 256GB",
				BrandId        = BrandId("Samsung"),
				ItemCategoryId = CategoryId("Smartphones"),
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
				Name           = "Dell XPS 15",
				Description    = "Intel Core i7, 16GB RAM, 512GB SSD, OLED",
				BrandId        = BrandId("Dell"),
				ItemCategoryId = CategoryId("Laptops"),
				Barcode        = "DELL-XPS15-I7",
			},
			new()
			{
				Name           = "Sony WH-1000XM5",
				Description    = "Industry-leading noise cancelling headphones",
				BrandId        = BrandId("Sony"),
				ItemCategoryId = CategoryId("Audio"),
				Barcode        = "SNY-WH1000XM5",
			},
			new()
			{
				Name           = "Lenovo ThinkPad X1 Carbon",
				Description    = "Intel Core i7, 16GB, 512GB, 14\" FHD",
				BrandId        = BrandId("Lenovo"),
				ItemCategoryId = CategoryId("Laptops"),
				Barcode        = "LNV-X1C-GEN11",
			},
			new()
			{
				Name           = "HP Spectre x360",
				Description    = "2-in-1 laptop, Intel Core i7, 16GB, 512GB OLED",
				BrandId        = BrandId("HP"),
				ItemCategoryId = CategoryId("Laptops"),
				Barcode        = "HP-SPCX360-14",
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
				Name          = "Apple Productivity Bundle",
				Description   = "MacBook Pro + iPhone 15 Pro — save 10%",
				OriginalPrice = 3_598m,
				OfferPrice    = 3_238m,
				StartDate     = DateTime.UtcNow,
				EndDate       = DateTime.UtcNow.AddDays(30),
				IsActive      = true,
				Items         = new()
				{
					new() { ItemId = ItemId("MacBook"),   Quantity = 1 },
					new() { ItemId = ItemId("iPhone 15"), Quantity = 1 },
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
					new() { ItemId = ItemId("Galaxy S24"), Quantity = 1 },
					new() { ItemId = ItemId("Galaxy Tab"), Quantity = 1 },
				}
			},
			new()
			{
				Name          = "Work From Home Kit",
				Description   = "Dell XPS 15 + Sony WH-1000XM5 — save 5%",
				OriginalPrice = 1_848m,
				OfferPrice    = 1_755m,
				StartDate     = DateTime.UtcNow.AddDays(-10),
				EndDate       = DateTime.UtcNow.AddDays(-1), // already expired
				IsActive      = false,
				Items         = new()
				{
					new() { ItemId = ItemId("Dell XPS"), Quantity = 1 },
					new() { ItemId = ItemId("Sony"),     Quantity = 1 },
				}
			},
		};

		// Assign auto-increment long IDs before bulk insert
		foreach (var pkg in packages)
			pkg.Id = await _context.GetNextSequenceAsync("itempackages");

		await _context.ItemPackages.InsertManyAsync(packages);
		Console.WriteLine($"[Seeder] Inserted {packages.Count} packages/offers.");
	}
}
