import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { StoreItem, SellingPriceType } from '../../../core/models/store-item.model';
import { Item } from '../../../core/models/item.model';
import { Store } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-item-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './store-item-list-operation.component.html',
})
export class StoreItemListOperationComponent {
  @Input() editDraft!: StoreItem;
  @Input() isCreating = false;
  @Input() items: Item[] = [];
  @Input() stores: Store[] = [];
  @Input() sellingPriceTypes: SellingPriceType[] = [];
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();
}
