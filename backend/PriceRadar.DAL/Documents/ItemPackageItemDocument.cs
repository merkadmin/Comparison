using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class ItemPackageItemDocument
{
    public long ItemId { get; set; }
    public int Quantity { get; set; } = 1;

    public ItemPackageItem ToModel() => new()
    {
        ItemId   = ItemId,
        Quantity = Quantity
    };

    public static ItemPackageItemDocument FromModel(ItemPackageItem i) => new()
    {
        ItemId   = i.ItemId,
        Quantity = i.Quantity
    };
}
