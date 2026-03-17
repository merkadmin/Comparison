export type StoreType = 'Online' | 'Physical';

export interface Store {
  id?: string;
  name: string;
  type: StoreType;
  websiteUrl?: string;
  logoUrl?: string;
  country: string;
}
