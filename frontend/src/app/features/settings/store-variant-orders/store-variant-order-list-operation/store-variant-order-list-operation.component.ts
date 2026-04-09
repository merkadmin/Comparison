import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../../core/services/translate.service';
import { StoreVariantOrder } from '../../../../core/models/store-variant-order.model';
import { Store } from '../../../../core/models/store.model';
import { IItemCategory } from '../../../../core/models/interfaces/IItemCategory';
import { MultiLangString } from '../../../../core/models/interfaces/LocalizedString';
import { VariantType, VARIANT_TYPES } from '../../../../core/models/product-item-variant.model';

@Component({
  selector: 'app-store-variant-order-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './store-variant-order-list-operation.component.html',
})
export class StoreVariantOrderListOperationComponent implements OnChanges {
  private translateSvc = inject(TranslateService);

  @Input() editDraft!: StoreVariantOrder;
  @Input() isCreating = true;
  @Input() saving = false;
  @Input() stores: Store[] = [];
  @Input() categories: IItemCategory[] = [];
  @Input() nextOrderIndex = 0;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();

  readonly variantTypes: VariantType[] = VARIANT_TYPES;

  /** 'store' = scope by store, 'category' = scope by category */
  scopeMode: 'store' | 'category' = 'store';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editDraft']) {
      // Determine initial scope mode from the draft
      this.scopeMode = this.editDraft.categoryId ? 'category' : 'store';
      if (this.isCreating) {
        this.editDraft.orderIndex = this.nextOrderIndex;
      }
    }
  }

  onScopeModeChange(mode: 'store' | 'category'): void {
    this.scopeMode = mode;
    if (mode === 'store') {
      this.editDraft.categoryId = null;
    } else {
      this.editDraft.storeId = 0;
      this.editDraft.categoryId = null;
    }
  }

  /** Flat list of leaf-level categories (no children) for selection. */
  get leafCategories(): IItemCategory[] {
    const parentIds = new Set(this.categories.filter(c => c.parentCategoryId).map(c => c.parentCategoryId!));
    return this.categories.filter(c => !parentIds.has(c.id!));
  }

  getCategoryPath(id: number): string {
    const parts: string[] = [];
    let current = this.categories.find(c => c.id === id);
    while (current) {
      parts.unshift(this.localize(current.name));
      current = current.parentCategoryId
        ? this.categories.find(c => c.id === current!.parentCategoryId)
        : undefined;
    }
    return parts.join(' › ');
  }

  localize(ls: MultiLangString): string {
    const lang = this.translateSvc.currentLang();
    return ls[lang] || ls.en;
  }
}
