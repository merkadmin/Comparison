import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ItemCategoryService } from '../../../core/services/item-category.service';
import { MultiLangString } from '../../../core/models/interfaces/LocalizedString';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActionMenuItem } from '../../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { buildRowMenuItems } from '../../../shared/helpers/row-menu.helper';
import { CommonListHeaderActions } from '../../../shared/components/common-list-header-actions/common-list-header-actions';
import { ItemCategoryListOperationComponent } from './item-category-list-operation/item-category-list-operation.component';
import { IItemCategory } from '../../../core/models/interfaces/IItemCategory';

@Component({
  selector: 'app-item-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonListHeaderActions, ItemCategoryListOperationComponent],
  templateUrl: './item-category-list.component.html',
  styleUrl: './item-category-list.component.less',
})
export class ItemCategoryListComponent implements OnInit {

  /** Reference to the create/edit modal child component.
   *  Used to read `pendingFile` (staged image) and call `clearPending()` after a save. */
  @ViewChild('operationComp') operationComp?: ItemCategoryListOperationComponent;

  /** Reference to the hidden `<input type="file">` used for Excel import.
   *  Needed to programmatically reset its value after each import attempt. */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** Exposes auth state to the template (e.g. hiding admin-only buttons). */
  auth = inject(AuthService);

  /** Handles all HTTP calls for categories: CRUD, image upload/delete, Excel import/export,
   *  descendant counting, and active-state toggling. */
  private service = inject(ItemCategoryService);

  /** Provides `translate(key)` for resolving i18n strings at runtime
   *  (used in toasts, Swal dialogs, and localised category names). */
  private translate = inject(TranslateService);

  /** Shows brief success/error notifications at the top of the screen. */
  private toast = inject(ToastService);

  // ── Modal state ──────────────────────────────────────────────────────────

  /** ID of the category currently open in the edit modal.
   *  `null` = modal is closed.  `0` = open in create mode (no real ID yet). */
  editingId = signal<number | null>(null);

  /** `true` while the modal is open in "Add new category" mode. */
  isCreating = signal(false);

  /** `true` while an HTTP save (create / update / image upload) is in progress.
   *  Disables the Save button and shows a spinner to prevent double-submits. */
  saving = signal(false);

  /** Mutable copy of the category being created or edited.
   *  Bound directly to the modal form fields via `[(ngModel)]`. */
  editDraft: IItemCategory = { name: { en: '', ar: '', fr: '' } };

  /** Controls whether the list is rendered as a flat table (`'list'`) or as
   *  a card grid (`'cards'`). Persists for the lifetime of the component. */
  viewMode = signal<'list' | 'cards'>('cards');

  // ── Menu item definitions ────────────────────────────────────────────────

  /** Drop-down items shown in the bulk-action bar when one or more rows are selected. */
  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'category.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  // ── Derived / computed state ──────────────────────────────────────────────

  /** The full flat category list as returned by the API (unsorted, unfiltered). */
  categories = signal<IItemCategory[]>([]);

  /**
   * Filtered list of categories available as "parent" options in the modal's select.
   * Excludes the category currently being edited to prevent a category from being
   * its own parent (which would create a circular reference).
   */
  parentOptions = computed<IItemCategory[]>(() => {
    const id = this.editingId();
    return this.categories().filter(c => c.id !== id);
  });

  /**
   * Tree-aware sorted view of all categories.
   * Builds a depth-first ordering where each parent is immediately followed by its
   * children (recursively), and siblings are sorted alphabetically in the active language.
   * Used as the base for `visibleCategories` and indentation rendering in the table.
   */
  sortedCategories = computed<IItemCategory[]>(() => {
    const all = this.categories();
    const lang = this.translate.currentLang();
    const loc = (ls: MultiLangString) => ls[lang] || ls.en;

    const flatten = (parentId: number | null): IItemCategory[] =>
      all
        .filter(c => (c.parentCategoryId ?? null) === parentId)
        .sort((a, b) => loc(a.name).localeCompare(loc(b.name)))
        .flatMap(c => [c, ...flatten(c.id ?? null)]);

    return flatten(null);
  });

  /** Current value of the search input; filters `visibleCategories` in real time. */
  searchTerm = signal('');

  /**
   * Subset of `sortedCategories` that match the current `searchTerm`.
   * Searches across all language values of the category name (en, ar, fr).
   * When the search term is empty the full sorted list is returned unchanged.
   */
  visibleCategories = computed<IItemCategory[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.sortedCategories();
    return this.sortedCategories().filter(cat =>
      Object.values(cat.name).some(v => typeof v === 'string' && v.toLowerCase().includes(term))
    );
  });

  // ── List state ───────────────────────────────────────────────────────────

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

  /** Drop-down items for the import/export button group in the list header. */
  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /** Angular lifecycle hook — triggers the initial data load when the component mounts. */
  ngOnInit(): void { this.load(); }

  /**
   * Fetches all categories from the API and updates the `categories` signal.
   * `sortedCategories` and `visibleCategories` recompute automatically.
   * Resets any previous error state before each attempt.
   */
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { 
        this.categories.set(data); 
        this.loading.set(false);
      },
      error: () => { 
        this.error.set(this.translate.translate('category.loadError')); this.loading.set(false);
      }
    });
  }

  /** Opens the modal in "create" mode with a blank multilingual draft
   *  (all language fields empty, no parent, no image). */
  openCreate(): void {
    this.editDraft = { name: { en: '', ar: '', fr: '' }, description: { en: '', ar: '', fr: '' } };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  /**
   * Opens the modal in "edit" mode, pre-filling the form with the selected category.
   * Deep-copies `name` and `description` so the original list item is not mutated
   * until the user explicitly saves.
   * @param cat - The category row that was clicked for editing.
   */
  openEdit(cat: IItemCategory): void {
    this.editDraft = {
      ...cat,
      name: { ...cat.name },
      description: cat.description ? { ...cat.description } : { en: '', ar: '', fr: '' }
    };
    this.isCreating.set(false);
    this.editingId.set(cat.id!);
  }

  /**
   * Builds the per-row action menu for a given category.
   * Returned as a fresh array each call so each row captures its own `id` in the closure.
   * @param id - The category ID for which the menu is being built.
   * @returns Array of `ActionMenuItem` objects rendered in the row's drop-down button.
   */
  getRowMenuItems(id: number): ActionMenuItem[] {
    return buildRowMenuItems(() => this.delete(id));
  }

  // ── Modal open / close ───────────────────────────────────────────────────

  /** Closes the modal and resets both `editingId` and `isCreating` to their idle state. */
  closeEdit(): void {
    this.editingId.set(null);
    this.isCreating.set(false);
  }

  /**
   * Navigates to the previous (`-1`) or next (`1`) category in the sorted list
   * while the edit modal is open, without closing and reopening it.
   * @param dir - Direction: `1` = next, `-1` = previous.
   */
  navigateCategory(dir: 1 | -1): void {
    const all = this.sortedCategories();
    const idx = all.findIndex(c => c.id === this.editingId());
    if (idx === -1) return;
    const next = all[idx + dir];
    if (next) this.openEdit(next);
  }

  /**
   * Saves the current draft (create or update) and optionally uploads a pending image.
   *
   * Flow:
   * 1. Normalises `parentCategoryId` to `null` when blank (avoids sending `undefined`).
   * 2. Calls `create` or `update` depending on `isCreating`.
   * 3. If the modal has a staged image (`pendingFile`), uploads it to the file-storage
   *    server, then calls `update` again to persist the returned relative path.
   * 4. On success: shows a toast, reloads the list, clears the pending image, closes modal.
   * 5. On any error: stops the spinner and shows an error toast.
   */
  saveEdit(): void {
    this.saving.set(true);
    const payload: IItemCategory = { ...this.editDraft, parentCategoryId: this.editDraft.parentCategoryId || null };
    const pendingFile = this.operationComp?.pendingFile ?? null;
    const creating = this.isCreating();

    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('category.saveError')); };

    const finalize = (savedId: number, savedCategory: IItemCategory) => {
      if (!pendingFile) {
        this.saving.set(false);
        this.operationComp?.clearPending();
        this.toast.success(this.translate.translate('category.saveSuccess'));
        this.load();
        if (creating) this.closeEdit();
        return;
      }
      this.service.uploadImage(savedId, pendingFile).subscribe({
        next: relativePath => {
          const updated = { ...savedCategory, categoryImage: relativePath };
          this.service.update(savedId, updated).subscribe({
            next: () => {
              this.saving.set(false);
              this.operationComp?.clearPending();
              this.editDraft = { ...this.editDraft, categoryImage: relativePath };
              this.toast.success(this.translate.translate('category.saveSuccess'));
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
      this.service.create(payload).subscribe({ next: saved => finalize(saved.id!, saved), error: onError });
    } else {
      const id = this.editingId()!;
      this.service.update(id, payload).subscribe({ next: () => finalize(id, payload), error: onError });
    }
  }

  /**
   * Removes the uploaded category image both from the file-storage server and from
   * the local `editDraft`, so the UI reverts to the icon placeholder.
   * The DELETE call is fire-and-forget; a failure does not block the UI update.
   */
  removeImage(): void {
    const id = this.editingId();
    if (id) this.service.deleteImage(id).subscribe({ error: () => {} });
    this.editDraft = { ...this.editDraft, categoryImage: undefined };
  }

  /**
   * Saves the current draft as a new category and immediately resets the form
   * for the next entry — the modal stays open (intended for batch data entry).
   * Only valid when `isCreating` is `true`.
   *
   * Note: unlike `saveEdit`, this path does not handle image upload because
   * batch-create scenarios rarely need per-entry images; images can be added
   * by re-opening the created record for edit.
   */
  saveEditAndNew(): void {
    if (!this.isCreating()) return;
    this.saving.set(true);
    const payload: IItemCategory = { ...this.editDraft, parentCategoryId: this.editDraft.parentCategoryId || null };
    const pendingFile = this.operationComp?.pendingFile ?? null;
    const onError = () => { this.saving.set(false); this.toast.error(this.translate.translate('category.saveError')); };

    this.service.create(payload).subscribe({
      next: saved => {
        const reset = () => {
          this.saving.set(false);
          this.operationComp?.clearPending();
          this.toast.success(this.translate.translate('category.saveSuccess'));
          this.load();
          this.editDraft = { name: { en: '', ar: '', fr: '' }, description: { en: '', ar: '', fr: '' } };
        };

        if (!pendingFile) { reset(); return; }

        this.service.uploadImage(saved.id!, pendingFile).subscribe({
          next: relativePath => {
            this.service.update(saved.id!, { ...saved, categoryImage: relativePath }).subscribe({
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
   * Resolves the display string for a multilingual label in the current UI language,
   * falling back to English when the chosen language has no value.
   * @param ls - A `MultiLangString` object with `en`, `ar`, `fr` keys.
   * @returns The localised string for the active language, or the English fallback.
   */
  localize(ls: MultiLangString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }

  /**
   * Calculates how many levels deep a category is in the tree (0 = root).
   * Used by the template to add left-padding so the hierarchy is visually apparent.
   * Capped at 10 to guard against circular references in malformed data.
   * @param cat - The category whose nesting depth is needed.
   * @returns Depth as a non-negative integer.
   */
  getDepth(cat: IItemCategory): number {
    const all = this.categories();
    let depth = 0;
    let parentId = cat.parentCategoryId;
    while (parentId && depth < 10) {
      depth++;
      parentId = all.find(c => c.id === parentId)?.parentCategoryId;
    }
    return depth;
  }

  /**
   * Resolves a parent category ID to its localised display name.
   * Returns `'—'` when the ID is absent or the parent cannot be found in the loaded list.
   * @param parentCategoryId - The `parentCategoryId` field of a child category.
   * @returns Localised parent name or `'—'`.
   */
  getParentName(parentCategoryId: number | null | undefined): string {
    if (!parentCategoryId) return '—';
    const parent = this.categories().find(c => c.id === parentCategoryId);
    return parent ? this.localize(parent.name) : '—';
  }

  // ── Row selection helpers ────────────────────────────────────────────────

  /**
   * Returns whether a specific category row is currently checked.
   * @param id - Category ID to check.
   */
  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  /**
   * Returns `true` when every row in `visibleCategories` is checked.
   * Used to drive the "select all" header checkbox state.
   */
  isAllSelected(): boolean {
    const visible = this.visibleCategories();
    return visible.length > 0 && visible.every(c => this.selectedIds().has(c.id!));
  }

  /**
   * Toggles the checked state of a category row and all its descendants.
   * Cascading to descendants prevents a situation where a parent is selected
   * but its children are not, which would be confusing in bulk-delete operations.
   * Creates a new `Set` on every call to trigger Angular signal change detection.
   * @param id - Category ID to toggle (children cascade automatically).
   */
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    const adding = !s.has(id);
    [id, ...this.getAllDescendantIds(id)].forEach(i => adding ? s.add(i) : s.delete(i));
    this.selectedIds.set(s);
  }

  /**
   * Selects all visible rows if not all are currently selected; otherwise clears the selection.
   * "Visible" means filtered by the current `searchTerm`, so only matching rows are affected.
   */
  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.visibleCategories().map(c => c.id!)));
    }
  }

  /**
   * Prompts with a SweetAlert2 dialog before deleting a single category.
   * If the category has children the dialog warns how many will also be deleted.
   * On confirmation, calls the API and removes the ID from `selectedIds` to keep
   * the bulk-action bar consistent, then reloads the list.
   * @param id - ID of the category to delete.
   */
  delete(id: number): void {
    this.service.getDescendantCount(id).subscribe(childCount => {
      const text = childCount > 0
        ? this.translate.translate('category.deleteWithChildrenText').replace('{count}', String(childCount))
        : this.translate.translate('category.deleteConfirmText');

      Swal.fire({
        title: this.translate.translate('category.deleteConfirm'),
        text,
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
    });
  }

  /**
   * Recursively collects the IDs of all descendants of a category using an
   * iterative depth-first stack traversal.
   * Used by `toggleOne` (cascade selection) and `doSetActive` (cascade deactivation).
   * Private because it is an internal implementation detail.
   * @param id - Root category ID whose subtree should be collected.
   * @returns Flat array of all descendant IDs (does not include `id` itself).
   */
  private getAllDescendantIds(id: number): number[] {
    const all = this.categories();
    const result: number[] = [];
    const stack = [id];
    while (stack.length) {
      const parentId = stack.pop()!;
      const children = all.filter(c => c.parentCategoryId != null && c.parentCategoryId === parentId);
      children.forEach(c => { result.push(c.id!); stack.push(c.id!); });
    }
    return result;
  }

  /**
   * Shows a SweetAlert2 confirmation dialog before bulk-deleting all checked categories.
   * On confirmation, calls the API with all selected IDs, clears the selection,
   * and reloads the list.
   */
  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('category.deleteBulkText')
      .replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('category.deleteBulkConfirm'),
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.deleteMany(ids).subscribe({
        next: () => {
          this.selectedIds.set(new Set());
          this.load();
        }
      });
    });
  }

  /**
   * Shows a SweetAlert2 confirmation dialog before bulk-deactivating all checked categories.
   * On confirmation, calls the API and updates the affected rows in the signal in-place
   * (no full reload) for a snappier UI.
   */
  deactivateSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('category.deactivateBulkConfirm'),
      text: this.translate.translate('category.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.setActiveMany(ids, false).subscribe({
        next: () => {
          this.categories.update(list => list.map(c => ids.includes(c.id!) ? { ...c, isActive: false } : c));
          this.selectedIds.set(new Set());
        }
      });
    });
  }

  /**
   * Toggles the `isActive` flag for a single category.
   * Deactivating shows a SweetAlert2 warning (with child-count info) because it
   * cascades to all descendants via `doSetActive`. Activating skips the dialog.
   * @param id       - Category ID to update.
   * @param isActive - The new active state (`true` = active, `false` = inactive).
   */
  setActive(id: number, isActive: boolean): void {
    if (!isActive) {
      this.service.getDescendantCount(id).subscribe(childCount => {
        const text = childCount > 0
          ? this.translate.translate('category.deactivateWithChildrenText').replace('{count}', String(childCount))
          : this.translate.translate('category.deactivateConfirmText');

        Swal.fire({
          title: this.translate.translate('category.deactivateConfirm'),
          text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f39c12',
          confirmButtonText: this.translate.translate('common.deactivate'),
          cancelButtonText: this.translate.translate('common.cancel'),
        }).then(result => {
          if (!result.isConfirmed) return;
          this.doSetActive(id, isActive);
        });
      });
    } else {
      this.doSetActive(id, isActive);
    }
  }

  /**
   * Performs the actual active-state API call and updates the signal in-place.
   * Cascades the change to all descendants so that deactivating a parent
   * also visually deactivates its children without a full reload.
   * Private because it should only be called after confirmation (via `setActive`).
   * @param id       - Root category ID to update.
   * @param isActive - The new active state to apply to the category and its subtree.
   */
  private doSetActive(id: number, isActive: boolean): void {
    this.service.setActive(id, isActive).subscribe({
      next: () => {
        const affected = new Set([id, ...this.getAllDescendantIds(id)]);
        this.categories.update(list =>
          list.map(c => affected.has(c.id!) ? { ...c, isActive } : c)
        );
      }
    });
  }

  /**
   * Downloads a blank Excel template (.xlsx) pre-formatted for category import.
   * Creates a temporary `<a>` element to trigger the browser download,
   * then revokes the object URL to free memory.
   */
  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'item-categories-template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { }
    });
  }

  /**
   * Downloads an Excel file (.xlsx) containing all current categories.
   * Uses the same browser-download trick as `exportTemplate()`.
   */
  exportList(): void {
    this.service.exportList().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'item-categories.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { }
    });
  }

  /**
   * Handles the file-input `change` event when the user picks an Excel file for import.
   * Uploads the file to the API, then reloads the list on success.
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
        this.importError.set(this.translate.translate('category.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
