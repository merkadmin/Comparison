using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents
{
	public class ProductItemVariantDocument : IDocument<ProductItemVariant>
	{
		[BsonId]
		public long Id { get; set; }
		public long ProductItemId { get; set; }
		public string VariantName { get; set; } = string.Empty;
		public string? VariantValue { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public ProductItemVariant ToModel() => new()
		{
			Id = Id,
			IsActive = IsActive,
			IsDeleted = IsDeleted,
			ProductItemId = ProductItemId,
			VariantName = VariantName,
			VariantValue = VariantValue,
			CreatedAt = CreatedAt,
		};

		public static ProductItemVariantDocument FromModel(ProductItemVariant variant) => new()
		{
			Id = variant.Id,
			IsActive = variant.IsActive,
			IsDeleted = variant.IsDeleted,
			ProductItemId = variant.ProductItemId,
			VariantName = variant.VariantName,
			VariantValue = variant.VariantValue,
			CreatedAt = variant.CreatedAt,
		};
	}
}
