import { Component, Input, OnChanges, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { TableMetaService } from '../../../core/services/table-meta.service';
import { ApiService } from '../../../core/services/api.service';
import { TranslateService } from '../../../core/services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ColumnMeta, TableMeta } from '../../../core/models/table-meta.model';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, TranslatePipe, DatePipe, DecimalPipe],
  templateUrl: './dynamic-table.component.html',
})
export class DynamicTableComponent implements OnChanges {
  @Input() tableName!: string;

  private metaService = inject(TableMetaService);
  private api         = inject(ApiService);
  private translate   = inject(TranslateService);

  meta    = signal<TableMeta | null>(null);
  rows    = signal<any[]>([]);
  loading = signal(false);
  error   = signal<string | null>(null);

  columns = computed<ColumnMeta[]>(() =>
    (this.meta()?.columns ?? [])
      .filter(c => c.visible)
      .sort((a, b) => a.order - b.order)
  );

  ngOnChanges(): void {
    if (!this.tableName) return;
    this.loading.set(true);
    this.error.set(null);
    this.metaService.getByName(this.tableName).subscribe({
      next: meta => {
        this.meta.set(meta);
        this.api.get<any[]>(meta.endpoint).subscribe({
          next: rows => { this.rows.set(rows); this.loading.set(false); },
          error: ()  => { this.error.set('Failed to load data.'); this.loading.set(false); }
        });
      },
      error: () => { this.error.set('Failed to load table metadata.'); this.loading.set(false); }
    });
  }

  cellValue(row: any, col: ColumnMeta): any {
    return row[col.field] ?? row[col.field.charAt(0).toUpperCase() + col.field.slice(1)];
  }

  localize(value: any): string {
    if (!value || typeof value !== 'object') return value ?? '—';
    const lang = this.translate.currentLang();
    return value[lang] || value['en'] || '—';
  }
}
