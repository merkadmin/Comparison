using PriceRadar.Core.enums;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class StorePriceDocument
{
	public long StoreId { get; set; }
	public decimal Price { get; set; }
	public DBPriceHistoryType PriceType { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public StorePrice ToModel() => new()
	{
		StoreId = StoreId, 
		Price = Price,
		PriceType = PriceType,
		IsActive = IsActive,
		IsDeleted = IsDeleted,
		CreatedAt = CreatedAt,
	};

	public static StorePriceDocument FromModel(StorePrice sp) => new()
	{
		StoreId = sp.StoreId,
		Price = sp.Price,
		PriceType = sp.PriceType,
		IsActive = sp.IsActive,
		IsDeleted = sp.IsDeleted,
		CreatedAt = sp.CreatedAt,
	};
}
