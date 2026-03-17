namespace PriceRadar.Core.Models;

public enum StoreType { Online, Physical }

public class Store
{
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public StoreType Type { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string Country { get; set; } = string.Empty;
}
