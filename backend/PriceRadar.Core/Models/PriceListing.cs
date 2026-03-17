namespace PriceRadar.Core.Models;

public class PriceListing
{
    public string? Id { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string StoreId { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string? ProductUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
