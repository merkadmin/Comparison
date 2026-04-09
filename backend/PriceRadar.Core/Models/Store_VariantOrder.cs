using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models
{
	public class Store_VariantOrder
	{
		public long Id { get; set; }
		/// <summary>Store scope — used when CategoryId is null.</summary>
		public long StoreId { get; set; }
		/// <summary>Category scope — when set, this order applies to all products in this category regardless of store.</summary>
		public long? CategoryId { get; set; }
		public DBVariantType VariantTypeId { get; set; }
		public int OrderIndex { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}
