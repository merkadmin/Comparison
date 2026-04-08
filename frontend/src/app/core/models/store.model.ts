import { StoreType } from "../../shared/helpers/StaticEnums";
export { StoreType };

export interface Store {
  id?: number;
  isActive?: boolean;
  name: string;
  storeTypeIds: StoreType[];
  websiteUrl?: string;
  logoUrl?: string;
  storeImage?: string;
  country: string;
}
