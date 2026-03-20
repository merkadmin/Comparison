using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.enums;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents
{
	public class Store_ItemDocuement : IDocument<Store_Item>
	{
		[BsonId]
		public long Id { get; set; }
		public long ItemId { get; set; }
		public long StoreId { get; set; }
		public decimal SellingPrice { get; set; }
		public SellingPriceType SellingPriceTypeId { get; set; } = SellingPriceType.Regular;
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public Store_Item ToModel() => new()
		{
			Id                 = Id,
			ItemId             = ItemId,
			StoreId            = StoreId,
			SellingPrice       = SellingPrice,
			SellingPriceTypeId = SellingPriceTypeId,
			IsActive           = IsActive,
			IsDeleted          = IsDeleted,
			CreatedAt          = CreatedAt,
		};

		public static Store_ItemDocuement FromModel(Store_Item storeItem) => new()
		{
			Id                 = storeItem.Id,
			ItemId             = storeItem.ItemId,
			StoreId            = storeItem.StoreId,
			SellingPrice       = storeItem.SellingPrice,
			SellingPriceTypeId = storeItem.SellingPriceTypeId,
			IsActive           = storeItem.IsActive,
			IsDeleted          = storeItem.IsDeleted,
			CreatedAt          = storeItem.CreatedAt,
		};
	}
}
