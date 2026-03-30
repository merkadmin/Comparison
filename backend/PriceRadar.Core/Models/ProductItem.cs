namespace PriceRadar.Core.Models;

public class ProductItem
{
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public string? Description { get; set; }
	public string? BriefDescription { get; set; }
	public string? AboutThisItem { get; set; }
	public string? ModelName { get; set; }
	public string? Barcode { get; set; }
	public DateTime? AnnouncedDate { get; set; }
	public DateTime? ReleaseDate { get; set; }
	public string? ImageUrl { get; set; }
	public List<string> Images { get; set; } = new();
	public long BrandId { get; set; }
	public ItemBrand? Brand { get; set; }
	public long ItemCategoryId { get; set; }
	public ItemCategory? Category { get; set; }
	public long? ProductItemTypeId { get; set; }
	public long? ProductInformationId { get; set; }
	public List<StorePrice> Prices { get; set; } = new();
	public List<double> CustomerReviews { get; set; } = new();
	public List<long> CustomerCommentIds { get; set; } = new();
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
