export type SellingPriceType = 'Regular' | 'Premium' | 'Offer';

export interface StoreItem {
  id?: number;
  itemId: number;
  storeId: number;
  sellingPrice: number;
  sellingPriceTypeId: SellingPriceType;
  isActive?: boolean;
  createdAt?: string;
}
