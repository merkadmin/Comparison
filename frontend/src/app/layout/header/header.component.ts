import { Component, HostListener, OnDestroy, OnInit, inject, signal, computed, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemService } from '../../core/services/item.service';
import { Item } from '../../core/models/item.model';
import { AuthService } from '../../core/services/auth.service';
import { UserActivityService } from '../../core/services/user-activity.service';

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
  imports: [RouterLink, RouterLinkActive, FormsModule, TranslatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  translate        = inject(TranslateService);
  auth             = inject(AuthService);
  userActivity     = inject(UserActivityService);
  private router   = inject(Router);
  private catSvc   = inject(ItemCategoryService);
  private itemSvc  = inject(ItemService);

  isDark = signal(document.documentElement.getAttribute('data-bs-theme') === 'dark');

  private currentUrl = toSignal(
    this.router.events.pipe(map(() => this.router.url)),
    { initialValue: this.router.url }
  );

  // Holds the localized name of the active category (when browsing by category)
  private categoryName = signal<string | null>(null);

  cartCount = computed(() => this.userActivity.cartIds().size);

  /** Global product search input value */
  globalSearch = '';
  suggestions  = signal<Item[]>([]);
  showSuggestions = signal(false);

  private searchInput$ = new Subject<string>();
  private destroy$     = new Subject<void>();

  constructor() {
    // Sync search input with URL ?q= param so back/forward navigation updates it
    effect(() => {
      const url = this.currentUrl();
      const match = url.match(/[?&]q=([^&]*)/);
      this.globalSearch = match ? decodeURIComponent(match[1]) : '';
    });

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

    // Load cart/favorites when user is authenticated
    effect(() => {
      if (this.auth.currentUser()) {
        this.userActivity.loadAll();
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

  ngOnInit(): void {
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term.trim().length >= 1 ? this.itemSvc.search(term.trim()) : of([])),
      takeUntil(this.destroy$),
    ).subscribe(items => {
      this.suggestions.set(items);
      this.showSuggestions.set(items.length > 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click')
  closeSuggestions(): void {
    this.showSuggestions.set(false);
  }

  onSearchInput(): void {
    const term = this.globalSearch.trim();
    if (!term) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    }
    this.searchInput$.next(this.globalSearch);
  }

  selectSuggestion(item: Item): void {
    this.globalSearch = item.name;
    this.showSuggestions.set(false);
    this.router.navigate(['/shop-by-category/by-category', item.itemCategoryId, 'item', item.id]);
  }

  submitSearch(): void {
    const term = this.globalSearch.trim();
    if (term) {
      this.router.navigate(['/shop-by-category'], { queryParams: { q: term } });
    } else {
      this.router.navigate(['/shop-by-category']);
    }
  }

  clearSearch(): void {
    this.globalSearch = '';
    this.router.navigate(['/shop-by-category']);
  }

  toggleTheme(): void {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('data-bs-theme', next);
    this.isDark.set(!this.isDark());
  }
}
