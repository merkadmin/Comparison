import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../core/services/item.service';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { Item } from '../../core/models/item.model';
import { ItemCategory } from '../../core/models/item-category.model';
import { ItemBrand } from '../../core/models/item-brand.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent implements OnInit {
  private itemService = inject(ItemService);
  private categoryService = inject(ItemCategoryService);
  private brandService = inject(ItemBrandService);

  items: Item[] = [];
  categories: ItemCategory[] = [];
  brands: ItemBrand[] = [];
  loading = false;
  error: string | null = null;
  selectedCategoryId = '';
  selectedBrandId = '';

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c);
    this.brandService.getAll().subscribe(b => this.brands = b);
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.error = null;
    const obs = this.selectedCategoryId
      ? this.itemService.getByCategory(this.selectedCategoryId)
      : this.selectedBrandId
        ? this.itemService.getByBrand(this.selectedBrandId)
        : this.itemService.getAll();

    obs.subscribe({
      next: data => { this.items = data; this.loading = false; },
      error: () => { this.error = 'Failed to load items.'; this.loading = false; }
    });
  }

  getBrandName(brandId: string): string {
    return this.brands.find(b => b.id === brandId)?.name ?? '—';
  }

  getCategoryNames(ids: string[]): string {
    return ids.map(id => this.categories.find(c => c.id === id)?.name ?? id).join(', ') || '—';
  }

  delete(id: string): void {
    if (!confirm('Delete this item?')) return;
    this.itemService.delete(id).subscribe({ next: () => this.loadItems() });
  }

  onFilterChange(): void {
    this.loadItems();
  }
}
