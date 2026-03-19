import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemBrand } from '../../core/models/item-brand.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-item-brand-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-brand-list.component.html',
  styleUrl: './item-brand-list.component.less',
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
  selectedIds   = signal<Set<number>>(new Set());

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.brands();
    return all.length > 0 && all.every(b => this.selectedIds().has(b.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.brands().map(b => b.id!))
    );
  }

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
    this.service.delete(id).subscribe({ next: () => { const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s); this.load(); } });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('brand.deleteBulkText').replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('brand.deleteBulkConfirm'),
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.deleteMany(ids).subscribe({ next: () => { this.selectedIds.set(new Set()); this.load(); } });
    });
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
