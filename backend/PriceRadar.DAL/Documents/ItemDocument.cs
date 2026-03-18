using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class ItemDocument
{
	[BsonId]
	[BsonRepresentation(BsonType.ObjectId)]
	public string? Id { get; set; }

	public string Name { get; set; } = string.Empty;
	public string? Description { get; set; }
	public string? Barcode { get; set; }
	public string? ImageUrl { get; set; }

	[BsonRepresentation(BsonType.ObjectId)]
	public string BrandId { get; set; } = string.Empty;

	[BsonRepresentation(BsonType.ObjectId)]
	public string ItemCategoryId { get; set; } = string.Empty;

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public Item ToModel() => new()
	{
		Id             = Id,
		Name           = Name,
		Description    = Description,
		Barcode        = Barcode,
		ImageUrl       = ImageUrl,
		BrandId        = BrandId,
		ItemCategoryId = ItemCategoryId,
		CreatedAt      = CreatedAt
	};

	public static ItemDocument FromModel(Item i) => new()
	{
		Id             = i.Id,
		Name           = i.Name,
		Description    = i.Description,
		Barcode        = i.Barcode,
		ImageUrl       = i.ImageUrl,
		BrandId        = i.BrandId,
		ItemCategoryId = i.ItemCategoryId,
		CreatedAt      = i.CreatedAt
	};
}
