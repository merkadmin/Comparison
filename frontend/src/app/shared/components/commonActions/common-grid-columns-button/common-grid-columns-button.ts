import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'app-common-grid-columns-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-grid-columns-button.html',
  styleUrl: './common-grid-columns-button.less',
})
export class CommonGridColumnsButton {
  @Input()  columns: GridColumns = 5;
  @Output() columnsChange = new EventEmitter<GridColumns>();

  readonly options: GridColumns[] = [1, 2, 3, 4, 5, 6];

  select(n: GridColumns): void {
    this.columnsChange.emit(n);
  }
}
