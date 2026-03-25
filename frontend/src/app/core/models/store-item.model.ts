export interface ItemBestPrice {
  itemId: number;
  storeId: number;
  sellingPrice: number;
}

export interface StoreItemDraft {
  itemId: number;
  sellingPrice: number;
  sellingPriceTypeId: string;
  quantity: number;
  isDeliverAvailable: boolean;
}
