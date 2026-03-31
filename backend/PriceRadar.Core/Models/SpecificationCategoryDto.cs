namespace PriceRadar.Core.Models;

/// <summary>
/// A single field definition inside a specification category.
/// </summary>
public class SpecificationFieldDto
{
	public string Label { get; set; } = string.Empty;

	/// <summary>
	/// Field type: "string", "string[]", "boolean", "date"
	/// </summary>
	public string Type { get; set; } = string.Empty;

	/// <summary>
	/// Pre-defined selectable values — only present when Type is "string[]".
	/// </summary>
	public List<string>? Values { get; set; }
}

/// <summary>
/// Typed DTO returned by the API for a specification category.
/// Fields is a dictionary of fieldKey → field definition.
/// </summary>
public class SpecificationCategoryDto
{
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public Dictionary<string, SpecificationFieldDto> Fields { get; set; } = new();
	public bool IsActive { get; set; } = true;
}
