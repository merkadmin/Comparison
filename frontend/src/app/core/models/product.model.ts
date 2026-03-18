export interface Product {
  id?: string;
  name: string;
  brand: string;
  category: string;
  barcode?: string;
  imageUrl?: string;
  specs: Record<string, string>;
  createdAt?: Date;
}
