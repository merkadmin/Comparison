export interface LocalizedString {
  en: string;
  ar: string;
  fr: string;
}

export interface ItemCategory {
  id?: number;
  name: LocalizedString;
  parentCategoryId?: number | null;
  description?: LocalizedString;
  createdAt?: Date;
}
