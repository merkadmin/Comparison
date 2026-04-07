import { Injectable } from '@angular/core';
import { ApiGlobalService } from './api-global.service';
import { ProductType } from '../models/product-type.model';

@Injectable({ providedIn: 'root' })
export class ProductTypeService extends ApiGlobalService<ProductType> {
  protected readonly basePath = '/producttypes';
}
