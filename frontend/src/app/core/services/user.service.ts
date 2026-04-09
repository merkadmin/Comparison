import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiGlobalService } from './api-global.service';
import { UserDto, CreateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiGlobalService<UserDto> {
  protected readonly basePath = '/users';

  createUser(req: CreateUserRequest): Observable<UserDto> {
    return this.api.post<UserDto>('/auth/create-user', req);
  }
}
