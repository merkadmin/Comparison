using System.Text.Json;
using System.Text.Json.Serialization;

namespace PriceRadar.API.Services;

/// <summary>
/// Converts JSON <c>object?</c> fields to plain CLR types (string, long, double, bool,
/// List&lt;object?&gt;, Dictionary&lt;string, object?&gt;) instead of JsonElement,
/// so MongoDB's BSON serializer never encounters a JsonElement value.
/// </summary>
public class ObjectToClrConverter : JsonConverter<object>
{
    public override object? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        reader.TokenType switch
        {
            JsonTokenType.True        => true,
            JsonTokenType.False       => false,
            JsonTokenType.Null        => null,
            JsonTokenType.Number      => reader.TryGetInt64(out var l) ? l : reader.GetDouble(),
            JsonTokenType.String      => reader.GetString(),
            JsonTokenType.StartArray  => ReadArray(ref reader, options),
            JsonTokenType.StartObject => ReadObject(ref reader, options),
            _                         => JsonDocument.ParseValue(ref reader).RootElement.Clone(),
        };

    private List<object?> ReadArray(ref Utf8JsonReader reader, JsonSerializerOptions options)
    {
        var list = new List<object?>();
        while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
            list.Add(Read(ref reader, typeof(object), options));
        return list;
    }

    private Dictionary<string, object?> ReadObject(ref Utf8JsonReader reader, JsonSerializerOptions options)
    {
        var dict = new Dictionary<string, object?>();
        while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
        {
            var key = reader.GetString()!;
            reader.Read();
            dict[key] = Read(ref reader, typeof(object), options);
        }
        return dict;
    }

    public override void Write(Utf8JsonWriter writer, object value, JsonSerializerOptions options) =>
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
}
