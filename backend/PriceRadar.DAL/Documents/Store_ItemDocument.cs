using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents
{
	[BsonIgnoreExtraElements]
	public class Store_ItemDocument : IDocument<Store_Item>
	{
		[BsonId]
		public long Id { get; set; }
		public long StoreId { get; set; }
		public long ProductItemId { get; set; }
		public int AvailableQuantity { get; set; }
		public decimal SellingPrice { get; set; }
		public bool IsDeliveryAvailable { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public Store_Item ToModel() => new()
		{
			Id = Id,
			StoreId = StoreId,
			ProductItemId = ProductItemId,
			AvailableQuantity = AvailableQuantity,
			SellingPrice = SellingPrice,
			IsDeliveryAvailable = IsDeliveryAvailable,
			IsActive = IsActive,
			IsDeleted = IsDeleted,
			CreatedAt = CreatedAt,
		};

		public static Store_ItemDocument FromModel(Store_Item m) => new()
		{
			Id = m.Id,
			StoreId = m.StoreId,
			ProductItemId = m.ProductItemId,
			AvailableQuantity = m.AvailableQuantity,
			SellingPrice = m.SellingPrice,
			IsDeliveryAvailable = m.IsDeliveryAvailable,
			IsActive = m.IsActive,
			IsDeleted = m.IsDeleted,
			CreatedAt = m.CreatedAt,
		};
	}
}
