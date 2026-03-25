import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../core/models/item.model';
import { Store } from '../../../core/models/store.model';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { ProductItemVariant } from '../../../core/models/product-item-variant.model';
import { ItemImageService } from '../../../core/services/item-image.service';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { IconConfigService } from '../../../core/services/icon-config.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.less',
})
export class ItemDetailComponent implements OnInit {
  private imageService = inject(ItemImageService);
  userActivity = inject(UserActivityService);
  private iconConfig = inject(IconConfigService);

  cartIcon    = this.iconConfig.iconSignal('global.cart',    'basket');
  compareIcon = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  @Input() item!: Item;
  @Input() storeItems: ProductItemVariantMap[] = [];
  @Input() stores: Store[] = [];
  @Input() compareIds = new Set<number>();
  @Input() itemVariantMaps: ProductItemVariantMap[] = [];
  @Input() allVariants: ProductItemVariant[] = [];

  @Input() isPage = false;

  @Output() closed = new EventEmitter<void>();
  @Output() favoriteToggled = new EventEmitter<number>();
  @Output() cartToggled = new EventEmitter<number>();
  @Output() compareToggled = new EventEmitter<number>();

  activeIdx        = signal(0);
  lightboxIdx      = signal<number | null>(null);
  selectedStoreId  = signal<number | null>(null);   // storeId of selected store row (radio)
  selectedVariants = signal<Map<string, number>>(new Map());

  get variantGroups(): { type: string; variants: ProductItemVariant[] }[] {
    const storeId = this.selectedStoreId();
    const maps = storeId !== null
      ? this.itemVariantMaps.filter(m => m.storeId === storeId)
      : this.itemVariantMaps;

    const groups = new Map<string, ProductItemVariant[]>();
    for (const map of maps) {
      for (const entry of map.variants) {
        const v = this.allVariants.find(v => v.id === entry.variantId && v.isActive !== false);
        if (!v) continue;
        if (!groups.has(v.variantTypeId)) groups.set(v.variantTypeId, []);
        if (!groups.get(v.variantTypeId)!.some(e => e.id === v.id))
          groups.get(v.variantTypeId)!.push(v);
      }
    }
    return Array.from(groups.entries()).map(([type, variants]) => ({ type, variants }));
  }

  /** Finds the variant-map record matching the selected store + all selected variants. */
  private get matchingMap(): ProductItemVariantMap | null {
    const storeId = this.selectedStoreId();
    if (storeId === null) return null;
    const storeMaps = this.itemVariantMaps.filter(m => m.storeId === storeId);
    const selectedIds = [...this.selectedVariants().values()];
    if (selectedIds.length === 0) return storeMaps[0] ?? null;
    return storeMaps.find(m =>
      selectedIds.every(id => m.variants.some(e => e.variantId === id))
    ) ?? storeMaps[0] ?? null;
  }

  get selectedStoreMap(): ProductItemVariantMap | null {
    return this.matchingMap;
  }

  get effectiveDescription(): string {
    return this.selectedStoreMap?.description || this.item.briefDescription || this.item.description || '';
  }

  get effectiveAbout(): string {
    return this.selectedStoreMap?.about || this.item.aboutThisItem || '';
  }

  /** Price for the exact selected store + variant combination, or null if no match. */
  get selectedVariantPrice(): number | null {
    const storeId = this.selectedStoreId();
    if (storeId === null) return null;
    const selectedIds = [...this.selectedVariants().values()];
    if (selectedIds.length === 0) return null;
    const storeMaps = this.itemVariantMaps.filter(m => m.storeId === storeId);
    const match = storeMaps.find(m =>
      selectedIds.every(id => m.variants.some(e => e.variantId === id))
    );
    return match?.sellingPrice ?? null;
  }

  /** The price to display in the Best Price badge — cascades through variant → store → overall best. */
  get displayBestPrice(): number | null {
    if (this.selectedVariantPrice !== null) return this.selectedVariantPrice;
    const storeId = this.selectedStoreId();
    if (storeId !== null) {
      return this.itemStoreItems.find(si => si.storeId === storeId)?.sellingPrice ?? null;
    }
    return this.itemStoreItems[0]?.sellingPrice ?? null;
  }

  get hasVariants(): boolean { return this.variantGroups.length > 0; }

  /**
   * True only when ALL variant groups are selected but no record matches the combination.
   * Partial selection never triggers the warning — we just show the closest price.
   */
  get noVariantMatch(): boolean {
    return this.selectedStoreId() !== null &&
      this.allVariantsSelected &&
      this.hasVariants &&
      this.selectedVariantPrice === null;
  }

  /** Returns the variant-matched price for a given store, or null if no match for current selection. */
  getStoreVariantPrice(storeId: number): number | null {
    const selectedIds = [...this.selectedVariants().values()];
    if (selectedIds.length === 0) return null;
    const storeMaps = this.itemVariantMaps.filter(m => m.storeId === storeId);
    const match = storeMaps.find(m =>
      selectedIds.every(id => m.variants.some(e => e.variantId === id))
    );
    return match?.sellingPrice ?? null;
  }

  get allVariantsSelected(): boolean {
    return !this.hasVariants || this.variantGroups.every(g => this.selectedVariants().has(g.type));
  }

  get selectedVariantSummary(): string {
    return Array.from(this.selectedVariants().values())
      .map(id => {
        const v = this.allVariants.find(v => v.id === id);
        return v ? (v.abbreviation ?? v.variantValue) : '';
      })
      .filter(Boolean)
      .join(' · ');
  }

  ngOnInit(): void {
    // Find the map entry with the absolute lowest price for this item
    const activeMaps = this.storeItems.filter(
      m => m.productItemId === this.item.id && m.isActive !== false
    );
    if (activeMaps.length === 0) return;

    const bestMap = activeMaps.reduce((best, m) =>
      m.sellingPrice < best.sellingPrice ? m : best
    );

    // Auto-select the store that has the best price
    this.selectedStoreId.set(bestMap.storeId);

    // Pre-select all variants from that best-price combination
    const initial = new Map<string, number>();
    for (const entry of bestMap.variants) {
      const v = this.allVariants.find(v => v.id === entry.variantId);
      if (v) initial.set(v.variantTypeId, v.id!);
    }
    this.selectedVariants.set(initial);
  }

  selectVariant(type: string, variantId: number): void {
    this.selectedVariants.update(m => new Map(m).set(type, variantId));
  }

  onStoreRowClick(si: ProductItemVariantMap): void {
    if (this.inCart()) return;
    const newStoreId = this.selectedStoreId() === si.storeId ? null : si.storeId;
    this.selectedStoreId.set(newStoreId);

    if (newStoreId === null) {
      this.selectedVariants.set(new Map());
      return;
    }

    const storeMaps = this.itemVariantMaps
      .filter(m => m.storeId === newStoreId && m.isActive !== false);
    const bestMap = storeMaps.length
      ? storeMaps.reduce((b, m) => m.sellingPrice < b.sellingPrice ? m : b)
      : null;

    const initial = new Map<string, number>();
    if (bestMap) {
      for (const entry of bestMap.variants) {
        const v = this.allVariants.find(v => v.id === entry.variantId);
        if (v) initial.set(v.variantTypeId, v.id!);
      }
    }
    this.selectedVariants.set(initial);
  }

  toggleStoreSelection(si: ProductItemVariantMap): void { this.onStoreRowClick(si); }

  isStoreSelected(si: ProductItemVariantMap): boolean { return this.selectedStoreId() === si.storeId; }

  confirmCart(): void {
    if (this.selectedStoreId() === null || !this.allVariantsSelected) return;
    if (!this.inCart()) this.cartToggled.emit(this.item.id!);
  }

  removeFromCart(): void {
    this.selectedStoreId.set(null);
    this.cartToggled.emit(this.item.id!);
  }

  openLightbox(): void { this.lightboxIdx.set(this.activeIdx()); }
  closeLightbox(): void { this.lightboxIdx.set(null); }
  lightboxNext(): void { this.lightboxIdx.update(i => i !== null ? Math.min(i + 1, this.allImages.length - 1) : null); }
  lightboxPrev(): void { this.lightboxIdx.update(i => i !== null ? Math.max(i - 1, 0) : null); }
  lightboxSelect(i: number): void { this.lightboxIdx.set(i); }

  get allImages(): string[] {
    const imgs = this.item.images?.length
      ? this.item.images.map(p => this.imageService.resolveUrl(p))
      : [];
    if (!imgs.length && this.item.imageUrl) return [this.item.imageUrl];
    return imgs;
  }

  get itemStoreItems(): ProductItemVariantMap[] {
    const active = this.storeItems.filter(m => m.productItemId === this.item.id && m.isActive !== false);
    const best = new Map<number, ProductItemVariantMap>();
    for (const m of active) {
      const existing = best.get(m.storeId);
      if (!existing || m.sellingPrice < existing.sellingPrice) best.set(m.storeId, m);
    }
    return [...best.values()].sort((a, b) => a.sellingPrice - b.sellingPrice);
  }

  getStoreName(storeId: number): string {
    return this.stores.find(s => s.id === storeId)?.name ?? String(storeId);
  }

  isFavorite(): boolean { return this.userActivity.favoriteIds().has(this.item.id!); }
  inCart(): boolean { return this.userActivity.cartIds().has(this.item.id!); }
  inCompare(): boolean { return this.compareIds.has(this.item.id!); }
}
