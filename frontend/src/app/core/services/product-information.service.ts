import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductInformation } from '../models/product-information.model';

@Injectable({ providedIn: 'root' })
export class ProductInformationService {
  private api = inject(ApiService);

  getAll(): Observable<ProductInformation[]> {
    return this.api.get<ProductInformation[]>('/productinformations');
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
