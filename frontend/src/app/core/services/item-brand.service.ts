import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiGlobalService } from './api-global.service';
import { ItemBrand } from '../models/item-brand.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemBrandService extends ApiGlobalService<ItemBrand> {
  protected readonly basePath = '/itembrands';

  private http     = inject(HttpClient);
  private fileBase = environment.fileStorageUrl;

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
