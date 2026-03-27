import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { Item } from '../../../core/models/item.model';
import { Store } from '../../../core/models/store.model';
import { ProductItemVariant, VariantType, VARIANT_TYPES } from '../../../core/models/product-item-variant.model';

interface VariantRow {
  id: string;
  type: VariantType | null;
  variantId: number;
}

@Component({
  selector: 'app-item-variant-map-operation',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './item-variant-map-operation.component.html',
})
export class ItemVariantMapOperationComponent implements OnInit {
  @Input() editDraft!: ProductItemVariantMap;
  @Input() isCreating = false;
  @Input() items: Item[] = [];
  @Input() stores: Store[] = [];
  @Input() variants: ProductItemVariant[] = [];
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();
  @Output() bulkSaved      = new EventEmitter<ProductItemVariantMap>();
  @Output() bulkSavedAndNew = new EventEmitter<ProductItemVariantMap>();

  readonly variantTypes = VARIANT_TYPES;

  // ── Shared rows (used in both create and edit modes) ──────────────────────
  rows = signal<VariantRow[]>([]);
  private rowCounter = 0;

  // ── Create-mode (bulk) draft signals ─────────────────────────────────────
  bulkItemId       = signal(0);
  bulkStoreId      = signal(0);
  bulkSellingPrice = signal<number>(0);
  bulkDescription  = signal('');
  bulkAbout        = signal('');

  isBulkValid = computed(() =>
    this.bulkItemId() > 0 &&
    this.bulkStoreId() > 0 &&
    this.bulkSellingPrice() > 0 &&
    this.rows().every(r => r.variantId > 0)
  );

  isEditValid = computed(() =>
    this.editDraft?.productItemId > 0 &&
    this.editDraft?.storeId > 0 &&
    this.rows().every(r => r.variantId > 0)
  );

  ngOnInit(): void {
    if (!this.isCreating && this.editDraft?.variants?.length) {
      const rows: VariantRow[] = this.editDraft.variants.map(entry => {
        const v = this.variants.find(v => v.id === entry.variantId);
        return { id: String(++this.rowCounter), type: (v?.variantTypeId as VariantType) ?? null, variantId: entry.variantId };
      });
      this.rows.set(rows);
    }
  }

  addRow(): void {
    this.rows.update(rows => [...rows, { id: String(++this.rowCounter), type: null, variantId: 0 }]);
  }

  removeRow(id: string): void {
    this.rows.update(rows => rows.filter(r => r.id !== id));
  }

  updateRowType(id: string, type: VariantType | null): void {
    this.rows.update(rows => rows.map(r => r.id === id ? { ...r, type, variantId: 0 } : r));
  }

  updateRowVariantId(id: string, variantId: number): void {
    this.rows.update(rows => rows.map(r => r.id === id ? { ...r, variantId } : r));
  }

  getRowVariants(type: VariantType | null): ProductItemVariant[] {
    return type ? this.variants.filter(v => v.variantTypeId === type) : this.variants;
  }

  private buildRecord(): ProductItemVariantMap {
    const variants = this.rows().map(r => ({ variantId: r.variantId }));
    return {
      productItemId: this.bulkItemId(),
      storeId:       this.bulkStoreId(),
      sellingPrice:  this.bulkSellingPrice(),
      description:   this.bulkDescription() || null,
      about:         this.bulkAbout() || null,
      variants,
    };
  }

  saveBulk(): void {
    this.bulkSaved.emit(this.buildRecord());
  }

  saveBulkAndNew(): void {
    this.bulkSavedAndNew.emit(this.buildRecord());
    // Only reset Item, Store, and Price — keep the variants table and text fields
    this.bulkItemId.set(0);
    this.bulkStoreId.set(0);
    this.bulkSellingPrice.set(0);
  }

  // ── Edit-mode save ────────────────────────────────────────────────────────
  onSaved(): void {
    this.editDraft.variants = this.rows().map(r => ({ variantId: r.variantId }));
    this.saved.emit();
  }

  onSavedAndNew(): void {
    this.editDraft.variants = this.rows().map(r => ({ variantId: r.variantId }));
    this.savedAndNew.emit();
  }
}
