namespace PriceRadar.Core.Models;

public class ItemPackage
{
    public long                Id                 { get; set; }
    public bool                IsActive           { get; set; } = true;
    public bool                IsDeleted          { get; set; } = false;
    public string              Name               { get; set; } = string.Empty;
    public string?             Description        { get; set; }
    public List<ItemPackageItem> Items            { get; set; } = new();
    public decimal             OriginalPrice      { get; set; }
    public decimal             OfferPrice         { get; set; }
    public decimal             DiscountPercentage => OriginalPrice > 0
        ? Math.Round((OriginalPrice - OfferPrice) / OriginalPrice * 100, 2) : 0;
    public DateTime            StartDate          { get; set; } = DateTime.UtcNow;
    public DateTime?           EndDate            { get; set; }
    public DateTime            CreatedAt          { get; set; } = DateTime.UtcNow;
}
