namespace PriceRadar.Core.Models;

public class Item
{
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public string? Description { get; set; }
	public string? Barcode { get; set; }
	public string? ImageUrl { get; set; }

	// Many-to-One: each item has one brand
	public long BrandId { get; set; }
	public ItemBrand? Brand { get; set; }

	// Many-to-One: each item belongs to one category
	public long ItemCategoryId { get; set; }
	public ItemCategory? Category { get; set; }

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
