import { Injectable } from '@angular/core';
import { ApiGlobalService } from './api-global.service';
import { OnlineWebSite } from '../models/online-web-site.model';

@Injectable({ providedIn: 'root' })
export class OnlineWebSiteService extends ApiGlobalService<OnlineWebSite> {
  protected readonly basePath = '/onlinewebsites';
}
