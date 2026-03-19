import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { SelectOption } from '../../shared/components/common-select/common-select.component';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../../core/services/item.service';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { Item } from '../../core/models/item.model';
import { ItemCategory, LocalizedString } from '../../core/models/item-category.model';
import { ItemBrand } from '../../core/models/item-brand.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonViewModeComponent } from '../../shared/components/commonActions/common-view-mode/common-view-mode';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonSelectComponent, CommonViewModeComponent],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.less',
})
export class ItemListComponent implements OnInit, OnDestroy {
  private itemService = inject(ItemService);
  private categoryService = inject(ItemCategoryService);
  private brandService = inject(ItemBrandService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);

  editingId = signal<number | null>(null);
  editDraft: Item = { name: '', brandId: 0, itemCategoryId: 0 };

  openEdit(item: Item): void {
    this.editDraft = { ...item };
    this.editingId.set(item.id!);
  }

  closeEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (id === null) return;
    this.itemService.update(id, this.editDraft).subscribe({
      next: () => { this.loadItems(); this.closeEdit(); }
    });
  }

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }

  items = signal<Item[]>([]);
  categories = signal<ItemCategory[]>([]);
  brands = signal<ItemBrand[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedCategoryId = signal<number | null>(null);
  selectedBrandId = signal<number | null>(null);
  searchQuery = signal('');
  importing = signal(false);
  importError = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds = signal<Set<number>>(new Set());
  viewMode = signal<'list' | 'cards'>('cards');
  private querySub!: Subscription;

  categoryOptions = computed<SelectOption[]>(() =>
    this.categories().map(c => ({ value: c.id, label: this.localize(c.name) }))
  );
  brandOptions = computed<SelectOption[]>(() =>
    this.brands().map(b => ({ value: b.id, label: b.name }))
  );
  private categoryMap = computed<Map<number, ItemCategory>>(() =>
    new Map(this.categories().map(c => [c.id!, c]))
  );
  private brandMap = computed<Map<number, ItemBrand>>(() =>
    new Map(this.brands().map(b => [b.id!, b]))
  );
  filteredItems = computed<Item[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return q ? this.items().filter(i => i.name.toLowerCase().includes(q)) : this.items();
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: c => this.categories.set(c), error: () => { } });
    this.brandService.getAll().subscribe({ next: b => this.brands.set(b), error: () => { } });

    // Subscribe to query param changes so clicking a sidebar category
    // reloads items even when already on the /items route
    this.querySub = this.route.queryParamMap.subscribe(params => {
      const categoryId = params.get('categoryId');
      this.selectedCategoryId.set(categoryId ? +categoryId : null);
      this.selectedBrandId.set(null);
      this.loadItems();
    });
  }

  ngOnDestroy(): void {
    this.querySub.unsubscribe();
  }

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.selectedCategoryId() !== null
      ? this.itemService.getByCategory(this.selectedCategoryId()!)
      : this.selectedBrandId() !== null
        ? this.itemService.getByBrand(this.selectedBrandId()!)
        : this.itemService.getAll();

    obs.subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load items.'); this.loading.set(false); }
    });
  }

  resetFilters(): void {
    this.selectedCategoryId.set(null);
    this.selectedBrandId.set(null);
    this.loadItems();
  }

  getBrandName(brandId: number): string {
    const brand = this.brandMap().get(+brandId);
    return brand ? brand.name : String(brandId);
  }

  getCategoryName(id: number): string {
    const cat = this.categoryMap().get(+id);
    return cat ? this.localize(cat.name) : String(id);
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.filteredItems();
    return all.length > 0 && all.every(i => this.selectedIds().has(i.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.filteredItems().map(i => i.id!))
    );
  }

  delete(id: number): void {
    if (!confirm('Delete this item?')) return;
    this.itemService.delete(id).subscribe({ next: () => { const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s); this.loadItems(); } });
  }

  setActive(id: number, isActive: boolean): void {
    this.itemService.setActive(id, isActive).subscribe({
      next: () => this.items.update(list => list.map(i => i.id === id ? { ...i, isActive } : i))
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('item.deleteBulkText').replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('item.deleteBulkConfirm'),
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.itemService.deleteMany(ids).subscribe({ next: () => { this.selectedIds.set(new Set()); this.loadItems(); } });
    });
  }

  deactivateSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('item.deactivateBulkConfirm'),
      text: this.translate.translate('item.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.itemService.setActiveMany(ids, false).subscribe({
        next: () => {
          this.items.update(list => list.map(i => ids.includes(i.id!) ? { ...i, isActive: false } : i));
          this.selectedIds.set(new Set());
        }
      });
    });
  }

  exportTemplate(): void {
    this.itemService.exportTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'items-template.xlsx';
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
    this.itemService.importExcel(file).subscribe({
      next: () => {
        this.importing.set(false);
        this.importSuccess.set(true);
        this.loadItems();
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.importing.set(false);
        this.importError.set(this.translate.translate('item.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
