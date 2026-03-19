namespace PriceRadar.Core.Models;

public class Diagnostics
{
    public long      Id        { get; set; }
    public bool      IsActive  { get; set; } = true;
    public bool      IsDeleted { get; set; } = false;
    public string    TableName { get; set; } = string.Empty;
    public string    Action    { get; set; } = string.Empty;
    public long?     EntityId  { get; set; }
    public DateTime  Timestamp { get; set; } = DateTime.UtcNow;
}
