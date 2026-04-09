using System.Text.RegularExpressions;
using HtmlAgilityPack;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Services;

public static class DomParserService
{
    // ── 1. prodDetTable section heading → internal section key ────────────────
    private static readonly Dictionary<string, string> SectionKeyMap =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["Item details"]       = "itemDetails",
            ["Memory"]             = "memory",
            ["Connectivity"]       = "comms",
            ["Features"]           = "features",
            ["Additional details"] = "additionalDetails",
            ["Display"]            = "display",
            ["Battery"]            = "battery",
            ["Processor"]          = "platform",
            ["Camera"]             = "mainCamera",
            ["Audio"]              = "sound",
            ["Launch"]             = "launch",
        };

    // ── 2. prodDetTable (sectionKey, amazonFieldCamelCase) → (targetSec, targetField)
    private static readonly Dictionary<(string Sec, string Field), (string Sec, string Field)> FieldMap =
        new()
        {
            // ITEM DETAILS
            [("itemDetails", "builtInMedia")]                        = ("body",     "stylusSupport"),
            [("itemDetails", "dateFirstAvailable")]                  = ("launch",   "releaseDate"),

            // DISPLAY
            [("display", "screenSize")]                              = ("display",  "size"),
            [("display", "displayType")]                             = ("display",  "type"),
            [("display", "displayResolutionMaximum")]                = ("display",  "resolution"),
            [("display", "nativeResolution")]                        = ("display",  "resolution"),
            [("display", "displayRefreshRateInHertz")]               = ("display",  "refreshRate"),
            [("display", "aspectRatio")]                             = ("display",  "aspectRatio"),

            // MEMORY
            [("memory", "memoryStorageCapacity")]                    = ("memory",   "internalStorage"),
            [("memory", "ramMemoryInstalled")]                       = ("memory",   "ram"),

            // COMMS (Connectivity)
            [("comms", "hardwareInterface")]                         = ("comms",    "usb"),
            [("comms", "wirelessTechnology")]                        = ("comms",    "wlan"),
            [("comms", "wirelessCompability")]                       = ("comms",    "wlan"),
            [("comms", "cellularTechnology")]                        = ("network",  "technology"),

            // FEATURES
            [("features", "otherSpecialFeaturesOfTheProduct")]       = ("features", "aiFeatures"),
            [("features", "gpsGeolocationFunctionality")]            = ("comms",    "positioning"),
            [("features", "gpsCeolocationFunctionality")]            = ("comms",    "positioning"),

            // ADDITIONAL DETAILS → body / platform
            [("additionalDetails", "operatingSystem")]               = ("platform", "os"),
            [("additionalDetails", "graphicsDescription")]           = ("platform", "gpu"),
            [("additionalDetails", "color")]                         = ("body",     "color"),
            [("additionalDetails", "itemWeight")]                    = ("body",     "weight"),
            [("additionalDetails", "itemDimensionsLXWXThickness")]   = ("body",     "dimensions"),
            [("additionalDetails", "humanInterfaceInput")]           = ("body",     "stylusSupport"),
            [("additionalDetails", "compatibleDevices")]             = ("body",     "stylusSupport"),

            // PLATFORM (Processor section)
            [("platform", "processorDescription")]                   = ("platform", "chipset"),

            // BATTERY
            [("battery", "batteryCapacity")]                         = ("battery",  "capacity"),
            [("battery", "batteryPower")]                            = ("battery",  "wiredCharging"),

            // MAIN CAMERA
            [("mainCamera", "videoCaptureResolution")]               = ("mainCamera", "video"),
            [("mainCamera", "cameraDescription")]                    = ("mainCamera", "features"),

            // SOUND (Audio)
            [("sound", "supportedAudioFormat")]                      = ("sound",    "audioCodecs"),
            [("sound", "headphonesJack")]                            = ("sound",    "headphoneJack"),

            // LAUNCH
            [("launch", "announced")]                                = ("launch",   "announcedDate"),
            [("launch", "releaseDate")]                              = ("launch",   "releaseDate"),
        };

    private static readonly HashSet<(string Sec, string Field)> SkipFields = new()
    {
        ("itemDetails", "bestSellersRank"),
        ("itemDetails", "customerReviews"),
        ("itemDetails", "warrantyDescription"),
        ("itemDetails", "manufacturer"),
        ("itemDetails", "generation"),
        ("itemDetails", "specificUsesForProduct"),
        ("additionalDetails", "warrantyType"),
        ("platform", "processorBrand"),
    };

    // ── Public entry point ────────────────────────────────────────────────────
    public static ParsedDomItemDto Parse(string html, IEnumerable<ItemBrand> brands)
    {
        var brandList = brands.ToList();
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        string? name            = null;
        string? modelName       = null;
        string? barcode         = null;
        long?   brandId         = null;
        string? aboutThisItem   = null;
        string? briefDescription = null;
        string? description     = null;
        var specs = new Dictionary<string, Dictionary<string, string>>();

        // ── Product title ────────────────────────────────────────────────────
        var titleNode = doc.DocumentNode.SelectSingleNode("//*[@id='productTitle']");
        if (titleNode != null)
            name = CleanText(titleNode.InnerText);

        // ── "About this item" bullets ─────────────────────────────────────────
        var featureBullets = doc.DocumentNode
            .SelectNodes("//*[@id='feature-bullets']//li/span[@class='a-list-item']");
        if (featureBullets != null)
        {
            var bullets = featureBullets
                .Select(n => CleanText(n.InnerText))
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();
            if (bullets.Count > 0)
            {
                aboutThisItem    = string.Join("\n", bullets);
                briefDescription = string.Join("\n", bullets.Take(2));
            }
        }

        // ── Product description ──────────────────────────────────────────────
        var descNode = doc.DocumentNode.SelectSingleNode("//*[@id='productDescription']");
        if (descNode != null)
        {
            var raw = CleanText(descNode.InnerText);
            if (!string.IsNullOrWhiteSpace(raw))
                description = raw;

            // Parse structured spec sections inside the description
            ParseProductDescription(descNode, specs, brandList, ref brandId);
        }

        // ── Structured prodDetTable key-value pairs ──────────────────────────
        // Parsed AFTER product description so spec-table values win (overwrite)
        ParseSpecTables(doc, brandList, specs, ref modelName, ref barcode, ref brandId);

        return new ParsedDomItemDto(name, modelName, barcode, brandId,
                                   aboutThisItem, briefDescription, description, specs);
    }

    // ── prodDetTable parser ───────────────────────────────────────────────────
    private static void ParseSpecTables(
        HtmlDocument doc, List<ItemBrand> brands,
        Dictionary<string, Dictionary<string, string>> specs,
        ref string? modelName, ref string? barcode, ref long? brandId)
    {
        var sections = doc.DocumentNode
            .SelectNodes("//div[contains(@class,'a-expander-section-container')]");
        if (sections == null) return;

        foreach (var section in sections)
        {
            var headingNode = section.SelectSingleNode(
                ".//span[contains(@class,'a-expander-prompt')]");
            if (headingNode == null) continue;

            var sectionName = CleanText(headingNode.InnerText);
            var sectionKey  = SectionKeyMap.TryGetValue(sectionName, out var mapped)
                              ? mapped : ToCamelCase(sectionName);

            var table = section.SelectSingleNode(".//table[contains(@class,'prodDetTable')]");
            if (table == null) continue;

            var rows = table.SelectNodes(".//tr");
            if (rows == null) continue;

            foreach (var row in rows)
            {
                var th = row.SelectSingleNode(".//th[contains(@class,'prodDetSectionEntry')]");
                var td = row.SelectSingleNode(".//td[contains(@class,'prodDetAttrValue')]");
                if (th == null || td == null) continue;

                var rawKey   = CleanText(th.InnerText);
                var rawValue = CleanText(td.InnerText);
                if (string.IsNullOrWhiteSpace(rawKey) || string.IsNullOrWhiteSpace(rawValue)) continue;

                var amazonFieldKey = ToCamelCase(rawKey);
                PromoteTopLevelFields(rawKey, rawValue, brands, ref modelName, ref barcode, ref brandId);

                var (targetSec, targetField) =
                    FieldMap.TryGetValue((sectionKey, amazonFieldKey), out var fm)
                    ? fm : (sectionKey, amazonFieldKey);

                if (targetSec == "itemDetails") continue;
                if (SkipFields.Contains((targetSec, targetField))) continue;

                var value = NormaliseValue(targetSec, targetField, rawValue);

                if (!specs.TryGetValue(targetSec, out var secData))
                { secData = new(); specs[targetSec] = secData; }

                // Spec-table values overwrite product-description values (more authoritative)
                secData[targetField] = value;
            }
        }
    }

    // ── Product description section parser ────────────────────────────────────
    private static readonly Dictionary<string, string?> DescSectionMap =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["Network"]      = "network",
            ["Body"]         = "body",
            ["Display"]      = "display",
            ["Platform"]     = "platform",
            ["Memory"]       = "memory",
            ["Camera"]       = "cameraSection", // special: mainCamera + selfieCamera
            ["Sound"]        = "sound",
            ["Connectivity"] = "comms",
            ["Features"]     = "features",
            ["Battery"]      = "battery",
            ["Launch"]       = "launch",
            ["Colors"]       = null,             // skip
        };

    private static void ParseProductDescription(
        HtmlNode descNode,
        Dictionary<string, Dictionary<string, string>> specs,
        List<ItemBrand> brands,
        ref long? brandId)
    {
        string? currentSec = "UNKNOWN";

        foreach (var node in descNode.ChildNodes.Where(n => n.NodeType == HtmlNodeType.Element))
        {
            if (node.Name == "p")
            {
                var bold = node.SelectSingleNode(".//*[contains(@class,'a-text-bold')]");
                if (bold != null)
                {
                    var name = CleanText(bold.InnerText);
                    currentSec = DescSectionMap.TryGetValue(name, out var key) ? key : ToCamelCase(name);
                }
                continue;
            }

            if (node.Name != "ul") continue;

            if (currentSec == "cameraSection")
            {
                ApplyCameraUl(node, specs);
                continue;
            }

            if (currentSec == null) continue; // "Colors" — skip

            ApplyDescUl(node, currentSec, specs, brands, ref brandId);
        }
    }

    private static void ApplyDescUl(
        HtmlNode ulNode, string sectionKey,
        Dictionary<string, Dictionary<string, string>> specs,
        List<ItemBrand> brands, ref long? brandId)
    {
        foreach (var li in ulNode.ChildNodes.Where(n => n.Name == "li"))
        {
            var spanNode    = li.SelectSingleNode("span[@class='a-list-item']");
            if (spanNode == null) continue;

            // Direct child <span> (not nested ul)
            var innerSpan   = spanNode.SelectSingleNode("span");
            var rawText     = CleanText(innerSpan?.InnerText ?? spanNode.InnerText);
            var nestedUl    = spanNode.SelectSingleNode("ul");

            string? key   = null;
            string? value = null;

            if (nestedUl != null)
            {
                // "Key: " → key, nested list → value
                var colonIdx = rawText.IndexOf(':');
                key = colonIdx >= 0 ? rawText[..colonIdx].Trim() : rawText.Trim();
                var subItems = nestedUl.SelectNodes(".//li")
                    ?.Select(n => CleanText(n.InnerText))
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .ToList() ?? new List<string>();
                value = string.Join("; ", subItems);
            }
            else if (rawText.Contains(':'))
            {
                var colonIdx = rawText.IndexOf(':');
                key   = rawText[..colonIdx].Trim();
                value = rawText[(colonIdx + 1)..].Trim();
            }
            else
            {
                // Plain text — infer field from content
                key   = null;
                value = rawText;
            }

            if (string.IsNullOrWhiteSpace(value)) continue;

            // Map key → target field
            (string targetSec, string targetField) = MapDescField(sectionKey, key, value, specs, brands, ref brandId);
            if (targetSec == null!) continue;

            Set(specs, targetSec, targetField, value);
        }
    }

    private static (string sec, string field) MapDescField(
        string sectionKey, string? key, string value,
        Dictionary<string, Dictionary<string, string>> specs,
        List<ItemBrand> brands, ref long? brandId)
    {
        var k = (key ?? "").ToLowerInvariant().Trim();

        switch (sectionKey)
        {
            case "network":
                if (k == "network" || key == null)
                    return ("network", "technology");
                break;

            case "body":
                if (k == "dimensions") return ("body", "dimensions");
                if (k == "weight")     return ("body", "weight");
                if (k == "build")      return ("body", "build");
                if (k == "sim")        return ("body", "sim");
                if (key == null)
                {
                    // Plain text: detect IP68, stylus
                    if (Regex.IsMatch(value, @"IP\d+", RegexOptions.IgnoreCase))
                    {
                        var ip = Regex.Match(value, @"IP\d+").Value;
                        return ("body", "durability");
                    }
                    if (value.Contains("stylus", StringComparison.OrdinalIgnoreCase) ||
                        value.Contains("s pen", StringComparison.OrdinalIgnoreCase))
                        return ("body", "stylusSupport");
                }
                break;

            case "display":
                if (k == "type")
                {
                    // "Dynamic AMOLED 2X, 120Hz, HDR10+" → split extras
                    var parts = value.Split(',').Select(p => p.Trim()).ToList();
                    if (parts.Count > 0) Set(specs, "display", "type", parts[0]);
                    foreach (var part in parts.Skip(1))
                    {
                        if (Regex.IsMatch(part, @"\d+Hz"))      Set(specs, "display", "refreshRate", part.Trim());
                        if (Regex.IsMatch(part, @"HDR|Dolby",  RegexOptions.IgnoreCase)) Set(specs, "display", "hdr", part.Trim());
                    }
                    return (null!, null!); // already stored above
                }
                if (k == "size")
                {
                    var m = Regex.Match(value, @"([\d.]+)\s*inches?", RegexOptions.IgnoreCase);
                    return ("display", "size");
                }
                if (k == "resolution")
                {
                    var m = Regex.Match(value, @"(\d+\s*x\s*\d+\s*pixels?)", RegexOptions.IgnoreCase);
                    return ("display", "resolution");
                }
                if (k == "screen-to-body ratio") return ("display", "screenToBodyRatio");
                break;

            case "platform":
                if (k == "os")
                {
                    // "Android 14, One UI 6.1" → extract "Android 14"
                    var os = Regex.Match(value, @"Android\s+\d+|iOS\s+\d+|iPadOS\s+\d+|Windows\s+\d+|HarmonyOS\s+\d+", RegexOptions.IgnoreCase);
                    return ("platform", "os");
                }
                if (k == "chipset")
                {
                    // Extract process node from "(4 nm)"
                    var pnMatch = Regex.Match(value, @"\((\d+\s*nm)\)");
                    if (pnMatch.Success) Set(specs, "platform", "processNode", pnMatch.Groups[1].Value.Trim());
                    var chipset = Regex.Replace(value, @"\s*\(\d+\s*nm\)", "").Trim();
                    return ("platform", "chipset");
                }
                if (k == "cpu") return ("platform", "cpu");
                if (k == "gpu") return ("platform", "gpu");
                break;

            case "memory":
                if (k == "card slot")
                {
                    if (!value.Equals("No", StringComparison.OrdinalIgnoreCase))
                    {
                        Set(specs, "memory", "cardSlot", "true");
                        Set(specs, "memory", "cardSlotType", value);
                    }
                    return (null!, null!);
                }
                if (k == "ram/storage options" || k.Contains("storage"))
                {
                    // "256GB/12GB RAM" → storage + ram
                    var match = Regex.Match(value, @"(\d+)\s*GB\s*/\s*(\d+)\s*GB\s*RAM", RegexOptions.IgnoreCase);
                    if (match.Success)
                    {
                        Set(specs, "memory", "internalStorage", $"{match.Groups[1].Value} GB");
                        Set(specs, "memory", "ram", $"{match.Groups[2].Value} GB");
                    }
                    // "Storage type: UFS" inside nested
                    var stMatch = Regex.Match(value, @"storage\s+type\s*:\s*(\S+)", RegexOptions.IgnoreCase);
                    if (stMatch.Success) Set(specs, "memory", "storageType", stMatch.Groups[1].Value);
                    return (null!, null!);
                }
                break;

            case "sound":
                if (key == null || k.Contains("speaker"))
                {
                    var lsMatch = Regex.Match(value, @"(quad|dual|mono|triple)\s*speakers?", RegexOptions.IgnoreCase);
                    if (lsMatch.Success)
                    {
                        var ls = char.ToUpperInvariant(lsMatch.Groups[1].Value[0]) + lsMatch.Groups[1].Value.Substring(1).ToLowerInvariant() + " speaker";
                        Set(specs, "sound", "loudspeaker", ls);
                    }
                    // Tuning brand
                    foreach (var brand in new[] { "AKG", "Harman Kardon", "Dolby", "JBL", "Bang & Olufsen", "Bose", "Yamaha" })
                        if (value.Contains(brand, StringComparison.OrdinalIgnoreCase))
                        { Set(specs, "sound", "tuning", brand); break; }
                    // No 3.5mm → skip (boolean false = default)
                    return (null!, null!);
                }
                break;

            case "comms":
                if (k.StartsWith("wi-fi") || k.StartsWith("wifi")) return ("comms", "wlan");
                if (k == "bluetooth")
                {
                    var btVer = Regex.Match(value, @"\d+\.\d+");
                    return ("comms", "bluetooth");
                }
                if (k.StartsWith("gps") || k == "positioning") return ("comms", "positioning");
                if (k == "usb") return ("comms", "usb");
                if (key == null)
                {
                    // "No NFC, No Radio" → skip (both false)
                }
                break;

            case "features":
                if (key == null || k.Contains("fingerprint"))
                    return ("features", "fingerprintType");
                if (k == "sensors" || key == null && Regex.IsMatch(value, @"accelerometer|gyro|compass", RegexOptions.IgnoreCase))
                    return ("features", "sensors");
                if (value.Contains("Samsung DeX", StringComparison.OrdinalIgnoreCase))
                {
                    Set(specs, "features", "samsungDex", "true");
                    return (null!, null!);
                }
                if (key == null) return ("features", "aiFeatures");
                break;

            case "battery":
                if (k == "capacity")
                {
                    // "11200 mAh Li-Po" → capacity + type
                    var capMatch = Regex.Match(value, @"(\d[\d,]+)\s*mAh", RegexOptions.IgnoreCase);
                    if (capMatch.Success) Set(specs, "battery", "capacity", $"{capMatch.Groups[1].Value} mAh");
                    var typeMatch = Regex.Match(value, @"Li-Po|Li-Ion|Si-C", RegexOptions.IgnoreCase);
                    if (typeMatch.Success) Set(specs, "battery", "type", typeMatch.Value);
                    return (null!, null!);
                }
                if (k == "charging")
                {
                    var wMatch = Regex.Match(value, @"(\d+)\s*W");
                    if (wMatch.Success) return ("battery", "wiredCharging");
                }
                break;

            case "launch":
                if (k == "announced" || k == "announcement date") return ("launch", "announcedDate");
                if (k == "release date" || k == "status") return ("launch", k == "status" ? "status" : "releaseDate");
                break;
        }

        // Fallback: store under section with camelCase key
        if (key != null) return (sectionKey, ToCamelCase(key));
        return (null!, null!);
    }

    private static void HandleCameraItem(
        string? key, string value, HtmlNode? nestedUl,
        Dictionary<string, Dictionary<string, string>> specs)
    {
        if (key == null) return;
        var k = key.ToLowerInvariant();

        if (k == "main camera" && nestedUl != null)
        {
            ParseCameraSubSection(nestedUl, "mainCamera", specs);
        }
        else if (k == "selfie camera" && nestedUl != null)
        {
            ParseCameraSubSection(nestedUl, "selfieCamera", specs);
        }
    }

    private static void ParseCameraSubSection(
        HtmlNode ulNode, string targetSec,
        Dictionary<string, Dictionary<string, string>> specs)
    {
        var items = ulNode.SelectNodes(".//li")
            ?.Select(n => CleanText(n.InnerText))
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .ToList() ?? new();

        bool primarySet = false;
        foreach (var item in items)
        {
            if (item.StartsWith("Features:", StringComparison.OrdinalIgnoreCase))
                Set(specs, targetSec, "features", item[9..].Trim());
            else if (item.StartsWith("Video:", StringComparison.OrdinalIgnoreCase))
                Set(specs, targetSec, "video", item[6..].Trim());
            else if (item.Contains("ultrawide", StringComparison.OrdinalIgnoreCase) ||
                     item.Contains("ultra wide", StringComparison.OrdinalIgnoreCase))
                Set(specs, targetSec, targetSec == "mainCamera" ? "ultrawide" : "secondary", item);
            else if (Regex.IsMatch(item, @"\d+\s*MP", RegexOptions.IgnoreCase) && !primarySet)
            {
                Set(specs, targetSec, "primary", item);
                primarySet = true;
            }
        }
    }

    // ── Camera section routing ────────────────────────────────────────────────
    // Called for the Camera <ul> in the product description
    private static void ApplyCameraUl(HtmlNode ulNode, Dictionary<string, Dictionary<string, string>> specs)
    {
        foreach (var li in ulNode.ChildNodes.Where(n => n.Name == "li"))
        {
            var spanNode = li.SelectSingleNode("span[@class='a-list-item']");
            if (spanNode == null) continue;

            var innerSpan = spanNode.SelectSingleNode("span");
            var rawText   = CleanText(innerSpan?.InnerText ?? spanNode.InnerText);
            var nestedUl  = spanNode.SelectSingleNode("ul");

            var colonIdx = rawText.IndexOf(':');
            var key      = colonIdx >= 0 ? rawText[..colonIdx].Trim() : rawText.Trim();
            HandleCameraItem(key, rawText, nestedUl, specs);
        }
    }

    // ── Value normalisers ─────────────────────────────────────────────────────
    private static string NormaliseValue(string sec, string field, string raw)
    {
        if (sec == "display" && field == "size")
        {
            var m = Regex.Match(raw, @"([\d.]+)\s*inches?", RegexOptions.IgnoreCase);
            if (m.Success) return $"{m.Groups[1].Value} inches";
        }
        if (sec == "display" && field == "refreshRate")
        {
            var m = Regex.Match(raw, @"(\d+)");
            if (m.Success && !raw.Contains("Hz", StringComparison.OrdinalIgnoreCase))
                return $"{m.Groups[1].Value}Hz";
        }
        if (sec == "battery" && field == "wiredCharging")
        {
            var m = Regex.Match(raw, @"(\d+)\s*watts?", RegexOptions.IgnoreCase);
            if (m.Success) return $"{m.Groups[1].Value}W";
        }
        if (sec == "battery" && field == "capacity" &&
            !raw.Contains("mAh", StringComparison.OrdinalIgnoreCase))
        {
            var m = Regex.Match(raw, @"(\d[\d,]+)");
            if (m.Success) return $"{m.Groups[1].Value} mAh";
        }
        return raw;
    }

    private static void PromoteTopLevelFields(
        string rawKey, string rawValue, List<ItemBrand> brands,
        ref string? modelName, ref string? barcode, ref long? brandId)
    {
        if (rawKey.Equals("Model Name",   StringComparison.OrdinalIgnoreCase) ||
            rawKey.Equals("Model Number", StringComparison.OrdinalIgnoreCase))
            modelName ??= rawValue;

        if (rawKey.Equals("ASIN", StringComparison.OrdinalIgnoreCase))
            barcode ??= rawValue;

        if ((rawKey.Equals("Brand",        StringComparison.OrdinalIgnoreCase) ||
             rawKey.Equals("Manufacturer", StringComparison.OrdinalIgnoreCase))
            && brandId == null)
        {
            var matched = brands.FirstOrDefault(b =>
                !string.IsNullOrWhiteSpace(b.Name) &&
                string.Equals(b.Name, rawValue, StringComparison.OrdinalIgnoreCase));
            brandId = matched?.Id;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static void Set(
        Dictionary<string, Dictionary<string, string>> specs,
        string sec, string field, string value)
    {
        if (!specs.TryGetValue(sec, out var d)) { d = new(); specs[sec] = d; }
        d.TryAdd(field, value);
    }

    private static string CleanText(string raw)
    {
        var decoded = System.Net.WebUtility.HtmlDecode(raw ?? "");
        return Regex.Replace(decoded, @"\s+", " ").Trim();
    }

    private static string ToCamelCase(string text)
    {
        var words = Regex.Split(text.Trim(), @"[\s\-_\/]+")
                         .Where(w => !string.IsNullOrWhiteSpace(w))
                         .ToArray();
        if (words.Length == 0) return text;
        return words[0].ToLowerInvariant()
             + string.Concat(words.Skip(1).Select(w =>
                   char.ToUpperInvariant(w[0]) + w.Substring(1).ToLowerInvariant()));
    }
}

public record ParsedDomItemDto(
    string?  Name,
    string?  ModelName,
    string?  Barcode,
    long?    BrandId,
    string?  AboutThisItem,
    string?  BriefDescription,
    string?  Description,
    Dictionary<string, Dictionary<string, string>> Specifications
);
