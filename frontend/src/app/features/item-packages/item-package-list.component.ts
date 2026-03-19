import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ItemPackageService } from '../../core/services/item-package.service';
import { ItemPackage } from '../../core/models/item-package.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-item-package-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-package-list.component.html',
  styleUrl: './item-package-list.component.less',
})
export class ItemPackageListComponent implements OnInit {
  private service   = inject(ItemPackageService);
  private translate = inject(TranslateService);

  packages      = signal<ItemPackage[]>([]);
  loading       = signal(false);
  error         = signal<string | null>(null);
  showActiveOnly = signal(false);
  importing     = signal(false);
  importError   = signal<string | null>(null);
  importSuccess = signal(false);
  selectedIds   = signal<Set<number>>(new Set());

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.showActiveOnly() ? this.service.getActive() : this.service.getAll();
    obs.subscribe({
      next: data => { this.packages.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load packages.'); this.loading.set(false); }
    });
  }

  toggleActive(): void {
    this.showActiveOnly.set(!this.showActiveOnly());
    this.load();
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.packages();
    return all.length > 0 && all.every(p => this.selectedIds().has(p.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.packages().map(p => p.id!))
    );
  }

  delete(id: number): void {
    if (!confirm('Delete this package/offer?')) return;
    this.service.delete(id).subscribe({ next: () => { const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s); this.load(); } });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('package.deleteBulkText').replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('package.deleteBulkConfirm'),
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
        a.download = 'item-packages-template.xlsx';
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
        this.importError.set(this.translate.translate('package.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
