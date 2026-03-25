import { SellingPriceType } from '../../shared/helpers/StaticEnums';
export { SellingPriceType };

export interface StoreItem {
  id?: number;
  itemId: number;
  storeId: number;
  sellingPrice: number;
  sellingPriceTypeId: SellingPriceType;
  isActive?: boolean;
  createdAt?: string;
}

export interface ItemBestPrice {
  itemId: number;
  storeId: number;
  sellingPrice: number;
}
