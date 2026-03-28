import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { Item } from '../../core/models/item.model';
import { ItemBrand } from '../../core/models/item-brand.model';
import { ProductItemVariantMap } from '../../core/models/product-item-variant-map.model';
import { ItemBestPrice } from '../../core/models/store-item.model';
import { Store } from '../../core/models/store.model';
import { IconConfigService } from '../../core/services/icon-config.service';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemImageService } from '../../core/services/item-image.service';
import { ItemService } from '../../core/services/item.service';
import { ProductItemVariantMapService } from '../../core/services/product-item-variant-map.service';
import { StoreService } from '../../core/services/store.service';
import { UserActivityService } from '../../core/services/user-activity.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { computedColClass } from '../../shared/helpers/grid-columns.helper';
import { GridColumns, CommonGridColumnsButton } from '../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';

@Component({
  selector: 'app-shop-by-brand',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, CommonGridColumnsButton],
  templateUrl: './shop-by-brand.component.html',
  styleUrl: './shop-by-brand.component.less',
})
export class ShopByBrandComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private brandService = inject(ItemBrandService);
  private storeService = inject(StoreService);
  private imageService = inject(ItemImageService);
  private variantMapSvc = inject(ProductItemVariantMapService);
  userActivity = inject(UserActivityService);
  private iconConfig = inject(IconConfigService);

  private _routeSub!: Subscription;
  private _pendingBrandId: number | null = null;

  compareIcon = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  allBrands = signal<ItemBrand[]>([]);
  selectedBrand = signal<ItemBrand | null>(null);
  items = signal<Item[]>([]);
  stores = signal<Store[]>([]);
  itemVariantMaps = signal<ProductItemVariantMap[]>([]);
  bestPrices = signal<ItemBestPrice[]>([]);

  loadingBrands = signal(false);
  loadingItems = signal(false);

  viewMode = signal<'grid' | 'list'>('grid');
  colsPerRow = signal<GridColumns>(4);
  colClass = computedColClass(this.colsPerRow);
  searchQuery = signal('');

  filteredItems = computed<Item[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return q ? this.items().filter(i => i.name.toLowerCase().includes(q)) : this.items();
  });

  bestPriceMap = computed<Map<number, ItemBestPrice>>(() =>
    new Map(this.bestPrices().map(bp => [bp.itemId, bp]))
  );

  getBestPrice(itemId: number): number | null {
    return this.bestPriceMap().get(itemId)?.sellingPrice ?? null;
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

  imgUrl(path: string): string { return this.imageService.resolveUrl(path); }
  brandImgUrl(brand: ItemBrand): string | null {
    if (brand.brandImage) return this.brandService.resolveImageUrl(brand.brandImage);
    return brand.logoUrl ?? null;
  }
  isFavorite(id: number): boolean { return this.userActivity.favoriteIds().has(id); }
  toggleFavorite(id: number): void { this.userActivity.toggleFavorite(id); }

  selectBrand(brand: ItemBrand): void {
    this.router.navigate(['/shop-by-brand/by-brand', brand.id]);
  }

  goToRoot(): void {
    this.router.navigate(['/shop-by-brand']);
  }

  openDetail(item: Item): void {
    this.router.navigate(['/shop-by-brand/by-brand', this.selectedBrand()!.id, 'item', item.id]);
  }

  ngOnInit(): void {
    this.loadingBrands.set(true);
    this.brandService.getAll().subscribe({
      next: b => {
        this.allBrands.set(b.filter(x => x.isActive !== false).sort((a, b) => a.name.localeCompare(b.name)));
        this.loadingBrands.set(false);
        if (this._pendingBrandId !== null) {
          const brand = this.allBrands().find(x => x.id === this._pendingBrandId);
          if (brand) this.selectedBrand.set(brand);
          this._pendingBrandId = null;
        }
      },
      error: () => { this.loadingBrands.set(false); }
    });
    this.storeService.getAll().subscribe({ next: s => this.stores.set(s), error: () => {} });
    this.variantMapSvc.getAll().subscribe({ next: d => this.itemVariantMaps.set(d), error: () => {} });
    this.userActivity.loadAll();

    this._routeSub = this.route.paramMap.subscribe(params => {
      const brandId = params.get('brandId');
      this.searchQuery.set('');
      if (brandId) {
        const id = +brandId;
        const brand = this.allBrands().find(b => b.id === id);
        if (brand) {
          this.selectedBrand.set(brand);
        } else {
          this._pendingBrandId = id;
        }
        this.loadItemsForBrand(id);
      } else {
        this.selectedBrand.set(null);
        this.items.set([]);
      }
    });
  }

  ngOnDestroy(): void { this._routeSub?.unsubscribe(); }

  private loadItemsForBrand(brandId: number): void {
    this.loadingItems.set(true);
    this.bestPrices.set([]);
    this.itemService.getBestPrices().subscribe({ next: bp => this.bestPrices.set(bp), error: () => {} });
    this.itemService.getByBrand(brandId).subscribe({
      next: data => {
        this.loadingItems.set(false);
        const needImages = data.filter(i => !(i.images?.length)).map(i => i.id!);
        if (!needImages.length) { this.items.set(data); return; }
        this.imageService.getImagesBulk(needImages).subscribe({
          next: imageMap => {
            this.items.set(data.map(item => ({
              ...item,
              images: item.images?.length ? item.images : (imageMap[item.id!] ?? []),
            })));
          },
          error: () => { this.items.set(data); }
        });
      },
      error: () => { this.loadingItems.set(false); }
    });
  }
}
