import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ProductItemVariant, VARIANT_TYPES } from '../../../core/models/product-item-variant.model';

@Component({
  selector: 'app-product-item-variant-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './product-item-variant-list-operation.component.html',
})
export class ProductItemVariantListOperationComponent {
  readonly variantTypes = VARIANT_TYPES;

  @Input() editDraft!: ProductItemVariant;
  @Input() isCreating = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<void>();
}
