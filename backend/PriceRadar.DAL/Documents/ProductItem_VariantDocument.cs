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
		public decimal SellingPrice { get; set; }
		public long StoreId { get; set; }
		public string? Description { get; set; }
		public string? About { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public ProductItem_Variant ToModel() => new()
		{
			Id = Id,
			ProductItemId = ProductItemId,
			VariantId = VariantId,
			SellingPrice = SellingPrice,
			StoreId = StoreId,
			Description = Description,
			About = About,
			IsActive = IsActive,
			IsDeleted = IsDeleted,
			CreatedAt = CreatedAt,
		};

		public static ProductItem_VariantDocument FromModel(ProductItem_Variant m) => new()
		{
			Id = m.Id,
			ProductItemId = m.ProductItemId,
			VariantId = m.VariantId,
			SellingPrice = m.SellingPrice,
			StoreId = m.StoreId,
			Description = m.Description,
			About = m.About,
			IsActive = m.IsActive,
			IsDeleted = m.IsDeleted,
			CreatedAt = m.CreatedAt,
		};
	}
}
