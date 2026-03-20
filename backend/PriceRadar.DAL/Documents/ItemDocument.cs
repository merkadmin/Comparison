using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ItemDocument : IDocument<Item>
{
	[BsonId]
	public long Id { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public string Name { get; set; } = string.Empty;
	public string? Description { get; set; }
	public string? BriefDescription { get; set; }
	public string? AboutThisItem { get; set; }
	public string? ModelName { get; set; }
	public string? Barcode { get; set; }
	public string? ImageUrl { get; set; }
	public List<string> Images { get; set; } = new();
	public long BrandId { get; set; }
	public long ItemCategoryId { get; set; }
	public long? ProductItemTypeId { get; set; }
	public long? ProductInformationId { get; set; }
	public List<StorePriceDocument> Prices { get; set; } = new();
	public List<double> CustomerReviews { get; set; } = new();
	public List<long> CustomerCommentIds { get; set; } = new();
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public Item ToModel() => new()
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
		ImageUrl = ImageUrl,
		Images = Images,
		BrandId = BrandId,
		ItemCategoryId = ItemCategoryId,
		ProductItemTypeId = ProductItemTypeId,
		ProductInformationId = ProductInformationId,
		Prices = Prices.Select(p => p.ToModel()).ToList(),
		CustomerReviews = CustomerReviews,
		CustomerCommentIds = CustomerCommentIds,
		CreatedAt = CreatedAt,
	};

	public static ItemDocument FromModel(Item i) => new()
	{
		Id = i.Id,
		IsActive = i.IsActive,
		IsDeleted = i.IsDeleted,
		Name = i.Name,
		Description = i.Description,
		BriefDescription = i.BriefDescription,
		AboutThisItem = i.AboutThisItem,
		ModelName = i.ModelName,
		Barcode = i.Barcode,
		ImageUrl = i.ImageUrl,
		Images = i.Images,
		BrandId = i.BrandId,
		ItemCategoryId = i.ItemCategoryId,
		ProductItemTypeId = i.ProductItemTypeId,
		ProductInformationId = i.ProductInformationId,
		Prices = i.Prices.Select(StorePriceDocument.FromModel).ToList(),
		CustomerReviews = i.CustomerReviews,
		CustomerCommentIds = i.CustomerCommentIds,
		CreatedAt = i.CreatedAt,
	};
}
