using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models
{
	public class Store_Item
	{
		public long Id { get; set; }
		public long ItemId { get; set; }
		public long StoreId { get; set; }
		public decimal SellingPrice { get; set; }
		public SellingPriceType SellingPriceTypeId { get; set; } = SellingPriceType.Regular;
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}
