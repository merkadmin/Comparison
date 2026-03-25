import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
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
export class ItemVariantMapOperationComponent {
  @Input() editDraft!: ProductItemVariantMap;
  @Input() isCreating = false;
  @Input() items: Item[] = [];
  @Input() stores: Store[] = [];
  @Input() variants: ProductItemVariant[] = [];
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();
  @Output() bulkSaved   = new EventEmitter<ProductItemVariantMap[]>();

  readonly variantTypes = VARIANT_TYPES;

  // ── Create-mode (bulk) draft ──────────────────────────────────────────────
  bulkItemId       = signal(0);
  bulkStoreId      = signal(0);
  bulkSellingPrice = signal<number>(0);
  bulkDescription  = signal('');
  bulkAbout        = signal('');
  rows             = signal<VariantRow[]>([{ id: '0', type: null, variantId: 0 }]);
  private rowCounter = 0;

  isBulkValid = computed(() =>
    this.bulkItemId() > 0 &&
    this.bulkStoreId() > 0 &&
    this.bulkSellingPrice() > 0 &&
    this.rows().length > 0 &&
    this.rows().every(r => r.variantId > 0)
  );

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

  saveBulk(): void {
    const records: ProductItemVariantMap[] = this.rows().map(row => ({
      productItemId: this.bulkItemId(),
      storeId:       this.bulkStoreId(),
      sellingPrice:  this.bulkSellingPrice(),
      variantId:     row.variantId,
      description:   this.bulkDescription() || null,
      about:         this.bulkAbout() || null,
    }));
    this.bulkSaved.emit(records);
  }

  // ── Edit-mode helpers ─────────────────────────────────────────────────────
  selectedType = signal<VariantType | null>(null);

  filteredVariants = computed<ProductItemVariant[]>(() => {
    const type = this.selectedType();
    return type ? this.variants.filter(v => v.variantTypeId === type) : this.variants;
  });

  get typeCount(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const v of this.variants) counts[v.variantTypeId] = (counts[v.variantTypeId] ?? 0) + 1;
    return counts;
  }

  selectType(type: VariantType | null): void {
    this.selectedType.set(type);
    this.editDraft.variantId = 0;
  }
}
