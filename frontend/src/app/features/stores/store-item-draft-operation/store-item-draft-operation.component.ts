import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { StoreItemDraft } from '../../../core/models/store-item.model';
import { Item } from '../../../core/models/item.model';
import { SellingPriceType } from '../../../shared/helpers/StaticEnums';

@Component({
  selector: 'app-store-item-draft-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './store-item-draft-operation.component.html',
})
export class StoreItemDraftOperationComponent {
  readonly sellingPriceTypes = [SellingPriceType.Regular, SellingPriceType.Premium, SellingPriceType.Offer];

  @Input() draft!: StoreItemDraft;
  @Input() items: Item[] = [];
  @Input() isEditing = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();
}
