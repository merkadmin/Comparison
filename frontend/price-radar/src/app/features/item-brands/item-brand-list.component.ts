import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemBrand } from '../../core/models/item-brand.model';

@Component({
  selector: 'app-item-brand-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-brand-list.component.html',
  styleUrl: './item-brand-list.component.scss'
})
export class ItemBrandListComponent implements OnInit {
  private service = inject(ItemBrandService);

  brands: ItemBrand[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.service.getAll().subscribe({
      next: data => { this.brands = data; this.loading = false; },
      error: () => { this.error = 'Failed to load brands.'; this.loading = false; }
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this brand?')) return;
    this.service.delete(id).subscribe({ next: () => this.load() });
  }
}
