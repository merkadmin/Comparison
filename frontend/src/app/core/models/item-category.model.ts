export interface LocalizedString {
  en: string;
  ar: string;
  fr: string;
}

export interface ItemCategory {
  id?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  name: LocalizedString;
  parentCategoryId?: number | null;
  description?: LocalizedString;
  createdAt?: Date;
}
