import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
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

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-list.component.html',
})
export class ItemListComponent implements OnInit, OnDestroy {
  private itemService     = inject(ItemService);
  private categoryService = inject(ItemCategoryService);
  private brandService    = inject(ItemBrandService);
  private translate       = inject(TranslateService);
  private route           = inject(ActivatedRoute);

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }

  items      = signal<Item[]>([]);
  categories = signal<ItemCategory[]>([]);
  brands     = signal<ItemBrand[]>([]);
  loading    = signal(false);
  error      = signal<string | null>(null);
  selectedCategoryId = signal<number | null>(null);
  selectedBrandId    = signal<number | null>(null);
  private querySub!: Subscription;

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: c => this.categories.set(c), error: () => {} });
    this.brandService.getAll().subscribe({ next: b => this.brands.set(b), error: () => {} });

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
    return this.brands().find(b => b.id === brandId)?.name ?? String(brandId);
  }

  getCategoryName(id: number): string {
    const cat = this.categories().find(c => c.id === id);
    return cat ? this.localize(cat.name) : String(id);
  }

  delete(id: number): void {
    if (!confirm('Delete this item?')) return;
    this.itemService.delete(id).subscribe({ next: () => this.loadItems() });
  }
}
