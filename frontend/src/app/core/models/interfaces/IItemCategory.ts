import type { MultiLangString } from './LocalizedString';

export interface IItemCategory {
  id?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  name: MultiLangString;
  parentCategoryId?: number | null;
  description?: MultiLangString;
  categoryImage?: string;
  createdAt?: Date;
}
