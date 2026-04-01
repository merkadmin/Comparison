using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models;

public class OnlineWebSite
{
    public long        Id        { get; set; }
    public bool        IsActive  { get; set; } = true;
    public bool        IsDeleted { get; set; } = false;
    public string      Name      { get; set; } = string.Empty;
    public string      Url       { get; set; } = string.Empty;
    public string?     LogoUrl   { get; set; }
    public WebSiteType Type      { get; set; }
    public string?     Country   { get; set; }
    public DateTime    CreatedAt { get; set; } = DateTime.UtcNow;
}
