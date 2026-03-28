import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ItemBrand } from '../models/item-brand.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemBrandService {
  private api      = inject(ApiService);
  private http     = inject(HttpClient);
  private fileBase = environment.fileStorageUrl;

  getAll(): Observable<ItemBrand[]> {
    return this.api.get<ItemBrand[]>('/itembrands/getAll');
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

  exportList(): Observable<Blob> {
    return this.api.getBlob('/itembrands/export-list');
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/itembrands/import', formData);
  }

  /** Upload a brand image to the file storage server. Returns the relative path. */
  uploadImage(brandId: number, file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.fileBase}/api/brands/${brandId}/image`, form, { responseType: 'text' });
  }

  /** Delete the image for a brand from the file storage server. */
  deleteImage(brandId: number): Observable<void> {
    return this.http.delete<void>(`${this.fileBase}/api/brands/${brandId}/image`);
  }

  /** Resolve a stored relative path to a full URL for display. */
  resolveImageUrl(relativePath: string): string {
    return `${this.fileBase}/${relativePath}`;
  }
}
