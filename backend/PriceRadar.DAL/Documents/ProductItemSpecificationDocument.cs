using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ProductItemSpecificationDocument : IDocument<ProductItemSpecificationRecord>
{
    [BsonId]
    public long Id { get; set; }
    public long ProductItemId { get; set; }
    public ProductItemSpecification Specifications { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ProductItemSpecificationRecord ToModel() => new()
    {
        Id             = Id,
        ProductItemId  = ProductItemId,
        Specifications = Specifications,
        IsActive       = IsActive,
        IsDeleted      = IsDeleted,
        CreatedAt      = CreatedAt,
    };

    public static ProductItemSpecificationDocument FromModel(ProductItemSpecificationRecord r) => new()
    {
        Id             = r.Id,
        ProductItemId  = r.ProductItemId,
        Specifications = r.Specifications,
        IsActive       = r.IsActive,
        IsDeleted      = r.IsDeleted,
        CreatedAt      = r.CreatedAt,
    };
}
