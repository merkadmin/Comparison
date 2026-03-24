import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { Store, StoreType } from '../../core/models/store.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonListHeaderActions } from '../../shared/components/common-list-header-actions/common-list-header-actions';
import { StoreListOperationComponent } from './store-list-operation/store-list-operation.component';
import { GridColumns } from '../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';
import { ViewMode } from '../../shared/components/commonActions/common-view-mode/common-view-mode';
import { computedColClass } from '../../shared/helpers/grid-columns.helper';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonDropDownMenuActionButton, CommonListHeaderActions, StoreListOperationComponent],
  templateUrl: './store-list.component.html',
  styleUrl: './store-list.component.less',
})
export class StoreListComponent implements OnInit {
  auth = inject(AuthService);
  private service = inject(StoreService);
  private translate = inject(TranslateService);

  readonly storeTypes: StoreType[] = [StoreType.Online, StoreType.Physical];

  // ── View ──────────────────────────────────────────────────────────────────
  viewMode = signal<ViewMode>('cards');
  colsPerRow = signal<GridColumns>(5);
  colClass = computedColClass(this.colsPerRow);

  // ── Edit / Create ─────────────────────────────────────────────────────────
  editingId = signal<number | null>(null);
  isCreating = signal(false);
  editDraft: Store = { name: '', type: StoreType.Online, country: '' };

  // ── Data ──────────────────────────────────────────────────────────────────
  stores = signal<Store[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  importing = signal(false);
  importError = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds = signal<Set<number>>(new Set());

  filteredStores = computed<Store[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return q ? this.stores().filter(s => s.name.toLowerCase().includes(q)) : this.stores();
  });

  // ── Bulk actions ──────────────────────────────────────────────────────────
  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'store.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  openCreate(): void {
    this.editDraft = { name: '', type: StoreType.Online, country: '' };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(store: Store): void {
    this.editDraft = { ...store };
    this.isCreating.set(false);
    this.editingId.set(store.id!);
  }

  closeEdit(): void { this.editingId.set(null); }

  saveEdit(): void {
    if (this.isCreating()) {
      this.service.create(this.editDraft).subscribe({ next: () => { this.load(); this.closeEdit(); } });
    } else {
      const id = this.editingId();
      if (id === null) return;
      this.service.update(id, this.editDraft).subscribe({ next: () => { this.load(); this.closeEdit(); } });
    }
  }

  // ── Selection ─────────────────────────────────────────────────────────────
  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.filteredStores();
    return all.length > 0 && all.every(s => this.selectedIds().has(s.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.filteredStores().map(s => s.id!))
    );
  }

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
      next: data => { this.stores.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load stores.'); this.loading.set(false); }
    });
  }

  // ── Single row actions ────────────────────────────────────────────────────
  setActive(id: number, isActive: boolean): void {
    this.service.setActive(id, isActive).subscribe({
      next: () => this.stores.update(list => list.map(s => s.id === id ? { ...s, isActive } : s))
    });
  }

  delete(id: number): void {
    Swal.fire({
      title: this.translate.translate('store.deleteConfirm'),
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
      title: this.translate.translate('store.deactivateBulkConfirm'),
      text: this.translate.translate('store.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.setActiveMany(ids, false).subscribe({
        next: () => {
          this.stores.update(list => list.map(s => ids.includes(s.id!) ? { ...s, isActive: false } : s));
          this.selectedIds.set(new Set());
        }
      });
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('store.deleteBulkConfirm'),
      text: this.translate.translate('store.deleteBulkText').replace('{count}', String(ids.length)),
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
        a.download = 'stores-template.xlsx';
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
        a.download = 'stores.xlsx';
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
        this.importError.set(this.translate.translate('store.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
