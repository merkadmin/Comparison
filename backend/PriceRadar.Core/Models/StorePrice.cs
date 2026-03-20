using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models;

public class StorePrice
{
	public long StoreId { get; set; }
	public decimal Price { get; set; }
	public DBPriceHistoryType PriceType { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
