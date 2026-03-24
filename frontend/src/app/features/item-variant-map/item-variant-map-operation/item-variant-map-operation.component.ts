import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { Item } from '../../../core/models/item.model';
import { Store } from '../../../core/models/store.model';
import { ProductItemVariant, VariantType, VARIANT_TYPES } from '../../../core/models/product-item-variant.model';

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

  readonly variantTypes = VARIANT_TYPES;
  selectedType = signal<VariantType | null>(null);

  get typeCount(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const v of this.variants) {
      counts[v.variantTypeId] = (counts[v.variantTypeId] ?? 0) + 1;
    }
    return counts;
  }

  filteredVariants = computed<ProductItemVariant[]>(() => {
    const type = this.selectedType();
    return type ? this.variants.filter(v => v.variantTypeId === type) : this.variants;
  });

  selectType(type: VariantType | null): void {
    this.selectedType.set(type);
    this.editDraft.variantId = 0;
  }
}
