import { Injectable } from '@angular/core';
import { ApiGlobalService } from './api-global.service';
import { UserDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiGlobalService<UserDto> {
  protected readonly basePath = '/users';
}
