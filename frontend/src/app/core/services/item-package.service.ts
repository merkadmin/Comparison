import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ItemPackage } from '../models/item-package.model';

@Injectable({ providedIn: 'root' })
export class ItemPackageService {
  private api = inject(ApiService);

  getAll(): Observable<ItemPackage[]> {
    return this.api.get<ItemPackage[]>('/itempackages/getAll');
  }

  getActive(): Observable<ItemPackage[]> {
    return this.api.get<ItemPackage[]>('/itempackages/active');
  }

  getById(id: number): Observable<ItemPackage> {
    return this.api.get<ItemPackage>(`/itempackages/${id}`);
  }

  create(pkg: ItemPackage): Observable<ItemPackage> {
    return this.api.post<ItemPackage>('/itempackages', pkg);
  }

  update(id: number, pkg: ItemPackage): Observable<void> {
    return this.api.put<void>(`/itempackages/${id}`, pkg);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/itempackages/${id}`);
  }

  deleteMany(ids: number[]): Observable<void> {
    return this.api.deleteWithBody<void>('/itempackages/bulk', ids);
  }

  exportTemplate(): Observable<Blob> {
    return this.api.getBlob('/itempackages/export-template');
  }

  importExcel(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFile<void>('/itempackages/import', formData);
  }
}
