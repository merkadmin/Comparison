export interface ItemBestPrice {
  itemId: number;
  storeId: number;
  sellingPrice: number;
}

export interface StoreItem {
  id?: number;
  storeId: number;
  productItemId: number;
  availableQuantity: number;
  sellingPrice: number;
  isDeliveryAvailable: boolean;
  isActive?: boolean;
}
