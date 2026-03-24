import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { Item } from '../../../core/models/item.model';
import { ProductItemVariant } from '../../../core/models/product-item-variant.model';

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

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<void>();
}
