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

  /**
   * Fetches brands from a website without importing — each entry includes
   * an `exists` flag showing whether it is already in the database.
   */
  fetchFromWeb(source: string): Observable<{ name: string; exists: boolean }[]> {
    return this.api.get(`/itembrands/from-web/${source}`);
  }

  /** Imports a specific list of brand names into the database. */
  importNames(names: string[]): Observable<{ imported: number }> {
    return this.api.post(`/itembrands/import-names`, names);
  }

  /**
   * Scrapes a website and bulk-imports every brand not already in the database.
   * @param source One of: gsmarena | phonearena | nanoreview | kimovil | gizchina
   */
  importFromWeb(source: string): Observable<{ scraped: number; imported: number; skipped: number }> {
    return this.api.post(`/itembrands/import-from-web/${source}`, null);
  }
}
