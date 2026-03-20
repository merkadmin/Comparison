import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemImageService {
  private base = environment.fileStorageUrl;

  constructor(private http: HttpClient) { }

  /** Returns the full URL for a relative image path stored in the database. */
  resolveUrl(relativePath: string): string {
    return `${this.base}/${relativePath}`;
  }

  /** Fetch all relative paths stored on disk for a given item. */
  getImages(itemId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/api/items/${itemId}/images`);
  }

  /** Fetch images for multiple items at once. Returns a map of itemId → relative paths. */
  getImagesBulk(itemIds: number[]): Observable<Record<number, string[]>> {
    return this.http.post<Record<number, string[]>>(`${this.base}/api/items/images/getImagesBulk`, itemIds);
  }

  /** Upload one or more image files for a given item. Returns relative paths. */
  upload(itemId: number, categoryId: number, files: File[]): Observable<string[]> {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return this.http.post<string[]>(
      `${this.base}/api/items/${itemId}/images?categoryId=${categoryId}`, form);
  }

  /** Delete a single image by its relative path stored in the database. */
  delete(itemId: number, relativePath: string): Observable<void> {
    const filename = relativePath.split('/').pop()!;
    return this.http.delete<void>(`${this.base}/api/items/${itemId}/images/${filename}`);
  }

  /** Delete all images for an item (call when deleting the item). */
  deleteAll(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/items/${itemId}/images`);
  }
}
