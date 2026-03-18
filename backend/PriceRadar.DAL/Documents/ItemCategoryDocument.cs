using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class ItemCategoryDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public LocalizedString Name { get; set; } = new();
    public LocalizedString? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ItemCategory ToModel() => new()
    {
        Id          = Id,
        Name        = Name,
        Description = Description,
        CreatedAt   = CreatedAt
    };

    public static ItemCategoryDocument FromModel(ItemCategory c) => new()
    {
        Id          = c.Id,
        Name        = c.Name,
        Description = c.Description,
        CreatedAt   = c.CreatedAt
    };
}
