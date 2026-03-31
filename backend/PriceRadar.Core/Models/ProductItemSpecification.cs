namespace PriceRadar.Core.Models;

/// <summary>
/// Specifications stored as nested objects keyed by category name.
/// Each category contains field key → value pairs.
/// Example: { "network": { "technology": ["GSM", "LTE"], "gprs": "Yes" }, "body": { "dimensions": "162.8mm" } }
/// </summary>
public class ProductItemSpecification : Dictionary<string, Dictionary<string, object?>>
{
}
