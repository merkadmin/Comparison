using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models
{
	public class Variant
	{
		public long Id { get; set; }
		public DBVariantType VariantTypeId { get; set; }
		public string VariantValue { get; set; } = string.Empty;
		public string? Abbreviation { get; set; } = string.Empty;
		public string? Color { get; set; }
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}
