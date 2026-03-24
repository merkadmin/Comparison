using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.enums;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents
{
	public class VariantDocument : IDocument<Variant>
	{
		[BsonId]
		public long Id { get; set; }
		public DBVariantType VariantTypeId { get; set; }
		public string VariantValue { get; set; } = string.Empty;
		public string? Abbreviation { get; set; } = string.Empty;
		public bool IsActive { get; set; } = true;
		public bool IsDeleted { get; set; } = false;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public Variant ToModel() => new()
		{
			Id = Id,
			IsActive = IsActive,
			IsDeleted = IsDeleted,
			VariantTypeId = VariantTypeId,
			VariantValue = VariantValue,
			Abbreviation = Abbreviation,
			CreatedAt = CreatedAt,
		};

		public static VariantDocument FromModel(Variant v) => new()
		{
			Id = v.Id,
			IsActive = v.IsActive,
			IsDeleted = v.IsDeleted,
			VariantTypeId = v.VariantTypeId,
			VariantValue = v.VariantValue,
			Abbreviation = v.Abbreviation,
			CreatedAt = v.CreatedAt,
		};
	}
}
