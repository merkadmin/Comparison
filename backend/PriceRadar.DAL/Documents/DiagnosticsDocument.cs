using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

public class DiagnosticsDocument : IDocument<Diagnostics>
{
    [BsonId]
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   TableName { get; set; } = string.Empty;
    public string   Action    { get; set; } = string.Empty;
    public long?    EntityId  { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public Diagnostics ToModel() => new()
    {
        Id        = Id,
        IsActive  = IsActive,
        IsDeleted = IsDeleted,
        TableName = TableName,
        Action    = Action,
        EntityId  = EntityId,
        Timestamp = Timestamp,
    };

    public static DiagnosticsDocument FromModel(Diagnostics d) => new()
    {
        Id        = d.Id,
        IsActive  = d.IsActive,
        IsDeleted = d.IsDeleted,
        TableName = d.TableName,
        Action    = d.Action,
        EntityId  = d.EntityId,
        Timestamp = d.Timestamp,
    };
}
