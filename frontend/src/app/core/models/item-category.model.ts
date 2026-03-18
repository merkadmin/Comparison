export interface LocalizedString {
  en: string;
  ar: string;
  fr: string;
}

export interface ItemCategory {
  id?: string;
  name: LocalizedString;
  description?: LocalizedString;
  createdAt?: Date;
}
