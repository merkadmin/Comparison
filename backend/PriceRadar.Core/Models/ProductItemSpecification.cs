namespace PriceRadar.Core.Models;

public class ProductItemSpecification
{
	// ── Network ────────────────────────────────────────────────────
	public string? Technology { get; set; }
	public string? Bands2G { get; set; }
	public string? Bands3G { get; set; }
	public string? Bands4G { get; set; }
	public string? Bands5G { get; set; }
	public string? Speed { get; set; }

	// ── Body ──────────────────────────────────────────────────────
	public string? Dimensions { get; set; }
	public string? Weight { get; set; }
	public string? Build { get; set; }
	public string? Sim { get; set; }
	public bool? Esim { get; set; }
	public bool? DualSim { get; set; }
	public string? Durability { get; set; }
	public string? StylusSupport { get; set; }
	public bool? Foldable { get; set; }
	public string? CoverDisplay { get; set; }

	// ── Display ───────────────────────────────────────────────────
	public string? DisplayType { get; set; }
	public string? DisplaySize { get; set; }
	public string? DisplayResolution { get; set; }
	public string? ScreenToBodyRatio { get; set; }
	public string? DisplayProtection { get; set; }
	public string? RefreshRate { get; set; }
	public string? BrightnessTypical { get; set; }
	public string? BrightnessPeak { get; set; }
	public string? Hdr { get; set; }
	public bool? AlwaysOnDisplay { get; set; }
	public string? Ppi { get; set; }

	// ── Platform ──────────────────────────────────────────────────
	public string? Os { get; set; }
	public string? Chipset { get; set; }
	public string? Cpu { get; set; }
	public string? Gpu { get; set; }
	public string? ProcessNode { get; set; }

	// ── Memory ────────────────────────────────────────────────────
	public string? Ram { get; set; }
	public List<string> RamOptions { get; set; } = new();
	public string? InternalStorage { get; set; }
	public List<string> StorageOptions { get; set; } = new();
	public string? StorageType { get; set; }
	public string? CardSlot { get; set; }

	// ── Main Camera ───────────────────────────────────────────────
	public string? CameraSetup { get; set; }
	public string? CameraPrimary { get; set; }
	public string? CameraUltrawide { get; set; }
	public string? CameraTelephoto { get; set; }
	public string? CameraMacro { get; set; }
	public string? CameraFeatures { get; set; }
	public string? CameraVideo { get; set; }
	public string? OpticalZoom { get; set; }
	public string? DigitalZoom { get; set; }

	// ── Selfie Camera ─────────────────────────────────────────────
	public string? SelfiePrimary { get; set; }
	public string? SelfieFeatures { get; set; }
	public string? SelfieVideo { get; set; }

	// ── Sound ─────────────────────────────────────────────────────
	public string? Loudspeaker { get; set; }
	public bool? HeadphoneJack { get; set; }
	public string? AudioCodecs { get; set; }

	// ── Comms ─────────────────────────────────────────────────────
	public string? Wlan { get; set; }
	public string? Bluetooth { get; set; }
	public string? Positioning { get; set; }
	public bool? Nfc { get; set; }
	public string? Usb { get; set; }
	public bool? Uwb { get; set; }

	// ── Features ──────────────────────────────────────────────────
	public List<string> Sensors { get; set; } = new();
	public string? FingerprintType { get; set; }
	public string? FaceRecognition { get; set; }

	// ── Battery ───────────────────────────────────────────────────
	public string? BatteryType { get; set; }
	public string? BatteryCapacity { get; set; }
	public string? WiredCharging { get; set; }
	public string? WirelessCharging { get; set; }
	public bool? ReverseWireless { get; set; }

	// ── Misc ──────────────────────────────────────────────────────
	public List<string> Colors { get; set; } = new();
	public List<string> ModelNumbers { get; set; } = new();
	public string? Price { get; set; }
}
