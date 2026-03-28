import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { ProductType } from '../models/product-type.model';

@Injectable({ providedIn: 'root' })
export class ProductTypeService {
  private api = inject(ApiService);
  private all$?: Observable<ProductType[]>;

  getAll(): Observable<ProductType[]> {
    return this.all$ ??= this.api.get<ProductType[]>('/producttypes/getAll').pipe(shareReplay(1));
  }
}
