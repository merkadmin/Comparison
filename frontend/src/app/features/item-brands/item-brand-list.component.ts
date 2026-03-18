import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemBrand } from '../../core/models/item-brand.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-item-brand-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-brand-list.component.html',
})
export class ItemBrandListComponent implements OnInit {
  private service   = inject(ItemBrandService);
  private translate = inject(TranslateService);

  brands        = signal<ItemBrand[]>([]);
  loading       = signal(false);
  error         = signal<string | null>(null);
  importing     = signal(false);
  importError   = signal<string | null>(null);
  importSuccess = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.brands.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load brands.'); this.loading.set(false); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this brand?')) return;
    this.service.delete(id).subscribe({ next: () => this.load() });
  }

  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'item-brands-template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importing.set(true);
    this.importError.set(null);
    this.importSuccess.set(false);
    this.service.importExcel(file).subscribe({
      next: () => {
        this.importing.set(false);
        this.importSuccess.set(true);
        this.load();
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.importing.set(false);
        this.importError.set(this.translate.translate('brand.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
