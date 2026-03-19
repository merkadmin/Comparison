using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class TableNameDocument : IDocument<TableName>
{
	[BsonId]
	public long             Id        { get; set; }
	public bool             IsActive  { get; set; } = true;
	public bool             IsDeleted { get; set; } = false;
	public string           Name      { get; set; } = string.Empty;
	public string           Endpoint  { get; set; } = string.Empty;
	public List<ColumnMeta> Columns   { get; set; } = [];

	public TableName ToModel() => new()
	{
		Id        = Id,
		IsActive  = IsActive,
		IsDeleted = IsDeleted,
		Name      = Name,
		Endpoint  = Endpoint,
		Columns   = Columns,
	};

	public static TableNameDocument FromModel(TableName t) => new()
	{
		Id        = t.Id,
		IsActive  = t.IsActive,
		IsDeleted = t.IsDeleted,
		Name      = t.Name,
		Endpoint  = t.Endpoint,
		Columns   = t.Columns,
	};
}
