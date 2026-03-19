export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'image' | 'localized' | 'badge';

export interface ColumnMeta {
  field: string;
  labelKey: string;
  type: ColumnType;
  visible: boolean;
  order: number;
}

export interface TableMeta {
  id: number;
  name: string;
  endpoint: string;
  columns: ColumnMeta[];
}
