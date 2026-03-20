import { Injectable, inject, signal } from '@angular/core';
import { CartItemService } from './cart-item.service';
import { FavoriteProductItemService } from './favorite-product-item.service';

@Injectable({ providedIn: 'root' })
export class UserActivityService {
  private cartSvc     = inject(CartItemService);
  private favoriteSvc = inject(FavoriteProductItemService);

  cartIds     = signal<Set<number>>(new Set());
  favoriteIds = signal<Set<number>>(new Set());

  loadAll(): void {
    this.cartSvc.getMyCart().subscribe({
      next: items => this.cartIds.set(new Set(items.map(x => x.productItemId))),
      error: () => {},
    });
    this.favoriteSvc.getMyFavorites().subscribe({
      next: items => this.favoriteIds.set(new Set(items.map(x => x.productItemId))),
      error: () => {},
    });
  }

  private reloadCart(): void {
    this.cartSvc.getMyCart().subscribe({
      next: items => this.cartIds.set(new Set(items.map(x => x.productItemId))),
      error: () => {},
    });
  }

  toggleCart(id: number): void {
    if (this.cartIds().has(id)) {
      this.cartIds.update(s => { const n = new Set(s); n.delete(id); return n; });
      this.cartSvc.remove(id).subscribe({
        next: () => this.reloadCart(),
        error: () => this.reloadCart(),
      });
    } else {
      this.cartIds.update(s => new Set(s).add(id));
      this.cartSvc.add(id).subscribe({
        next: () => this.reloadCart(),
        error: () => this.reloadCart(),
      });
    }
  }

  toggleFavorite(id: number): void {
    if (this.favoriteIds().has(id)) {
      this.favoriteSvc.remove(id).subscribe({ error: () => {} });
      this.favoriteIds.update(s => { const n = new Set(s); n.delete(id); return n; });
    } else {
      this.favoriteSvc.add(id).subscribe({ error: () => {} });
      this.favoriteIds.update(s => new Set(s).add(id));
    }
  }
}
