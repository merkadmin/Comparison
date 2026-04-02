using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("Country_s")]
public class CountryDocument : IDocument<Country>
{
    [BsonId]
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Name      { get; set; } = string.Empty;
    public string?  Code      { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Country ToModel() => new()
    {
        Id        = Id,
        IsActive  = IsActive,
        IsDeleted = IsDeleted,
        Name      = Name,
        Code      = Code,
        CreatedAt = CreatedAt,
    };

    public static CountryDocument FromModel(Country c) => new()
    {
        Id        = c.Id,
        IsActive  = c.IsActive,
        IsDeleted = c.IsDeleted,
        Name      = c.Name,
        Code      = c.Code,
        CreatedAt = c.CreatedAt,
    };
}
