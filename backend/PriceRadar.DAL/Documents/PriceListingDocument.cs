using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class PriceListingDocument : IDocument<PriceListing>
{
    [BsonId]
    public long     Id          { get; set; }
    public bool     IsActive    { get; set; } = true;
    public bool     IsDeleted   { get; set; } = false;
    public long     ProductId   { get; set; }
    public long     StoreId     { get; set; }
    public decimal  Price       { get; set; }
    public string   Currency    { get; set; } = "USD";
    public string?  ProductUrl  { get; set; }
    public bool     IsAvailable { get; set; } = true;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public PriceListing ToModel() => new()
    {
        Id          = Id,
        IsActive    = IsActive,
        IsDeleted   = IsDeleted,
        ProductId   = ProductId,
        StoreId     = StoreId,
        Price       = Price,
        Currency    = Currency,
        ProductUrl  = ProductUrl,
        IsAvailable = IsAvailable,
        LastUpdated = LastUpdated,
    };

    public static PriceListingDocument FromModel(PriceListing l) => new()
    {
        Id          = l.Id,
        IsActive    = l.IsActive,
        IsDeleted   = l.IsDeleted,
        ProductId   = l.ProductId,
        StoreId     = l.StoreId,
        Price       = l.Price,
        Currency    = l.Currency,
        ProductUrl  = l.ProductUrl,
        IsAvailable = l.IsAvailable,
        LastUpdated = l.LastUpdated,
    };
}
