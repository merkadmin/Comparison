import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPackageService } from '../../core/services/item-package.service';
import { ItemPackage } from '../../core/models/item-package.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-package-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="card">
      <div class="card-header border-0 pt-6">
        <div class="card-title">
          <h3 class="fw-bold m-0">{{ 'package.title' | translate }}</h3>
        </div>
        <div class="card-toolbar">
          <button class="btn btn-sm me-3"
                  [class.btn-light-primary]="!showActiveOnly()"
                  [class.btn-primary]="showActiveOnly()"
                  (click)="toggleActive()">
            <i class="ki-duotone ki-filter fs-2"><span class="path1"></span><span class="path2"></span></i>
            {{ (showActiveOnly() ? 'package.showAll' : 'package.activeOnly') | translate }}
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
                <th class="min-w-175px">{{ 'common.name' | translate }}</th>
                <th class="min-w-60px">{{ 'package.itemsCount' | translate }}</th>
                <th class="min-w-100px">{{ 'package.originalPrice' | translate }}</th>
                <th class="min-w-100px">{{ 'package.offerPrice' | translate }}</th>
                <th class="min-w-80px">{{ 'package.discount' | translate }}</th>
                <th class="min-w-100px">{{ 'package.startDate' | translate }}</th>
                <th class="min-w-100px">{{ 'package.endDate' | translate }}</th>
                <th class="min-w-80px">{{ 'common.status' | translate }}</th>
                <th class="text-end min-w-100px">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody class="text-gray-600 fw-semibold">
              @if (packages().length === 0) {
                <tr>
                  <td colspan="10" class="text-center text-muted py-10">{{ 'common.noData' | translate }}</td>
                </tr>
              }
              @for (pkg of packages(); track pkg.id; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td>
                    <span class="text-gray-800 fw-bold text-hover-primary d-block fs-6">{{ pkg.name }}</span>
                    @if (pkg.description) {
                      <span class="text-muted fw-semibold fs-7">{{ pkg.description }}</span>
                    }
                  </td>
                  <td>
                    <span class="badge badge-light-primary">{{ pkg.items.length }}</span>
                  </td>
                  <td class="text-muted text-decoration-line-through">
                    {{ pkg.originalPrice | currency }}
                  </td>
                  <td class="text-success fw-bold">{{ pkg.offerPrice | currency }}</td>
                  <td>
                    <span class="badge badge-light-danger fw-bold">
                      {{ pkg.discountPercentage | number:'1.0-1' }}%
                    </span>
                  </td>
                  <td>{{ pkg.startDate | date:'mediumDate' }}</td>
                  <td>
                    @if (pkg.endDate) {
                      {{ pkg.endDate | date:'mediumDate' }}
                    } @else {
                      <span class="text-muted">{{ 'package.noExpiry' | translate }}</span>
                    }
                  </td>
                  <td>
                    @if (pkg.isActive) {
                      <span class="badge badge-light-success">{{ 'common.active' | translate }}</span>
                    } @else {
                      <span class="badge badge-light-danger">{{ 'common.inactive' | translate }}</span>
                    }
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-light-danger" (click)="delete(pkg.id!)">
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
export class ItemPackageListComponent implements OnInit {
  private service = inject(ItemPackageService);

  packages = signal<ItemPackage[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showActiveOnly = signal(false);

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

  delete(id: number): void {
    if (!confirm('Delete this package/offer?')) return;
    this.service.delete(id).subscribe({ next: () => this.load() });
  }
}
