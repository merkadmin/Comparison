using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class ItemCategoryDocument : IDocument<ItemCategory>
{
	[BsonId]
	public long Id { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public LocalizedString Name { get; set; } = new();
	public long? ParentCategoryId { get; set; }
	public LocalizedString? Description { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public ItemCategory ToModel() => new()
	{
		Id = Id,
		IsActive = IsActive,
		IsDeleted = IsDeleted,
		Name = Name,
		ParentCategoryId = ParentCategoryId,
		Description = Description,
		CreatedAt = CreatedAt,
	};

	public static ItemCategoryDocument FromModel(ItemCategory c) => new()
	{
		Id = c.Id,
		IsActive = c.IsActive,
		IsDeleted = c.IsDeleted,
		Name = c.Name,
		ParentCategoryId = c.ParentCategoryId,
		Description = c.Description,
		CreatedAt = c.CreatedAt == default ? DateTime.UtcNow : c.CreatedAt,
	};
}
