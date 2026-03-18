import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemBrand } from '../../core/models/item-brand.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-brand-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="card">
      <div class="card-header border-0 pt-6">
        <div class="card-title">
          <h3 class="fw-bold m-0">{{ 'brand.title' | translate }}</h3>
        </div>
        <div class="card-toolbar">
          <button class="btn btn-sm btn-primary" (click)="load()">
            <i class="ki-duotone ki-arrows-circle fs-2"><span class="path1"></span><span class="path2"></span></i>
            {{ 'common.search' | translate }}
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
                <th class="w-50px">{{ 'common.logo' | translate }}</th>
                <th class="min-w-150px">{{ 'common.name' | translate }}</th>
                <th class="min-w-125px">{{ 'common.country' | translate }}</th>
                <th class="min-w-125px">{{ 'common.created' | translate }}</th>
                <th class="text-end min-w-100px">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody class="text-gray-600 fw-semibold">
              @if (brands().length === 0) {
                <tr>
                  <td colspan="6" class="text-center text-muted py-10">{{ 'common.noData' | translate }}</td>
                </tr>
              }
              @for (brand of brands(); track brand.id; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td>
                    @if (brand.logoUrl) {
                      <div class="symbol symbol-40px">
                        <img [src]="brand.logoUrl" [alt]="brand.name" class="object-fit-contain" />
                      </div>
                    } @else {
                      <div class="symbol symbol-40px symbol-light">
                        <span class="symbol-label bg-light-primary text-primary fw-bold fs-6">
                          {{ brand.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    }
                  </td>
                  <td>
                    <span class="text-gray-800 fw-bold text-hover-primary fs-6">{{ brand.name }}</span>
                  </td>
                  <td class="text-muted">{{ brand.country || '—' }}</td>
                  <td>{{ brand.createdAt | date:'mediumDate' }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-light-danger" (click)="delete(brand.id!)">
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

  delete(id: string): void {
    if (!confirm('Delete this brand?')) return;
    this.service.delete(id).subscribe({ next: () => this.load() });
  }
}
