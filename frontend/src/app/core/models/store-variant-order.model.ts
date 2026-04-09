import { VariantType } from './product-item-variant.model';

export interface StoreVariantOrder {
  id?: number;
  storeId: number;
  /** When set, the order applies to all products in this category (ignores storeId). */
  categoryId?: number | null;
  variantTypeId: VariantType;
  orderIndex: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}
