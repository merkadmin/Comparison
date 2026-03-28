import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Abstract generic base service for standard CRUD + bulk + import/export operations.
 *
 * Concrete services extend this class and declare `basePath` (e.g. `'/itemcategories'`).
 * All HTTP calls delegate to `ApiService` so timeout and base-URL handling stay centralised.
 *
 * @template T  The model type returned and sent by the API.
 */
@Injectable()
export abstract class ApiGlobalService<T> {
  protected api = inject(ApiService);

  /** API route prefix, e.g. `'/itemcategories'` or `'/itembrands'`. Must start with `/`. */
  protected abstract readonly basePath: string;

  /** Fetch every record of type T from the server. */
  getAll(): Observable<T[]> {
    return this.api.get<T[]>(`${this.basePath}/getAll`);
  }

  /** Fetch a single record by its numeric id. */
  getById(id: number): Observable<T> {
    return this.api.get<T>(`${this.basePath}/${id}`);
  }

  /** Create a new record and return the saved entity (with server-assigned id). */
  create(item: T): Observable<T> {
    return this.api.post<T>(this.basePath, item);
  }

  /** Replace an existing record identified by `id` with the supplied payload. */
  update(id: number, item: T): Observable<void> {
    return this.api.put<void>(`${this.basePath}/${id}`, item);
  }

  /** Hard-delete a single record by id. */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  /** Hard-delete multiple records in one request. */
  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>(`${this.basePath}/bulk`, ids);
  }

  /** Toggle the `isActive` flag on a single record. */
  setActive(id: number, isActive: boolean): Observable<void> {
    return this.api.patch<void>(`${this.basePath}/${id}/active`, isActive);
  }

  /** Toggle the `isActive` flag on multiple records in one request. */
  setActiveMany(ids: number[], isActive: boolean): Observable<void> {
    return this.api.patch<void>(`${this.basePath}/bulk/active`, { ids, isActive });
  }

  /** Download an empty Excel template for bulk-import. */
  exportTemplate(): Observable<Blob> {
    return this.api.getBlob(`${this.basePath}/export-template`);
  }

  /** Download the current list as an Excel file. */
  exportList(): Observable<Blob> {
    return this.api.getBlob(`${this.basePath}/export-list`);
  }

  /** Upload an Excel file to bulk-import records. */
  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>(`${this.basePath}/import`, formData);
  }
}
