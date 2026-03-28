import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiGlobalService } from './api-global.service';
import { IItemCategory } from '../models/interfaces/IItemCategory';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemCategoryService extends ApiGlobalService<IItemCategory> {
  protected readonly basePath = '/itemcategories';

  private http     = inject(HttpClient);
  private fileBase = environment.fileStorageUrl;

  getDescendantCount(id: number): Observable<number> {
    return this.api.get<number>(`/itemcategories/${id}/descendant-count`);
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
