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
      {
        routerLink: '/item-brands',
        title: 'nav.settings',
        menuIcon: 'ki-setting-2',
        orderIndex: 0,
        ChildrenList: [
          { routerLink: '/item-brands', title: 'nav.itemBrands', menuIcon: 'ki-badge', orderIndex: 0 },
          { routerLink: '/stores', title: 'nav.stores', menuIcon: 'ki-shop', orderIndex: 1 },
          { routerLink: '/item-categories', title: 'nav.itemCategories', menuIcon: 'ki-category', orderIndex: 2 },
          { routerLink: '/items', title: 'nav.items', menuIcon: 'ki-package', orderIndex: 3 },
          { routerLink: '/variants', title: 'nav.productItemVariants', menuIcon: 'ki-setting-3', orderIndex: 4 },
          { routerLink: '/productItem-variants', title: 'nav.itemVariantMap', menuIcon: 'ki-data', orderIndex: 5 },
          { routerLink: '/store-variant-orders', title: 'nav.storeVariantOrders', menuIcon: 'ki-some-files', orderIndex: 6 },
          { routerLink: '/online-websites', title: 'nav.onlineWebsites', menuIcon: 'ki-globe', orderIndex: 7 },
        ]
      }
    ];
    // this._navigationBarItem = [
    //   { routerLink: '/item-brands',          title: 'nav.itemBrands',          menuIcon: 'ki-badge',       orderIndex: 0 },
    //   { routerLink: '/stores',               title: 'nav.stores',              menuIcon: 'ki-shop',        orderIndex: 1 },
    //   { routerLink: '/item-categories',      title: 'nav.itemCategories',      menuIcon: 'ki-category',    orderIndex: 2 },
    //   { routerLink: '/items',                title: 'nav.items',               menuIcon: 'ki-package',     orderIndex: 3 },
    //   { routerLink: '/variants',             title: 'nav.productItemVariants', menuIcon: 'ki-setting-3',   orderIndex: 4 },
    //   { routerLink: '/productItem-variants', title: 'nav.itemVariantMap',      menuIcon: 'ki-data',        orderIndex: 5 },
    //   { routerLink: '/store-variant-orders', title: 'nav.storeVariantOrders',  menuIcon: 'ki-some-files',  orderIndex: 6 },
    //   { routerLink: '/online-websites',      title: 'nav.onlineWebsites',      menuIcon: 'ki-globe',       orderIndex: 7 },
    // ];
  }
  // END::Side navigation Bar items
}
