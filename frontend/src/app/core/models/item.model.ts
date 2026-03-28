import { ItemBrand } from './item-brand.model';
import { IItemCategory } from './interfaces/IItemCategory';
import { ProductType } from './product-type.model';

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
  categoryIds: number[];
  categories?: IItemCategory[];
  productTypeIds: number[];
  productTypes?: ProductType[];
  customerReviews?: number[];
  customerCommentIds?: number[];
  createdAt?: Date;
}
