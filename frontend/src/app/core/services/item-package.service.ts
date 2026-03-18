import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ItemPackage } from '../models/item-package.model';

@Injectable({ providedIn: 'root' })
export class ItemPackageService {
  private api = inject(ApiService);

  getAll(): Observable<ItemPackage[]> {
    return this.api.get<ItemPackage[]>('/itempackages');
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
}
