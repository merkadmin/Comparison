import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private api = inject(ApiService);

  getAll(): Observable<Item[]> {
    return this.api.get<Item[]>('/items');
  }

  getById(id: number): Observable<Item> {
    return this.api.get<Item>(`/items/${id}`);
  }

  getByCategory(categoryId: number): Observable<Item[]> {
    return this.api.get<Item[]>(`/items/by-category/${categoryId}`);
  }

  getByBrand(brandId: number): Observable<Item[]> {
    return this.api.get<Item[]>(`/items/by-brand/${brandId}`);
  }

  create(item: Item): Observable<Item> {
    return this.api.post<Item>('/items', item);
  }

  update(id: number, item: Item): Observable<void> {
    return this.api.put<void>(`/items/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/items/${id}`);
  }
}
