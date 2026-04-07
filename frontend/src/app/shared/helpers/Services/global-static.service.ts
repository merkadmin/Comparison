import { Injectable } from '@angular/core';
import { NavigationBarItem } from '../NavigationBarItem';
import { UserRole } from '../StaticEnums';

@Injectable({
  providedIn: 'root',
})
export class GlobalStaticService {
  // =========================================================================================================
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
        isForAdminUser: true,
        ChildrenList: [
          { routerLink: '/item-brands',          title: 'nav.itemBrands',          menuIcon: 'ki-badge',      orderIndex: 0, isForAdminUser: true },
          { routerLink: '/stores',               title: 'nav.stores',              menuIcon: 'ki-shop',       orderIndex: 1, isForAdminUser: true },
          { routerLink: '/item-categories',      title: 'nav.itemCategories',      menuIcon: 'ki-category',   orderIndex: 2, isForAdminUser: true },
          { routerLink: '/items',                title: 'nav.items',               menuIcon: 'ki-package',    orderIndex: 3, isForAdminUser: true },
          { routerLink: '/variants',             title: 'nav.productItemVariants', menuIcon: 'ki-setting-3',  orderIndex: 4, isForAdminUser: true },
          { routerLink: '/productItem-variants', title: 'nav.itemVariantMap',      menuIcon: 'ki-data',       orderIndex: 5, isForAdminUser: true },
          { routerLink: '/store-variant-orders', title: 'nav.storeVariantOrders',  menuIcon: 'ki-some-files', orderIndex: 6, isForAdminUser: true },
          { routerLink: '/online-websites',      title: 'nav.onlineWebsites',      menuIcon: 'ki-globe',      orderIndex: 7, isForAdminUser: true },
          { routerLink: '/product-types',        title: 'nav.productTypes',         menuIcon: 'ki-category',   orderIndex: 8, isForAdminUser: true },
        ]
      }
    ];
  }
  // END::Side navigation Bar items
  // =========================================================================================================

  // =========================================================================================================
  // START::Current logged in user info
  private _currentLoggeduserName: string = '';
  public get CurrentLoggeduserName(): string {
    return this._currentLoggeduserName;
  }
  public set CurrentLoggeduserName(value: string) {
    this._currentLoggeduserName = value;
  }

  private _currentLoggedUserRole: UserRole = UserRole.Regular;
  public get CurrentLoggedUserRole(): UserRole {
    return this._currentLoggedUserRole;
  }
  public set currentLoggedUserRole(value: UserRole) {
    this._currentLoggedUserRole = value;
  }

  private _currentLoggedUserID: number = 0;
  public get CurrentLoggedUserID(): number {
    return this._currentLoggedUserID;
  }
  public set CurrentLoggedUserID(value: number) {
    this._currentLoggedUserID = value;
  }
  // END::Current logged in user info
  // =========================================================================================================
}
