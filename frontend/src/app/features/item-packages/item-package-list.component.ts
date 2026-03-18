import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPackageService } from '../../core/services/item-package.service';
import { ItemPackage } from '../../core/models/item-package.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-package-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-package-list.component.html',
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
