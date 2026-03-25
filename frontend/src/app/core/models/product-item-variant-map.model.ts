export interface ProductItemVariantEntry {
  productItemVariantId?: number;
  variantId: number;
}

export interface ProductItemVariantMap {
  id?: number;
  productItemId: number;
  storeId: number;
  sellingPrice: number;
  description?: string | null;
  about?: string | null;
  variants: ProductItemVariantEntry[];
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}

export interface ItemPriceDto {
  storeId: number;
  sellingPrice: number;
  variantIds?: number[];
  description?: string | null;
  about?: string | null;
  source: 'variant' | 'store_item';
}
