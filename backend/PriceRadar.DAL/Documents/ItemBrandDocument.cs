using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("Item_Brand_sc")]
public class ItemBrandDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Country { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ItemBrand ToModel() => new()
    {
        Id = Id,
        Name = Name,
        LogoUrl = LogoUrl,
        Country = Country,
        CreatedAt = CreatedAt
    };

    public static ItemBrandDocument FromModel(ItemBrand b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        LogoUrl = b.LogoUrl,
        Country = b.Country,
        CreatedAt = b.CreatedAt
    };
}
