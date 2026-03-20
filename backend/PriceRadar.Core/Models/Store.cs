using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models;

public class Store
{
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public DBStoreType StoreTypeId { get; set; }
	public DBStore StoreId { get; set; }
	public string? WebsiteUrl { get; set; }
	public string? LogoUrl { get; set; }
	public string Country { get; set; } = string.Empty;
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
