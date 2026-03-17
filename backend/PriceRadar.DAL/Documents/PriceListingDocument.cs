using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class PriceListingDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string ProductId { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string StoreId { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string? ProductUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public PriceListing ToModel() => new()
    {
        Id = Id,
        ProductId = ProductId,
        StoreId = StoreId,
        Price = Price,
        Currency = Currency,
        ProductUrl = ProductUrl,
        IsAvailable = IsAvailable,
        LastUpdated = LastUpdated
    };

    public static PriceListingDocument FromModel(PriceListing l) => new()
    {
        Id = l.Id,
        ProductId = l.ProductId,
        StoreId = l.StoreId,
        Price = l.Price,
        Currency = l.Currency,
        ProductUrl = l.ProductUrl,
        IsAvailable = l.IsAvailable,
        LastUpdated = l.LastUpdated
    };
}
