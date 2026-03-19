import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { AuthService } from '../../core/services/auth.service';

export interface BreadcrumbItem {
  labelKey?: string;   // translation key
  label?: string;      // raw string (takes precedence over labelKey)
  link?: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  'dashboard':       [{ labelKey: 'nav.dashboard' }],
  'items':           [{ labelKey: 'nav.products', link: '/items' }, { labelKey: 'nav.itemList' }],
  'item-categories': [{ labelKey: 'nav.shopByCategory', link: '/item-categories' }, { labelKey: 'nav.itemCategories' }],
  'item-brands':     [{ labelKey: 'nav.products', link: '/items' }, { labelKey: 'nav.itemBrands' }],
  'item-packages':   [{ labelKey: 'nav.products', link: '/items' }, { labelKey: 'nav.itemPackages' }],
  'stores':          [{ labelKey: 'nav.stores' }],
  'prices':          [{ labelKey: 'nav.prices' }],
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  translate        = inject(TranslateService);
  auth             = inject(AuthService);
  private router   = inject(Router);
  private catSvc   = inject(ItemCategoryService);

  isDark = signal(document.documentElement.getAttribute('data-bs-theme') === 'dark');

  private currentUrl = toSignal(
    this.router.events.pipe(map(() => this.router.url)),
    { initialValue: this.router.url }
  );

  // Holds the localized name of the active category (when browsing by category)
  private categoryName = signal<string | null>(null);

  constructor() {
    // Whenever the URL changes, check for categoryId and fetch the category name
    effect(() => {
      const url = this.currentUrl();
      const match = url.match(/categoryId=(\d+)/);
      if (match) {
        const id = +match[1];
        this.catSvc.getById(id).subscribe({
          next: cat => {
            const lang = this.translate.currentLang();
            this.categoryName.set(cat.name[lang] || cat.name.en);
          },
          error: () => this.categoryName.set(null),
        });
      } else {
        this.categoryName.set(null);
      }
    });
  }

  breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const [path, query] = this.currentUrl().split('?');
    const segment = path.split('/').filter(Boolean)[0] ?? 'dashboard';

    if (segment === 'items' && query?.includes('categoryId')) {
      return [
        { labelKey: 'nav.shopByCategory', link: '/item-categories' },
        { label: this.categoryName() ?? '' },
      ];
    }

    return breadcrumbMap[segment] ?? [{ labelKey: 'nav.dashboard' }];
  });

  readonly flagMap: Record<string, string> = {
    en: 'assets/media/flags/united-states.svg',
    ar: 'assets/media/flags/saudi-arabia.svg',
    fr: 'assets/media/flags/france.svg',
  };

  get currentFlag(): string {
    return this.flagMap[this.translate.currentLang()] ?? '';
  }

  toggleTheme(): void {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('data-bs-theme', next);
    this.isDark.set(!this.isDark());
  }
}
