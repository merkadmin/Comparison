using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ItemDocument : IDocument<Item>
{
    [BsonId]
    public long     Id             { get; set; }
    public bool     IsActive       { get; set; } = true;
    public bool     IsDeleted      { get; set; } = false;
    public string   Name           { get; set; } = string.Empty;
    public string?  Description    { get; set; }
    public string?  Barcode        { get; set; }
    public string?  ImageUrl       { get; set; }
    public long     BrandId        { get; set; }
    public long     ItemCategoryId { get; set; }
    public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;

    public Item ToModel() => new()
    {
        Id             = Id,
        IsActive       = IsActive,
        IsDeleted      = IsDeleted,
        Name           = Name,
        Description    = Description,
        Barcode        = Barcode,
        ImageUrl       = ImageUrl,
        BrandId        = BrandId,
        ItemCategoryId = ItemCategoryId,
        CreatedAt      = CreatedAt,
    };

    public static ItemDocument FromModel(Item i) => new()
    {
        Id             = i.Id,
        IsActive       = i.IsActive,
        IsDeleted      = i.IsDeleted,
        Name           = i.Name,
        Description    = i.Description,
        Barcode        = i.Barcode,
        ImageUrl       = i.ImageUrl,
        BrandId        = i.BrandId,
        ItemCategoryId = i.ItemCategoryId,
        CreatedAt      = i.CreatedAt,
    };
}
