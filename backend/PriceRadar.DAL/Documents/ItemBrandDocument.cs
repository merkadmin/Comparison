using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("ItemBrand")]
public class ItemBrandDocument : IDocument<ItemBrand>
{
    [BsonId]
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Name      { get; set; } = string.Empty;
    public string?  LogoUrl    { get; set; }
    public string?  BrandImage { get; set; }
    public string?  Country       { get; set; }
    public long?    CountryId     { get; set; }
    public List<long> ProductTypeIds { get; set; } = new();
    public DateTime   CreatedAt      { get; set; } = DateTime.UtcNow;

    public ItemBrand ToModel() => new()
    {
        Id             = Id,
        IsActive       = IsActive,
        IsDeleted      = IsDeleted,
        Name           = Name,
        LogoUrl        = LogoUrl,
        BrandImage     = BrandImage,
        Country        = Country,
        CountryId      = CountryId,
        ProductTypeIds = ProductTypeIds,
        CreatedAt      = CreatedAt,
    };

    public static ItemBrandDocument FromModel(ItemBrand b) => new()
    {
        Id             = b.Id,
        IsActive       = b.IsActive,
        IsDeleted      = b.IsDeleted,
        Name           = b.Name,
        LogoUrl        = b.LogoUrl,
        BrandImage     = b.BrandImage,
        Country        = b.Country,
        CountryId      = b.CountryId,
        ProductTypeIds = b.ProductTypeIds ?? new(),
        CreatedAt      = b.CreatedAt,
    };
}
