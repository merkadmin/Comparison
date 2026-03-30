using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ProductItemDocument : IDocument<ProductItem>
{
	[BsonId]
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public long BrandId { get; set; }
	public long ItemCategoryId { get; set; }
	public string? Description { get; set; }
	public string? BriefDescription { get; set; }
	public string? AboutThisItem { get; set; }
	public string? ModelName { get; set; }
	public string? Barcode { get; set; }
	public DateTime? AnnouncedDate { get; set; }
	public DateTime? ReleaseDate { get; set; }
	public string? ImageUrl { get; set; }
	public List<string> Images { get; set; } = new();
	public List<StorePriceDocument> Prices { get; set; } = new();
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public ProductItem ToModel() => new()
	{
		Id = Id,
		IsActive = IsActive,
		IsDeleted = IsDeleted,
		Name = Name,
		Description = Description,
		BriefDescription = BriefDescription,
		AboutThisItem = AboutThisItem,
		ModelName = ModelName,
		Barcode = Barcode,
		AnnouncedDate = AnnouncedDate,
		ReleaseDate = ReleaseDate,
		ImageUrl = ImageUrl,
		Images = Images,
		BrandId = BrandId,
		ItemCategoryId = ItemCategoryId,
		Prices = Prices.Select(p => p.ToModel()).ToList(),
		CreatedAt = CreatedAt,
	};

	public static ProductItemDocument FromModel(ProductItem item) => new()
	{
		Id = item.Id,
		IsActive = item.IsActive,
		IsDeleted = item.IsDeleted,
		Name = item.Name,
		Description = item.Description,
		BriefDescription = item.BriefDescription,
		AboutThisItem = item.AboutThisItem,
		ModelName = item.ModelName,
		Barcode = item.Barcode,
		AnnouncedDate = item.AnnouncedDate,
		ReleaseDate = item.ReleaseDate,
		ImageUrl = item.ImageUrl,
		Images = item.Images,
		BrandId = item.BrandId,
		ItemCategoryId = item.ItemCategoryId,
		Prices = item.Prices.Select(StorePriceDocument.FromModel).ToList(),
		CreatedAt = item.CreatedAt,
	};
}
