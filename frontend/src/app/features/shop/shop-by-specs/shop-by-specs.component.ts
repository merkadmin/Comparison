import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { Item } from '../../../core/models/item.model';
import { ProductItemVariant, VariantType } from '../../../core/models/product-item-variant.model';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { ItemBestPrice } from '../../../core/models/store-item.model';
import { Store } from '../../../core/models/store.model';
import { IconConfigService } from '../../../core/services/icon-config.service';
import { ItemImageService } from '../../../core/services/item-image.service';
import { ItemService } from '../../../core/services/item.service';
import { ProductItemVariantMapService } from '../../../core/services/product-item-variant-map.service';
import { ProductItemVariantService } from '../../../core/services/product-item-variant.service';
import { StoreService } from '../../../core/services/store.service';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { computedColClass } from '../../../shared/helpers/grid-columns.helper';
import { GridColumns, CommonGridColumnsButton } from '../../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';

export interface VariantGroup {
  type: VariantType;
  variants: ProductItemVariant[];
  expanded: boolean;
}

@Component({
  selector: 'app-shop-by-specs',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, CommonGridColumnsButton],
  templateUrl: './shop-by-specs.component.html',
  styleUrl: './shop-by-specs.component.less',
})
export class ShopBySpecsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private storeService = inject(StoreService);
  private imageService = inject(ItemImageService);
  private variantMapSvc = inject(ProductItemVariantMapService);
  private variantSvc = inject(ProductItemVariantService);
  private translate = inject(TranslateService);
  userActivity = inject(UserActivityService);
  private iconConfig = inject(IconConfigService);

  private _sub!: Subscription;

  compareIcon = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  // ── State ────────────────────────────────────────────────────────────────
  allItems       = signal<Item[]>([]);
  stores         = signal<Store[]>([]);
  allVariants    = signal<ProductItemVariant[]>([]);
  variantMaps    = signal<ProductItemVariantMap[]>([]);
  bestPrices     = signal<ItemBestPrice[]>([]);
  selectedIds    = signal<Set<number>>(new Set());
  searchQuery    = signal('');

  loading        = signal(true);
  viewMode       = signal<'grid' | 'list'>('grid');
  colsPerRow     = signal<GridColumns>(4);
  colClass       = computedColClass(this.colsPerRow);

  // Variant groups built from the variants that are actually used in active maps
  variantGroups  = signal<VariantGroup[]>([]);

  // ── Derived ──────────────────────────────────────────────────────────────

  /** IDs of variants that are selected, grouped by type for filter logic. */
  private selectedByType = computed<Map<string, Set<number>>>(() => {
    const byType = new Map<string, Set<number>>();
    for (const id of this.selectedIds()) {
      const v = this.allVariants().find(v => v.id === id);
      if (!v) continue;
      if (!byType.has(v.variantTypeId)) byType.set(v.variantTypeId, new Set());
      byType.get(v.variantTypeId)!.add(id);
    }
    return byType;
  });

  filteredItems = computed<Item[]>(() => {
    const byType = this.selectedByType();
    const maps   = this.variantMaps();
    const q      = this.searchQuery().trim().toLowerCase();
    let result   = this.allItems();

    if (q) result = result.filter(i => i.name.toLowerCase().includes(q));

    if (byType.size === 0) return result;

    return result.filter(item => {
      const activeMaps = maps.filter(m => m.productItemId === item.id && m.isActive !== false);
      // AND across types: each selected type must match at least one variant in some active map
      return [...byType.entries()].every(([, ids]) =>
        activeMaps.some(m => m.variants.some(e => ids.has(e.variantId)))
      );
    });
  });

  bestPriceMap = computed<Map<number, ItemBestPrice>>(() =>
    new Map(this.bestPrices().map(bp => [bp.itemId, bp]))
  );

  selectedCount = computed(() => this.selectedIds().size);

  // ── Helpers ──────────────────────────────────────────────────────────────

  isSelected(variantId: number): boolean { return this.selectedIds().has(variantId); }

  toggleVariant(variantId: number): void {
    this.selectedIds.update(s => {
      const n = new Set(s);
      n.has(variantId) ? n.delete(variantId) : n.add(variantId);
      return n;
    });
  }

  clearSelection(): void { this.selectedIds.set(new Set()); }

  toggleGroup(group: VariantGroup): void {
    this.variantGroups.update(groups =>
      groups.map(g => g.type === group.type ? { ...g, expanded: !g.expanded } : g)
    );
  }

  typeLabelKey(type: VariantType): string { return `variant.type.${type}`; }

  typeHasSelection(type: VariantType): boolean {
    return this.selectedByType().has(type);
  }

  getBestPrice(itemId: number): number | null {
    return this.bestPriceMap().get(itemId)?.sellingPrice ?? null;
  }

  getItemStoreItems(itemId: number): ProductItemVariantMap[] {
    const active = this.variantMaps().filter(m => m.productItemId === itemId && m.isActive !== false);
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

  getItemColor(itemId: number): string | null {
    const variantIds = new Set(
      this.variantMaps()
        .filter(m => m.productItemId === itemId && m.isActive !== false)
        .flatMap(m => m.variants.map(e => e.variantId))
    );
    for (const v of this.allVariants()) {
      if (variantIds.has(v.id!) && v.color) return v.color;
    }
    return null;
  }

  imgUrl(path: string): string { return this.imageService.resolveUrl(path); }
  isFavorite(id: number): boolean { return this.userActivity.favoriteIds().has(id); }
  toggleFavorite(id: number): void { this.userActivity.toggleFavorite(id); }

  openDetail(item: Item): void {
    this.router.navigate(['/shop-by-specs/item', item.id]);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.userActivity.loadAll();
    this.storeService.getAll().subscribe({ next: s => this.stores.set(s), error: () => {} });
    this.itemService.getBestPrices().subscribe({ next: bp => this.bestPrices.set(bp), error: () => {} });

    this._sub = combineLatest([
      this.variantSvc.getAll(),
      this.variantMapSvc.getAll(),
      this.itemService.getAll(),
    ]).subscribe({
      next: ([variants, maps, items]) => {
        this.allVariants.set(variants);
        this.variantMaps.set(maps);

        // Load item images
        const needImages = items.filter(i => !(i.images?.length)).map(i => i.id!);
        if (!needImages.length) {
          this.allItems.set(items);
        } else {
          this.imageService.getImagesBulk(needImages).subscribe({
            next: imageMap => {
              this.allItems.set(items.map(item => ({
                ...item,
                images: item.images?.length ? item.images : (imageMap[item.id!] ?? []),
              })));
            },
            error: () => { this.allItems.set(items); }
          });
        }

        // Build variant groups: only types that appear in active maps
        const usedVariantIds = new Set(
          maps.filter(m => m.isActive !== false)
              .flatMap(m => m.variants.map(e => e.variantId))
        );
        const activeVariants = variants.filter(v => v.isActive !== false && usedVariantIds.has(v.id!));
        const typeMap = new Map<VariantType, ProductItemVariant[]>();
        for (const v of activeVariants) {
          if (!typeMap.has(v.variantTypeId)) typeMap.set(v.variantTypeId, []);
          typeMap.get(v.variantTypeId)!.push(v);
        }
        this.variantGroups.set(
          [...typeMap.entries()].map(([type, vs]) => ({ type, variants: vs, expanded: true }))
        );

        // Pre-select variant IDs passed via query param (e.g. from home page picker)
        const idsParam = this.route.snapshot.queryParamMap.get('ids');
        if (idsParam) {
          const preSelected = new Set(idsParam.split(',').map(Number).filter(Boolean));
          this.selectedIds.set(preSelected);
        }

        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  ngOnDestroy(): void { this._sub?.unsubscribe(); }
}
