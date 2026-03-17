import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../core/services/item.service';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { Item } from '../../core/models/item.model';
import { ItemCategory } from '../../core/models/item-category.model';
import { ItemBrand } from '../../core/models/item-brand.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="card">
      <div class="card-header border-0 pt-6">
        <div class="card-title">
          <h3 class="fw-bold m-0">{{ 'item.title' | translate }}</h3>
        </div>
        <div class="card-toolbar d-flex gap-3">
          <select class="form-select form-select-sm w-auto"
                  [ngModel]="selectedCategoryId()"
                  (ngModelChange)="selectedCategoryId.set($event); selectedBrandId.set(''); loadItems()">
            <option value="">{{ 'item.allCategories' | translate }}</option>
            @for (c of categories(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
          <select class="form-select form-select-sm w-auto"
                  [ngModel]="selectedBrandId()"
                  (ngModelChange)="selectedBrandId.set($event); selectedCategoryId.set(''); loadItems()">
            <option value="">{{ 'item.allBrands' | translate }}</option>
            @for (b of brands(); track b.id) {
              <option [value]="b.id">{{ b.name }}</option>
            }
          </select>
          <button class="btn btn-sm btn-light-primary" (click)="resetFilters()">
            <i class="ki-duotone ki-filter-search fs-2"><span class="path1"></span><span class="path2"></span></i>
            {{ 'common.all' | translate }}
          </button>
        </div>
      </div>

      <div class="card-body py-4">
        @if (loading()) {
          <div class="d-flex justify-content-center py-10">
            <span class="spinner-border text-primary"></span>
            <span class="ms-3 text-muted">{{ 'common.loading' | translate }}</span>
          </div>
        }
        @if (!loading() && error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        @if (!loading() && !error()) {
          <table class="table align-middle table-row-dashed fs-6 gy-5">
            <thead>
              <tr class="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                <th class="w-30px">{{ 'common.number' | translate }}</th>
                <th class="w-50px">{{ 'common.image' | translate }}</th>
                <th class="min-w-175px">{{ 'common.name' | translate }}</th>
                <th class="min-w-125px">{{ 'item.brand' | translate }}</th>
                <th class="min-w-200px">{{ 'item.categories' | translate }}</th>
                <th class="min-w-100px">{{ 'common.barcode' | translate }}</th>
                <th class="text-end min-w-100px">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody class="text-gray-600 fw-semibold">
              @if (items().length === 0) {
                <tr>
                  <td colspan="7" class="text-center text-muted py-10">{{ 'common.noData' | translate }}</td>
                </tr>
              }
              @for (item of items(); track item.id; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td>
                    @if (item.imageUrl) {
                      <div class="symbol symbol-40px">
                        <img [src]="item.imageUrl" [alt]="item.name" class="object-fit-contain" />
                      </div>
                    } @else {
                      <div class="symbol symbol-40px symbol-light">
                        <span class="symbol-label bg-light-info text-info fw-bold fs-6">
                          {{ item.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    }
                  </td>
                  <td>
                    <span class="text-gray-800 fw-bold text-hover-primary d-block fs-6">{{ item.name }}</span>
                    @if (item.description) {
                      <span class="text-muted fw-semibold fs-7">{{ item.description }}</span>
                    }
                  </td>
                  <td>
                    <span class="badge badge-light-primary">{{ getBrandName(item.brandId) }}</span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      @for (id of item.categoryIds; track id) {
                        <span class="badge badge-light-success">{{ getCategoryName(id) }}</span>
                      }
                    </div>
                  </td>
                  <td class="text-muted">{{ item.barcode || '—' }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-light-danger" (click)="delete(item.id!)">
                      <i class="ki-duotone ki-trash fs-5">
                        <span class="path1"></span><span class="path2"></span>
                        <span class="path3"></span><span class="path4"></span><span class="path5"></span>
                      </i>
                      {{ 'common.delete' | translate }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class ItemListComponent implements OnInit {
  private itemService     = inject(ItemService);
  private categoryService = inject(ItemCategoryService);
  private brandService    = inject(ItemBrandService);

  items      = signal<Item[]>([]);
  categories = signal<ItemCategory[]>([]);
  brands     = signal<ItemBrand[]>([]);
  loading    = signal(false);
  error      = signal<string | null>(null);
  selectedCategoryId = signal('');
  selectedBrandId    = signal('');

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: c => this.categories.set(c), error: () => {} });
    this.brandService.getAll().subscribe({ next: b => this.brands.set(b), error: () => {} });
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.selectedCategoryId()
      ? this.itemService.getByCategory(this.selectedCategoryId())
      : this.selectedBrandId()
        ? this.itemService.getByBrand(this.selectedBrandId())
        : this.itemService.getAll();

    obs.subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load items.'); this.loading.set(false); }
    });
  }

  resetFilters(): void {
    this.selectedCategoryId.set('');
    this.selectedBrandId.set('');
    this.loadItems();
  }

  getBrandName(brandId: string): string {
    return this.brands().find(b => b.id === brandId)?.name ?? brandId;
  }

  getCategoryName(id: string): string {
    return this.categories().find(c => c.id === id)?.name ?? id;
  }

  delete(id: string): void {
    if (!confirm('Delete this item?')) return;
    this.itemService.delete(id).subscribe({ next: () => this.loadItems() });
  }
}
