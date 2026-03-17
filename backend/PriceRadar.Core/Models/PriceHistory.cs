namespace PriceRadar.Core.Models;

public class PriceHistory
{
    public string? Id { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string StoreId { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}
