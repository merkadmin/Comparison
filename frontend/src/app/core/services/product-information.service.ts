import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { ProductInformation } from '../models/product-information.model';

@Injectable({ providedIn: 'root' })
export class ProductInformationService {
  private api = inject(ApiService);
  private all$?: Observable<ProductInformation[]>;

  getAll(): Observable<ProductInformation[]> {
    return this.all$ ??= this.api.get<ProductInformation[]>('/productinformations/getAll').pipe(shareReplay(1));
  }

  create(item: ProductInformation): Observable<ProductInformation> {
    return this.api.post<ProductInformation>('/productinformations', item);
  }

  update(id: number, item: ProductInformation): Observable<void> {
    return this.api.put<void>(`/productinformations/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/productinformations/${id}`);
  }
}
