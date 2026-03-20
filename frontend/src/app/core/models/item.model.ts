import { ItemBrand } from './item-brand.model';
import { IItemCategory } from './interfaces/IItemCategory';

export interface StorePrice {
  storeId: number;
  price: number;
}

export interface Item {
  id?: number;
  name: string;
  description?: string;
  briefDescription?: string;
  aboutThisItem?: string;
  modelName?: string;
  barcode?: string;
  imageUrl?: string;
  images?: string[];
  isActive?: boolean;
  brandId: number;
  brand?: ItemBrand;
  itemCategoryId: number;
  category?: IItemCategory;
  productItemTypeId?: number | null;
  productInformationId?: number | null;
  prices?: StorePrice[];
  customerReviews?: number[];
  customerCommentIds?: number[];
  createdAt?: Date;
}
