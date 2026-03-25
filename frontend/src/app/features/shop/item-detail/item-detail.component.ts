import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../core/models/item.model';
import { StoreItem, SellingPriceType } from '../../../core/models/store-item.model';
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

  cartIcon = this.iconConfig.iconSignal('global.cart', 'basket');
  compareIcon = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite', 'heart');

  @Input() item!: Item;
  @Input() storeItems: StoreItem[] = [];
  @Input() stores: Store[] = [];
  @Input() compareIds = new Set<number>();
  @Input() itemVariantMaps: ProductItemVariantMap[] = [];
  @Input() allVariants: ProductItemVariant[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() favoriteToggled = new EventEmitter<number>();
  @Output() cartToggled = new EventEmitter<number>();
  @Output() compareToggled = new EventEmitter<number>();

  activeIdx        = signal(0);
  lightboxIdx      = signal<number | null>(null);
  selectedStoreIds = signal<Set<number>>(new Set());
  selectedVariants = signal<Map<string, number>>(new Map());

  get variantGroups(): { type: string; variants: ProductItemVariant[] }[] {
    const groups = new Map<string, ProductItemVariant[]>();
    for (const map of this.itemVariantMaps) {
      const v = this.allVariants.find(v => v.id === map.variantId && v.isActive !== false);
      if (!v) continue;
      if (!groups.has(v.variantTypeId)) groups.set(v.variantTypeId, []);
      groups.get(v.variantTypeId)!.push(v);
    }
    return Array.from(groups.entries()).map(([type, variants]) => ({ type, variants }));
  }

  get hasVariants(): boolean { return this.variantGroups.length > 0; }

  get allVariantsSelected(): boolean {
    return !this.hasVariants || this.variantGroups.every(g => this.selectedVariants().has(g.type));
  }

  get selectedVariantSummary(): string {
    const sel = this.selectedVariants();
    return Array.from(sel.values())
      .map(id => {
        const v = this.allVariants.find(v => v.id === id);
        return v ? (v.abbreviation ?? v.variantValue) : '';
      })
      .filter(Boolean)
      .join(' · ');
  }

  ngOnInit(): void {
    const initial = new Map<string, number>();
    for (const group of this.variantGroups) {
      if (group.variants.length > 0) initial.set(group.type, group.variants[0].id!);
    }
    if (initial.size > 0) this.selectedVariants.set(initial);
  }

  selectVariant(type: string, variantId: number): void {
    this.selectedVariants.update(m => new Map(m).set(type, variantId));
  }

  toggleStoreSelection(si: StoreItem): void {
    this.selectedStoreIds.update(s => {
      const n = new Set(s);
      n.has(si.id!) ? n.delete(si.id!) : n.add(si.id!);
      return n;
    });
  }

  isStoreSelected(si: StoreItem): boolean { return this.selectedStoreIds().has(si.id!); }

  confirmCart(): void {
    if (this.selectedStoreIds().size === 0 || !this.allVariantsSelected) return;
    if (!this.inCart()) this.cartToggled.emit(this.item.id!);
  }

  removeFromCart(): void {
    this.selectedStoreIds.set(new Set());
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

  get itemStoreItems(): StoreItem[] {
    const active = this.storeItems.filter(si => si.itemId === this.item.id && si.isActive !== false);
    const bestPerStore = new Map<number, StoreItem>();
    for (const si of active) {
      const existing = bestPerStore.get(si.storeId);
      if (!existing || si.sellingPrice < existing.sellingPrice) bestPerStore.set(si.storeId, si);
    }
    return [...bestPerStore.values()].sort((a, b) => a.sellingPrice - b.sellingPrice);
  }

  getStoreName(storeId: number): string {
    return this.stores.find(s => s.id === storeId)?.name ?? String(storeId);
  }

  priceTypeLabel(type: SellingPriceType): string {
    return SellingPriceType[type] ?? String(type);
  }

  priceTypeBadge(type: SellingPriceType): string {
    if (type === SellingPriceType.Offer) return 'badge-light-danger';
    if (type === SellingPriceType.Premium) return 'badge-light-warning';
    return 'badge-light-success';
  }

  isFavorite(): boolean { return this.userActivity.favoriteIds().has(this.item.id!); }
  inCart(): boolean { return this.userActivity.cartIds().has(this.item.id!); }
  inCompare(): boolean { return this.compareIds.has(this.item.id!); }
}
