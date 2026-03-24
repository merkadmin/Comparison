import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductItemVariant } from '../models/product-item-variant.model';

@Injectable({ providedIn: 'root' })
export class ProductItemVariantService {
  private api = inject(ApiService);

  getAll(): Observable<ProductItemVariant[]> {
    return this.api.get<ProductItemVariant[]>('/product-item-variants/getAll');
  }

  getById(id: number): Observable<ProductItemVariant> {
    return this.api.get<ProductItemVariant>(`/product-item-variants/${id}`);
  }

  create(variant: ProductItemVariant): Observable<ProductItemVariant> {
    return this.api.post<ProductItemVariant>('/product-item-variants', variant);
  }

  update(id: number, variant: ProductItemVariant): Observable<void> {
    return this.api.put<void>(`/product-item-variants/${id}`, variant);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/product-item-variants/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/product-item-variants/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/product-item-variants/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/product-item-variants/bulk/active', { ids, isActive });
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/product-item-variants/import', formData);
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/product-item-variants/export-template');
  }

  exportList(): Observable<Blob> {
    return this.api.getBlob('/product-item-variants/export-list');
  }
}
