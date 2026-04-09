import { Injectable } from '@angular/core';
import { ApiGlobalService } from './api-global.service';
import { AppPage } from '../models/app-page.model';

@Injectable({ providedIn: 'root' })
export class AppPageService extends ApiGlobalService<AppPage> {
  protected readonly basePath = '/app-pages';
}
