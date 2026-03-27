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

  readonly colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E',
    '#000000', '#1F2937', '#6B7280', '#D1D5DB', '#FFFFFF',
    '#92400E', '#78350F', '#7C3AED', '#1D4ED8', '#15803D',
  ];

  @Input() editDraft!: ProductItemVariant;
  @Input() isCreating = false;
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();
}
