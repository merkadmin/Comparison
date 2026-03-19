namespace PriceRadar.Core.Models;

public class PriceListing
{
    public long     Id          { get; set; }
    public bool     IsActive    { get; set; } = true;
    public bool     IsDeleted   { get; set; } = false;
    public long     ProductId   { get; set; }
    public long     StoreId     { get; set; }
    public decimal  Price       { get; set; }
    public string   Currency    { get; set; } = "USD";
    public string?  ProductUrl  { get; set; }
    public bool     IsAvailable { get; set; } = true;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
