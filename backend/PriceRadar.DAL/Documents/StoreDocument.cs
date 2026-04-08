using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.enums;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class StoreDocument : IDocument<Store>
{
	[BsonId]
	public long Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public List<DBStoreType> StoreTypeIds { get; set; } = new();
	public DBStore StoreId { get; set; }
	public string? WebsiteUrl { get; set; }
	public string? LogoUrl { get; set; }
	public string? StoreImage { get; set; }
	public string Country { get; set; } = string.Empty;
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public Store ToModel() => new()
	{
		Id = Id,
		IsActive = IsActive,
		IsDeleted = IsDeleted,
		Name = Name,
		StoreTypeIds = StoreTypeIds,
		StoreId = StoreId,
		WebsiteUrl = WebsiteUrl,
		LogoUrl = LogoUrl,
		StoreImage = StoreImage,
		Country = Country,
		CreatedAt = CreatedAt,
	};

	public static StoreDocument FromModel(Store s) => new()
	{
		Id = s.Id,
		IsActive = s.IsActive,
		IsDeleted = s.IsDeleted,
		Name = s.Name,
		StoreTypeIds = s.StoreTypeIds,
		StoreId = s.StoreId,
		WebsiteUrl = s.WebsiteUrl,
		LogoUrl = s.LogoUrl,
		StoreImage = s.StoreImage,
		Country = s.Country,
		CreatedAt = s.CreatedAt,
	};
}
