using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class StoreDocument : IDocument<Store>
{
    [BsonId]
    public long      Id         { get; set; }
    public bool      IsActive   { get; set; } = true;
    public bool      IsDeleted  { get; set; } = false;
    public string    Name       { get; set; } = string.Empty;
    public StoreType Type       { get; set; }
    public string?   WebsiteUrl { get; set; }
    public string?   LogoUrl    { get; set; }
    public string    Country    { get; set; } = string.Empty;

    public Store ToModel() => new()
    {
        Id         = Id,
        IsActive   = IsActive,
        IsDeleted  = IsDeleted,
        Name       = Name,
        Type       = Type,
        WebsiteUrl = WebsiteUrl,
        LogoUrl    = LogoUrl,
        Country    = Country,
    };

    public static StoreDocument FromModel(Store s) => new()
    {
        Id         = s.Id,
        IsActive   = s.IsActive,
        IsDeleted  = s.IsDeleted,
        Name       = s.Name,
        Type       = s.Type,
        WebsiteUrl = s.WebsiteUrl,
        LogoUrl    = s.LogoUrl,
        Country    = s.Country,
    };
}
