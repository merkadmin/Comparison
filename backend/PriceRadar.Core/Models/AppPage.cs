namespace PriceRadar.Core.Models;

public class AppPage
{
    public long     Id         { get; set; }
    public bool     IsActive   { get; set; } = true;
    public bool     IsDeleted  { get; set; } = false;
    public string   Name       { get; set; } = string.Empty;
    public string   Route      { get; set; } = string.Empty;
    public string?  Icon       { get; set; }
    public int      OrderIndex { get; set; } = 0;
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
}
