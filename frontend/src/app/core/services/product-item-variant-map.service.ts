import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductItemVariantMap, ItemPriceDto } from '../models/product-item-variant-map.model';

@Injectable({ providedIn: 'root' })
export class ProductItemVariantMapService {
  private api = inject(ApiService);

  getAll(): Observable<ProductItemVariantMap[]> {
    return this.api.get<ProductItemVariantMap[]>('/item-variant-map/getAll');
  }

  getByItem(itemId: number): Observable<ProductItemVariantMap[]> {
    return this.api.get<ProductItemVariantMap[]>(`/item-variant-map/by-item/${itemId}`);
  }

  getByVariant(variantId: number): Observable<ProductItemVariantMap[]> {
    return this.api.get<ProductItemVariantMap[]>(`/item-variant-map/by-variant/${variantId}`);
  }

  getPrices(itemId: number): Observable<ItemPriceDto[]> {
    return this.api.get<ItemPriceDto[]>(`/item-variant-map/prices/${itemId}`);
  }

  create(map: ProductItemVariantMap): Observable<ProductItemVariantMap> {
    return this.api.post<ProductItemVariantMap>('/item-variant-map', map);
  }

  update(id: number, map: ProductItemVariantMap): Observable<void> {
    return this.api.put<void>(`/item-variant-map/${id}`, map);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/item-variant-map/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/item-variant-map/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/item-variant-map/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/item-variant-map/bulk/active', { ids, isActive });
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/item-variant-map/import', formData);
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/item-variant-map/export-template');
  }

  exportList(): Observable<Blob> {
    return this.api.getBlob('/item-variant-map/export-list');
  }
}
