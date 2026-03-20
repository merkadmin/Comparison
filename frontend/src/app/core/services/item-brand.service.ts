import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { ItemBrand } from '../models/item-brand.model';

@Injectable({ providedIn: 'root' })
export class ItemBrandService {
  private api = inject(ApiService);
  private all$?: Observable<ItemBrand[]>;

  getAll(): Observable<ItemBrand[]> {
    return this.all$ ??= this.api.get<ItemBrand[]>('/itembrands/getAll').pipe(shareReplay(1));
  }

  getById(id: number): Observable<ItemBrand> {
    return this.api.get<ItemBrand>(`/itembrands/${id}`);
  }

  create(brand: ItemBrand): Observable<ItemBrand> {
    return this.api.post<ItemBrand>('/itembrands', brand);
  }

  update(id: number, brand: ItemBrand): Observable<void> {
    return this.api.put<void>(`/itembrands/${id}`, brand);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/itembrands/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/itembrands/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/itembrands/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/itembrands/bulk/active', { ids, isActive });
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/itembrands/export-template');
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/itembrands/import', formData);
  }
}
