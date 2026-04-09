using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("AppPage_s")]
public class AppPageDocument : IDocument<AppPage>
{
    [BsonId]
    public long     Id         { get; set; }
    public bool     IsActive   { get; set; } = true;
    public bool     IsDeleted  { get; set; } = false;
    public string   Name       { get; set; } = string.Empty;
    public string   Route      { get; set; } = string.Empty;
    public string?  Icon       { get; set; }
    public int      OrderIndex { get; set; } = 0;
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;

    public AppPage ToModel() => new()
    {
        Id         = Id,
        IsActive   = IsActive,
        IsDeleted  = IsDeleted,
        Name       = Name,
        Route      = Route,
        Icon       = Icon,
        OrderIndex = OrderIndex,
        CreatedAt  = CreatedAt,
    };

    public static AppPageDocument FromModel(AppPage p) => new()
    {
        Id         = p.Id,
        IsActive   = p.IsActive,
        IsDeleted  = p.IsDeleted,
        Name       = p.Name,
        Route      = p.Route,
        Icon       = p.Icon,
        OrderIndex = p.OrderIndex,
        CreatedAt  = p.CreatedAt,
    };
}
