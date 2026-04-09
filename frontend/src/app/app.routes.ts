import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItemCategoryListComponent } from './features/settings/item-categories/item-category-list.component';
import { ItemBrandListComponent } from './features/settings/item-brands/item-brand-list.component';
import { ItemListComponent } from './features/settings/items/item-list.component';
import { FavoritesListComponent } from './features/favorites/favorites-list.component';
import { ItemPackageListComponent } from './features/settings/item-packages/item-package-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { StoreListComponent } from './features/settings/stores/store-list.component';
import { ShopByCategoryComponent } from './features/shop/shop-by-category/shop-by-category.component';
import { ShopByBrandComponent } from './features/shop/shop-by-brand/shop-by-brand.component';
import { ShopByStoreComponent } from './features/shop/shop-by-store/shop-by-store.component';
import { ShopByTypeComponent } from './features/shop/shop-by-type/shop-by-type.component';
import { ShopBySpecsComponent } from './features/shop/shop-by-specs/shop-by-specs.component';
import { ItemDetailPageComponent } from './features/shop/item-detail/item-detail-page.component';
import { SetIconsComponent } from './features/app-setup/set-icons/set-icons.component';
import { PagesComponent } from './features/app-setup/pages/pages.component';
import { ProductItemVariantListComponent } from './features/settings/product-item-variants/product-item-variant-list.component';
import { ItemVariantMapListComponent } from './features/settings/item-variant-map/item-variant-map-list.component';
import { StoreVariantOrderListComponent } from './features/settings/store-variant-orders/store-variant-order-list.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { OnlineWebsiteListComponent } from './features/settings/online-websites/online-website-list.component';
import { ProductTypeListComponent } from './features/settings/product-types/product-type-list.component';
import { UserListComponent } from './features/users/user-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardComponent },
      { path: 'item-categories', component: ItemCategoryListComponent },
      { path: 'item-brands', component: ItemBrandListComponent },
      { path: 'items', component: ItemListComponent },
      { path: 'item-packages', component: ItemPackageListComponent },
      { path: 'favorites', component: FavoritesListComponent },
      { path: 'stores', component: StoreListComponent },
      { path: 'shop-by-store', component: ShopByStoreComponent },
      { path: 'shop-by-store/by-store/:storeId', component: ShopByStoreComponent },
      { path: 'shop-by-store/by-store/:storeId/item/:itemId', component: ItemDetailPageComponent },
      { path: 'shop-by-category', component: ShopByCategoryComponent },
      { path: 'shop-by-category/by-category/:categoryId', component: ShopByCategoryComponent },
      { path: 'shop-by-category/by-category/:categoryId/item/:itemId', component: ItemDetailPageComponent },
      { path: 'shop-by-brand', component: ShopByBrandComponent },
      { path: 'shop-by-brand/by-brand/:brandId', component: ShopByBrandComponent },
      { path: 'shop-by-brand/by-brand/:brandId/item/:itemId', component: ItemDetailPageComponent },
      { path: 'shop-by-type', component: ShopByTypeComponent },
      { path: 'shop-by-type/by-type/:typeId', component: ShopByTypeComponent },
      { path: 'shop-by-type/by-type/:typeId/item/:itemId', component: ItemDetailPageComponent },
      { path: 'shop-by-specs', component: ShopBySpecsComponent },
      { path: 'shop-by-specs/item/:itemId', component: ItemDetailPageComponent },
      { path: 'app-setup/set-icons', component: SetIconsComponent },
      { path: 'app-setup/pages', component: PagesComponent },
      { path: 'variants', component: ProductItemVariantListComponent },
      { path: 'productItem-variants', component: ItemVariantMapListComponent },
      { path: 'store-variant-orders', component: StoreVariantOrderListComponent },
      { path: 'online-websites', component: OnlineWebsiteListComponent, canActivate: [adminGuard] },
      { path: 'product-types', component: ProductTypeListComponent, canActivate: [adminGuard] },
      { path: 'users', component: UserListComponent, canActivate: [adminGuard] },
    ],
  },
  { path: '**', redirectTo: '' },
];
