namespace PriceRadar.Core.Models;

public class ItemBrand
{
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Name      { get; set; } = string.Empty;
    public string?  LogoUrl   { get; set; }
    public string?  Country   { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
