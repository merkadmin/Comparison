import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItemCategoryListComponent } from './features/item-categories/item-category-list.component';
import { ItemBrandListComponent } from './features/item-brands/item-brand-list.component';
import { ItemListComponent } from './features/items/item-list.component';
import { FavoritesListComponent } from './features/favorites/favorites-list.component';
import { ItemPackageListComponent } from './features/item-packages/item-package-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { StoreListComponent } from './features/stores/store-list.component';
import { ShopByCategoryComponent } from './features/shop/shop-by-category.component';
import { ShopByBrandComponent } from './features/shop/shop-by-brand.component';
import { ItemDetailPageComponent } from './features/shop/item-detail/item-detail-page.component';
import { SetIconsComponent } from './features/app-setup/set-icons/set-icons.component';
import { PagesComponent } from './features/app-setup/pages/pages.component';
import { ProductItemVariantListComponent } from './features/product-item-variants/product-item-variant-list.component';
import { ItemVariantMapListComponent } from './features/item-variant-map/item-variant-map-list.component';
import { StoreVariantOrderListComponent } from './features/store-variant-orders/store-variant-order-list.component';
import { authGuard } from './core/guards/auth.guard';

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
      { path: 'shop-by-category', component: ShopByCategoryComponent },
      { path: 'shop-by-category/by-category/:categoryId', component: ShopByCategoryComponent },
      { path: 'shop-by-category/by-category/:categoryId/item/:itemId', component: ItemDetailPageComponent },
      { path: 'shop-by-brand', component: ShopByBrandComponent },
      { path: 'shop-by-brand/by-brand/:brandId', component: ShopByBrandComponent },
      { path: 'shop-by-brand/by-brand/:brandId/item/:itemId', component: ItemDetailPageComponent },
      { path: 'app-setup/set-icons', component: SetIconsComponent },
      { path: 'app-setup/pages', component: PagesComponent },
      { path: 'variants', component: ProductItemVariantListComponent },
      { path: 'productItem-variants', component: ItemVariantMapListComponent },
      { path: 'store-variant-orders', component: StoreVariantOrderListComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
