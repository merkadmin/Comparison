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
      { routerLink: '/item-brands', title: 'nav.itemBrands', menuIcon: 'menu-bullet', orderIndex: 0 },
      { routerLink: '/stores', title: 'nav.stores', menuIcon: 'menu-bullet', orderIndex: 1 },
      { routerLink: '/item-categories', title: 'nav.itemCategories', menuIcon: 'menu-bullet', orderIndex: 2 },
      { routerLink: '/items', title: 'nav.items', menuIcon: 'menu-bullet', orderIndex: 3 },
      { routerLink: '/variants', title: 'nav.productItemVariants', menuIcon: 'menu-bullet', orderIndex: 4 },
      { routerLink: '/productItem-variants', title: 'nav.itemVariantMap', menuIcon: 'menu-bullet', orderIndex: 5 },
      { routerLink: '/store-variant-orders', title: 'nav.storeVariantOrders', menuIcon: 'menu-bullet', orderIndex: 6 },
      { routerLink: '/online-websites', title: 'nav.onlineWebsites', menuIcon: 'menu-bullet', orderIndex: 7 },
    ];
  }
  // END::Side navigation Bar items
}
