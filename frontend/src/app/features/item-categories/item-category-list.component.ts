import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemCategory, LocalizedString } from '../../core/models/item-category.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonListHeaderActions } from '../../shared/components/common-list-header-actions/common-list-header-actions';
import { ItemCategoryListOperationComponent } from './item-category-list-operation/item-category-list-operation.component';

@Component({
  selector: 'app-item-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonDropDownMenuActionButton, CommonListHeaderActions, ItemCategoryListOperationComponent],
  templateUrl: './item-category-list.component.html',
  styleUrl: './item-category-list.component.less',
})
export class ItemCategoryListComponent implements OnInit {
  auth              = inject(AuthService);
  private service   = inject(ItemCategoryService);
  private translate = inject(TranslateService);

  editingId  = signal<number | null>(null);
  isCreating = signal(false);
  editDraft: ItemCategory = { name: { en: '', ar: '', fr: '' } };
  viewMode = signal<'list' | 'cards'>('cards');

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'category.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  getRowMenuItems(id: number): ActionMenuItem[] {
    return [
      { labelKey: 'common.delete', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.delete(id) }
    ];
  }

  openCreate(): void {
    this.editDraft = { name: { en: '', ar: '', fr: '' }, description: { en: '', ar: '', fr: '' } };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(cat: ItemCategory): void {
    this.editDraft = {
      ...cat,
      name: { ...cat.name },
      description: cat.description ? { ...cat.description } : { en: '', ar: '', fr: '' }
    };
    this.isCreating.set(false);
    this.editingId.set(cat.id!);
  }

  closeEdit(): void {
    this.editingId.set(null);
    this.isCreating.set(false);
  }

  saveEdit(): void {
    if (this.isCreating()) {
      const payload: ItemCategory = { ...this.editDraft, parentCategoryId: this.editDraft.parentCategoryId || null };
      this.service.create(payload).subscribe({ next: () => { this.load(); this.closeEdit(); } });
    } else {
      const id = this.editingId();
      if (id === null) return;
      const payload: ItemCategory = { ...this.editDraft, parentCategoryId: this.editDraft.parentCategoryId || null };
      this.service.update(id, payload).subscribe({
        next: () => { this.load(); this.closeEdit(); }
      });
    }
  }

  parentOptions = computed<ItemCategory[]>(() => {
    const id = this.editingId();
    return this.categories().filter(c => c.id !== id);
  });

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }

  categories = signal<ItemCategory[]>([]);

  sortedCategories = computed<ItemCategory[]>(() => {
    const all = this.categories();
    const lang = this.translate.currentLang();
    const loc = (ls: LocalizedString) => ls[lang] || ls.en;

    const flatten = (parentId: number | null): ItemCategory[] =>
      all
        .filter(c => (c.parentCategoryId ?? null) === parentId)
        .sort((a, b) => loc(a.name).localeCompare(loc(b.name)))
        .flatMap(c => [c, ...flatten(c.id ?? null)]);

    return flatten(null);
  });
  searchTerm = signal('');

  visibleCategories = computed<ItemCategory[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.sortedCategories();
    return this.sortedCategories().filter(cat =>
      Object.values(cat.name).some(v => typeof v === 'string' && v.toLowerCase().includes(term))
    );
  });

  loading = signal(false);
  error = signal<string | null>(null);
  importing = signal(false);
  importError = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds = signal<Set<number>>(new Set());

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() }
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.categories.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load categories.'); this.loading.set(false); }
    });
  }

  getDepth(cat: ItemCategory): number {
    const all = this.categories();
    let depth = 0;
    let parentId = cat.parentCategoryId;
    while (parentId && depth < 10) {
      depth++;
      parentId = all.find(c => c.id === parentId)?.parentCategoryId;
    }
    return depth;
  }

  getParentName(parentCategoryId: number | null | undefined): string {
    if (!parentCategoryId) return '—';
    const parent = this.categories().find(c => c.id === parentCategoryId);
    return parent ? this.localize(parent.name) : '—';
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  isAllSelected(): boolean {
    const visible = this.visibleCategories();
    return visible.length > 0 && visible.every(c => this.selectedIds().has(c.id!));
  }

  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    const adding = !s.has(id);
    [id, ...this.getAllDescendantIds(id)].forEach(i => adding ? s.add(i) : s.delete(i));
    this.selectedIds.set(s);
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.visibleCategories().map(c => c.id!)));
    }
  }

  delete(id: number): void {
    this.service.getDescendantCount(id).subscribe(childCount => {
      const text = childCount > 0
        ? this.translate.translate('category.deleteWithChildrenText').replace('{count}', String(childCount))
        : this.translate.translate('category.deleteConfirmText');

      Swal.fire({
        title:              this.translate.translate('category.deleteConfirm'),
        text,
        icon:               'warning',
        showCancelButton:   true,
        confirmButtonColor: '#f1416c',
        confirmButtonText:  this.translate.translate('common.delete'),
        cancelButtonText:   this.translate.translate('common.cancel'),
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

  setActive(id: number, isActive: boolean): void {
    if (!isActive) {
      this.service.getDescendantCount(id).subscribe(childCount => {
        const text = childCount > 0
          ? this.translate.translate('category.deactivateWithChildrenText').replace('{count}', String(childCount))
          : this.translate.translate('category.deactivateConfirmText');

        Swal.fire({
          title:              this.translate.translate('category.deactivateConfirm'),
          text,
          icon:               'warning',
          showCancelButton:   true,
          confirmButtonColor: '#f39c12',
          confirmButtonText:  this.translate.translate('common.deactivate'),
          cancelButtonText:   this.translate.translate('common.cancel'),
        }).then(result => {
          if (!result.isConfirmed) return;
          this.doSetActive(id, isActive);
        });
      });
    } else {
      this.doSetActive(id, isActive);
    }
  }

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
