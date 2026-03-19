using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ProductInformationDocument : IDocument<ProductInformation>
{
    [BsonId]
    public long     Id          { get; set; }
    public bool     IsActive    { get; set; } = true;
    public bool     IsDeleted   { get; set; } = false;
    public string   Information { get; set; } = string.Empty;
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;

    public ProductInformation ToModel() => new()
    {
        Id          = Id,
        IsActive    = IsActive,
        IsDeleted   = IsDeleted,
        Information = Information,
        CreatedAt   = CreatedAt,
    };

    public static ProductInformationDocument FromModel(ProductInformation m) => new()
    {
        Id          = m.Id,
        IsActive    = m.IsActive,
        IsDeleted   = m.IsDeleted,
        Information = m.Information,
        CreatedAt   = m.CreatedAt,
    };
}
