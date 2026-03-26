import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StoreItem } from '../models/store-item.model';

@Injectable({ providedIn: 'root' })
export class StoreItemService {
  private api = inject(ApiService);

  getByStore(storeId: number): Observable<StoreItem[]> {
    return this.api.get<StoreItem[]>(`/store-items/by-store/${storeId}`);
  }

  replaceByStore(storeId: number, items: StoreItem[]): Observable<StoreItem[]> {
    return this.api.put<StoreItem[]>(`/store-items/by-store/${storeId}`, items);
  }
}
