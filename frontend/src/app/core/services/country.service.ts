import { Injectable } from '@angular/core';
import { ApiGlobalService } from './api-global.service';
import { Country } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class CountryService extends ApiGlobalService<Country> {
  protected readonly basePath = '/countries';
}
