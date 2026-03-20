import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { ProductItemType } from '../models/product-item-type.model';

@Injectable({ providedIn: 'root' })
export class ProductItemTypeService {
  private api = inject(ApiService);
  private all$?: Observable<ProductItemType[]>;

  getAll(): Observable<ProductItemType[]> {
    return this.all$ ??= this.api.get<ProductItemType[]>('/productitemtypes/getAll').pipe(shareReplay(1));
  }

  create(item: ProductItemType): Observable<ProductItemType> {
    return this.api.post<ProductItemType>('/productitemtypes', item);
  }

  update(id: number, item: ProductItemType): Observable<void> {
    return this.api.put<void>(`/productitemtypes/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/productitemtypes/${id}`);
  }
}
