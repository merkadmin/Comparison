namespace PriceRadar.Core.Models;

public class ColumnMeta
{
	/// <summary>JSON field name on the row object (camelCase), e.g. "name", "createdAt".</summary>
	public string Field    { get; set; } = string.Empty;

	/// <summary>i18n translation key for the column header, e.g. "common.name".</summary>
	public string LabelKey { get; set; } = string.Empty;

	/// <summary>
	/// Render hint for the frontend cell.
	/// Allowed values: text | number | date | boolean | image | localized | badge
	/// </summary>
	public string Type     { get; set; } = "text";

	/// <summary>Whether the column is visible by default.</summary>
	public bool   Visible  { get; set; } = true;

	/// <summary>Display order (ascending).</summary>
	public int    Order    { get; set; }
}
