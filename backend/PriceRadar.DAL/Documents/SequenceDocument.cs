using MongoDB.Bson.Serialization.Attributes;

namespace PriceRadar.DAL.Documents;

public class SequenceDocument
{
    [BsonId]
    public string Name { get; set; } = string.Empty;
    public long Seq { get; set; }
}
