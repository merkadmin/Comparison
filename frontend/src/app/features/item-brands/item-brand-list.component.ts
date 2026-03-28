import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemBrand } from '../../core/models/item-brand.model';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { ToastService } from '../../core/services/toast.service';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonListHeaderActions } from '../../shared/components/common-list-header-actions/common-list-header-actions';
import { ItemBrandListOperationComponent } from './item-brand-list-operation/item-brand-list-operation.component';

@Component({
  selector: 'app-item-brand-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonDropDownMenuActionButton, CommonListHeaderActions, ItemBrandListOperationComponent],
  templateUrl: './item-brand-list.component.html',
  styleUrl: './item-brand-list.component.less',
})
export class ItemBrandListComponent implements OnInit {
  @ViewChild('operationComp') operationComp?: ItemBrandListOperationComponent;
  auth              = inject(AuthService);
  private service   = inject(ItemBrandService);
  private translate = inject(TranslateService);
  private toast     = inject(ToastService);

  editingId  = signal<number | null>(null);
  isCreating = signal(false);
  saving     = signal(false);
  editDraft: ItemBrand = { name: '' };

  openCreate(): void {
    this.editDraft = { name: '' };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(brand: ItemBrand): void {
    this.editDraft = { ...brand };
    this.isCreating.set(false);
    this.editingId.set(brand.id!);
  }

  closeEdit(): void {
    this.editingId.set(null);
    this.isCreating.set(false);
  }

  saveEdit(): void {
    this.saving.set(true);
    const pendingFile = this.operationComp?.pendingFile ?? null;
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('brand.saveError')); };

    const finalize = (savedId: number, savedBrand: ItemBrand) => {
      if (!pendingFile) {
        this.saving.set(false);
        this.toast.success(this.translate.translate('brand.saveSuccess'));
        this.load();
        this.closeEdit();
        return;
      }
      this.service.uploadImage(savedId, pendingFile).subscribe({
        next: relativePath => {
          const updated = { ...savedBrand, brandImage: relativePath };
          this.service.update(savedId, updated).subscribe({
            next: () => {
              this.saving.set(false);
              this.operationComp?.clearPending();
              this.toast.success(this.translate.translate('brand.saveSuccess'));
              this.load();
              this.closeEdit();
            },
            error: onError,
          });
        },
        error: onError,
      });
    };

    if (this.isCreating()) {
      this.service.create(this.editDraft).subscribe({ next: saved => finalize(saved.id!, saved), error: onError });
    } else {
      const id = this.editingId()!;
      this.service.update(id, this.editDraft).subscribe({ next: () => finalize(id, this.editDraft), error: onError });
    }
  }

  removeImage(): void {
    const id = this.editingId();
    if (id) this.service.deleteImage(id).subscribe({ error: () => {} });
    this.editDraft = { ...this.editDraft, brandImage: undefined };
  }

  saveEditAndNew(): void {
    if (!this.isCreating()) return;
    this.saving.set(true);
    this.service.create(this.editDraft).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.translate.translate('brand.saveSuccess'));
        this.load();
        this.editDraft = { name: '' };
      },
      error: () => { this.saving.set(false); this.toast.error(this.translate.translate('brand.saveError')); },
    });
  }

  brands        = signal<ItemBrand[]>([]);
  loading       = signal(false);
  error         = signal<string | null>(null);
  importing     = signal(false);
  importError   = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds   = signal<Set<number>>(new Set());

  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'brand.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  getRowMenuItems(id: number): ActionMenuItem[] {
    return [
      { labelKey: 'common.delete', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.delete(id) }
    ];
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.brands();
    return all.length > 0 && all.every(b => this.selectedIds().has(b.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.brands().map(b => b.id!))
    );
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.brands.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load brands.'); this.loading.set(false); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this brand?')) return;
    this.service.delete(id).subscribe({ next: () => { const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s); this.load(); } });
  }

  setActive(id: number, isActive: boolean): void {
    this.service.setActive(id, isActive).subscribe({
      next: () => this.brands.update(list => list.map(b => b.id === id ? { ...b, isActive } : b))
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('brand.deleteBulkText').replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('brand.deleteBulkConfirm'),
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
      title: this.translate.translate('brand.deactivateBulkConfirm'),
      text: this.translate.translate('brand.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.setActiveMany(ids, false).subscribe({
        next: () => {
          this.brands.update(list => list.map(b => ids.includes(b.id!) ? { ...b, isActive: false } : b));
          this.selectedIds.set(new Set());
        }
      });
    });
  }

  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'item-brands-template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }

  exportList(): void {
    this.service.exportList().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'item-brands.xlsx';
        a.click();
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
        this.importError.set(this.translate.translate('brand.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
