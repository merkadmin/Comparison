namespace PriceRadar.Core.Models;

public class Product
{
    public long                        Id        { get; set; }
    public bool                        IsActive  { get; set; } = true;
    public bool                        IsDeleted { get; set; } = false;
    public string                      Name      { get; set; } = string.Empty;
    public string                      Brand     { get; set; } = string.Empty;
    public string                      Category  { get; set; } = string.Empty;
    public string?                     Barcode   { get; set; }
    public string?                     ImageUrl  { get; set; }
    public Dictionary<string, string>  Specs     { get; set; } = new();
    public DateTime                    CreatedAt { get; set; } = DateTime.UtcNow;
}
