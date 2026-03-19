using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ProductDocument : IDocument<Product>
{
    [BsonId]
    public long                       Id        { get; set; }
    public bool                       IsActive  { get; set; } = true;
    public bool                       IsDeleted { get; set; } = false;
    public string                     Name      { get; set; } = string.Empty;
    public string                     Brand     { get; set; } = string.Empty;
    public string                     Category  { get; set; } = string.Empty;
    public string?                    Barcode   { get; set; }
    public string?                    ImageUrl  { get; set; }
    public Dictionary<string, string> Specs     { get; set; } = new();
    public DateTime                   CreatedAt { get; set; } = DateTime.UtcNow;

    public Product ToModel() => new()
    {
        Id        = Id,
        IsActive  = IsActive,
        IsDeleted = IsDeleted,
        Name      = Name,
        Brand     = Brand,
        Category  = Category,
        Barcode   = Barcode,
        ImageUrl  = ImageUrl,
        Specs     = Specs,
        CreatedAt = CreatedAt,
    };

    public static ProductDocument FromModel(Product p) => new()
    {
        Id        = p.Id,
        IsActive  = p.IsActive,
        IsDeleted = p.IsDeleted,
        Name      = p.Name,
        Brand     = p.Brand,
        Category  = p.Category,
        Barcode   = p.Barcode,
        ImageUrl  = p.ImageUrl,
        Specs     = p.Specs,
        CreatedAt = p.CreatedAt,
    };
}
