using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("ProductType_s")]
public class ProductTypeDocument : IDocument<ProductType>
{
    [BsonId]
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Type      { get; set; } = string.Empty;
    public string?  TypeImage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ProductType ToModel() => new()
    {
        Id        = Id,
        IsActive  = IsActive,
        IsDeleted = IsDeleted,
        Type      = Type,
        TypeImage = TypeImage,
        CreatedAt = CreatedAt,
    };

    public static ProductTypeDocument FromModel(ProductType p) => new()
    {
        Id        = p.Id,
        IsActive  = p.IsActive,
        IsDeleted = p.IsDeleted,
        Type      = p.Type,
        TypeImage = p.TypeImage,
        CreatedAt = p.CreatedAt,
    };
}
