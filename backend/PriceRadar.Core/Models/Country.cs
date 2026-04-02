namespace PriceRadar.Core.Models;

public class Country
{
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Name      { get; set; } = string.Empty;
    public string?  Code      { get; set; }   // ISO 3166-1 alpha-2, e.g. "US", "GB"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
