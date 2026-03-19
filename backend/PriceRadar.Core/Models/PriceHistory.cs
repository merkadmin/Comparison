namespace PriceRadar.Core.Models;

public class PriceHistory
{
    public long     Id         { get; set; }
    public bool     IsActive   { get; set; } = true;
    public bool     IsDeleted  { get; set; } = false;
    public long     ProductId  { get; set; }
    public long     StoreId    { get; set; }
    public decimal  Price      { get; set; }
    public string   Currency   { get; set; } = "USD";
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}
