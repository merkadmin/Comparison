import { Item } from './item.model';

export interface ItemPackageItem {
  itemId: number;
  item?: Item;
  quantity: number;
}

export interface ItemPackage {
  id?: number;
  name: string;
  description?: string;
  items: ItemPackageItem[];
  originalPrice: number;
  offerPrice: number;
  discountPercentage?: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt?: Date;
}
