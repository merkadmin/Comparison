namespace PriceRadar.Core.Models;

public class StaticLookupItem
{
	public long   Id       { get; set; }
	public string Name     { get; set; } = string.Empty;
	public bool   IsActive { get; set; } = true;
}
