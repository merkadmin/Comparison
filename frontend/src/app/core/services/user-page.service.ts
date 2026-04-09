import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserPageService {
  private api = inject(ApiService);

  /** Root only — get page IDs assigned to a user. */
  getPageIdsByUser(userId: number): Observable<number[]> {
    return this.api.get<number[]>(`/user-pages/user/${userId}`);
  }

  /** Root only — replace all page assignments for a user. */
  setUserPages(userId: number, pageIds: number[]): Observable<void> {
    return this.api.post<void>(`/user-pages/user/${userId}`, pageIds);
  }

  /** Any auth — returns routes the current user can access. */
  getMyRoutes(): Observable<string[]> {
    return this.api.get<string[]>('/user-pages/my-routes');
  }
}
