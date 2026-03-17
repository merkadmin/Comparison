using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.API.Seeder;

public class DataSeeder
{
	private readonly MongoDbContext _context;

	public DataSeeder(MongoDbContext context)
	{
		_context = context;
	}

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
		if (await _context.ItemCategories.CountDocumentsAsync(_ => true) > 0) return;

		var categories = new List<ItemCategoryDocument>
		{
			new() { Name = "Laptops",     Description = "Portable computers" },
			new() { Name = "Smartphones", Description = "Mobile phones and smart devices" },
			new() { Name = "Tablets",     Description = "Tablet computers and e-readers" },
			new() { Name = "Accessories", Description = "Cables, bags, chargers, and more" },
			new() { Name = "Audio",       Description = "Headphones, speakers, and earbuds" },
		};

		await _context.ItemCategories.InsertManyAsync(categories);
		Console.WriteLine($"[Seeder] Inserted {categories.Count} categories.");
	}

	// ─── Brands ───────────────────────────────────────────────────────────────
	private async Task SeedBrandsAsync()
	{
		if (await _context.ItemBrands.CountDocumentsAsync(_ => true) > 0) return;

		var brands = new List<ItemBrandDocument>
		{
			new() { Name = "Apple",   Country = "USA" },
			new() { Name = "Samsung", Country = "South Korea" },
			new() { Name = "Dell",    Country = "USA" },
			new() { Name = "Sony",    Country = "Japan" },
			new() { Name = "Lenovo",  Country = "China" },
			new() { Name = "HP",      Country = "USA" },
		};

		await _context.ItemBrands.InsertManyAsync(brands);
		Console.WriteLine($"[Seeder] Inserted {brands.Count} brands.");
	}

	// ─── Items ────────────────────────────────────────────────────────────────
	private async Task SeedItemsAsync()
	{
		if (await _context.Items.CountDocumentsAsync(_ => true) > 0) return;

		// Fetch IDs after seeding categories and brands
		var categories = await _context.ItemCategories.Find(_ => true).ToListAsync();
		var brands = await _context.ItemBrands.Find(_ => true).ToListAsync();

		string CategoryId(string name) => categories.First(c => c.Name == name).Id!;
		string BrandId(string name) => brands.First(b => b.Name == name).Id!;

		var items = new List<ItemDocument>
		{
			new()
			{
				Name        = "MacBook Pro 14\"",
				Description = "Apple M3 Pro chip, 18GB RAM, 512GB SSD",
				BrandId     = BrandId("Apple"),
				CategoryIds = new() { CategoryId("Laptops") },
				Barcode     = "APL-MBP14-M3",
			},
			new()
			{
				Name        = "iPhone 15 Pro",
				Description = "A17 Pro chip, 256GB, Titanium",
				BrandId     = BrandId("Apple"),
				CategoryIds = new() { CategoryId("Smartphones"), CategoryId("Accessories") },
				Barcode     = "APL-IP15PRO",
			},
			new()
			{
				Name        = "Samsung Galaxy S24 Ultra",
				Description = "Snapdragon 8 Gen 3, 12GB RAM, 256GB",
				BrandId     = BrandId("Samsung"),
				CategoryIds = new() { CategoryId("Smartphones") },
				Barcode     = "SAM-S24U-256",
			},
			new()
			{
				Name        = "Galaxy Tab S9",
				Description = "11\" AMOLED, Snapdragon 8 Gen 2, 128GB",
				BrandId     = BrandId("Samsung"),
				CategoryIds = new() { CategoryId("Tablets") },
				Barcode     = "SAM-TABS9-128",
			},
			new()
			{
				Name        = "Dell XPS 15",
				Description = "Intel Core i7, 16GB RAM, 512GB SSD, OLED",
				BrandId     = BrandId("Dell"),
				CategoryIds = new() { CategoryId("Laptops") },
				Barcode     = "DELL-XPS15-I7",
			},
			new()
			{
				Name        = "Sony WH-1000XM5",
				Description = "Industry-leading noise cancelling headphones",
				BrandId     = BrandId("Sony"),
				CategoryIds = new() { CategoryId("Audio"), CategoryId("Accessories") },
				Barcode     = "SNY-WH1000XM5",
			},
			new()
			{
				Name        = "Lenovo ThinkPad X1 Carbon",
				Description = "Intel Core i7, 16GB, 512GB, 14\" FHD",
				BrandId     = BrandId("Lenovo"),
				CategoryIds = new() { CategoryId("Laptops") },
				Barcode     = "LNV-X1C-GEN11",
			},
			new()
			{
				Name        = "HP Spectre x360",
				Description = "2-in-1 laptop, Intel Core i7, 16GB, 512GB OLED",
				BrandId     = BrandId("HP"),
				CategoryIds = new() { CategoryId("Laptops"), CategoryId("Tablets") },
				Barcode     = "HP-SPCX360-14",
			},
		};

		await _context.Items.InsertManyAsync(items);
		Console.WriteLine($"[Seeder] Inserted {items.Count} items.");
	}

	// ─── Packages / Offers ────────────────────────────────────────────────────
	private async Task SeedPackagesAsync()
	{
		if (await _context.ItemPackages.CountDocumentsAsync(_ => true) > 0) return;

		var items = await _context.Items.Find(_ => true).ToListAsync();

		string ItemId(string name) => items.First(i => i.Name.Contains(name)).Id!;

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
					new() { ItemId = ItemId("MacBook"),  Quantity = 1 },
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
					new() { ItemId = ItemId("Galaxy Tab"),  Quantity = 1 },
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

		await _context.ItemPackages.InsertManyAsync(packages);
		Console.WriteLine($"[Seeder] Inserted {packages.Count} packages/offers.");
	}
}
