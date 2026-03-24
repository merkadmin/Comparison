import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { ProductItemVariantMapService } from '../../core/services/product-item-variant-map.service';
import { ItemService } from '../../core/services/item.service';
import { ProductItemVariantService } from '../../core/services/product-item-variant.service';
import { ProductItemVariantMap } from '../../core/models/product-item-variant-map.model';
import { Item } from '../../core/models/item.model';
import { ProductItemVariant } from '../../core/models/product-item-variant.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { ToastService } from '../../core/services/toast.service';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonListHeaderActions } from '../../shared/components/common-list-header-actions/common-list-header-actions';
import { GridColumns } from '../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';
import { computedColClass } from '../../shared/helpers/grid-columns.helper';
import { ItemVariantMapOperationComponent } from './item-variant-map-operation/item-variant-map-operation.component';
import { IconConfigService } from '../../core/services/icon-config.service';

@Component({
  selector: 'app-item-variant-map-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe,
    CommonDropDownMenuActionButton, CommonListHeaderActions,
    ItemVariantMapOperationComponent,
  ],
  templateUrl: './item-variant-map-list.component.html',
  styleUrl: './item-variant-map-list.component.less',
})
export class ItemVariantMapListComponent implements OnInit {
  auth              = inject(AuthService);
  private service   = inject(ProductItemVariantMapService);
  private itemSvc   = inject(ItemService);
  private variantSvc = inject(ProductItemVariantService);
  private translate  = inject(TranslateService);
  private toast      = inject(ToastService);
  private iconConfig = inject(IconConfigService);

  addIcon    = this.iconConfig.iconSignal('global.add',    'plus');
  editIcon   = this.iconConfig.iconSignal('global.edit',   'pencil');
  deleteIcon = this.iconConfig.iconSignal('global.delete', 'trash');

  maps          = signal<ProductItemVariantMap[]>([]);
  items         = signal<Item[]>([]);
  variants      = signal<ProductItemVariant[]>([]);
  loading       = signal(false);
  error         = signal<string | null>(null);
  searchQuery   = signal('');
  selectedIds   = signal<Set<number>>(new Set());
  viewMode      = signal<'list' | 'cards'>('list');
  colsPerRow    = signal<GridColumns>(4);
  colClass      = computedColClass(this.colsPerRow);
  importing     = signal(false);
  importError   = signal<string | null>(null);
  importSuccess = signal(false);

  editingId      = signal<number | null>(null);
  isCreating     = signal(false);
  saving         = signal(false);
  selectedItemId = signal<number | null>(null);
  editDraft: ProductItemVariantMap = { productItemId: 0, variantId: 0 };

  private itemMap    = computed(() => new Map(this.items().map(i => [i.id!, i])));
  private variantMap = computed(() => new Map(this.variants().map(v => [v.id!, v])));

  getItemName(id: number): string { return this.itemMap().get(id)?.name ?? String(id); }
  getVariant(id: number): ProductItemVariant | undefined { return this.variantMap().get(id); }

  filteredMaps = computed<ProductItemVariantMap[]>(() => {
    const q      = this.searchQuery().trim().toLowerCase();
    const itemId = this.selectedItemId();
    return this.maps().filter(m => {
      if (itemId !== null && m.productItemId !== itemId) return false;
      if (!q) return true;
      const item = this.getItemName(m.productItemId).toLowerCase();
      const v = this.getVariant(m.variantId);
      const vStr = v ? `${v.variantTypeId} ${v.variantValue} ${v.abbreviation ?? ''}`.toLowerCase() : '';
      return item.includes(q) || vStr.includes(q);
    });
  });

  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList',     iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'itemVariantMap.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() },
  ];

  getRowMenuItems(id: number): ActionMenuItem[] {
    return [
      { labelKey: 'common.delete', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.delete(id) },
    ];
  }

  openCreate(): void {
    this.editDraft = { productItemId: 0, variantId: 0 };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(m: ProductItemVariantMap): void {
    this.editDraft = { ...m };
    this.isCreating.set(false);
    this.editingId.set(m.id!);
  }

  closeEdit(): void { this.editingId.set(null); this.isCreating.set(false); }

  saveEdit(): void {
    this.saving.set(true);
    const onSuccess = () => {
      this.saving.set(false);
      this.toast.success(this.translate.translate('itemVariantMap.saveSuccess'));
      this.load();
      this.closeEdit();
    };
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('itemVariantMap.saveError')); };
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
        this.toast.success(this.translate.translate('itemVariantMap.saveSuccess'));
        this.load();
        this.editDraft = { productItemId: 0, variantId: 0 };
      },
      error: () => { this.saving.set(false); this.toast.error(this.translate.translate('itemVariantMap.saveError')); },
    });
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.filteredMaps();
    return all.length > 0 && all.every(m => this.selectedIds().has(m.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds()); s.has(id) ? s.delete(id) : s.add(id); this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.filteredMaps().map(m => m.id!))
    );
  }

  ngOnInit(): void {
    this.load();
    this.itemSvc.getAll().subscribe({ next: d => this.items.set(d), error: () => {} });
    this.variantSvc.getAll().subscribe({ next: d => this.variants.set(d), error: () => {} });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: d => { this.maps.set(d); this.loading.set(false); },
      error: () => { this.error.set('Failed to load.'); this.loading.set(false); },
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this mapping?')) return;
    this.service.delete(id).subscribe({
      next: () => {
        const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s);
        this.load();
      },
    });
  }

  setActive(id: number, isActive: boolean): void {
    this.service.setActive(id, isActive).subscribe({
      next: () => this.maps.update(list => list.map(m => m.id === id ? { ...m, isActive } : m)),
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('itemVariantMap.deleteBulkConfirm'),
      text: this.translate.translate('itemVariantMap.deleteBulkText').replace('{count}', String(ids.length)),
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

  deactivateSelected(): void {
    const ids = [...this.selectedIds()];
    this.service.setActiveMany(ids, false).subscribe({
      next: () => {
        this.maps.update(list => list.map(m => ids.includes(m.id!) ? { ...m, isActive: false } : m));
        this.selectedIds.set(new Set());
      },
    });
  }

  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'item-variant-map-template.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }

  exportList(): void {
    this.service.exportList().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'item-variant-map.xlsx'; a.click();
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
        this.importError.set(this.translate.translate('itemVariantMap.importError'));
        (event.target as HTMLInputElement).value = '';
      },
    });
  }
}
