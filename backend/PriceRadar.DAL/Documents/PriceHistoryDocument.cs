using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class PriceHistoryDocument : IDocument<PriceHistory>
{
    [BsonId]
    public long Id { get; set; }

    public long ProductId { get; set; }
    public long StoreId { get; set; }

    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    public PriceHistory ToModel() => new()
    {
        Id         = Id,
        ProductId  = ProductId,
        StoreId    = StoreId,
        Price      = Price,
        Currency   = Currency,
        RecordedAt = RecordedAt
    };

    public static PriceHistoryDocument FromModel(PriceHistory h) => new()
    {
        Id         = h.Id,
        ProductId  = h.ProductId,
        StoreId    = h.StoreId,
        Price      = h.Price,
        Currency   = h.Currency,
        RecordedAt = h.RecordedAt
    };
}
