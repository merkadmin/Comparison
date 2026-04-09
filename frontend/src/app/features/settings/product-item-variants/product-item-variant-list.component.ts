import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { ProductItemVariantService } from '../../../core/services/product-item-variant.service';
import { ProductItemVariant, VariantType, VARIANT_TYPES } from '../../../core/models/product-item-variant.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActionMenuItem } from '../../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { buildRowMenuItems } from '../../../shared/helpers/row-menu.helper';
import { EntityListHeaderActionsComponent } from '../../../shared/components/entity-list-header-actions/entity-list-header-actions.component';
import { GridColumns } from '../../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';
import { computedColClass } from '../../../shared/helpers/grid-columns.helper';
import { ProductItemVariantListOperationComponent } from './product-item-variant-list-operation/product-item-variant-list-operation.component';
import { IconConfigService } from '../../../core/services/icon-config.service';

@Component({
  selector: 'app-product-item-variant-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe,
    EntityListHeaderActionsComponent,
    ProductItemVariantListOperationComponent,
  ],
  templateUrl: './product-item-variant-list.component.html',
  styleUrl: './product-item-variant-list.component.less',
})
export class ProductItemVariantListComponent implements OnInit {
  auth             = inject(AuthService);
  private service  = inject(ProductItemVariantService);
private translate = inject(TranslateService);
  private toast    = inject(ToastService);
  private iconConfig = inject(IconConfigService);

  addIcon    = this.iconConfig.iconSignal('global.add',    'plus');
  editIcon   = this.iconConfig.iconSignal('global.edit',   'pencil');
  deleteIcon = this.iconConfig.iconSignal('global.delete', 'trash');

  variants      = signal<ProductItemVariant[]>([]);
  loading       = signal(false);
  error         = signal<string | null>(null);
  searchQuery   = signal('');
  importing     = signal(false);
  importError   = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds   = signal<Set<number>>(new Set());
  viewMode      = signal<'list' | 'cards'>('list');
  colsPerRow    = signal<GridColumns>(4);
  colClass      = computedColClass(this.colsPerRow);

  editingId      = signal<number | null>(null);
  isCreating     = signal(false);
  saving         = signal(false);
  selectedType   = signal<VariantType | null>(null);
  readonly variantTypes = VARIANT_TYPES;
  editDraft: ProductItemVariant = { variantTypeId: 'Color', variantValue: '' };

  typeCount = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const v of this.variants()) {
      counts[v.variantTypeId] = (counts[v.variantTypeId] ?? 0) + 1;
    }
    return counts;
  });

  filteredVariants = computed<ProductItemVariant[]>(() => {
    const q    = this.searchQuery().trim().toLowerCase();
    const type = this.selectedType();
    return this.variants().filter(v => {
      if (type && v.variantTypeId !== type) return false;
      if (!q) return true;
      return v.variantTypeId.toLowerCase().includes(q) ||
             v.variantValue.toLowerCase().includes(q) ||
             (v.abbreviation ?? '').toLowerCase().includes(q);
    });
  });

  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList',     iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'variant.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() },
  ];

  getRowMenuItems(id: number): ActionMenuItem[] {
    return buildRowMenuItems(() => this.delete(id));
  }

  openCreate(): void {
    this.editDraft = { variantTypeId: 'Color', variantValue: '' };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(v: ProductItemVariant): void {
    this.editDraft = { ...v };
    this.isCreating.set(false);
    this.editingId.set(v.id!);
  }

  closeEdit(): void { this.editingId.set(null); this.isCreating.set(false); }

  saveEdit(): void {
    this.saving.set(true);
    const onSuccess = () => {
      this.saving.set(false);
      this.toast.success(this.translate.translate('variant.saveSuccess'));
      this.load();
      this.closeEdit();
    };
    const onError = () => {
      this.saving.set(false);
      this.toast.error(this.translate.translate('variant.saveError'));
    };

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
        this.toast.success(this.translate.translate('variant.saveSuccess'));
        this.load();
        this.editDraft = { variantTypeId: 'Color', variantValue: '' };
      },
      error: () => {
        this.saving.set(false);
        this.toast.error(this.translate.translate('variant.saveError'));
      },
    });
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.filteredVariants();
    return all.length > 0 && all.every(v => this.selectedIds().has(v.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.filteredVariants().map(v => v.id!))
    );
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.variants.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load variants.'); this.loading.set(false); },
    });
  }

  delete(id: number): void {
    Swal.fire({
      title: this.translate.translate('variant.deleteConfirm'),
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
        title: this.translate.translate('variant.deactivateConfirm'),
        text: this.translate.translate('variant.deactivateConfirmText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f39c12',
        confirmButtonText: this.translate.translate('common.deactivate'),
        cancelButtonText: this.translate.translate('common.cancel'),
      }).then(result => {
        if (!result.isConfirmed) return;
        this.service.setActive(id, isActive).subscribe({
          next: () => this.variants.update(list => list.map(v => v.id === id ? { ...v, isActive } : v)),
        });
      });
    } else {
      this.service.setActive(id, isActive).subscribe({
        next: () => this.variants.update(list => list.map(v => v.id === id ? { ...v, isActive } : v)),
      });
    }
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('variant.deleteBulkText').replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('variant.deleteBulkConfirm'),
      text,
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
    Swal.fire({
      title: this.translate.translate('variant.deactivateBulkConfirm'),
      text: this.translate.translate('variant.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.setActiveMany(ids, false).subscribe({
        next: () => {
          this.variants.update(list => list.map(v => ids.includes(v.id!) ? { ...v, isActive: false } : v));
          this.selectedIds.set(new Set());
        },
      });
    });
  }

  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'product-item-variants-template.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }

  exportList(): void {
    this.service.exportList().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'product-item-variants.xlsx'; a.click();
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
        this.importError.set(this.translate.translate('variant.importError'));
        (event.target as HTMLInputElement).value = '';
      },
    });
  }
}
