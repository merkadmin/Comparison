using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents
{
	public class ProductItem_VariantEntryDocument
	{
		public long ProductItem_VariantId { get; set; }
		public long VariantId { get; set; }

		public ProductItem_VariantEntry ToModel() => new()
		{
			ProductItem_VariantId = ProductItem_VariantId,
			VariantId = VariantId,
		};

		public static ProductItem_VariantEntryDocument FromModel(ProductItem_VariantEntry e) => new()
		{
			ProductItem_VariantId = e.ProductItem_VariantId,
			VariantId = e.VariantId,
		};
	}

	[BsonIgnoreExtraElements]
	public class ProductItem_VariantDocument : IDocument<ProductItem_Variant>
	{
		[BsonId]
		public long Id { get; set; }
		public long ProductItemId { get; set; }
		public long StoreId { get; set; }
		public decimal SellingPrice { get; set; }
		public string? Description { get; set; }
		public string? About { get; set; }
		public List<ProductItem_VariantEntryDocument> Variants { get; set; } = new();
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public ProductItem_Variant ToModel() => new()
		{
			Id = Id,
			ProductItemId = ProductItemId,
			StoreId = StoreId,
			SellingPrice = SellingPrice,
			Description = Description,
			About = About,
			Variants = Variants.Select(e => e.ToModel()).ToList(),
			IsActive = IsActive,
			IsDeleted = IsDeleted,
			CreatedAt = CreatedAt,
		};

		public static ProductItem_VariantDocument FromModel(ProductItem_Variant m) => new()
		{
			Id = m.Id,
			ProductItemId = m.ProductItemId,
			StoreId = m.StoreId,
			SellingPrice = m.SellingPrice,
			Description = m.Description,
			About = m.About,
			Variants = m.Variants.Select(ProductItem_VariantEntryDocument.FromModel).ToList(),
			IsActive = m.IsActive,
			IsDeleted = m.IsDeleted,
			CreatedAt = m.CreatedAt,
		};
	}
}
