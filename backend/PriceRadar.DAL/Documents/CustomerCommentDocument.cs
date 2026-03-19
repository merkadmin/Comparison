using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class CustomerCommentDocument : IDocument<CustomerComment>
{
    [BsonId]
    public long     Id        { get; set; }
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public string   Comment   { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CustomerComment ToModel() => new()
    {
        Id        = Id,
        IsActive  = IsActive,
        IsDeleted = IsDeleted,
        Comment   = Comment,
        CreatedAt = CreatedAt,
    };

    public static CustomerCommentDocument FromModel(CustomerComment m) => new()
    {
        Id        = m.Id,
        IsActive  = m.IsActive,
        IsDeleted = m.IsDeleted,
        Comment   = m.Comment,
        CreatedAt = m.CreatedAt,
    };
}
