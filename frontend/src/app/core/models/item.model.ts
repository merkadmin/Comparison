import { ItemBrand } from './item-brand.model';
import { ItemCategory } from './item-category.model';

export interface Item {
  id?: number;
  name: string;
  description?: string;
  barcode?: string;
  imageUrl?: string;
  images?: string[];
  isActive?: boolean;
  brandId: number;
  brand?: ItemBrand;
  itemCategoryId: number;
  category?: ItemCategory;
  createdAt?: Date;
}
