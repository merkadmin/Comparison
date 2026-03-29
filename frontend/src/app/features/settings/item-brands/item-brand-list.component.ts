import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { ItemBrandService } from '../../../core/services/item-brand.service';
import { ItemBrand } from '../../../core/models/item-brand.model';

import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActionMenuItem } from '../../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { buildRowMenuItems } from '../../../shared/helpers/row-menu.helper';
import { CommonListHeaderActions } from '../../../shared/components/common-list-header-actions/common-list-header-actions';
import { ItemBrandListOperationComponent } from './item-brand-list-operation/item-brand-list-operation.component';

@Component({
  selector: 'app-item-brand-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonListHeaderActions, ItemBrandListOperationComponent],
  templateUrl: './item-brand-list.component.html',
  styleUrl: './item-brand-list.component.less',
})
export class ItemBrandListComponent implements OnInit {

  /** Reference to the create/edit modal child component.
   *  Used to read `pendingFile` (staged image) and call `clearPending()` after a save. */
  @ViewChild('operationComp') operationComp?: ItemBrandListOperationComponent;

  /** Exposes auth state to the template (e.g. hiding admin-only buttons). */
  auth = inject(AuthService);

  /** Handles all HTTP calls for brands: CRUD, image upload/delete, Excel import/export. */
  private service = inject(ItemBrandService);

  /** Provides `translate(key)` for resolving i18n strings at runtime (used in toasts and Swal dialogs). */
  private translate = inject(TranslateService);

  /** Shows brief success/error notifications at the top of the screen. */
  private toast = inject(ToastService);

  // ── Modal state ──────────────────────────────────────────────────────────

  /** ID of the brand currently open in the edit modal.
   *  `null`  = modal is closed.
   *  `0`     = modal is open in create mode (no real ID yet). */
  editingId = signal<number | null>(null);

  /** `true` while the modal is open in "Add new brand" mode. */
  isCreating = signal(false);

  /** `true` while an HTTP save (create / update / image upload) is in progress.
   *  Disables the Save button and shows a spinner to prevent double-submits. */
  saving = signal(false);

  /** Mutable copy of the brand being created or edited.
   *  Bound directly to the modal form via `[(ngModel)]`. */
  editDraft: ItemBrand = { name: '' };

  // ── List state ───────────────────────────────────────────────────────────

  /** The full sorted brand list displayed in the table. */
  brands = signal<ItemBrand[]>([]);

  /** `true` while the initial (or reload) fetch is in progress. */
  loading = signal(false);

  /** Non-null when the fetch fails; displayed as an inline error banner. */
  error = signal<string | null>(null);

  /** `true` while an Excel import upload is in progress. */
  importing = signal(false);

  /** Non-null when the import fails; shown in the header import feedback area. */
  importError = signal<string | null>(null);

  /** `true` for one render cycle after a successful import, triggering a success banner. */
  importSuccess = signal(false);

  /** IDs of rows currently checked in the table; drives bulk-action buttons. */
  selectedIds = signal<Set<number>>(new Set());

  // ── Menu item definitions ────────────────────────────────────────────────

  /** Drop-down items for the import/export button group in the list header. */
  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  /** Drop-down items shown when one or more rows are selected (bulk actions). */
  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'brand.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /** Angular lifecycle hook — triggers the initial data load when the component mounts. */
  ngOnInit(): void { this.load(); }

  /**
   * Fetches all brands from the API, sorts them alphabetically by name,
   * and updates the `brands` signal. Resets any previous error state.
   */
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { 
        this.brands.set([...data].sort((a, b) => a.name.localeCompare(b.name))); 
        this.loading.set(false); 
      },
      error: () => { 
        this.error.set('Failed to load brands.'); this.loading.set(false); 
      }
    });
  }

  // ── Modal open / close ───────────────────────────────────────────────────

  /** Opens the modal in "create" mode with a blank draft. */
  openCreate(): void {
    this.editDraft = { name: '' };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  /**
   * Opens the modal in "edit" mode, pre-filling the form with the selected brand.
   * A shallow copy is made so the original list item is not mutated before saving.
   * @param brand - The brand row that was clicked for editing.
   */
  openEdit(brand: ItemBrand): void {
    this.editDraft = { ...brand };
    this.isCreating.set(false);
    this.editingId.set(brand.id!);
  }

  /** Closes the modal and resets both `editingId` and `isCreating` to their idle state. */
  closeEdit(): void {
    this.editingId.set(null);
    this.isCreating.set(false);
  }

  /**
   * Navigates to the previous (`-1`) or next (`1`) brand in the sorted list
   * while the edit modal is open, without closing and reopening it.
   * If already at the first or last brand the call is a no-op.
   * @param dir - Direction: `1` = next brand, `-1` = previous brand.
   */
  navigateBrand(dir: 1 | -1): void {
    const all = this.brands();
    const idx = all.findIndex(b => b.id === this.editingId());
    if (idx === -1) return;
    const next = all[idx + dir];
    if (next) this.openEdit(next);
  }

  /**
   * Removes the uploaded brand image both from the file-storage server and from
   * the local `editDraft`, so the UI reverts to the letter-placeholder fallback.
   * The DELETE call is fire-and-forget; a failure does not block the UI update.
   */
  removeImage(): void {
    const id = this.editingId();
    if (id) this.service.deleteImage(id).subscribe({ error: () => { } });
    this.editDraft = { ...this.editDraft, brandImage: undefined };
  }

  /**
   * Saves the current draft (create or update) and optionally uploads a pending image.
   *
   * Flow:
   * 1. Calls `create` or `update` depending on `isCreating`.
   * 2. If the modal has a staged image file (`pendingFile`), uploads it to the file-storage
   *    server and then calls `update` a second time to persist the returned relative path.
   * 3. On success: shows a toast, reloads the list, clears the pending image state.
   *    - In create mode: also closes the modal.
   *    - In edit mode: keeps the modal open so the user can continue editing.
   * 4. On any error: stops the spinner and shows an error toast.
   */
  saveEdit(): void {
    this.saving.set(true);
    const pendingFile = this.operationComp?.pendingFile ?? null;
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('brand.saveError')); };

    const creating = this.isCreating();

    /**
     * Called after the initial create/update succeeds.
     * If there is a pending image it uploads it and patches the record;
     * otherwise it finalises immediately.
     * @param savedId   - The ID of the just-saved brand (needed for the upload endpoint).
     * @param savedBrand - The full brand object returned / used for the update payload.
     */
    const finalize = (savedId: number, savedBrand: ItemBrand) => {
      if (!pendingFile) {
        this.saving.set(false);
        this.operationComp?.clearPending();
        this.toast.success(this.translate.translate('brand.saveSuccess'));
        this.load();
        if (creating) this.closeEdit();
        return;
      }
      this.service.uploadImage(savedId, pendingFile).subscribe({
        next: relativePath => {
          const updated = { ...savedBrand, brandImage: relativePath };
          this.service.update(savedId, updated).subscribe({
            next: () => {
              this.saving.set(false);
              this.operationComp?.clearPending();
              this.editDraft = { ...this.editDraft, brandImage: relativePath };
              this.toast.success(this.translate.translate('brand.saveSuccess'));
              this.load();
              if (creating) this.closeEdit();
            },
            error: onError,
          });
        },
        error: onError,
      });
    };

    if (creating) {
      this.service.create(this.editDraft).subscribe({ next: saved => finalize(saved.id!, saved), error: onError });
    } else {
      const id = this.editingId()!;
      this.service.update(id, this.editDraft).subscribe({ next: () => finalize(id, this.editDraft), error: onError });
    }
  }

  /**
   * Saves the current draft as a new brand and immediately resets the form
   * for the next entry — the modal stays open (intended for batch data entry).
   *
   * Follows the same create → upload → update pattern as `saveEdit()` but
   * always resets `editDraft` to a blank object on success instead of closing.
   * Only valid when `isCreating` is `true`.
   */
  saveEditAndNew(): void {
    if (!this.isCreating()) return;
    this.saving.set(true);
    const pendingFile = this.operationComp?.pendingFile ?? null;
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('brand.saveError')); };

    this.service.create(this.editDraft).subscribe({
      next: saved => {
        /** Resets spinner, clears staged image, shows toast, reloads list, blanks form. */
        const reset = () => {
          this.saving.set(false);
          this.operationComp?.clearPending();
          this.toast.success(this.translate.translate('brand.saveSuccess'));
          this.load();
          this.editDraft = { name: '' };
        };

        if (!pendingFile) { reset(); return; }

        this.service.uploadImage(saved.id!, pendingFile).subscribe({
          next: relativePath => {
            this.service.update(saved.id!, { ...saved, brandImage: relativePath }).subscribe({
              next: reset,
              error: onError,
            });
          },
          error: onError,
        });
      },
      error: onError,
    });
  }

  /**
   * Builds the per-row action menu for a given brand.
   * Returned as a fresh array each call so each row gets its own closure over `id`.
   * @param id - The brand ID for which the menu is being built.
   * @returns Array of `ActionMenuItem` objects rendered in the row's drop-down.
   */
  getRowMenuItems(id: number): ActionMenuItem[] {
    return buildRowMenuItems(() => this.delete(id));
  }

  // ── Row selection helpers ────────────────────────────────────────────────

  /**
   * Returns whether a specific brand row is currently checked.
   * @param id - Brand ID to check.
   */
  isSelected(id: number): boolean { return this.selectedIds().has(id); }

  /**
   * Returns `true` when every visible brand row is checked.
   * Used to drive the "select all" checkbox state in the table header.
   */
  isAllSelected(): boolean {
    const all = this.brands();
    return all.length > 0 && all.every(b => this.selectedIds().has(b.id!));
  }

  /**
   * Toggles the checked state of a single brand row.
   * Creates a new `Set` on every call to trigger Angular's signal change detection.
   * @param id - Brand ID to toggle.
   */
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }

  /**
   * Selects all rows if not all are currently selected; otherwise clears the selection.
   * Bound to the header checkbox in the table.
   */
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.brands().map(b => b.id!))
    );
  }

  /**
   * Prompts the user with a native `confirm` dialog before deleting a single brand.
   * On confirmation, calls the API and removes the ID from `selectedIds` to keep
   * the bulk-action bar consistent, then reloads the list.
   * @param id - ID of the brand to delete.
   */
  delete(id: number): void {
    if (!confirm('Delete this brand?')) return;
    this.service.delete(id).subscribe({ next: () => { const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s); this.load(); } });
  }

  /**
   * Toggles the `isActive` flag for a single brand without a confirmation dialog.
   * Updates the signal optimistically in-place instead of reloading the full list.
   * @param id       - Brand ID to update.
   * @param isActive - The new active state (`true` = active, `false` = inactive).
   */
  setActive(id: number, isActive: boolean): void {
    this.service.setActive(id, isActive).subscribe({
      next: () => this.brands.update(list => list.map(b => b.id === id ? { ...b, isActive } : b))
    });
  }

  /**
   * Shows a SweetAlert2 confirmation dialog before bulk-deleting all checked brands.
   * On confirmation, calls the API with all selected IDs, clears the selection,
   * and reloads the list.
   */
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

  /**
   * Shows a SweetAlert2 confirmation dialog before bulk-deactivating all checked brands.
   * On confirmation, calls the API and updates the affected rows in the signal
   * without a full reload, for a snappier UI.
   */
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

  /**
   * Downloads a blank Excel template (.xlsx) pre-formatted for brand import.
   * Creates a temporary `<a>` element to trigger the browser download,
   * then revokes the object URL to free memory.
   */
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
      error: () => { }
    });
  }

  /**
   * Downloads an Excel file (.xlsx) containing all current brands.
   * Uses the same browser-download trick as `exportTemplate()`.
   */
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
      error: () => { }
    });
  }

  /**
   * Handles the file-input `change` event triggered when the user picks an Excel file
   * for import. Uploads the file to the API, then reloads the list on success.
   * Resets the `<input>` value after each attempt so the same file can be re-selected
   * if the user wants to retry after an error.
   * @param event - The DOM `change` event from the hidden `<input type="file">`.
   */
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
