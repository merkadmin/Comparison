import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../core/models/item.model';
import { StoreItem, SellingPriceType } from '../../../core/models/store-item.model';
import { Store } from '../../../core/models/store.model';
import { ItemImageService } from '../../../core/services/item-image.service';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.less',
})
export class ItemDetailComponent {
  private imageService = inject(ItemImageService);
  userActivity         = inject(UserActivityService);

  @Input() item!: Item;
  @Input() storeItems: StoreItem[] = [];
  @Input() stores: Store[] = [];
  @Input() compareIds = new Set<number>();

  @Output() closed          = new EventEmitter<void>();
  @Output() favoriteToggled = new EventEmitter<number>();
  @Output() cartToggled     = new EventEmitter<number>();
  @Output() compareToggled  = new EventEmitter<number>();

  activeIdx = signal(0);

  get allImages(): string[] {
    const imgs = this.item.images?.length
      ? this.item.images.map(p => this.imageService.resolveUrl(p))
      : [];
    if (!imgs.length && this.item.imageUrl) return [this.item.imageUrl];
    return imgs;
  }

  get itemStoreItems(): StoreItem[] {
    return this.storeItems
      .filter(si => si.itemId === this.item.id && si.isActive !== false)
      .sort((a, b) => a.sellingPrice - b.sellingPrice);
  }

  getStoreName(storeId: number): string {
    return this.stores.find(s => s.id === storeId)?.name ?? String(storeId);
  }

  priceTypeLabel(type: SellingPriceType): string {
    return SellingPriceType[type] ?? String(type);
  }

  priceTypeBadge(type: SellingPriceType): string {
    if (type === SellingPriceType.Offer)   return 'badge-light-danger';
    if (type === SellingPriceType.Premium) return 'badge-light-warning';
    return 'badge-light-success';
  }

  isFavorite(): boolean { return this.userActivity.favoriteIds().has(this.item.id!); }
  inCart(): boolean     { return this.userActivity.cartIds().has(this.item.id!); }
  inCompare(): boolean  { return this.compareIds.has(this.item.id!); }
}
