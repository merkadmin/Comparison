import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ItemBrand } from '../models/item-brand.model';

@Injectable({ providedIn: 'root' })
export class ItemBrandService {
  private api = inject(ApiService);

  getAll(): Observable<ItemBrand[]> {
    return this.api.get<ItemBrand[]>('/itembrands');
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

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/itembrands/export-template');
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/itembrands/import', formData);
  }
}
