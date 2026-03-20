import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ItemService } from '../../core/services/item.service';
import { StoreItemService } from '../../core/services/store-item.service';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemImageService } from '../../core/services/item-image.service';
import { UserActivityService } from '../../core/services/user-activity.service';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Item } from '../../core/models/item.model';
import { StoreItem } from '../../core/models/store-item.model';
import { IItemCategory } from '../../core/models/interfaces/IItemCategory';
import { GridColumns } from '../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';
import { computedColClass } from '../../shared/helpers/grid-columns.helper';

@Component({
  selector: 'app-shop-by-category',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './shop-by-category.component.html',
  styleUrl: './shop-by-category.component.less',
})
export class ShopByCategoryComponent implements OnInit, OnDestroy {
  private itemService      = inject(ItemService);
  private storeItemService = inject(StoreItemService);
  private categoryService  = inject(ItemCategoryService);
  private imageService     = inject(ItemImageService);
  private route            = inject(ActivatedRoute);
  private translate        = inject(TranslateService);
  userActivity             = inject(UserActivityService);

  private querySub!: Subscription;

  items        = signal<Item[]>([]);
  storeItems   = signal<StoreItem[]>([]);
  categories   = signal<IItemCategory[]>([]);
  loading      = signal(false);
  error        = signal<string | null>(null);
  searchQuery  = signal('');
  colsPerRow   = signal<GridColumns>(4);
  colClass     = computedColClass(this.colsPerRow);
  compareIds   = signal<Set<number>>(new Set());

  currentCategory = computed<IItemCategory | undefined>(() => {
    const id = this.selectedCategoryId();
    return id !== null ? this.categories().find(c => c.id === id) : undefined;
  });

  selectedCategoryId = signal<number | null>(null);

  bestPriceMap = computed<Map<number, number>>(() => {
    const map = new Map<number, number>();
    for (const si of this.storeItems()) {
      if (si.isActive === false) continue;
      const cur = map.get(si.itemId);
      if (cur === undefined || si.sellingPrice < cur) map.set(si.itemId, si.sellingPrice);
    }
    return map;
  });

  filteredItems = computed<Item[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter(i => i.name.toLowerCase().includes(q));
  });

  getBestPrice(itemId: number): number | null { return this.bestPriceMap().get(itemId) ?? null; }
  imgUrl(path: string): string { return this.imageService.resolveUrl(path); }
  isFavorite(id: number): boolean { return this.userActivity.favoriteIds().has(id); }
  inCart(id: number): boolean { return this.userActivity.cartIds().has(id); }
  inCompare(id: number): boolean { return this.compareIds().has(id); }

  toggleFavorite(id: number): void { this.userActivity.toggleFavorite(id); }
  toggleCart(id: number): void { this.userActivity.toggleCart(id); }
  toggleCompare(id: number): void {
    this.compareIds.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  getCategoryName(id: number): string {
    const lang = this.translate.currentLang();
    const cat = this.categories().find(c => c.id === id);
    if (!cat) return String(id);
    return cat.name[lang] || cat.name['en'];
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: c => this.categories.set(c), error: () => {} });
    this.storeItemService.getAll().subscribe({ next: si => this.storeItems.set(si), error: () => {} });
    this.userActivity.loadAll();

    this.querySub = this.route.queryParamMap.subscribe(params => {
      const categoryId = params.get('categoryId');
      this.selectedCategoryId.set(categoryId ? +categoryId : null);
      this.loadItems();
    });
  }

  ngOnDestroy(): void { this.querySub.unsubscribe(); }

  private loadItems(): void {
    this.loading.set(true);
    this.error.set(null);
    const categoryId = this.selectedCategoryId();
    const obs = categoryId !== null
      ? this.itemService.getByCategory(categoryId)
      : this.itemService.getAll();

    obs.subscribe({
      next: data => {
        this.loading.set(false);
        const needImages = data.filter(item => !(item.images?.length)).map(i => i.id!);
        if (needImages.length === 0) { this.items.set(data); return; }
        this.imageService.getImagesBulk(needImages).subscribe({
          next: imageMap => {
            this.items.set(data.map(item => ({
              ...item,
              images: item.images?.length ? item.images : (imageMap[item.id!] ?? [])
            })));
          },
          error: () => { this.items.set(data); }
        });
      },
      error: () => { this.error.set('Failed to load items.'); this.loading.set(false); }
    });
  }
}
