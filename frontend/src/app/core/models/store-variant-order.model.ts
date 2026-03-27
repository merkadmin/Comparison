import { VariantType } from './product-item-variant.model';

export interface StoreVariantOrder {
  id?: number;
  storeId: number;
  variantTypeId: VariantType;
  orderIndex: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}
