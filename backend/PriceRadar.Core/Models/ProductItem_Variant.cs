namespace PriceRadar.Core.Models
{
	public class ProductItem_Variant
	{
		public long Id { get; set; }
		public long ProductItemId { get; set; }
		public long VariantId { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	}
}
