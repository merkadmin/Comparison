import { Injectable } from '@angular/core';
import { NavigationBarItem } from '../NavigationBarItem';

@Injectable({
  providedIn: 'root',
})
export class GlobalStaticService {
  // START::Side navigation Bar items
  private _navigationBarItem: NavigationBarItem[] = [];
  public get navigationBarItem(): NavigationBarItem[] {
    return this._navigationBarItem;
  }
  public set navigationBarItem(value: NavigationBarItem[]) {
    this._navigationBarItem = value;
  }

  public setNavigationBarItem() {
    this._navigationBarItem = [
      { routerLink: '/item-brands', title: 'nav.itemBrands', orderIndex: 0 },
      { routerLink: '/stores', title: 'nav.stores', orderIndex: 1 },
      { routerLink: '/item-categories', title: 'nav.itemCategories', orderIndex: 2 },
      { routerLink: '/items', title: 'nav.items', orderIndex: 3 },
      { routerLink: '/variants', title: 'nav.productItemVariants', orderIndex: 4 },
      { routerLink: '/productItem-variants', title: 'nav.itemVariantMap', orderIndex: 5 },
      { routerLink: '/store-variant-orders', title: 'nav.storeVariantOrders', orderIndex: 6 },
      { routerLink: '/online-websites', title: 'nav.onlineWebsites', orderIndex: 7 },
    ];
  }
  // END::Side navigation Bar items
}
