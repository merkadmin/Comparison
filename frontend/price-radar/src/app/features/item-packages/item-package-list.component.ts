import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPackageService } from '../../core/services/item-package.service';
import { ItemPackage } from '../../core/models/item-package.model';

@Component({
  selector: 'app-item-package-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-package-list.component.html',
  styleUrl: './item-package-list.component.scss'
})
export class ItemPackageListComponent implements OnInit {
  private service = inject(ItemPackageService);

  packages: ItemPackage[] = [];
  loading = false;
  error: string | null = null;
  showActiveOnly = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const obs = this.showActiveOnly ? this.service.getActive() : this.service.getAll();
    obs.subscribe({
      next: data => { this.packages = data; this.loading = false; },
      error: () => { this.error = 'Failed to load packages.'; this.loading = false; }
    });
  }

  toggleActive(): void {
    this.showActiveOnly = !this.showActiveOnly;
    this.load();
  }

  delete(id: string): void {
    if (!confirm('Delete this offer/package?')) return;
    this.service.delete(id).subscribe({ next: () => this.load() });
  }
}
