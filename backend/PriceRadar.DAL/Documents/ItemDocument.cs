using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ItemDocument
{
    [BsonId]
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? ImageUrl { get; set; }

    public long BrandId { get; set; }
    public long ItemCategoryId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Item ToModel() => new()
    {
        Id             = Id,
        Name           = Name,
        Description    = Description,
        Barcode        = Barcode,
        ImageUrl       = ImageUrl,
        BrandId        = BrandId,
        ItemCategoryId = ItemCategoryId,
        CreatedAt      = CreatedAt
    };

    public static ItemDocument FromModel(Item i) => new()
    {
        Id             = i.Id,
        Name           = i.Name,
        Description    = i.Description,
        Barcode        = i.Barcode,
        ImageUrl       = i.ImageUrl,
        BrandId        = i.BrandId,
        ItemCategoryId = i.ItemCategoryId,
        CreatedAt      = i.CreatedAt
    };
}
