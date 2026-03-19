using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ProductItemTypeDocument : IDocument<ProductItemType>
{
    [BsonId]
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Type      { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ProductItemType ToModel() => new()
    {
        Id        = Id,
        IsActive  = IsActive,
        IsDeleted = IsDeleted,
        Type      = Type,
        CreatedAt = CreatedAt,
    };

    public static ProductItemTypeDocument FromModel(ProductItemType m) => new()
    {
        Id        = m.Id,
        IsActive  = m.IsActive,
        IsDeleted = m.IsDeleted,
        Type      = m.Type,
        CreatedAt = m.CreatedAt,
    };
}
