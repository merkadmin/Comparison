namespace PriceRadar.Core.Models;

public class FavoriteProductItem
{
    public long     Id            { get; set; }
    public bool     IsActive      { get; set; } = true;
    public bool     IsDeleted     { get; set; } = false;
    public long     UserId        { get; set; }
    public long     ProductItemId { get; set; }
    public DateTime CreatedAt     { get; set; } = DateTime.UtcNow;
}
