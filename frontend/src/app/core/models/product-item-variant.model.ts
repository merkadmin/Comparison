export type VariantType =
  | 'Color' | 'Size' | 'Material' | 'Style' | 'Pattern' | 'Brand' | 'Model' | 'Version'
  | 'RamType' | 'RamSize' | 'HardDiskType' | 'HardDiskSize' | 'OperatingSystem'
  | 'ScreenType' | 'ScreenSize' | 'Resolution' | 'RefreshRate' | 'CellularTechnology'
  | 'Display' | 'Platform' | 'CameraMain' | 'CameraFront' | 'Battery' | 'Body'
  | 'Connectivity' | 'Network' | 'Sensors'
  | 'Other';

export const VARIANT_TYPES: VariantType[] = [
  'Color', 'Size', 'Material', 'Style', 'Pattern', 'Brand', 'Model', 'Version',
  'RamType', 'RamSize', 'HardDiskType', 'HardDiskSize', 'OperatingSystem',
  'ScreenType', 'ScreenSize', 'Resolution', 'RefreshRate', 'CellularTechnology',
  'Display', 'Platform', 'CameraMain', 'CameraFront', 'Battery', 'Body',
  'Connectivity', 'Network', 'Sensors',
  'Other',
];

export interface ProductItemVariant {
  id?: number;
  variantTypeId: VariantType;
  variantValue: string;
  abbreviation?: string;
  color?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}
