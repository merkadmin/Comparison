export interface ProductItemSpecification {
  // ── Network ────────────────────────────────────────────────────
  technology?: string;
  bands2G?: string;
  bands3G?: string;
  bands4G?: string;
  bands5G?: string;
  speed?: string;

  // ── Body ──────────────────────────────────────────────────────
  dimensions?: string;
  weight?: string;
  build?: string;
  sim?: string;
  esim?: boolean;
  dualSim?: boolean;
  durability?: string;
  stylusSupport?: string;
  foldable?: boolean;
  coverDisplay?: string;

  // ── Display ───────────────────────────────────────────────────
  displayType?: string;
  displaySize?: string;
  displayResolution?: string;
  screenToBodyRatio?: string;
  displayProtection?: string;
  refreshRate?: string;
  brightnessTypical?: string;
  brightnessPeak?: string;
  hdr?: string;
  alwaysOnDisplay?: boolean;
  ppi?: string;

  // ── Platform ──────────────────────────────────────────────────
  os?: string;
  chipset?: string;
  cpu?: string;
  gpu?: string;
  processNode?: string;

  // ── Memory ────────────────────────────────────────────────────
  ram?: string;
  ramOptions?: string[];
  internalStorage?: string;
  storageOptions?: string[];
  storageType?: string;
  cardSlot?: string;

  // ── Main Camera ───────────────────────────────────────────────
  cameraSetup?: string;
  cameraPrimary?: string;
  cameraUltrawide?: string;
  cameraTelephoto?: string;
  cameraMacro?: string;
  cameraFeatures?: string;
  cameraVideo?: string;
  opticalZoom?: string;
  digitalZoom?: string;

  // ── Selfie Camera ─────────────────────────────────────────────
  selfiePrimary?: string;
  selfieFeatures?: string;
  selfieVideo?: string;

  // ── Sound ─────────────────────────────────────────────────────
  loudspeaker?: string;
  headphoneJack?: boolean;
  audioCodecs?: string;

  // ── Comms ─────────────────────────────────────────────────────
  wlan?: string;
  bluetooth?: string;
  positioning?: string;
  nfc?: boolean;
  usb?: string;
  uwb?: boolean;

  // ── Features ──────────────────────────────────────────────────
  sensors?: string[];
  fingerprintType?: string;
  faceRecognition?: string;

  // ── Battery ───────────────────────────────────────────────────
  batteryType?: string;
  batteryCapacity?: string;
  wiredCharging?: string;
  wirelessCharging?: string;
  reverseWireless?: boolean;

  // ── Misc ──────────────────────────────────────────────────────
  colors?: string[];
  modelNumbers?: string[];
  price?: string;
}
