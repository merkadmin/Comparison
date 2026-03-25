import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IItemCategory } from '../../../core/models/interfaces/IItemCategory';
import { Item } from '../../../core/models/item.model';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { ProductItemVariant } from '../../../core/models/product-item-variant.model';
import { StoreItem, ItemBestPrice } from '../../../core/models/store-item.model';
import { Store } from '../../../core/models/store.model';
import { IconConfigService } from '../../../core/services/icon-config.service';
import { ItemCategoryService } from '../../../core/services/item-category.service';
import { ItemImageService } from '../../../core/services/item-image.service';
import { ItemService } from '../../../core/services/item.service';
import { ProductItemVariantMapService } from '../../../core/services/product-item-variant-map.service';
import { ProductItemVariantService } from '../../../core/services/product-item-variant.service';
import { StoreItemService } from '../../../core/services/store-item.service';
import { StoreService } from '../../../core/services/store.service';
import { TranslateService } from '../../../core/services/translate.service';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { computedColClass } from '../../helpers/grid-columns.helper';
import { GridColumns } from '../commonActions/common-grid-columns-button/common-grid-columns-button';
import { DecimalPipe } from "@angular/common";
import { ItemDetailComponent } from "../../../features/shop/item-detail/item-detail.component";
import { TranslatePipe } from "../../pipes/translate.pipe";
import { CommonBreadcrumb } from "../common-breadcrumb/common-breadcrumb";

@Component({
  selector: 'app-common-items-list-card-view-parent',
  imports: [ItemDetailComponent, TranslatePipe, DecimalPipe, CommonBreadcrumb],
  templateUrl: './common-items-list-card-view-parent.html',
  styleUrl: './common-items-list-card-view-parent.less',
})
export class CommonItemsListCardViewParent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private storeItemService = inject(StoreItemService);
  private storeService = inject(StoreService);
  private categoryService = inject(ItemCategoryService);
  private imageService = inject(ItemImageService);
  private translate = inject(TranslateService);
  userActivity = inject(UserActivityService);
  private iconConfig = inject(IconConfigService);
  private variantMapSvc = inject(ProductItemVariantMapService);
  private variantSvc = inject(ProductItemVariantService);

  private _routeSub!: Subscription;
  private _pendingCategoryId: number | null = null;

  // ── Icon config signals ────────────────────────────────────────────────────
  cartIcon = this.iconConfig.iconSignal('global.cart', 'basket');
  compareIcon = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  // ── State ──────────────────────────────────────────────────────────────────
  allCategories = signal<IItemCategory[]>([]);
  navStack = signal<IItemCategory[]>([]);
  selectedLeaf = signal<IItemCategory | null>(null);
  items = signal<Item[]>([]);
  storeItems = signal<StoreItem[]>([]);
  stores = signal<Store[]>([]);
  selectedItem = signal<Item | null>(null);
  loadingItems = signal(false);
  loadingCats = signal(false);
  itemVariantMaps = signal<ProductItemVariantMap[]>([]);
  allVariants = signal<ProductItemVariant[]>([]);
  bestPrices = signal<ItemBestPrice[]>([]);
  searchQuery = signal('');
  compareIds = signal<Set<number>>(new Set());
  colsPerRow = signal<GridColumns>(4);
  colClass = computedColClass(this.colsPerRow);

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

  getItemStoreItems(itemId: number): StoreItem[] {
    const active = this.storeItems().filter(si => si.itemId === itemId && si.isActive !== false);
    const best = new Map<number, StoreItem>();
    for (const si of active) {
      const cur = best.get(si.storeId);
      if (!cur || si.sellingPrice < cur.sellingPrice) best.set(si.storeId, si);
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

  getBestPrice(itemId: number): number | null { return this.bestPriceMap().get(itemId)?.sellingPrice ?? null; }
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
    this.router.navigate(['/shop/by-category', cat.id]);
  }

  goBack(): void {
    this.searchQuery.set('');
    const stack = this.navStack();
    if (this.selectedLeaf()) {
      stack.length > 0
        ? this.router.navigate(['/shop/by-category', stack[stack.length - 1].id])
        : this.router.navigate(['/shop']);
    } else {
      stack.length > 1
        ? this.router.navigate(['/shop/by-category', stack[stack.length - 2].id])
        : this.router.navigate(['/shop']);
    }
  }

  navigateTo(index: number): void {
    this.router.navigate(['/shop/by-category', this.navStack()[index].id]);
  }

  goToRoot(): void {
    this.router.navigate(['/shop']);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  openDetail(item: Item): void { this.selectedItem.set(item); }
  closeDetail(): void { this.selectedItem.set(null); }

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
    this.storeItemService.getEffectivePrices().subscribe({ next: si => this.storeItems.set(si), error: () => { } });
    this.storeService.getAll().subscribe({ next: s => this.stores.set(s), error: () => { } });
    this.variantMapSvc.getAll().subscribe({ next: d => this.itemVariantMaps.set(d), error: () => { } });
    this.variantSvc.getAll().subscribe({ next: d => this.allVariants.set(d), error: () => { } });
    this.userActivity.loadAll();

    this._routeSub = this.route.paramMap.subscribe(params => {
      const idStr = params.get('categoryId');
      if (idStr) {
        const id = +idStr;
        if (this.allCategories().length > 0) {
          this.restoreFromCategoryId(id);
        } else {
          this._pendingCategoryId = id;
        }
      } else {
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

  private loadItemsForLeaf(categoryId: number): void {
    this.loadingItems.set(true);
    this.bestPrices.set([]);
    this.storeItemService.getBestPricesByCategory(categoryId)
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
