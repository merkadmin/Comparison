import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FavoriteProductItem } from '../models/favorite-product-item.model';

@Injectable({ providedIn: 'root' })
export class FavoriteProductItemService {
  private api = inject(ApiService);

  getMyFavorites(): Observable<FavoriteProductItem[]> {
    return this.api.get<FavoriteProductItem[]>('/favoriteproductitems/getAll');
  }

  add(productItemId: number): Observable<void> {
    return this.api.post<void>(`/favoriteproductitems/${productItemId}`, {});
  }

  remove(productItemId: number): Observable<void> {
    return this.api.delete<void>(`/favoriteproductitems/${productItemId}`);
  }
}
