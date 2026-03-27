using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents
{
	[BsonIgnoreExtraElements]
	public class Store_VariantOrderDocument : IDocument<Store_VariantOrder>
	{
		[BsonId]
		public long Id { get; set; }
		public long StoreId { get; set; }
		public long VariantId { get; set; }
		public int OrderIndex { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public Store_VariantOrder ToModel() => new()
		{
			Id = Id,
			StoreId = StoreId,
			VariantId = VariantId,
			OrderIndex = OrderIndex,
			IsActive = IsActive,
			IsDeleted = IsDeleted,
			CreatedAt = CreatedAt,
		};

		public static Store_VariantOrderDocument FromModel(Store_VariantOrder m) => new()
		{
			Id = m.Id,
			StoreId = m.StoreId,
			VariantId = m.VariantId,
			OrderIndex = m.OrderIndex,
			IsActive = m.IsActive,
			IsDeleted = m.IsDeleted,
			CreatedAt = m.CreatedAt,
		};
	}
}
