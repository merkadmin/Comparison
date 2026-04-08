import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { StoreVariantOrderService } from '../../../core/services/store-variant-order.service';
import { StoreService } from '../../../core/services/store.service';
import { StoreVariantOrder } from '../../../core/models/store-variant-order.model';
import { Store } from '../../../core/models/store.model';
import { VariantType, ProductItemVariant } from '../../../core/models/product-item-variant.model';
import { ProductItemVariantService } from '../../../core/services/product-item-variant.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActionMenuItem } from '../../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { buildRowMenuItems } from '../../../shared/helpers/row-menu.helper';
import { CommonListHeaderActions } from '../../../shared/components/common-list-header-actions/common-list-header-actions';
import { GridColumns } from '../../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';
import { computedColClass } from '../../../shared/helpers/grid-columns.helper';
import { StoreVariantOrderListOperationComponent } from './store-variant-order-list-operation/store-variant-order-list-operation.component';
import { IconConfigService } from '../../../core/services/icon-config.service';

@Component({
  selector: 'app-store-variant-order-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe,
    CommonListHeaderActions,
    StoreVariantOrderListOperationComponent,
  ],
  templateUrl: './store-variant-order-list.component.html',
  styleUrl: './store-variant-order-list.component.less',
})
export class StoreVariantOrderListComponent implements OnInit {
  auth            = inject(AuthService);
  private service = inject(StoreVariantOrderService);
  private storeSvc    = inject(StoreService);
  private variantSvc  = inject(ProductItemVariantService);
  private translate   = inject(TranslateService);
  private toast      = inject(ToastService);
  private iconConfig = inject(IconConfigService);

  addIcon    = this.iconConfig.iconSignal('global.add',    'plus');
  editIcon   = this.iconConfig.iconSignal('global.edit',   'pencil');
  deleteIcon = this.iconConfig.iconSignal('global.delete', 'trash');

  orders          = signal<StoreVariantOrder[]>([]);
  stores          = signal<Store[]>([]);
  variants        = signal<ProductItemVariant[]>([]);
  loading         = signal(false);
  error           = signal<string | null>(null);
  searchQuery     = signal('');
  selectedIds     = signal<Set<number>>(new Set());
  selectedStoreId = signal<number | null>(null);

  viewMode   = signal<'list' | 'cards'>('list');
  colsPerRow = signal<GridColumns>(5);
  colClass   = computedColClass(this.colsPerRow);

  importing     = signal(false);
  importError   = signal<string | null>(null);
  importSuccess = signal(false);

  editingId  = signal<number | null>(null);
  isCreating = signal(false);
  saving     = signal(false);
  editDraft: StoreVariantOrder = { storeId: 0, variantTypeId: 'Color', orderIndex: 0 };

  private storeMap = computed(() => new Map(this.stores().map(s => [s.id!, s])));

  getStoreName(id: number): string { return this.storeMap().get(id)?.name ?? String(id); }

  getTypeColor(type: VariantType): string | null {
    return this.variants().find(v => v.variantTypeId === type && !!v.color)?.color ?? null;
  }

  filteredOrders = computed<StoreVariantOrder[]>(() => {
    const q       = this.searchQuery().trim().toLowerCase();
    const storeId = this.selectedStoreId();
    return this.orders()
      .filter(o => storeId === null || o.storeId === storeId)
      .filter(o => {
        if (!q) return true;
        return this.getStoreName(o.storeId).toLowerCase().includes(q)
          || String(o.variantTypeId).toLowerCase().includes(q);
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  });

  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList',     iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'storeVariantOrder.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() },
  ];

  getRowMenuItems(id: number): ActionMenuItem[] {
    return buildRowMenuItems(() => this.delete(id));
  }

  openCreate(): void {
    this.editDraft = { storeId: 0, variantTypeId: 'Color', orderIndex: this.orders().length };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(o: StoreVariantOrder): void {
    this.editDraft = { ...o };
    this.isCreating.set(false);
    this.editingId.set(o.id!);
  }

  closeEdit(): void { this.editingId.set(null); this.isCreating.set(false); }

  saveEdit(): void {
    this.saving.set(true);
    const onSuccess = () => {
      this.saving.set(false);
      this.toast.success(this.translate.translate('storeVariantOrder.saveSuccess'));
      this.load();
      this.closeEdit();
    };
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('storeVariantOrder.saveError')); };
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
        this.toast.success(this.translate.translate('storeVariantOrder.saveSuccess'));
        this.load();
        this.editDraft = { storeId: 0, variantTypeId: 'Color', orderIndex: this.orders().length + 1 };
      },
      error: () => { this.saving.set(false); this.toast.error(this.translate.translate('storeVariantOrder.saveError')); },
    });
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.filteredOrders();
    return all.length > 0 && all.every(o => this.selectedIds().has(o.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds()); s.has(id) ? s.delete(id) : s.add(id); this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.filteredOrders().map(o => o.id!))
    );
  }

  ngOnInit(): void {
    this.load();
    this.storeSvc.getAll().subscribe({ next: d => this.stores.set(d), error: () => {} });
    this.variantSvc.getAll().subscribe({ next: d => this.variants.set(d), error: () => {} });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: d => { this.orders.set(d); this.loading.set(false); },
      error: () => { this.error.set('Failed to load.'); this.loading.set(false); },
    });
  }

  delete(id: number): void {
    Swal.fire({
      title: this.translate.translate('storeVariantOrder.deleteConfirm'),
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
        },
      });
    });
  }

  setActive(id: number, isActive: boolean): void {
    if (!isActive) {
      Swal.fire({
        title: this.translate.translate('storeVariantOrder.deactivateConfirm'),
        text: this.translate.translate('storeVariantOrder.deactivateConfirmText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f39c12',
        confirmButtonText: this.translate.translate('common.deactivate'),
        cancelButtonText: this.translate.translate('common.cancel'),
      }).then(result => {
        if (!result.isConfirmed) return;
        this.service.setActive(id, isActive).subscribe({
          next: () => this.orders.update(list => list.map(o => o.id === id ? { ...o, isActive } : o)),
        });
      });
    } else {
      this.service.setActive(id, isActive).subscribe({
        next: () => this.orders.update(list => list.map(o => o.id === id ? { ...o, isActive } : o)),
      });
    }
  }

  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'store-variant-orders-template.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }

  exportList(): void {
    this.service.exportList().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'store-variant-orders.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {},
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
        this.importError.set(this.translate.translate('storeVariantOrder.importError'));
        (event.target as HTMLInputElement).value = '';
      },
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('storeVariantOrder.deleteBulkConfirm'),
      text: this.translate.translate('storeVariantOrder.deleteBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.deleteMany(ids).subscribe({ next: () => { this.selectedIds.set(new Set()); this.load(); } });
    });
  }
}
