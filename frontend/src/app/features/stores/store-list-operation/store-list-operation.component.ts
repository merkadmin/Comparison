import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Store, StoreType } from '../../../core/models/store.model';
import { StoreItemDraft } from '../../../core/models/store-item.model';
import { Item } from '../../../core/models/item.model';
import { SellingPriceType } from '../../../shared/helpers/StaticEnums';
import { StoreItemDraftOperationComponent } from '../store-item-draft-operation/store-item-draft-operation.component';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';

@Component({
  selector: 'app-store-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, StoreItemDraftOperationComponent, CommonDropDownMenuActionButton],
  templateUrl: './store-list-operation.component.html',
})
export class StoreListOperationComponent {
  @Input() editDraft!: Store;
  @Input() isCreating = false;
  @Input() storeTypes: StoreType[] = [];
  @Input() saving = false;
  @Input() items: Item[] = [];
  @Input() draftStoreItems: StoreItemDraft[] = [];

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();

  // ── Sub-modal state ────────────────────────────────────────────────────────
  editingItemIndex: number | null = null;   // -1 = new, >= 0 = editing
  currentItemDraft: StoreItemDraft = this.emptyDraft();

  private emptyDraft(): StoreItemDraft {
    return { itemId: 0, sellingPrice: 0, sellingPriceTypeId: SellingPriceType.Regular, quantity: 0, isDeliverAvailable: false };
  }

  openAddItem(): void {
    this.currentItemDraft = this.emptyDraft();
    this.editingItemIndex = -1;
  }

  openEditItem(index: number): void {
    this.currentItemDraft = { ...this.draftStoreItems[index] };
    this.editingItemIndex = index;
  }

  closeItemModal(): void {
    this.editingItemIndex = null;
  }

  confirmItem(): void {
    if (this.editingItemIndex === -1) {
      this.draftStoreItems.push({ ...this.currentItemDraft });
    } else if (this.editingItemIndex !== null) {
      this.draftStoreItems[this.editingItemIndex] = { ...this.currentItemDraft };
    }
    this.editingItemIndex = null;
  }

  confirmItemAndNew(): void {
    this.draftStoreItems.push({ ...this.currentItemDraft });
    this.currentItemDraft = this.emptyDraft();
    this.editingItemIndex = -1;
  }

  removeItem(index: number): void {
    this.draftStoreItems.splice(index, 1);
  }

  getItemName(id: number): string {
    return this.items.find(i => i.id === id)?.name ?? '—';
  }

  getItemRowMenuItems(index: number): ActionMenuItem[] {
    return [
      { labelKey: 'common.delete', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.removeItem(index) }
    ];
  }
}
