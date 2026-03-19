namespace PriceRadar.Core.Models;

public class TableName
{
	public long             Id        { get; set; }
	public bool             IsActive  { get; set; } = true;
	public bool             IsDeleted { get; set; } = false;
	public string           Name      { get; set; } = string.Empty;
	/// <summary>API path used to fetch rows, e.g. "/itembrands".</summary>
	public string           Endpoint  { get; set; } = string.Empty;
	/// <summary>Ordered column definitions for the generic table.</summary>
	public List<ColumnMeta> Columns   { get; set; } = [];
}
