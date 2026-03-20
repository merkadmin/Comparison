import { StoreType } from "../../shared/helpers/StaticEnums";
export { StoreType };

export interface Store {
  id?: number;
  isActive?: boolean;
  name: string;
  type: StoreType;
  websiteUrl?: string;
  logoUrl?: string;
  country: string;
}
