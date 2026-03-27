using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models
{
	public class Store_VariantOrder
	{
		public long Id { get; set; }
		public long StoreId { get; set; }
		public DBVariantType VariantTypeId { get; set; }
		public int OrderIndex { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}
