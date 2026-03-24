import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { StoreItemService } from '../../core/services/store-item.service';
import { ItemService } from '../../core/services/item.service';
import { StoreService } from '../../core/services/store.service';
import { StoreItem, SellingPriceType } from '../../core/models/store-item.model';
import { Item } from '../../core/models/item.model';
import { Store } from '../../core/models/store.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { ToastService } from '../../core/services/toast.service';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonListHeaderActions } from '../../shared/components/common-list-header-actions/common-list-header-actions';
import { CommonSelectComponent, SelectOption } from '../../shared/components/common-select/common-select.component';
import { GridColumns } from '../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';
import { ViewMode } from '../../shared/components/commonActions/common-view-mode/common-view-mode';
import { StoreItemListOperationComponent } from './store-item-list-operation/store-item-list-operation.component';
import { computedColClass } from '../../shared/helpers/grid-columns.helper';

@Component({
  selector: 'app-store-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonSelectComponent, CommonDropDownMenuActionButton, CommonListHeaderActions, StoreItemListOperationComponent],
  templateUrl: './store-item-list.component.html',
  styleUrl: './store-item-list.component.less',
})
export class StoreItemListComponent implements OnInit {
  auth = inject(AuthService);
  private service = inject(StoreItemService);
  private itemSvc = inject(ItemService);
  private storeSvc = inject(StoreService);
  private translate = inject(TranslateService);
  private toast = inject(ToastService);

  readonly sellingPriceTypes: SellingPriceType[] =
    [
      SellingPriceType.Regular,
      SellingPriceType.Premium,
      SellingPriceType.Offer
    ];

  // ── View ──────────────────────────────────────────────────────────────────
  viewMode = signal<ViewMode>('cards');
  colsPerRow = signal<GridColumns>(5);
  colClass = computedColClass(this.colsPerRow);

  // ── Edit / Create ─────────────────────────────────────────────────────────
  editingId = signal<number | null>(null);
  isCreating = signal(false);
  saving = signal(false);
  editDraft: StoreItem = { itemId: 0, storeId: 0, sellingPrice: 0, sellingPriceTypeId: SellingPriceType.Regular };

  // ── Data ──────────────────────────────────────────────────────────────────
  storeItems = signal<StoreItem[]>([]);
  items = signal<Item[]>([]);
  stores = signal<Store[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  selectedItemId = signal<number | null>(null);
  selectedStoreId = signal<number | null>(null);
  importing = signal(false);
  importError = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds = signal<Set<number>>(new Set());

  itemOptions = computed<SelectOption[]>(() => this.items().map(i => ({ value: i.id, label: i.name })));
  storeOptions = computed<SelectOption[]>(() => this.stores().map(s => ({ value: s.id, label: s.name })));

  filteredStoreItems = computed<StoreItem[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const itemId = this.selectedItemId();
    const storeId = this.selectedStoreId();
    return this.storeItems()
      .filter(si => {
        if (itemId !== null && si.itemId !== itemId) return false;
        if (storeId !== null && si.storeId !== storeId) return false;
        if (q) {
          const matchItem = this.getItemName(si.itemId).toLowerCase().includes(q);
          const matchStore = this.getStoreName(si.storeId).toLowerCase().includes(q);
          if (!matchItem && !matchStore) return false;
        }
        return true;
      })
      .sort((a, b) => a.sellingPrice - b.sellingPrice);
  });

  openCreate(): void {
    this.editDraft = { itemId: 0, storeId: 0, sellingPrice: 0, sellingPriceTypeId: SellingPriceType.Regular };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(si: StoreItem): void {
    this.editDraft = { ...si };
    this.isCreating.set(false);
    this.editingId.set(si.id!);
  }

  closeEdit(): void {
    this.editingId.set(null);
    this.isCreating.set(false);
  }

  saveEdit(): void {
    this.saving.set(true);
    const onSuccess = () => {
      this.saving.set(false);
      this.toast.success(this.translate.translate('storeItem.saveSuccess'));
      this.load();
      this.closeEdit();
    };
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('storeItem.saveError')); };
    if (this.isCreating()) {
      this.service.create(this.editDraft).subscribe({ next: onSuccess, error: onError });
    } else {
      this.service.update(this.editingId()!, this.editDraft).subscribe({ next: onSuccess, error: onError });
    }
  }

  saveEditAndNew(): void {
    if (!this.isCreating()) return;
    this.saving.set(true);
    this.service.create(this.editDraft).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.translate.translate('storeItem.saveSuccess'));
        this.load();
        this.editDraft = { itemId: 0, storeId: 0, sellingPrice: 0, sellingPriceTypeId: SellingPriceType.Regular };
      },
      error: () => { this.saving.set(false); this.toast.error(this.translate.translate('storeItem.saveError')); },
    });
  }

  // ── Lookups ───────────────────────────────────────────────────────────────
  getItemName(itemId: number): string {
    return this.items().find(i => i.id === itemId)?.name ?? String(itemId);
  }

  getStoreName(storeId: number): string {
    return this.stores().find(s => s.id === storeId)?.name ?? String(storeId);
  }

  // ── Selection ─────────────────────────────────────────────────────────────
  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.filteredStoreItems();
    return all.length > 0 && all.every(si => this.selectedIds().has(si.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.filteredStoreItems().map(si => si.id!))
    );
  }

  // ── Menus ─────────────────────────────────────────────────────────────────
  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'storeItem.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  getRowMenuItems(id: number): ActionMenuItem[] {
    return [
      { labelKey: 'common.delete', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.delete(id) }
    ];
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.storeItems.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load store items.'); this.loading.set(false); }
    });
    this.itemSvc.getAll().subscribe({ next: data => this.items.set(data) });
    this.storeSvc.getAll().subscribe({ next: data => this.stores.set(data) });
  }

  // ── Single row actions ────────────────────────────────────────────────────
  setActive(id: number, isActive: boolean): void {
    this.service.setActive(id, isActive).subscribe({
      next: () => this.storeItems.update(list => list.map(si => si.id === id ? { ...si, isActive } : si))
    });
  }

  delete(id: number): void {
    Swal.fire({
      title: this.translate.translate('storeItem.deleteConfirm'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.delete(id).subscribe({
        next: () => {
          const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s);
          this.load();
        }
      });
    });
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────
  deactivateSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('storeItem.deactivateBulkConfirm'),
      text: this.translate.translate('storeItem.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.setActiveMany(ids, false).subscribe({
        next: () => {
          this.storeItems.update(list => list.map(si => ids.includes(si.id!) ? { ...si, isActive: false } : si));
          this.selectedIds.set(new Set());
        }
      });
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('storeItem.deleteBulkConfirm'),
      text: this.translate.translate('storeItem.deleteBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.deleteMany(ids).subscribe({
        next: () => { this.selectedIds.set(new Set()); this.load(); }
      });
    });
  }

  // ── Import / Export ───────────────────────────────────────────────────────
  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'store-items-template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { }
    });
  }

  exportList(): void {
    this.service.exportList().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'store-items.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importing.set(true);
    this.importError.set(null);
    this.importSuccess.set(false);
    this.service.importExcel(file).subscribe({
      next: () => {
        this.importing.set(false);
        this.importSuccess.set(true);
        this.load();
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.importing.set(false);
        this.importError.set(this.translate.translate('storeItem.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
