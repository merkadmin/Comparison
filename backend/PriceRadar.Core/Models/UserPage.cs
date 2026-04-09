namespace PriceRadar.Core.Models;

public class UserPage
{
    public long     Id        { get; set; }
    public bool     IsDeleted { get; set; } = false;
    public long     UserId    { get; set; }
    public long     PageId    { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
