namespace PriceRadar.Core.Models;

public class Item
{
    public long          Id             { get; set; }
    public bool          IsActive       { get; set; } = true;
    public bool          IsDeleted      { get; set; } = false;
    public string        Name           { get; set; } = string.Empty;
    public string?       Description    { get; set; }
    public string?       Barcode        { get; set; }
    public string?       ImageUrl       { get; set; }
    public List<string>  Images         { get; set; } = new();
    public long          BrandId        { get; set; }
    public ItemBrand?    Brand          { get; set; }
    public long          ItemCategoryId { get; set; }
    public ItemCategory? Category       { get; set; }
    public DateTime      CreatedAt      { get; set; } = DateTime.UtcNow;
}
