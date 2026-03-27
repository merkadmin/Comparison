export interface StoreVariantOrder {
  id?: number;
  storeId: number;
  variantId: number;
  orderIndex: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}
