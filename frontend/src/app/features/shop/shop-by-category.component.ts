import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class ShopByCategoryComponent implements OnInit {
  private itemService      = inject(ItemService);
  private storeItemService = inject(StoreItemService);
  private categoryService  = inject(ItemCategoryService);
  private imageService     = inject(ItemImageService);
  private translate        = inject(TranslateService);
  userActivity             = inject(UserActivityService);

  // ── State ──────────────────────────────────────────────────────────────────
  allCategories  = signal<IItemCategory[]>([]);
  navStack       = signal<IItemCategory[]>([]);   // breadcrumb path
  selectedLeaf   = signal<IItemCategory | null>(null);  // leaf category whose items are shown
  items          = signal<Item[]>([]);
  storeItems     = signal<StoreItem[]>([]);
  loadingItems   = signal(false);
  loadingCats    = signal(false);
  searchQuery    = signal('');
  compareIds     = signal<Set<number>>(new Set());
  colsPerRow     = signal<GridColumns>(4);
  colClass       = computedColClass(this.colsPerRow);

  // ── Derived ────────────────────────────────────────────────────────────────

  /** ID of the category whose children we're currently listing (null = root). */
  currentParentId = computed<number | null>(() => {
    const stack = this.navStack();
    return stack.length > 0 ? stack[stack.length - 1].id! : null;
  });

  /** Children of the current level to display as category tiles. */
  visibleCategories = computed<IItemCategory[]>(() =>
    this.allCategories().filter(c => (c.parentCategoryId ?? null) === this.currentParentId())
  );

  filteredItems = computed<Item[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return q ? this.items().filter(i => i.name.toLowerCase().includes(q)) : this.items();
  });

  bestPriceMap = computed<Map<number, number>>(() => {
    const map = new Map<number, number>();
    for (const si of this.storeItems()) {
      if (si.isActive === false) continue;
      const cur = map.get(si.itemId);
      if (cur === undefined || si.sellingPrice < cur) map.set(si.itemId, si.sellingPrice);
    }
    return map;
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  hasChildren(cat: IItemCategory): boolean {
    return this.allCategories().some(c => c.parentCategoryId === cat.id);
  }

  localize(cat: IItemCategory): string {
    const lang = this.translate.currentLang();
    return cat.name[lang] || cat.name['en'];
  }

  getBestPrice(itemId: number): number | null { return this.bestPriceMap().get(itemId) ?? null; }
  imgUrl(path: string): string { return this.imageService.resolveUrl(path); }
  isFavorite(id: number): boolean { return this.userActivity.favoriteIds().has(id); }
  inCart(id: number): boolean { return this.userActivity.cartIds().has(id); }
  inCompare(id: number): boolean { return this.compareIds().has(id); }
  toggleFavorite(id: number): void { this.userActivity.toggleFavorite(id); }
  toggleCart(id: number): void { this.userActivity.toggleCart(id); }
  toggleCompare(id: number): void {
    this.compareIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  selectCategory(cat: IItemCategory): void {
    if (this.hasChildren(cat)) {
      this.navStack.update(s => [...s, cat]);
      this.selectedLeaf.set(null);
      this.items.set([]);
    } else {
      this.selectedLeaf.set(cat);
      this.loadItemsForLeaf(cat.id!);
    }
  }

  goBack(): void {
    if (this.selectedLeaf()) {
      this.selectedLeaf.set(null);
      this.items.set([]);
    } else {
      this.navStack.update(s => s.slice(0, -1));
    }
    this.searchQuery.set('');
  }

  navigateTo(index: number): void {
    this.navStack.update(s => s.slice(0, index + 1));
    this.selectedLeaf.set(null);
    this.items.set([]);
    this.searchQuery.set('');
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadingCats.set(true);
    this.categoryService.getAll().subscribe({
      next: c => { this.allCategories.set(c); this.loadingCats.set(false); },
      error: () => { this.loadingCats.set(false); }
    });
    this.storeItemService.getAll().subscribe({ next: si => this.storeItems.set(si), error: () => {} });
    this.userActivity.loadAll();
  }

  private loadItemsForLeaf(categoryId: number): void {
    this.loadingItems.set(true);
    this.itemService.getByCategory(categoryId).subscribe({
      next: data => {
        this.loadingItems.set(false);
        const needImages = data.filter(i => !(i.images?.length)).map(i => i.id!);
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
      error: () => { this.loadingItems.set(false); }
    });
  }
}
