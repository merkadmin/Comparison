import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { ProductTypeService } from '../../../core/services/product-type.service';
import { ProductType } from '../../../core/models/product-type.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActionMenuItem } from '../../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { buildRowMenuItems } from '../../../shared/helpers/row-menu.helper';
import { EntityListHeaderActionsComponent } from '../../../shared/components/entity-list-header-actions/entity-list-header-actions.component';
import { ProductTypeListOperationComponent } from './product-type-list-operation/product-type-list-operation.component';

@Component({
  selector: 'app-product-type-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, EntityListHeaderActionsComponent, ProductTypeListOperationComponent],
  templateUrl: './product-type-list.component.html',
  styleUrl: './product-type-list.component.less',
})
export class ProductTypeListComponent implements OnInit {

  @ViewChild(ProductTypeListOperationComponent) operationComp?: ProductTypeListOperationComponent;

  auth = inject(AuthService);
  private service = inject(ProductTypeService);
  private translate = inject(TranslateService);
  private toast = inject(ToastService);

  // ── Modal state ──────────────────────────────────────────────────────────

  editingId = signal<number | null>(null);
  isCreating = signal(false);
  saving = signal(false);
  editDraft: ProductType = { type: '' };

  // ── List state ───────────────────────────────────────────────────────────

  productTypes = signal<ProductType[]>([]);
  searchTerm = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  importing = signal(false);
  importError = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds = signal<Set<number>>(new Set());

  visibleTypes = computed<ProductType[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.productTypes();
    return term ? list.filter(t => t.type.toLowerCase().includes(term)) : list;
  });

  // ── Menu items ───────────────────────────────────────────────────────────

  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList',     iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'productType.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => {
        this.productTypes.set([...data].sort((a, b) => a.type.localeCompare(b.type)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load product types.');
        this.loading.set(false);
      }
    });
  }

  // ── Modal open / close ───────────────────────────────────────────────────

  openCreate(): void {
    this.editDraft = { type: '' };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(pt: ProductType): void {
    this.editDraft = { ...pt };
    this.isCreating.set(false);
    this.editingId.set(pt.id!);
  }

  closeEdit(): void {
    this.operationComp?.removePendingFile();
    this.editingId.set(null);
    this.isCreating.set(false);
  }

  removeImage(): void {
    const id = this.editingId();
    if (id) this.service.deleteImage(id).subscribe({ error: () => {} });
    this.editDraft = { ...this.editDraft, typeImage: undefined };
  }

  navigateType(dir: 1 | -1): void {
    const all = this.productTypes();
    const idx = all.findIndex(t => t.id === this.editingId());
    if (idx === -1) return;
    const next = all[idx + dir];
    if (next) this.openEdit(next);
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  saveEdit(): void {
    this.saving.set(true);
    const creating = this.isCreating();
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('productType.saveError')); };

    const finalize = (savedId: number) => {
      const pendingFile = this.operationComp?.pendingFile ?? null;
      if (pendingFile) {
        this.service.uploadImage(savedId, pendingFile).subscribe({
          next: relativePath => {
            this.service.update(savedId, { ...this.editDraft, id: savedId, typeImage: relativePath }).subscribe({
              next: () => {
                this.saving.set(false);
                this.toast.success(this.translate.translate('productType.saveSuccess'));
                this.operationComp?.removePendingFile();
                this.load();
                if (creating) this.closeEdit();
              },
              error: onError,
            });
          },
          error: onError,
        });
      } else {
        this.saving.set(false);
        this.toast.success(this.translate.translate('productType.saveSuccess'));
        this.load();
        if (creating) this.closeEdit();
      }
    };

    if (creating) {
      this.service.create(this.editDraft).subscribe({
        next: created => finalize(created.id!),
        error: onError,
      });
    } else {
      const id = this.editingId()!;
      this.service.update(id, this.editDraft).subscribe({
        next: () => finalize(id),
        error: onError,
      });
    }
  }

  saveEditAndNew(): void {
    if (!this.isCreating()) return;
    this.saving.set(true);
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('productType.saveError')); };

    this.service.create(this.editDraft).subscribe({
      next: created => {
        const savedId = created.id!;
        const pendingFile = this.operationComp?.pendingFile ?? null;
        if (pendingFile) {
          this.service.uploadImage(savedId, pendingFile).subscribe({
            next: relativePath => {
              this.service.update(savedId, { ...this.editDraft, id: savedId, typeImage: relativePath }).subscribe({
                next: () => {
                  this.saving.set(false);
                  this.toast.success(this.translate.translate('productType.saveSuccess'));
                  this.operationComp?.removePendingFile();
                  this.load();
                  this.editDraft = { type: '' };
                },
                error: onError,
              });
            },
            error: onError,
          });
        } else {
          this.saving.set(false);
          this.toast.success(this.translate.translate('productType.saveSuccess'));
          this.load();
          this.editDraft = { type: '' };
        }
      },
      error: onError,
    });
  }

  // ── Row actions ──────────────────────────────────────────────────────────

  getRowMenuItems(id: number): ActionMenuItem[] {
    return buildRowMenuItems(() => this.delete(id));
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }

  isAllSelected(): boolean {
    const visible = this.visibleTypes();
    return visible.length > 0 && visible.every(t => this.selectedIds().has(t.id!));
  }

  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }

  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.visibleTypes().map(t => t.id!))
    );
  }

  delete(id: number): void {
    Swal.fire({
      title: this.translate.translate('productType.deleteConfirm'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.delete(id).subscribe({
        next: () => {
          const s = new Set(this.selectedIds());
          s.delete(id);
          this.selectedIds.set(s);
          this.load();
        }
      });
    });
  }

  setActive(id: number, isActive: boolean): void {
    if (!isActive) {
      Swal.fire({
        title: this.translate.translate('productType.deactivateConfirm'),
        text: this.translate.translate('productType.deactivateConfirmText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f39c12',
        confirmButtonText: this.translate.translate('common.deactivate'),
        cancelButtonText: this.translate.translate('common.cancel'),
      }).then(result => {
        if (!result.isConfirmed) return;
        this.service.setActive(id, isActive).subscribe({
          next: () => this.productTypes.update(list => list.map(t => t.id === id ? { ...t, isActive } : t))
        });
      });
    } else {
      this.service.setActive(id, isActive).subscribe({
        next: () => this.productTypes.update(list => list.map(t => t.id === id ? { ...t, isActive } : t))
      });
    }
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('productType.deleteBulkText').replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('productType.deleteBulkConfirm'),
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
      title: this.translate.translate('productType.deactivateBulkConfirm'),
      text: this.translate.translate('productType.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.setActiveMany(ids, false).subscribe({
        next: () => {
          this.productTypes.update(list => list.map(t => ids.includes(t.id!) ? { ...t, isActive: false } : t));
          this.selectedIds.set(new Set());
        }
      });
    });
  }

  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'product-types-template.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }

  exportList(): void {
    this.service.exportList().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'product-types.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
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
        this.importError.set(this.translate.translate('productType.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
