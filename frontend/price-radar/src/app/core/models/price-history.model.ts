export interface PriceHistory {
  id?: string;
  productId: string;
  storeId: string;
  price: number;
  currency: string;
  recordedAt: Date;
}
