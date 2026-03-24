namespace PriceRadar.Core.Models
{
	public class ProductItemVariant
	{
		public long Id { get; set; }
		public long ProductItemId { get; set; }
		public string VariantName { get; set; } = string.Empty;
		public string? VariantValue { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}
