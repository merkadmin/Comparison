using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("Item_sc")]
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
	public List<string> CategoryIds { get; set; } = new();

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public Item ToModel() => new()
	{
		Id = Id,
		Name = Name,
		Description = Description,
		Barcode = Barcode,
		ImageUrl = ImageUrl,
		BrandId = BrandId,
		CategoryIds = CategoryIds,
		CreatedAt = CreatedAt
	};

	public static ItemDocument FromModel(Item i) => new()
	{
		Id = i.Id,
		Name = i.Name,
		Description = i.Description,
		Barcode = i.Barcode,
		ImageUrl = i.ImageUrl,
		BrandId = i.BrandId,
		CategoryIds = i.CategoryIds,
		CreatedAt = i.CreatedAt
	};
}
