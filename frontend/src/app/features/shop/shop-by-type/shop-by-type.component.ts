import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { Item } from '../../../core/models/item.model';
import { ProductType } from '../../../core/models/product-type.model';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { ItemBestPrice } from '../../../core/models/store-item.model';
import { Store, StoreType } from '../../../core/models/store.model';
import { IconConfigService } from '../../../core/services/icon-config.service';
import { ProductTypeService } from '../../../core/services/product-type.service';
import { ItemImageService } from '../../../core/services/item-image.service';
import { ItemService } from '../../../core/services/item.service';
import { ProductItemVariantMapService } from '../../../core/services/product-item-variant-map.service';
import { StoreService } from '../../../core/services/store.service';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { computedColClass } from '../../../shared/helpers/grid-columns.helper';
import { GridColumns, CommonGridColumnsButton } from '../../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';

@Component({
  selector: 'app-shop-by-type',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, CommonGridColumnsButton, RouterLink],
  templateUrl: './shop-by-type.component.html',
  styleUrl: './shop-by-type.component.less',
})
export class ShopByTypeComponent implements OnInit, OnDestroy {
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);
  private itemService  = inject(ItemService);
  private typeService  = inject(ProductTypeService);
  private storeService = inject(StoreService);
  private imageService = inject(ItemImageService);
  private variantMapSvc = inject(ProductItemVariantMapService);
  userActivity = inject(UserActivityService);
  private iconConfig = inject(IconConfigService);

  private _routeSub!: Subscription;
  private _pendingTypeId: number | null = null;

  compareIcon  = this.iconConfig.iconSignal('global.compare',  'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  allTypes      = signal<ProductType[]>([]);
  selectedType  = signal<ProductType | null>(null);
  items         = signal<Item[]>([]);
  stores        = signal<Store[]>([]);
  itemVariantMaps = signal<ProductItemVariantMap[]>([]);
  bestPrices    = signal<ItemBestPrice[]>([]);

  loadingTypes  = signal(false);
  loadingItems  = signal(false);

  viewMode   = signal<'grid' | 'list'>('grid');
  colsPerRow = signal<GridColumns>(5);
  colClass   = computedColClass(this.colsPerRow);
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

  isStoreOnline(storeId: number): boolean {
    return this.stores().find(s => s.id === storeId)?.storeTypeIds.includes(StoreType.Online) ?? false;
  }

  typeImgUrl(type: ProductType): string | null {
    if (type.typeImage) return this.typeService.resolveImageUrl(type.typeImage);
    return null;
  }

  coverUrl(item: Item): string | null {
    if (item.imageUrl) return item.imageUrl.startsWith('http') ? item.imageUrl : this.imageService.resolveUrl(item.imageUrl);
    if (item.images?.length) return this.imageService.resolveUrl(item.images[0]);
    return null;
  }

  isFavorite(id: number): boolean { return this.userActivity.favoriteIds().has(id); }
  toggleFavorite(id: number): void { this.userActivity.toggleFavorite(id); }

  selectType(type: ProductType): void {
    this.router.navigate(['/shop-by-type/by-type', type.id]);
  }

  goToRoot(): void {
    this.router.navigate(['/shop-by-type']);
  }

  openDetail(item: Item): void {
    this.router.navigate(['/shop-by-type/by-type', this.selectedType()!.id, 'item', item.id]);
  }

  ngOnInit(): void {
    this.loadingTypes.set(true);
    this.typeService.getAll().subscribe({
      next: t => {
        this.allTypes.set(t.filter(x => x.isActive !== false).sort((a, b) => a.type.localeCompare(b.type)));
        this.loadingTypes.set(false);
        if (this._pendingTypeId !== null) {
          const found = this.allTypes().find(x => x.id === this._pendingTypeId);
          if (found) this.selectedType.set(found);
          this._pendingTypeId = null;
        }
      },
      error: () => { this.loadingTypes.set(false); }
    });
    this.storeService.getAll().subscribe({ next: s => this.stores.set(s), error: () => {} });
    this.variantMapSvc.getAll().subscribe({ next: d => this.itemVariantMaps.set(d), error: () => {} });
    this.userActivity.loadAll();

    this._routeSub = this.route.paramMap.subscribe(params => {
      const typeId = params.get('typeId');
      this.searchQuery.set('');
      if (typeId) {
        const id = +typeId;
        const found = this.allTypes().find(t => t.id === id);
        if (found) {
          this.selectedType.set(found);
        } else {
          this._pendingTypeId = id;
        }
        this.loadItemsForType(id);
      } else {
        this.selectedType.set(null);
        this.items.set([]);
      }
    });
  }

  ngOnDestroy(): void { this._routeSub?.unsubscribe(); }

  private loadItemsForType(typeId: number): void {
    this.loadingItems.set(true);
    this.bestPrices.set([]);
    this.itemService.getBestPrices().subscribe({ next: bp => this.bestPrices.set(bp), error: () => {} });
    this.itemService.getByType(typeId).subscribe({
      next: data => {
        this.loadingItems.set(false);
        const needImages = data.filter(i => !(i.images?.length) && !i.imageUrl).map(i => i.id!);
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
