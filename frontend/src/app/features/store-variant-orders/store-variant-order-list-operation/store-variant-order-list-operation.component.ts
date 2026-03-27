import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { StoreVariantOrder } from '../../../core/models/store-variant-order.model';
import { Store } from '../../../core/models/store.model';
import { ProductItemVariant } from '../../../core/models/product-item-variant.model';

@Component({
  selector: 'app-store-variant-order-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './store-variant-order-list-operation.component.html',
})
export class StoreVariantOrderListOperationComponent {
  @Input() editDraft!: StoreVariantOrder;
  @Input() isCreating = true;
  @Input() saving = false;
  @Input() stores: Store[] = [];
  @Input() variants: ProductItemVariant[] = [];

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();

  getVariantLabel(v: ProductItemVariant): string {
    return `${v.variantTypeId}: ${v.variantValue}`;
  }
}
