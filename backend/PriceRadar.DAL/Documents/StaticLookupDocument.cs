using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class StaticLookupDocument : IDocument<StaticLookupItem>
{
	[BsonId]
	public long   Id        { get; set; }
	public string Name      { get; set; } = string.Empty;
	public bool   IsActive  { get; set; } = true;
	public bool   IsDeleted { get; set; } = false;

	public StaticLookupItem ToModel() => new()
	{
		Id       = Id,
		Name     = Name,
		IsActive = IsActive,
	};

	public static StaticLookupDocument From(long id, string name) => new()
	{
		Id   = id,
		Name = name,
	};
}
