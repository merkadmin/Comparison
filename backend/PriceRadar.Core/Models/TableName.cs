namespace PriceRadar.Core.Models;

public class TableName
{
    public long   Id        { get; set; }
    public bool   IsActive  { get; set; } = true;
    public bool   IsDeleted { get; set; } = false;
    public string Name      { get; set; } = string.Empty;
}
