import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemCategory, LocalizedString } from '../../core/models/item-category.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-item-category-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-category-list.component.html',
})
export class ItemCategoryListComponent implements OnInit {
  private service   = inject(ItemCategoryService);
  private translate = inject(TranslateService);

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }

  categories = signal<ItemCategory[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.categories.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load categories.'); this.loading.set(false); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.service.delete(id).subscribe({ next: () => this.load() });
  }
}
