import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductItemType } from '../models/product-item-type.model';

@Injectable({ providedIn: 'root' })
export class ProductItemTypeService {
  private api = inject(ApiService);

  getAll(): Observable<ProductItemType[]> {
    return this.api.get<ProductItemType[]>('/productitemtypes');
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
