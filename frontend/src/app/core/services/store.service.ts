import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Store } from '../models/store.model';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private api = inject(ApiService);

  getAll(): Observable<Store[]> {
    return this.api.get<Store[]>('/stores');
  }

  getById(id: string): Observable<Store> {
    return this.api.get<Store>(`/stores/${id}`);
  }

  create(store: Store): Observable<Store> {
    return this.api.post<Store>('/stores', store);
  }
}
