import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { IItemCategory } from '../../../core/models/interfaces/IItemCategory';
import { Item } from '../../../core/models/item.model';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { ProductItemVariant } from '../../../core/models/product-item-variant.model';
import { ItemBestPrice } from '../../../core/models/store-item.model';
import { Store } from '../../../core/models/store.model';
import { IconConfigService } from '../../../core/services/icon-config.service';
import { ItemBrandService } from '../../../core/services/item-brand.service';
import { ItemCategoryService } from '../../../core/services/item-category.service';
import { ItemImageService } from '../../../core/services/item-image.service';
import { ItemService } from '../../../core/services/item.service';
import { ProductItemVariantMapService } from '../../../core/services/product-item-variant-map.service';
import { ProductItemVariantService } from '../../../core/services/product-item-variant.service';
import { StoreService } from '../../../core/services/store.service';
import { TranslateService } from '../../../core/services/translate.service';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { computedColClass } from '../../helpers/grid-columns.helper';
import { GridColumns } from '../commonActions/common-grid-columns-button/common-grid-columns-button';
import { DecimalPipe } from "@angular/common";
import { TranslatePipe } from "../../pipes/translate.pipe";
import { CommonBreadcrumb } from "../common-breadcrumb/common-breadcrumb";
import { ItemBrand } from '../../../core/models/item-brand.model';

@Component({
  selector: 'app-common-items-list-card-view-parent',
  imports: [TranslatePipe, DecimalPipe, CommonBreadcrumb],
  templateUrl: './common-items-list-card-view-parent.html',
  styleUrl: './common-items-list-card-view-parent.less',
})
export class CommonItemsListCardViewParent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private storeService = inject(StoreService);
  private categoryService = inject(ItemCategoryService);
  private brandService = inject(ItemBrandService);
  private imageService = inject(ItemImageService);
  private translate = inject(TranslateService);
  userActivity = inject(UserActivityService);
  private iconConfig = inject(IconConfigService);
  private variantMapSvc = inject(ProductItemVariantMapService);
  private variantSvc = inject(ProductItemVariantService);

  private _routeSub!: Subscription;
  private _pendingCategoryId: number | null = null;
  isSearchMode = signal(false);

  // ── Icon config signals ────────────────────────────────────────────────────
  cartIcon = this.iconConfig.iconSignal('global.cart', 'basket');
  compareIcon = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  // ── State ──────────────────────────────────────────────────────────────────
  allCategories = signal<IItemCategory[]>([]);
  navStack = signal<IItemCategory[]>([]);
  selectedLeaf = signal<IItemCategory | null>(null);
  items = signal<Item[]>([]);
  stores = signal<Store[]>([]);

  loadingItems = signal(false);
  loadingCats = signal(false);
  itemVariantMaps = signal<ProductItemVariantMap[]>([]);
  allVariants = signal<ProductItemVariant[]>([]);
  bestPrices = signal<ItemBestPrice[]>([]);
  searchQuery = signal('');
  compareIds = signal<Set<number>>(new Set());
  colsPerRow = signal<GridColumns>(4);
  colClass = computedColClass(this.colsPerRow);
  allBrands = signal<ItemBrand[]>([]);
  selectedBrandId = signal<number | null>(null);

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
    const brandId = this.selectedBrandId();
    let result = this.items();
    if (q) result = result.filter(i => i.name.toLowerCase().includes(q));
    if (brandId !== null) result = result.filter(i => i.brandId === brandId);
    return result;
  });

  /** Full category tree flattened in depth-first order for the sidebar. */
  sortedCategoryTree = computed<IItemCategory[]>(() => {
    const all = this.allCategories();
    const flatten = (parentId: number | null): IItemCategory[] =>
      all
        .filter(c => (c.parentCategoryId ?? null) === parentId)
        .flatMap(c => [c, ...flatten(c.id ?? null)]);
    return flatten(null);
  });

  getCategoryDepth(cat: IItemCategory): number {
    let depth = 0;
    let parentId = cat.parentCategoryId;
    const all = this.allCategories();
    while (parentId && depth < 10) {
      depth++;
      parentId = all.find(c => c.id === parentId)?.parentCategoryId;
    }
    return depth;
  }

  isCategoryActive(cat: IItemCategory): boolean {
    return this.selectedLeaf()?.id === cat.id;
  }

  isLeafCategory(cat: IItemCategory): boolean {
    return !this.hasChildren(cat);
  }

  selectCategoryFromSidebar(cat: IItemCategory): void {
    if (!this.isLeafCategory(cat)) return;
    this.router.navigate(['/shop-by-category/by-category', cat.id]);
  }

  /** Brands that actually appear in the currently loaded items. */
  visibleBrands = computed<ItemBrand[]>(() => {
    const seen = new Map<number, ItemBrand>();
    for (const item of this.items()) {
      const id = item.brandId;
      if (!id || seen.has(id)) continue;
      const brand = item.brand ?? this.allBrands().find(b => b.id === id);
      if (brand) seen.set(id, brand);
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  bestPriceMap = computed<Map<number, ItemBestPrice>>(() =>
    new Map(this.bestPrices().map(bp => [bp.itemId, bp]))
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  hasChildren(cat: IItemCategory): boolean {
    return this.allCategories().some(c => c.parentCategoryId === cat.id);
  }

  localize(cat: IItemCategory): string {
    const lang = this.translate.currentLang();
    return cat.name[lang] || cat.name['en'];
  }

  cartPickerItemId = signal<number | null>(null);
  // pending selections per item: itemId -> Set of storeItem IDs checked but not yet confirmed
  cartPending = signal<Map<number, Set<number>>>(new Map());

  getItemVariantMaps(itemId: number): ProductItemVariantMap[] {
    return this.itemVariantMaps().filter(m => m.productItemId === itemId);
  }

  getItemStoreItems(itemId: number): ProductItemVariantMap[] {
    const active = this.itemVariantMaps().filter(m => m.productItemId === itemId && m.isActive !== false);
    const best = new Map<number, ProductItemVariantMap>();
    for (const m of active) {
      const cur = best.get(m.storeId);
      if (!cur || m.sellingPrice < cur.sellingPrice) best.set(m.storeId, m);
    }
    return [...best.values()].sort((a, b) => a.sellingPrice - b.sellingPrice);
  }

  getStoreName(storeId: number): string {
    return this.stores().find(s => s.id === storeId)?.name ?? String(storeId);
  }

  isStorePending(itemId: number, siId: number): boolean {
    return this.cartPending().get(itemId)?.has(siId) ?? false;
  }

  pendingCount(itemId: number): number {
    return this.cartPending().get(itemId)?.size ?? 0;
  }

  toggleStorePending(itemId: number, siId: number): void {
    this.cartPending.update(m => {
      const n = new Map(m);
      const s = new Set(n.get(itemId) ?? []);
      s.has(siId) ? s.delete(siId) : s.add(siId);
      n.set(itemId, s);
      return n;
    });
  }

  cartButtonClick(itemId: number): void {
    if (this.inCart(itemId)) {
      this.cartPending.update(m => { const n = new Map(m); n.delete(itemId); return n; });
      this.userActivity.toggleCart(itemId);
    } else if (this.pendingCount(itemId) > 0) {
      this.userActivity.toggleCart(itemId);
    }
  }

  /** Unique colored variants (color + label) for an item's active mappings. */
  getItemVariantColors(itemId: number): { color: string; label: string }[] {
    const seen = new Set<number>();
    const result: { color: string; label: string }[] = [];
    for (const map of this.itemVariantMaps().filter(m => m.productItemId === itemId && m.isActive !== false)) {
      for (const entry of map.variants) {
        if (seen.has(entry.variantId)) continue;
        seen.add(entry.variantId);
        const v = this.allVariants().find(v => v.id === entry.variantId);
        if (v?.color) result.push({ color: v.color, label: v.variantValue });
      }
    }
    return result;
  }

  getBestPrice(itemId: number, storeId?: number): number | null {
    if (storeId !== undefined) {
      const match = this.itemVariantMaps().find(m => m.productItemId === itemId && m.storeId === storeId && m.isActive !== false);
      return match?.sellingPrice ?? null;
    }
    return this.bestPriceMap().get(itemId)?.sellingPrice ?? null;
  }
  
  // ── Card Lightbox ───────────────────────────────────────────────────────────
  lightboxItem = signal<Item | null>(null);
  lightboxIdx  = signal<number>(0);

  getItemImages(item: Item): string[] {
    if (item.images?.length) return item.images.map(p => this.imageService.resolveUrl(p));
    if (item.imageUrl) return [item.imageUrl];
    return [];
  }

  openLightbox(item: Item, idx = 0): void {
    if (!this.getItemImages(item).length) return;
    this.lightboxItem.set(item);
    this.lightboxIdx.set(idx);
  }

  closeLightbox(): void { this.lightboxItem.set(null); }

  lightboxNext(): void {
    const max = this.getItemImages(this.lightboxItem()!).length - 1;
    this.lightboxIdx.update(i => Math.min(i + 1, max));
  }

  lightboxPrev(): void { this.lightboxIdx.update(i => Math.max(i - 1, 0)); }
  lightboxSelect(i: number): void { this.lightboxIdx.set(i); }

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
    this.router.navigate(['/shop-by-category/by-category', cat.id]);
  }

  navigateTo(index: number): void {
    this.router.navigate(['/shop-by-category/by-category', this.navStack()[index].id]);
  }

  goToRoot(): void {
    this.router.navigate(['/shop-by-category']);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  openDetail(item: Item): void {
    const catId = this.selectedLeaf()?.id ?? item.itemCategoryId;
    this.router.navigate(['/shop-by-category/by-category', catId, 'item', item.id]);
  }

  ngOnInit(): void {
    this.loadingCats.set(true);
    this.categoryService.getAll().subscribe({
      next: c => {
        this.allCategories.set(c);
        this.loadingCats.set(false);
        if (this._pendingCategoryId !== null) {
          this.restoreFromCategoryId(this._pendingCategoryId);
          this._pendingCategoryId = null;
        }
      },
      error: () => { this.loadingCats.set(false); }
    });
    this.storeService.getAll().subscribe({ next: s => this.stores.set(s), error: () => { } });
    this.brandService.getAll().subscribe({ next: b => this.allBrands.set(b), error: () => { } });
    this.variantMapSvc.getAll().subscribe({ next: d => this.itemVariantMaps.set(d), error: () => { } });
    this.variantSvc.getAll().subscribe({ next: d => this.allVariants.set(d), error: () => { } });
    this.userActivity.loadAll();

    this._routeSub = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ]).subscribe(([params, queryParams]) => {
      this.selectedBrandId.set(null);
      const categoryId = params.get('categoryId');
      const q = queryParams.get('q') ?? '';

      if (q) {
        this.isSearchMode.set(true);
        this.navStack.set([]);
        this.selectedLeaf.set(null);
        this.searchQuery.set(q);
        this.loadAllItems();
      } else if (categoryId) {
        this.isSearchMode.set(false);
        this.searchQuery.set('');
        const id = +categoryId;
        if (this.allCategories().length > 0) {
          this.restoreFromCategoryId(id);
        } else {
          this._pendingCategoryId = id;
        }
      } else {
        this.isSearchMode.set(false);
        this.navStack.set([]);
        this.selectedLeaf.set(null);
        this.items.set([]);
        this.searchQuery.set('');
      }
    });
  }

  ngOnDestroy(): void { this._routeSub?.unsubscribe(); }

  private restoreFromCategoryId(categoryId: number): void {
    const all = this.allCategories();
    const target = all.find(c => c.id === categoryId);
    if (!target) return;

    // Build ancestor stack by walking up parentCategoryId
    const ancestors: IItemCategory[] = [];
    let cur: IItemCategory = target;
    while (cur.parentCategoryId) {
      const parent = all.find(c => c.id === cur.parentCategoryId);
      if (!parent) break;
      ancestors.unshift(parent);
      cur = parent;
    }

    if (this.hasChildren(target)) {
      this.navStack.set([...ancestors, target]);
      this.selectedLeaf.set(null);
      this.items.set([]);
    } else {
      this.navStack.set(ancestors);
      this.selectedLeaf.set(target);
      this.loadItemsForLeaf(target.id!);
    }
    this.searchQuery.set('');
  }

  private loadAllItems(): void {
    this.loadingItems.set(true);
    this.bestPrices.set([]);
    this.itemService.getBestPrices().subscribe({ next: bp => this.bestPrices.set(bp), error: () => {} });
    this.itemService.getAll().subscribe({
      next: data => {
        this.loadingItems.set(false);
        const needImages = data.filter(i => !(i.images?.length)).map(i => i.id!);
        if (needImages.length === 0) { this.items.set(data); return; }
        this.imageService.getImagesBulk(needImages).subscribe({
          next: imageMap => {
            this.items.set(data.map(item => ({
              ...item,
              images: item.images?.length ? item.images : (imageMap[item.id!] ?? []),
            })));
          },
          error: () => { this.items.set(data); },
        });
      },
      error: () => { this.loadingItems.set(false); },
    });
  }

  private loadItemsForLeaf(categoryId: number): void {
    this.loadingItems.set(true);
    this.bestPrices.set([]);
    this.itemService.getBestPricesByCategory(categoryId)
      .subscribe({ next: bp => this.bestPrices.set(bp), error: () => { } });
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
