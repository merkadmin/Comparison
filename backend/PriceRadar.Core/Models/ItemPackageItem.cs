namespace PriceRadar.Core.Models;

public class ItemPackageItem
{
    public long ItemId { get; set; }
    public ProductItem? Item { get; set; }
    public int Quantity { get; set; } = 1;
}
