import { Component, OnInit, inject, signal, computed } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemCategory, LocalizedString } from '../../core/models/item-category.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-item-category-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-category-list.component.html',
})
export class ItemCategoryListComponent implements OnInit {
  private service   = inject(ItemCategoryService);
  private translate = inject(TranslateService);

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }

  categories    = signal<ItemCategory[]>([]);

  sortedCategories = computed<ItemCategory[]>(() => {
    const all  = this.categories();
    const lang = this.translate.currentLang();
    const loc  = (ls: LocalizedString) => ls[lang] || ls.en;

    const flatten = (parentId: number | null): ItemCategory[] =>
      all
        .filter(c => (c.parentCategoryId ?? null) === parentId)
        .sort((a, b) => loc(a.name).localeCompare(loc(b.name)))
        .flatMap(c => [c, ...flatten(c.id ?? null)]);

    return flatten(null);
  });
  loading       = signal(false);
  error         = signal<string | null>(null);
  importing     = signal(false);
  importError   = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds   = signal<Set<number>>(new Set());

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
    const all = this.sortedCategories();
    return all.length > 0 && all.every(c => this.selectedIds().has(c.id!));
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
      this.selectedIds.set(new Set(this.sortedCategories().map(c => c.id!)));
    }
  }

  delete(id: number): void {
    const childCount = this.getAllDescendantIds(id).length;
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
      cancelButtonText:  this.translate.translate('common.cancel'),
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
      cancelButtonText:  this.translate.translate('common.cancel'),
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
        this.importError.set(this.translate.translate('category.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
