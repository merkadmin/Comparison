using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class TableNameDocument : IDocument<TableName>
{
	[BsonId]
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;

	public TableName ToModel() => new()
	{
		Id   = Id,
		Name = Name
	};

	public static TableNameDocument FromModel(TableName t) => new()
	{
		Id   = t.Id,
		Name = t.Name
	};
}
