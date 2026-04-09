using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("User_Page")]
public class UserPageDocument : IDocument<UserPage>
{
    [BsonId]
    public long     Id        { get; set; }
    // IDocument<T> requires IsActive; always true for join records
    public bool     IsActive  { get; set; } = true;
    public bool     IsDeleted { get; set; } = false;
    public long     UserId    { get; set; }
    public long     PageId    { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserPage ToModel() => new()
    {
        Id        = Id,
        IsDeleted = IsDeleted,
        UserId    = UserId,
        PageId    = PageId,
        CreatedAt = CreatedAt,
    };

    public static UserPageDocument FromModel(UserPage p) => new()
    {
        Id        = p.Id,
        IsDeleted = p.IsDeleted,
        UserId    = p.UserId,
        PageId    = p.PageId,
        CreatedAt = p.CreatedAt,
    };
}
