import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiGlobalService } from './api-global.service';
import { ProductType } from '../models/product-type.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductTypeService extends ApiGlobalService<ProductType> {
  protected readonly basePath = '/producttypes';

  private http     = inject(HttpClient);
  private fileBase = environment.fileStorageUrl;

  /** Upload a product type image to the file storage server. Returns the relative path. */
  uploadImage(typeId: number, file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.fileBase}/api/product-types/${typeId}/image`, form, { responseType: 'text' });
  }

  /** Delete the image for a product type from the file storage server. */
  deleteImage(typeId: number): Observable<void> {
    return this.http.delete<void>(`${this.fileBase}/api/product-types/${typeId}/image`);
  }

  /** Resolve a stored relative path to a full URL for display. */
  resolveImageUrl(relativePath: string): string {
    return `${this.fileBase}/${relativePath}`;
  }
}
