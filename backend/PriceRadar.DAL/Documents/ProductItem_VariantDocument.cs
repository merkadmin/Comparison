using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents
{
	public class ProductItem_VariantDocument : IDocument<ProductItem_Variant>
	{
		[BsonId]
		public long Id { get; set; }
		public long ProductItemId { get; set; }
		public long VariantId { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public ProductItem_Variant ToModel() => new()
		{
			Id            = Id,
			ProductItemId = ProductItemId,
			VariantId     = VariantId,
			IsActive      = IsActive,
			IsDeleted     = IsDeleted,
			CreatedAt     = CreatedAt,
		};

		public static ProductItem_VariantDocument FromModel(ProductItem_Variant m) => new()
		{
			Id            = m.Id,
			ProductItemId = m.ProductItemId,
			VariantId     = m.VariantId,
			IsActive      = m.IsActive,
			IsDeleted     = m.IsDeleted,
			CreatedAt     = m.CreatedAt,
		};
	}
}
