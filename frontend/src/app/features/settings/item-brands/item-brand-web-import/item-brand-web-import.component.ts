import { Component, Output, EventEmitter, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ItemBrandService } from '../../../../core/services/item-brand.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export interface WebBrandRow {
  name: string;
  logoUrl?: string;
  exists: boolean;
  selected: boolean;
}

export const WEB_SOURCES = [
  { id: 'gsmarena',   label: 'GSMArena',   icon: '🌐' },
  { id: 'phonearena', label: 'PhoneArena', icon: '📱' },
  { id: 'nanoreview', label: 'NanoReview', icon: '🔍' },
  { id: 'kimovil',    label: 'Kimovil',    icon: '📡' },
  { id: 'gizchina',   label: 'GizChina',   icon: '🔧' },
];

@Component({
  selector: 'app-item-brand-web-import',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-brand-web-import.component.html',
})
export class ItemBrandWebImportComponent implements OnInit {
  private service = inject(ItemBrandService);

  @Output() closed   = new EventEmitter<void>();
  @Output() imported = new EventEmitter<void>();

  sources      = WEB_SOURCES;
  activeSource = signal(WEB_SOURCES[0].id);
  rows         = signal<WebBrandRow[]>([]);
  loading      = signal(false);
  importing    = signal(false);
  error        = signal<string | null>(null);
  searchTerm   = signal('');

  visibleRows = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.rows();
    return this.rows().filter(r => r.name.toLowerCase().includes(term));
  });

  selectedCount = computed(() => this.rows().filter(r => r.selected).length);

  allVisibleSelected = computed(() => {
    const visible = this.visibleRows();
    return visible.length > 0 && visible.every(r => r.selected);
  });

  newCount = computed(() => this.rows().filter(r => !r.exists).length);

  ngOnInit(): void { this.fetch(); }

  selectSource(id: string): void {
    if (this.activeSource() === id) return;
    this.activeSource.set(id);
    this.searchTerm.set('');
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.rows.set([]);
    this.service.fetchFromWeb(this.activeSource()).subscribe({
      next: data => {
        this.rows.set(data.map(b => ({ name: b.name, logoUrl: b.logoUrl, exists: b.exists, selected: !b.exists })));
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const msg = typeof err.error === 'string' && err.error
          ? err.error
          : 'Failed to fetch brands from this source. The website may be temporarily unavailable.';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  toggleAll(): void {
    const visible   = this.visibleRows().map(r => r.name);
    const allSelect = !this.allVisibleSelected();
    this.rows.update(rows =>
      rows.map(r => visible.includes(r.name) ? { ...r, selected: allSelect } : r)
    );
  }

  toggleRow(name: string): void {
    this.rows.update(rows => rows.map(r => r.name === name ? { ...r, selected: !r.selected } : r));
  }

  selectOnlyNew(): void {
    this.rows.update(rows => rows.map(r => ({ ...r, selected: !r.exists })));
  }

  importSelected(): void {
    const items = this.rows()
      .filter(r => r.selected && !r.exists)
      .map(r => ({ name: r.name, logoUrl: r.logoUrl }));
    if (!items.length) return;
    const names = items.map(i => i.name);
    this.importing.set(true);
    this.service.importNames(items).subscribe({
      next: () => {
        this.importing.set(false);
        // Mark imported rows as existing
        this.rows.update(rows =>
          rows.map(r => names.includes(r.name) ? { ...r, exists: true, selected: false } : r)
        );
        this.imported.emit();
      },
      error: () => { this.importing.set(false); },
    });
  }
}
