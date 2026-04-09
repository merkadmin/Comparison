using System.Text.RegularExpressions;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Services;

public static class ProductTextParserService
{
    public static ParsedItemDto Parse(string text, IEnumerable<ItemBrand> brands)
    {
        var lines = text
            .Split('\n')
            .Select(l => l.Trim())
            .Where(l => !string.IsNullOrWhiteSpace(l))
            .ToList();

        // -- Name: first substantive line (>20 chars, no breadcrumb arrow)
        string? name = lines.FirstOrDefault(l => l.Length > 20 && !l.Contains('›') && !l.StartsWith("›"));

        // -- Brand: first brand whose name appears anywhere in the text (case-insensitive)
        var lowerText = text.ToLowerInvariant();
        var matchedBrand = brands.FirstOrDefault(b =>
            !string.IsNullOrWhiteSpace(b.Name) &&
            lowerText.Contains(b.Name.ToLowerInvariant()));
        long? brandId = matchedBrand?.Id;

        // -- Key-value extraction helper
        static string? Kv(List<string> lines, params string[] keys)
        {
            foreach (var key in keys)
            {
                var pattern = new Regex($@"^{Regex.Escape(key)}\s*[:\-]?\s*(.+)$", RegexOptions.IgnoreCase);
                foreach (var line in lines)
                {
                    var m = pattern.Match(line);
                    if (m.Success) return m.Groups[1].Value.Trim();
                }
            }
            return null;
        }

        string? modelName = Kv(lines, "Model", "Model Name", "Model Number", "Item model number");
        string? barcode   = Kv(lines, "ASIN", "Barcode", "EAN", "UPC", "Item model number");

        // -- "About This Item" section → bullets → aboutThisItem
        string? aboutThisItem = null;
        int aboutIdx = lines.FindIndex(l => Regex.IsMatch(l, @"about\s+this\s+item", RegexOptions.IgnoreCase));
        if (aboutIdx >= 0)
        {
            var bullets = new List<string>();
            for (int i = aboutIdx + 1; i < lines.Count; i++)
            {
                var l = lines[i];
                // Stop at next section header
                if (Regex.IsMatch(l, @"^[A-Z][A-Z\s]{5,}$") || Regex.IsMatch(l, @"^#{1,3}\s")) break;
                if (l.StartsWith("•") || l.StartsWith("-") || l.StartsWith("*") || Regex.IsMatch(l, @"^\d+\."))
                    bullets.Add(Regex.Replace(l, @"^[•\-*]\s*|^\d+\.\s*", ""));
                else if (l.Length > 10)
                    bullets.Add(l);
            }
            if (bullets.Count > 0) aboutThisItem = string.Join("\n", bullets);
        }

        // -- Early bullets (before any section) → briefDescription
        string? briefDescription = null;
        var earlyBullets = new List<string>();
        for (int i = 0; i < Math.Min(30, lines.Count); i++)
        {
            var l = lines[i];
            if (Regex.IsMatch(l, @"about\s+this\s+item", RegexOptions.IgnoreCase)) break;
            if (l.StartsWith("•") || l.StartsWith("-") || l.StartsWith("*"))
                earlyBullets.Add(Regex.Replace(l, @"^[•\-*]\s*", ""));
        }
        if (earlyBullets.Count > 0) briefDescription = string.Join("\n", earlyBullets);

        return new ParsedItemDto(
            Name:             name,
            ModelName:        modelName,
            Barcode:          barcode,
            AboutThisItem:    aboutThisItem,
            BriefDescription: briefDescription,
            BrandId:          brandId
        );
    }
}

public record ParsedItemDto(
    string?   Name,
    string?   ModelName,
    string?   Barcode,
    string?   AboutThisItem,
    string?   BriefDescription,
    long?     BrandId
);
