import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemCategory } from '../../core/models/item-category.model';

@Component({
  selector: 'app-item-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-category-list.component.html',
  styleUrl: './item-category-list.component.scss'
})
export class ItemCategoryListComponent implements OnInit {
  private service = inject(ItemCategoryService);

  categories: ItemCategory[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.service.getAll().subscribe({
      next: data => { this.categories = data; this.loading = false; },
      error: () => { this.error = 'Failed to load categories.'; this.loading = false; }
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.service.delete(id).subscribe({ next: () => this.load() });
  }
}
