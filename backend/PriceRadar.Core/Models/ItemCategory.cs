namespace PriceRadar.Core.Models;

public class ItemCategory
{
    public long              Id               { get; set; }
    public bool              IsActive         { get; set; } = true;
    public bool              IsDeleted        { get; set; } = false;
    public LocalizedString   Name             { get; set; } = new();
    public long?             ParentCategoryId { get; set; }
    public LocalizedString?  Description      { get; set; }
    public string?           CategoryImage    { get; set; }
    public DateTime          CreatedAt        { get; set; } = DateTime.UtcNow;
}
