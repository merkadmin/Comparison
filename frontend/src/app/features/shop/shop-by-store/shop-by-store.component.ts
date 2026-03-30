import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { Item } from '../../../core/models/item.model';
import { Store } from '../../../core/models/store.model';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { ItemBestPrice } from '../../../core/models/store-item.model';
import { IconConfigService } from '../../../core/services/icon-config.service';
import { ItemImageService } from '../../../core/services/item-image.service';
import { ItemService } from '../../../core/services/item.service';
import { ProductItemVariantMapService } from '../../../core/services/product-item-variant-map.service';
import { StoreService } from '../../../core/services/store.service';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { computedColClass } from '../../../shared/helpers/grid-columns.helper';
import { GridColumns, CommonGridColumnsButton } from '../../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';

@Component({
  selector: 'app-shop-by-store',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, CommonGridColumnsButton, RouterLink],
  templateUrl: './shop-by-store.component.html',
  styleUrl: './shop-by-store.component.less',
})
export class ShopByStoreComponent implements OnInit, OnDestroy {
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private itemService    = inject(ItemService);
  private storeService   = inject(StoreService);
  private imageService   = inject(ItemImageService);
  private variantMapSvc  = inject(ProductItemVariantMapService);
  userActivity           = inject(UserActivityService);
  private iconConfig     = inject(IconConfigService);

  private _routeSub!: Subscription;
  private _pendingStoreId: number | null = null;

  compareIcon  = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  allStores      = signal<Store[]>([]);
  selectedStore  = signal<Store | null>(null);
  allItems       = signal<Item[]>([]);
  allVariantMaps = signal<ProductItemVariantMap[]>([]);
  bestPrices     = signal<ItemBestPrice[]>([]);

  loadingStores = signal(false);
  loadingItems  = signal(false);

  viewMode   = signal<'grid' | 'list'>('grid');
  colsPerRow = signal<GridColumns>(4);
  colClass   = computedColClass(this.colsPerRow);
  searchQuery = signal('');

  /** IDs of items that have at least one active variant map for the selected store. */
  storeItemIds = computed<Set<number>>(() => {
    const store = this.selectedStore();
    if (!store) return new Set();
    return new Set(
      this.allVariantMaps()
        .filter(m => m.storeId === store.id && m.isActive !== false)
        .map(m => m.productItemId)
    );
  });

  /** Items available at the selected store. */
  storeItems = computed<Item[]>(() => {
    const ids = this.storeItemIds();
    return this.allItems().filter(i => ids.has(i.id!));
  });

  filteredItems = computed<Item[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.storeItems();
    return q ? items.filter(i => i.name.toLowerCase().includes(q)) : items;
  });

  bestPriceMap = computed<Map<number, ItemBestPrice>>(() =>
    new Map(this.bestPrices().map(bp => [bp.itemId, bp]))
  );

  getBestPrice(itemId: number): number | null {
    return this.bestPriceMap().get(itemId)?.sellingPrice ?? null;
  }

  /** Best price per store for a given item (for the price breakdown rows). */
  getItemStoreItems(itemId: number): ProductItemVariantMap[] {
    const active = this.allVariantMaps().filter(m => m.productItemId === itemId && m.isActive !== false);
    const best = new Map<number, ProductItemVariantMap>();
    for (const m of active) {
      const cur = best.get(m.storeId);
      if (!cur || m.sellingPrice < cur.sellingPrice) best.set(m.storeId, m);
    }
    return [...best.values()].sort((a, b) => a.sellingPrice - b.sellingPrice);
  }

  getStoreName(storeId: number): string {
    return this.allStores().find(s => s.id === storeId)?.name ?? String(storeId);
  }

  imgUrl(path: string): string { return this.imageService.resolveUrl(path); }
  storeImgUrl(store: Store): string | null {
    if (store.storeImage) return this.storeService.resolveImageUrl(store.storeImage);
    return store.logoUrl ?? null;
  }
  isFavorite(id: number): boolean { return this.userActivity.favoriteIds().has(id); }
  toggleFavorite(id: number): void { this.userActivity.toggleFavorite(id); }

  selectStore(store: Store): void {
    this.router.navigate(['/shop-by-store/by-store', store.id]);
  }

  goToRoot(): void {
    this.router.navigate(['/shop-by-store']);
  }

  openDetail(item: Item): void {
    this.router.navigate(['/shop-by-store/by-store', this.selectedStore()!.id, 'item', item.id]);
  }

  ngOnInit(): void {
    this.loadingStores.set(true);
    this.storeService.getAll().subscribe({
      next: s => {
        this.allStores.set(s.filter(x => x.isActive !== false).sort((a, b) => a.name.localeCompare(b.name)));
        this.loadingStores.set(false);
        if (this._pendingStoreId !== null) {
          const store = this.allStores().find(x => x.id === this._pendingStoreId);
          if (store) this.selectedStore.set(store);
          this._pendingStoreId = null;
        }
      },
      error: () => { this.loadingStores.set(false); }
    });
    this.variantMapSvc.getAll().subscribe({ next: d => this.allVariantMaps.set(d), error: () => {} });
    this.userActivity.loadAll();

    this._routeSub = this.route.paramMap.subscribe(params => {
      const storeId = params.get('storeId');
      this.searchQuery.set('');
      if (storeId) {
        const id = +storeId;
        const store = this.allStores().find(s => s.id === id);
        if (store) {
          this.selectedStore.set(store);
        } else {
          this._pendingStoreId = id;
        }
        this.loadItemsForStore();
      } else {
        this.selectedStore.set(null);
        this.allItems.set([]);
      }
    });
  }

  ngOnDestroy(): void { this._routeSub?.unsubscribe(); }

  private loadItemsForStore(): void {
    if (this.allItems().length > 0) return; // already loaded, no re-fetch
    this.loadingItems.set(true);
    this.bestPrices.set([]);
    this.itemService.getBestPrices().subscribe({ next: bp => this.bestPrices.set(bp), error: () => {} });
    this.itemService.getAll().subscribe({
      next: data => {
        this.loadingItems.set(false);
        const needImages = data.filter(i => !(i.images?.length)).map(i => i.id!);
        if (!needImages.length) { this.allItems.set(data); return; }
        this.imageService.getImagesBulk(needImages).subscribe({
          next: imageMap => {
            this.allItems.set(data.map(item => ({
              ...item,
              images: item.images?.length ? item.images : (imageMap[item.id!] ?? []),
            })));
          },
          error: () => { this.allItems.set(data); }
        });
      },
      error: () => { this.loadingItems.set(false); }
    });
  }
}
