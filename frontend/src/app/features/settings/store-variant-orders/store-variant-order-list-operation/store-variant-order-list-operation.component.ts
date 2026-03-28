import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { StoreVariantOrder } from '../../../../core/models/store-variant-order.model';
import { Store } from '../../../../core/models/store.model';
import { VariantType, VARIANT_TYPES } from '../../../../core/models/product-item-variant.model';

@Component({
  selector: 'app-store-variant-order-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './store-variant-order-list-operation.component.html',
})
export class StoreVariantOrderListOperationComponent implements OnChanges {
  @Input() editDraft!: StoreVariantOrder;
  @Input() isCreating = true;
  @Input() saving = false;
  @Input() stores: Store[] = [];
  @Input() nextOrderIndex = 0;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();

  readonly variantTypes: VariantType[] = VARIANT_TYPES;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editDraft'] && this.isCreating) {
      this.editDraft.orderIndex = this.nextOrderIndex;
    }
  }
}
