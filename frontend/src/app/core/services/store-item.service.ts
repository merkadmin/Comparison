import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StoreItemDraft } from '../models/store-item.model';

export interface StoreItemPayload extends StoreItemDraft {
  storeId: number;
}

@Injectable({ providedIn: 'root' })
export class StoreItemService {
  private api = inject(ApiService);

  create(item: StoreItemPayload): Observable<unknown> {
    return this.api.post<unknown>('/store-items', item);
  }
}
