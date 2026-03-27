import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StoreVariantOrder } from '../models/store-variant-order.model';

@Injectable({ providedIn: 'root' })
export class StoreVariantOrderService {
  private api = inject(ApiService);

  getAll(): Observable<StoreVariantOrder[]> {
    return this.api.get<StoreVariantOrder[]>('/store-variant-orders/getAll');
  }

  getById(id: number): Observable<StoreVariantOrder> {
    return this.api.get<StoreVariantOrder>(`/store-variant-orders/${id}`);
  }

  create(order: StoreVariantOrder): Observable<StoreVariantOrder> {
    return this.api.post<StoreVariantOrder>('/store-variant-orders', order);
  }

  update(id: number, order: StoreVariantOrder): Observable<void> {
    return this.api.put<void>(`/store-variant-orders/${id}`, order);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/store-variant-orders/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/store-variant-orders/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/store-variant-orders/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/store-variant-orders/bulk/active', { ids, isActive });
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/store-variant-orders/import', formData);
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/store-variant-orders/export-template');
  }

  exportList(): Observable<Blob> {
    return this.api.getBlob('/store-variant-orders/export-list');
  }
}
