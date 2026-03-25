export interface ProductItemVariantMap {
  id?: number;
  productItemId: number;
  variantId: number;
  sellingPrice: number;
  storeId: number;
  description?: string | null;
  about?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}

export interface ItemPriceDto {
  storeId: number;
  sellingPrice: number;
  variantId?: number | null;
  description?: string | null;
  about?: string | null;
  source: 'variant' | 'store_item';
}
