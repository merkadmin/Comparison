import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TableMeta } from '../models/table-meta.model';

@Injectable({ providedIn: 'root' })
export class TableMetaService {
  private api = inject(ApiService);

  getAll(): Observable<TableMeta[]> {
    return this.api.get<TableMeta[]>('/tablenames');
  }

  getByName(name: string): Observable<TableMeta> {
    return this.api.get<TableMeta>(`/tablenames/by-name/${name}`);
  }
}
