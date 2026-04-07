using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class ProductItemDocument : IDocument<ProductItem>
{
	[BsonId]
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public long BrandId { get; set; }
	public List<long> CategoryIds { get; set; } = new();
	public string? Description { get; set; }
	public string? BriefDescription { get; set; }
	public string? AboutThisItem { get; set; }
	public string? ModelName { get; set; }
	public string? Barcode { get; set; }
	public DateTime? AnnouncedDate { get; set; }
	public DateTime? ReleaseDate { get; set; }

	/// <summary>
	/// Stored as raw BsonDocument to avoid BSON discriminator issues with untyped object? values.
	/// Converted to/from ProductItemSpecification in ToModel / FromModel.
	/// </summary>
	public BsonDocument? Specifications { get; set; }

	public string? ImageUrl { get; set; }
	public List<string> Images { get; set; } = new();
	public List<long> ProductTypeIds { get; set; } = new();
	public List<StorePriceDocument> Prices { get; set; } = new();
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public ProductItem ToModel() => new()
	{
		Id = Id,
		IsActive = IsActive,
		IsDeleted = IsDeleted,
		Name = Name,
		Description = Description,
		BriefDescription = BriefDescription,
		AboutThisItem = AboutThisItem,
		ModelName = ModelName,
		Barcode = Barcode,
		AnnouncedDate = AnnouncedDate,
		ReleaseDate = ReleaseDate,
		Specifications = Specifications != null ? BsonToSpecification(Specifications) : null,
		ImageUrl = ImageUrl,
		Images = Images,
		BrandId = BrandId,
		CategoryIds = CategoryIds,
		ProductTypeIds = ProductTypeIds,
		Prices = Prices.Select(p => p.ToModel()).ToList(),
		CreatedAt = CreatedAt,
	};

	public static ProductItemDocument FromModel(ProductItem item) => new()
	{
		Id = item.Id,
		IsActive = item.IsActive,
		IsDeleted = item.IsDeleted,
		Name = item.Name,
		Description = item.Description,
		BriefDescription = item.BriefDescription,
		AboutThisItem = item.AboutThisItem,
		ModelName = item.ModelName,
		Barcode = item.Barcode,
		AnnouncedDate = item.AnnouncedDate,
		ReleaseDate = item.ReleaseDate,
		Specifications = item.Specifications != null ? SpecificationToBson(item.Specifications) : null,
		ImageUrl = item.ImageUrl,
		Images = item.Images,
		BrandId = item.BrandId,
		CategoryIds = item.CategoryIds,
		ProductTypeIds = item.ProductTypeIds,
		Prices = item.Prices.Select(StorePriceDocument.FromModel).ToList(),
		CreatedAt = item.CreatedAt,
	};

	// ── Conversion helpers ────────────────────────────────────────────────────

	private static ProductItemSpecification BsonToSpecification(BsonDocument doc)
	{
		var result = new ProductItemSpecification();
		foreach (var cat in doc.Elements)
		{
			if (cat.Value is not BsonDocument catDoc) continue;
			var fields = new Dictionary<string, object?>();
			foreach (var field in catDoc.Elements)
				fields[field.Name] = BsonToClr(field.Value);
			result[cat.Name] = fields;
		}
		return result;
	}

	private static object? BsonToClr(BsonValue v) => v.BsonType switch
	{
		BsonType.String  => v.AsString,
		BsonType.Int32   => (object)v.AsInt32,
		BsonType.Int64   => v.AsInt64,
		BsonType.Double  => v.AsDouble,
		BsonType.Boolean => v.AsBoolean,
		BsonType.Null    => null,
		BsonType.Array   => v.AsBsonArray.Select(BsonToClr).ToList(),
		// Legacy documents may have { _t: "JsonElement", _v: <value> } — unwrap gracefully.
		BsonType.Document when v.AsBsonDocument.TryGetValue("_v", out var inner) => BsonToClr(inner),
		BsonType.Document => v.AsBsonDocument.Elements
			.ToDictionary(e => e.Name, e => BsonToClr(e.Value)),
		_ => v.ToString(),
	};

	private static BsonDocument SpecificationToBson(ProductItemSpecification spec)
	{
		var doc = new BsonDocument();
		foreach (var (catKey, fields) in spec)
		{
			var catDoc = new BsonDocument();
			if (fields != null)
				foreach (var (fieldKey, value) in fields)
					catDoc[fieldKey] = ClrToBson(value);
			doc[catKey] = catDoc;
		}
		return doc;
	}

	private static BsonValue ClrToBson(object? value) => value switch
	{
		null                              => BsonNull.Value,
		bool b                            => new BsonBoolean(b),
		int i                             => new BsonInt32(i),
		long l                            => new BsonInt64(l),
		double d                          => new BsonDouble(d),
		float f                           => new BsonDouble(f),
		string s                          => new BsonString(s),
		System.Collections.IEnumerable e  => new BsonArray(e.Cast<object?>().Select(ClrToBson)),
		_                                 => new BsonString(value.ToString() ?? string.Empty),
	};
}
