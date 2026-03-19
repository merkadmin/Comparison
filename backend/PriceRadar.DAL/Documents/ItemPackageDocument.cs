using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("ItemPackage")]
public class ItemPackageDocument : IDocument<ItemPackage>
{
    [BsonId]
    public long                         Id            { get; set; }
    public bool                         IsActive      { get; set; } = true;
    public bool                         IsDeleted     { get; set; } = false;
    public string                       Name          { get; set; } = string.Empty;
    public string?                      Description   { get; set; }
    public List<ItemPackageItemDocument> Items        { get; set; } = new();
    public decimal                      OriginalPrice { get; set; }
    public decimal                      OfferPrice    { get; set; }
    public DateTime                     StartDate     { get; set; } = DateTime.UtcNow;
    public DateTime?                    EndDate       { get; set; }
    public DateTime                     CreatedAt     { get; set; } = DateTime.UtcNow;

    public ItemPackage ToModel() => new()
    {
        Id            = Id,
        IsActive      = IsActive,
        IsDeleted     = IsDeleted,
        Name          = Name,
        Description   = Description,
        Items         = Items.Select(i => i.ToModel()).ToList(),
        OriginalPrice = OriginalPrice,
        OfferPrice    = OfferPrice,
        StartDate     = StartDate,
        EndDate       = EndDate,
        CreatedAt     = CreatedAt,
    };

    public static ItemPackageDocument FromModel(ItemPackage p) => new()
    {
        Id            = p.Id,
        IsActive      = p.IsActive,
        IsDeleted     = p.IsDeleted,
        Name          = p.Name,
        Description   = p.Description,
        Items         = p.Items.Select(ItemPackageItemDocument.FromModel).ToList(),
        OriginalPrice = p.OriginalPrice,
        OfferPrice    = p.OfferPrice,
        StartDate     = p.StartDate,
        EndDate       = p.EndDate,
        CreatedAt     = p.CreatedAt,
    };
}
