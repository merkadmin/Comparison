import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Store } from '../models/store.model';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private api = inject(ApiService);

  getAll(): Observable<Store[]> {
    return this.api.get<Store[]>('/stores/getAll');
  }

  getById(id: number): Observable<Store> {
    return this.api.get<Store>(`/stores/${id}`);
  }

  create(store: Store): Observable<Store> {
    return this.api.post<Store>('/stores', store);
  }

  update(id: number, store: Store): Observable<void> {
    return this.api.put<void>(`/stores/${id}`, store);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/stores/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/stores/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/stores/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/stores/bulk/active', { ids, isActive });
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/stores/export-template');
  }

  exportList(): Observable<Blob> {
    return this.api.getBlob('/stores/export-list');
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/stores/import', formData);
  }
}
