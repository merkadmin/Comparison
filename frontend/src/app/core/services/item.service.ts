import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private api = inject(ApiService);

  getAll(): Observable<Item[]> {
    return this.api.get<Item[]>('/items/getAll');
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

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/items/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/items/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/items/bulk/active', { ids, isActive });
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/items/import', formData);
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/items/export-template');
  }
}
