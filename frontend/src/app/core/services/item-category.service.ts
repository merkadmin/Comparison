import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { IItemCategory } from '../models/interfaces/IItemCategory';

@Injectable({ providedIn: 'root' })
export class ItemCategoryService {
  private api = inject(ApiService);
  private all$?: Observable<IItemCategory[]>;

  getAll(): Observable<IItemCategory[]> {
    return this.all$ ??= this.api.get<IItemCategory[]>('/itemcategories/getAll').pipe(shareReplay(1));
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

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/itemcategories/import', formData);
  }
}
