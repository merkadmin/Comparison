import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Store, StoreType } from '../../../core/models/store.model';
import { StoreItem } from '../../../core/models/store-item.model';
import { Item } from '../../../core/models/item.model';

export interface StoreItemRow {
  id: string;
  productItemId: number;
  availableQuantity: number;
  sellingPrice: number;
  isDeliveryAvailable: boolean;
}

@Component({
  selector: 'app-store-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './store-list-operation.component.html',
})
export class StoreListOperationComponent implements OnInit {
  @Input() editDraft!: Store;
  @Input() isCreating = false;
  @Input() storeTypes: StoreType[] = [];
  @Input() saving = false;
  @Input() productItems: Item[] = [];
  @Input() existingStoreItems: StoreItem[] = [];

  @Output() closed        = new EventEmitter<void>();
  @Output() saved         = new EventEmitter<void>();
  @Output() savedAndNew   = new EventEmitter<void>();
  @Output() rowsReady     = new EventEmitter<StoreItemRow[]>();

  rows = signal<StoreItemRow[]>([]);
  private rowCounter = 0;

  ngOnInit(): void {
    if (!this.isCreating && this.existingStoreItems.length) {
      const rows: StoreItemRow[] = this.existingStoreItems.map(item => ({
        id: String(++this.rowCounter),
        productItemId: item.productItemId,
        availableQuantity: item.availableQuantity,
        sellingPrice: item.sellingPrice,
        isDeliveryAvailable: item.isDeliveryAvailable,
      }));
      this.rows.set(rows);
    }
  }

  addRow(): void {
    this.rows.update(rows => [...rows, {
      id: String(++this.rowCounter),
      productItemId: 0,
      availableQuantity: 0,
      sellingPrice: 0,
      isDeliveryAvailable: false,
    }]);
  }

  removeRow(id: string): void {
    this.rows.update(rows => rows.filter(r => r.id !== id));
  }

  updateRow(id: string, field: keyof StoreItemRow, value: unknown): void {
    this.rows.update(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  onSaved(): void {
    this.rowsReady.emit(this.rows());
    this.saved.emit();
  }

  onSavedAndNew(): void {
    this.rowsReady.emit(this.rows());
    this.savedAndNew.emit();
  }
}
