export type VariantType = 'Color' | 'Size' | 'Material' | 'Style' | 'Pattern' | 'Brand' | 'Model' | 'Version' | 'Other';

export const VARIANT_TYPES: VariantType[] = [
  'Color', 'Size', 'Material', 'Style', 'Pattern', 'Brand', 'Model', 'Version', 'Other'
];

export interface ProductItemVariant {
  id?: number;
  variantTypeId: VariantType;
  variantValue: string;
  abbreviation?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}
