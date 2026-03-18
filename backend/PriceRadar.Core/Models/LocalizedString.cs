namespace PriceRadar.Core.Models;

public class LocalizedString
{
    public string En { get; set; } = string.Empty;
    public string Ar { get; set; } = string.Empty;
    public string Fr { get; set; } = string.Empty;

    /// <summary>Returns the translation for the given language code, falling back to English.</summary>
    public string Get(string lang) => lang switch
    {
        "ar" => string.IsNullOrEmpty(Ar) ? En : Ar,
        "fr" => string.IsNullOrEmpty(Fr) ? En : Fr,
        _    => En,
    };
}
