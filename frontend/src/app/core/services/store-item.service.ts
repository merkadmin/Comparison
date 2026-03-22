import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StoreItem } from '../models/store-item.model';

@Injectable({ providedIn: 'root' })
export class StoreItemService {
  private api = inject(ApiService);

  getAll(): Observable<StoreItem[]> {
    return this.api.get<StoreItem[]>('/store-items/getAll');
  }

  create(item: StoreItem): Observable<StoreItem> {
    return this.api.post<StoreItem>('/store-items', item);
  }

  update(id: number, item: StoreItem): Observable<void> {
    return this.api.put<void>(`/store-items/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/store-items/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/store-items/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/store-items/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/store-items/bulk/active', { ids, isActive });
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/store-items/export-template');
  }

  exportList(): Observable<Blob> {
    return this.api.getBlob('/store-items/export-list');
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/store-items/import', formData);
  }
}
