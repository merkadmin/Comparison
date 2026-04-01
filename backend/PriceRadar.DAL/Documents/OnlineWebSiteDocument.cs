using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.enums;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("OnlineWebSite_s")]
public class OnlineWebSiteDocument : IDocument<OnlineWebSite>
{
    [BsonId]
    public long        Id        { get; set; }
    public bool        IsActive  { get; set; } = true;
    public bool        IsDeleted { get; set; } = false;
    public string      Name      { get; set; } = string.Empty;
    public string      Url       { get; set; } = string.Empty;
    public string?     LogoUrl   { get; set; }
    public WebSiteType Type      { get; set; }
    public string?     Country   { get; set; }
    public DateTime    CreatedAt { get; set; } = DateTime.UtcNow;

    public OnlineWebSite ToModel() => new()
    {
        Id        = Id,
        IsActive  = IsActive,
        IsDeleted = IsDeleted,
        Name      = Name,
        Url       = Url,
        LogoUrl   = LogoUrl,
        Type      = Type,
        Country   = Country,
        CreatedAt = CreatedAt,
    };

    public static OnlineWebSiteDocument FromModel(OnlineWebSite s) => new()
    {
        Id        = s.Id,
        IsActive  = s.IsActive,
        IsDeleted = s.IsDeleted,
        Name      = s.Name,
        Url       = s.Url,
        LogoUrl   = s.LogoUrl,
        Type      = s.Type,
        Country   = s.Country,
        CreatedAt = s.CreatedAt,
    };
}
