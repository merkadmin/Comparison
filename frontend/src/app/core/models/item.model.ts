import { ItemBrand } from './item-brand.model';
import { ItemCategory } from './item-category.model';

export interface Item {
  id?: string;
  name: string;
  description?: string;
  barcode?: string;
  imageUrl?: string;
  brandId: string;
  brand?: ItemBrand;
  itemCategoryId: string;
  category?: ItemCategory;
  createdAt?: Date;
}
