import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);

  getAll(): Observable<Product[]> {
    return this.api.get<Product[]>('/products');
  }

  getById(id: string): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  search(keyword: string): Observable<Product[]> {
    return this.api.get<Product[]>(`/products/search?keyword=${keyword}`);
  }

  create(product: Product): Observable<Product> {
    return this.api.post<Product>('/products', product);
  }

  update(id: string, product: Product): Observable<void> {
    return this.api.put<void>(`/products/${id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }
}
