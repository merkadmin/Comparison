namespace PriceRadar.Core.Models;

public class SpecificationLookupItem
{
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public string Json { get; set; } = string.Empty;
	public bool IsActive { get; set; } = true;
}
