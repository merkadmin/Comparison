import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface StaticLookupItem {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class StaticLookupService {
  private api = inject(ApiService);

  getStoreTypes(): Observable<StaticLookupItem[]>       { return this.api.get('/static/store-types'); }
  getDBStores(): Observable<StaticLookupItem[]>          { return this.api.get('/static/db-stores'); }
  getPriceHistoryTypes(): Observable<StaticLookupItem[]> { return this.api.get('/static/price-history-types'); }
  getSellingPriceTypes(): Observable<StaticLookupItem[]> { return this.api.get('/static/selling-price-types'); }
  getUserPrivileges(): Observable<StaticLookupItem[]>    { return this.api.get('/static/user-privileges'); }
}
