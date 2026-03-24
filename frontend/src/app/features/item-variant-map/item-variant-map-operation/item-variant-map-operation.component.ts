import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { Item } from '../../../core/models/item.model';
import { ProductItemVariant, VariantType, VARIANT_TYPES } from '../../../core/models/product-item-variant.model';

@Component({
  selector: 'app-item-variant-map-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-variant-map-operation.component.html',
})
export class ItemVariantMapOperationComponent {
  @Input() editDraft!: ProductItemVariantMap;
  @Input() isCreating = false;
  @Input() items: Item[] = [];
  @Input() variants: ProductItemVariant[] = [];
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();

  readonly variantTypes = VARIANT_TYPES;
  selectedType = signal<VariantType | null>(null);

  filteredVariants = computed<ProductItemVariant[]>(() => {
    const type = this.selectedType();
    return type ? this.variants.filter(v => v.variantTypeId === type) : this.variants;
  });

  selectType(type: VariantType | null): void {
    this.selectedType.set(type);
    this.editDraft.variantId = 0;
  }
}
