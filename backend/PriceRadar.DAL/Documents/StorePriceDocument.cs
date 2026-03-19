using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class StorePriceDocument
{
    public long    StoreId { get; set; }
    public decimal Price   { get; set; }

    public StorePrice ToModel() => new() { StoreId = StoreId, Price = Price };

    public static StorePriceDocument FromModel(StorePrice sp) => new()
    {
        StoreId = sp.StoreId,
        Price   = sp.Price,
    };
}
