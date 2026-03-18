import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ItemCategory } from '../models/item-category.model';

@Injectable({ providedIn: 'root' })
export class ItemCategoryService {
  private api = inject(ApiService);

  getAll(): Observable<ItemCategory[]> {
    return this.api.get<ItemCategory[]>('/itemcategories');
  }

  getById(id: number): Observable<ItemCategory> {
    return this.api.get<ItemCategory>(`/itemcategories/${id}`);
  }

  create(category: ItemCategory): Observable<ItemCategory> {
    return this.api.post<ItemCategory>('/itemcategories', category);
  }

  update(id: number, category: ItemCategory): Observable<void> {
    return this.api.put<void>(`/itemcategories/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/itemcategories/${id}`);
  }
}
