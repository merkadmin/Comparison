import { Injectable, signal, computed } from '@angular/core';

export interface IconSlot {
  key: string;
  label: string;
  defaultIcon: string;
  paths: number;
}

export interface AppPage {
  key: string;
  label: string;
  route: string;
  navIcon: string;
  slots: IconSlot[];
}

// Global slots — shared across all pages that show the same action
const GLOBAL = {
  cart:    { key: 'global.cart',    label: 'Cart Button',    defaultIcon: 'basket',        paths: 3 },
  compare: { key: 'global.compare', label: 'Compare Button', defaultIcon: 'arrows-circle', paths: 2 },
  favorite:{ key: 'global.favorite',label: 'Favorite Button',defaultIcon: 'heart',         paths: 2 },
  add:     { key: 'global.add',     label: 'Add New Button', defaultIcon: 'plus',          paths: 2 },
  edit:    { key: 'global.edit',    label: 'Edit Button',    defaultIcon: 'pencil',        paths: 2 },
  delete:  { key: 'global.delete',  label: 'Delete Button',  defaultIcon: 'trash',         paths: 2 },
  search:  { key: 'global.search',  label: 'Search Input',   defaultIcon: 'magnifier',     paths: 2 },
  filter:  { key: 'global.filter',  label: 'Filter Button',  defaultIcon: 'filter',        paths: 2 },
  import:  { key: 'global.import',  label: 'Import Button',  defaultIcon: 'file-up',       paths: 2 },
  export:  { key: 'global.export',  label: 'Export Button',  defaultIcon: 'file-down',     paths: 2 },
};

export const APP_PAGES: AppPage[] = [
  {
    key: 'items', label: 'Items', route: '/items', navIcon: 'abstract-14',
    slots: [
      GLOBAL.add, GLOBAL.edit, GLOBAL.delete,
      GLOBAL.cart, GLOBAL.compare, GLOBAL.favorite,
      GLOBAL.search, GLOBAL.filter, GLOBAL.import, GLOBAL.export,
    ],
  },
  {
    key: 'item-categories', label: 'Item Categories', route: '/item-categories', navIcon: 'category',
    slots: [GLOBAL.add, GLOBAL.edit, GLOBAL.delete, GLOBAL.search, GLOBAL.import, GLOBAL.export],
  },
  {
    key: 'item-brands', label: 'Item Brands', route: '/item-brands', navIcon: 'award',
    slots: [GLOBAL.add, GLOBAL.edit, GLOBAL.delete, GLOBAL.search, GLOBAL.import, GLOBAL.export],
  },
  {
    key: 'stores', label: 'Stores', route: '/stores', navIcon: 'shop',
    slots: [GLOBAL.add, GLOBAL.edit, GLOBAL.delete, GLOBAL.search, GLOBAL.import, GLOBAL.export],
  },
  {
    key: 'store-items', label: 'Store Items', route: '/store-items', navIcon: 'price-tag',
    slots: [GLOBAL.add, GLOBAL.edit, GLOBAL.delete, GLOBAL.search, GLOBAL.filter, GLOBAL.import, GLOBAL.export],
  },
  {
    key: 'shop', label: 'Shop by Category', route: '/shop', navIcon: 'category',
    slots: [GLOBAL.cart, GLOBAL.compare, GLOBAL.favorite, GLOBAL.search],
  },
  {
    key: 'favorites', label: 'Favorites', route: '/favorites', navIcon: 'heart',
    slots: [GLOBAL.cart, GLOBAL.compare, GLOBAL.favorite, GLOBAL.search],
  },
  {
    key: 'dashboard', label: 'Dashboard', route: '/home', navIcon: 'element-11',
    slots: [GLOBAL.search],
  },
  {
    key: 'product-item-variants', label: 'Item Variants', route: '/product-item-variants', navIcon: 'data',
    slots: [GLOBAL.add, GLOBAL.edit, GLOBAL.delete, GLOBAL.search, GLOBAL.import, GLOBAL.export],
  },
];

const STORAGE_KEY = 'app_icon_config';

@Injectable({ providedIn: 'root' })
export class IconConfigService {
  private _overrides = signal<Record<string, string>>(this._load());

  private _load(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
    catch { return {}; }
  }

  private _save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._overrides()));
  }

  /** Reactive: returns the configured icon name or the default. */
  icon(key: string, defaultIcon: string): string {
    return this._overrides()[key] ?? defaultIcon;
  }

  /** Computed helper — use in components to track changes. */
  iconSignal(key: string, defaultIcon: string) {
    return computed(() => this._overrides()[key] ?? defaultIcon);
  }

  setIcon(key: string, icon: string): void {
    this._overrides.update(m => ({ ...m, [key]: icon }));
    this._save();
  }

  resetIcon(key: string): void {
    this._overrides.update(m => { const n = { ...m }; delete n[key]; return n; });
    this._save();
  }

  resetAll(): void {
    this._overrides.set({});
    this._save();
  }

  hasOverride(key: string): boolean {
    return key in this._overrides();
  }
}
