import { computed, Signal } from '@angular/core';
import { GridColumns } from '../components/commonActions/common-grid-columns-button/common-grid-columns-button';

const COL_CLASS_MAP: Record<GridColumns, string> = {
  1: 'col-12',
  2: 'col-6',
  3: 'col-4',
  4: 'col-3',
  5: 'col-grid-5',
  6: 'col-2',
};

export function colClassFor(cols: GridColumns): string {
  return COL_CLASS_MAP[cols];
}

export function computedColClass(colsPerRow: Signal<GridColumns>): Signal<string> {
  return computed(() => COL_CLASS_MAP[colsPerRow()]);
}
