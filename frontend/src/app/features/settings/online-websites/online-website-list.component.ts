import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { OnlineWebSiteService } from '../../../core/services/online-web-site.service';
import { CountryService } from '../../../core/services/country.service';
import { OnlineWebSite } from '../../../core/models/online-web-site.model';
import { Country } from '../../../core/models/country.model';

@Component({
  selector: 'app-online-website-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './online-website-list.component.html',
})
export class OnlineWebsiteListComponent implements OnInit {
  private service        = inject(OnlineWebSiteService);
  private countryService = inject(CountryService);

  sites     = signal<OnlineWebSite[]>([]);
  countries = signal<Country[]>([]);
  loading   = signal(false);
  error     = signal<string | null>(null);

  searchTerm        = signal('');
  selectedCountryId = signal<number | null>(null);
  selectedType      = signal<'Store' | 'Viewer' | null>(null);

  visible = computed(() => {
    const term      = this.searchTerm().toLowerCase().trim();
    const countryId = this.selectedCountryId();
    const type      = this.selectedType();

    return this.sites().filter(s => {
      if (type      && s.type      !== type)      return false;
      if (countryId && s.countryId !== countryId) return false;
      if (term && !s.name.toLowerCase().includes(term) &&
                  !s.url.toLowerCase().includes(term))  return false;
      return true;
    });
  });

  storeCount  = computed(() => this.sites().filter(s => s.type === 'Store').length);
  viewerCount = computed(() => this.sites().filter(s => s.type === 'Viewer').length);

  countryName(id: number | undefined): string {
    if (!id) return '—';
    return this.countries().find(c => c.id === id)?.name ?? '—';
  }

  countryCode(id: number | undefined): string | undefined {
    if (!id) return undefined;
    return this.countries().find(c => c.id === id)?.code?.toLowerCase();
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.countryService.getAll().subscribe({
      next: data => this.countries.set([...data].sort((a, b) => a.name.localeCompare(b.name))),
      error: () => {},
    });

    this.service.getAll().subscribe({
      next: data => {
        this.sites.set([...data].sort((a, b) => a.name.localeCompare(b.name)));
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load websites.'); this.loading.set(false); },
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCountryId.set(null);
    this.selectedType.set(null);
  }
}
