import { Store } from './store.model';

export interface PriceListing {
  id?: string;
  productId: string;
  storeId: string;
  store?: Store;
  price: number;
  currency: string;
  productUrl?: string;
  isAvailable: boolean;
  lastUpdated: Date;
  isBestDeal?: boolean;
}
