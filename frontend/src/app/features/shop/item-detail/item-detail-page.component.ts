import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ItemService } from '../../../core/services/item.service';
import { StoreService } from '../../../core/services/store.service';
import { ProductItemVariantMapService } from '../../../core/services/product-item-variant-map.service';
import { ProductItemVariantService } from '../../../core/services/product-item-variant.service';
import { Item } from '../../../core/models/item.model';
import { Store } from '../../../core/models/store.model';
import { ProductItemVariantMap } from '../../../core/models/product-item-variant-map.model';
import { ProductItemVariant } from '../../../core/models/product-item-variant.model';
import { UserActivityService } from '../../../core/services/user-activity.service';
import { IconConfigService } from '../../../core/services/icon-config.service';
import { StoreVariantOrderService } from '../../../core/services/store-variant-order.service';
import { StoreVariantOrder } from '../../../core/models/store-variant-order.model';
import { ItemDetailComponent } from './item-detail.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-detail-page',
  standalone: true,
  imports: [CommonModule, ItemDetailComponent, TranslatePipe],
  template: `
    <div class="container-fluid py-6 px-6">

      <!-- Back button row with action buttons -->
      <div class="d-flex align-items-center gap-3 mb-5">
        <button class="btn btn-icon btn-light btn-sm" (click)="goBack()">
          <i class="ki-duotone ki-arrow-left fs-2"><span class="path1"></span><span class="path2"></span></i>
        </button>
        @if (item()) {
          <h5 class="fw-bold text-gray-800 mb-0 flex-grow-1">{{ item()!.name }}</h5>

          <!-- Cart button -->
          @if (inCart(item()!.id!)) {
          <button class="btn btn-sm btn-success" (click)="toggleCart(item()!.id!)">
            <i class="ki-duotone ki-{{ cartIcon() }} fs-4">
              <span class="path1"></span><span class="path2"></span><span class="path3"></span>
            </i>
            {{ 'item.removeFromCart' | translate }}
          </button>
          } @else {
          <button class="btn btn-sm btn-primary" (click)="toggleCart(item()!.id!)">
            <i class="ki-duotone ki-{{ cartIcon() }} fs-4">
              <span class="path1"></span><span class="path2"></span><span class="path3"></span>
            </i>
            {{ 'item.addToCart' | translate }}
          </button>
          }

          <!-- Compare button -->
          <button class="btn btn-sm" [class.btn-light-success]="!inCompare(item()!.id!)" [class.btn-success]="inCompare(item()!.id!)"
            (click)="toggleCompare(item()!.id!)">
            <i class="ki-duotone ki-{{ compareIcon() }} fs-4">
              <span class="path1"></span><span class="path2"></span>
            </i>
            {{ 'item.compare' | translate }}
          </button>

          <!-- Favorite button -->
          <button class="btn btn-sm btn-icon" [class.btn-light-danger]="isFavorite(item()!.id!)" [class.btn-light]="!isFavorite(item()!.id!)"
            (click)="toggleFavorite(item()!.id!)">
            <i class="ki-duotone ki-{{ favoriteIcon() }} fs-3"
              [class.text-danger]="isFavorite(item()!.id!)"
              [class.text-gray-400]="!isFavorite(item()!.id!)">
              <span class="path1"></span><span class="path2"></span>
            </i>
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="d-flex justify-content-center py-10">
          <span class="spinner-border text-primary"></span>
          <span class="ms-3 text-muted">{{ 'common.loading' | translate }}</span>
        </div>
      }

      <!-- Detail card -->
      @if (!loading() && item(); as it) {
        <app-item-detail
          [item]="it"
          [isPage]="true"
          [storeItems]="itemVariantMaps()"
          [stores]="stores()"
          [compareIds]="compareIds()"
          [itemVariantMaps]="getItemVariantMaps(it.id!)"
          [allVariants]="allVariants()"
          [storeVariantOrders]="storeVariantOrders()"
          (closed)="goBack()"
          (favoriteToggled)="toggleFavorite($event)"
          (cartToggled)="toggleCart($event)"
          (compareToggled)="toggleCompare($event)" />
      }

    </div>
  `,
})
export class ItemDetailPageComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private itemSvc    = inject(ItemService);
  private storeSvc   = inject(StoreService);
  private variantMapSvc     = inject(ProductItemVariantMapService);
  private variantSvc        = inject(ProductItemVariantService);
  private variantOrderSvc   = inject(StoreVariantOrderService);
  userActivity       = inject(UserActivityService);

  private iconConfig = inject(IconConfigService);

  cartIcon     = this.iconConfig.iconSignal('global.cart',    'basket');
  compareIcon  = this.iconConfig.iconSignal('global.compare', 'kanban');
  favoriteIcon = this.iconConfig.iconSignal('global.favorite','heart');

  categoryId         = signal<number | null>(null);
  brandId            = signal<number | null>(null);
  item               = signal<Item | null>(null);
  stores             = signal<Store[]>([]);
  itemVariantMaps    = signal<ProductItemVariantMap[]>([]);
  allVariants        = signal<ProductItemVariant[]>([]);
  storeVariantOrders = signal<StoreVariantOrder[]>([]);
  compareIds         = signal<Set<number>>(new Set());
  loading            = signal(true);

  isFavorite(id: number): boolean { return this.userActivity.favoriteIds().has(id); }
  inCart(id: number): boolean     { return this.userActivity.cartIds().has(id); }
  inCompare(id: number): boolean  { return this.compareIds().has(id); }

  ngOnInit(): void {
    const catId   = this.route.snapshot.paramMap.get('categoryId');
    const bId     = this.route.snapshot.paramMap.get('brandId');
    const itemId  = +this.route.snapshot.paramMap.get('itemId')!;
    if (catId) this.categoryId.set(+catId);
    if (bId)   this.brandId.set(+bId);

    this.storeSvc.getAll().subscribe({ next: d => this.stores.set(d), error: () => {} });
    this.variantMapSvc.getAll().subscribe({ next: d => this.itemVariantMaps.set(d), error: () => {} });
    this.variantSvc.getAll().subscribe({ next: d => this.allVariants.set(d), error: () => {} });
    this.variantOrderSvc.getAll().subscribe({ next: d => this.storeVariantOrders.set(d), error: () => {} });
    this.userActivity.loadAll();

    this.itemSvc.getById(itemId).subscribe({
      next: d => { this.item.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  goBack(): void {
    if (this.brandId()) {
      this.router.navigate(['/shop-by-brand/by-brand', this.brandId()]);
    } else {
      this.router.navigate(['/shop-by-category/by-category', this.categoryId()]);
    }
  }

  getItemVariantMaps(itemId: number): ProductItemVariantMap[] {
    return this.itemVariantMaps().filter(m => m.productItemId === itemId);
  }

  toggleFavorite(id: number): void { this.userActivity.toggleFavorite(id); }
  toggleCart(id: number): void { this.userActivity.toggleCart(id); }
  toggleCompare(id: number): void {
    this.compareIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
}
