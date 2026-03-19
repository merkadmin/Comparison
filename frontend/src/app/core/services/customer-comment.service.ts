import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CustomerComment } from '../models/customer-comment.model';

@Injectable({ providedIn: 'root' })
export class CustomerCommentService {
  private api = inject(ApiService);

  getAll(): Observable<CustomerComment[]> {
    return this.api.get<CustomerComment[]>('/customercomments');
  }

  create(item: CustomerComment): Observable<CustomerComment> {
    return this.api.post<CustomerComment>('/customercomments', item);
  }

  update(id: number, item: CustomerComment): Observable<void> {
    return this.api.put<void>(`/customercomments/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/customercomments/${id}`);
  }
}
