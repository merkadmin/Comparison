namespace PriceRadar.Core.Models;

public class ItemCategory
{
    public long Id { get; set; }
    public LocalizedString Name { get; set; } = new();
    public LocalizedString? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
