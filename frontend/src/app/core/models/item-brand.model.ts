export interface ItemBrand {
  id?: number;
  name: string;
  logoUrl?: string;
  brandImage?: string;
  country?: string;
  countryId?: number;
  productTypeIds?: number[];
  isActive?: boolean;
  createdAt?: Date;
}
