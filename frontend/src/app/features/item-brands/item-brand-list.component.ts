import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemBrand } from '../../core/models/item-brand.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-brand-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-brand-list.component.html',
})
export class ItemBrandListComponent implements OnInit {
  private service = inject(ItemBrandService);

  brands = signal<ItemBrand[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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
}
