using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class ItemCategoryDocument
{
	[BsonId]
	public long Id { get; set; }
	public LocalizedString Name { get; set; } = new();
	public long? ParentCategoryId { get; set; } = null;
	public LocalizedString? Description { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public ItemCategory ToModel() => new()
	{
		Id = Id,
		Name = Name,
		ParentCategoryId = ParentCategoryId,
		Description = Description,
		CreatedAt = CreatedAt
	};

	public static ItemCategoryDocument FromModel(ItemCategory itemCategory) => new()
	{
		Id               = itemCategory.Id,
		Name             = itemCategory.Name,
		ParentCategoryId = itemCategory.ParentCategoryId,
		Description      = itemCategory.Description,
		CreatedAt        = itemCategory.CreatedAt == default ? DateTime.UtcNow : itemCategory.CreatedAt,
	};
}
