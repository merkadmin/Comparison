namespace PriceRadar.Core.Models;

public class Item
{
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? ImageUrl { get; set; }

    // Many-to-One: each item has one brand
    public string BrandId { get; set; } = string.Empty;
    public ItemBrand? Brand { get; set; }

    // Many-to-Many: each item belongs to many categories
    public List<string> CategoryIds { get; set; } = new();
    public List<ItemCategory>? Categories { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
