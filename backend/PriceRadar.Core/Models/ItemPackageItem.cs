namespace PriceRadar.Core.Models;

public class ItemPackageItem
{
    public string ItemId { get; set; } = string.Empty;
    public Item? Item { get; set; }
    public int Quantity { get; set; } = 1;
}
