import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartItemService {
  private api = inject(ApiService);

  getMyCart(): Observable<CartItem[]> {
    return this.api.get<CartItem[]>('/cartitems');
  }

  add(productItemId: number): Observable<void> {
    return this.api.post<void>(`/cartitems/${productItemId}`, {});
  }

  remove(productItemId: number): Observable<void> {
    return this.api.delete<void>(`/cartitems/${productItemId}`);
  }
}
