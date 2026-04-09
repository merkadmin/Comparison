namespace PriceRadar.Core.Models;

public class ProductType
{
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Type      { get; set; } = string.Empty;
    public string?  TypeImage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
