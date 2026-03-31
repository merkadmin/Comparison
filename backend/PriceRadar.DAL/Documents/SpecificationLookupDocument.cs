using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class SpecificationLookupDocument : IDocument<SpecificationLookupItem>
{
	[BsonId]
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public BsonDocument Json { get; set; } = new();
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;

	public SpecificationLookupItem ToModel() => new()
	{
		Id = Id,
		Name = Name,
		Json = Json.ToJson(),
		IsActive = IsActive,
	};

	/// <summary>
	/// Parses the BsonDocument Json into a fully-typed SpecificationCategoryDto.
	/// Each element in Json becomes a SpecificationFieldDto with Label, Type, and optional Values.
	/// </summary>
	public SpecificationCategoryDto ToDto() => new()
	{
		Id       = Id,
		Name     = Name,
		IsActive = IsActive,
		Fields   = Json.Elements.ToDictionary(
			e => e.Name,
			e =>
			{
				var field = e.Value.AsBsonDocument;
				return new SpecificationFieldDto
				{
					Label  = field.GetValue("label",  BsonString.Empty).AsString,
					Type   = field.GetValue("type",   new BsonString("string")).AsString,
					Values = field.Contains("values")
						? field["values"].AsBsonArray.Select(v => v.AsString).ToList()
						: null,
				};
			})
	};

	public static SpecificationLookupDocument From(long id, string name, BsonDocument json) => new()
	{
		Id   = id,
		Name = name,
		Json = json,
	};
}
