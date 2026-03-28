import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { IItemCategory } from '../models/interfaces/IItemCategory';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemCategoryService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private fileBase = environment.fileStorageUrl;

  getAll(): Observable<IItemCategory[]> {
    return this.api.get<IItemCategory[]>('/itemcategories/getAll');
  }

  getById(id: number): Observable<IItemCategory> {
    return this.api.get<IItemCategory>(`/itemcategories/${id}`);
  }

  create(category: IItemCategory): Observable<IItemCategory> {
    return this.api.post<IItemCategory>('/itemcategories', category);
  }

  update(id: number, category: IItemCategory): Observable<void> {
    return this.api.put<void>(`/itemcategories/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/itemcategories/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/itemcategories/bulk', ids);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`/itemcategories/${id}/active`, isActive);
  }

  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>('/itemcategories/bulk/active', { ids, isActive });
  }

  getDescendantCount(id: number): Observable<number> {
    return this.api.get<number>(`/itemcategories/${id}/descendant-count`);
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/itemcategories/export-template');
  }

  exportList(): Observable<Blob> {
    return this.api.getBlob('/itemcategories/export-list');
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/itemcategories/import', formData);
  }

  /** Upload a category image to the file storage server. Returns the relative path. */
  uploadImage(categoryId: number, file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.fileBase}/api/categories/${categoryId}/image`, form, { responseType: 'text' });
  }

  /** Delete the image for a category from the file storage server. */
  deleteImage(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.fileBase}/api/categories/${categoryId}/image`);
  }

  /** Resolve a stored relative path to a full URL for display. */
  resolveImageUrl(relativePath: string): string {
    return `${this.fileBase}/${relativePath}`;
  }
}
