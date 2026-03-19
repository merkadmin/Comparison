namespace PriceRadar.Core.Models;

public class ProductInformation
{
    public long     Id          { get; set; }
    public bool     IsActive    { get; set; } = true;
    public bool     IsDeleted   { get; set; } = false;
    public string   Information { get; set; } = string.Empty;
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;
}
