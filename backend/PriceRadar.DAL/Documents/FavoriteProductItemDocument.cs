using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class FavoriteProductItemDocument : IDocument<FavoriteProductItem>
{
	[BsonId]
	public long Id { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public long UserId { get; set; }
	public long ProductItemId { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public FavoriteProductItem ToModel() => new()
	{
		Id = Id,
		IsActive = IsActive,
		IsDeleted = IsDeleted,
		UserId = UserId,
		ProductItemId = ProductItemId,
		CreatedAt = CreatedAt,
	};

	public static FavoriteProductItemDocument FromModel(FavoriteProductItem m) => new()
	{
		Id = m.Id,
		IsActive = m.IsActive,
		IsDeleted = m.IsDeleted,
		UserId = m.UserId,
		ProductItemId = m.ProductItemId,
		CreatedAt = m.CreatedAt,
	};
}
