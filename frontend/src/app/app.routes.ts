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
import { StoreItemListComponent } from './features/store-items/store-item-list.component';
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
      { path: 'store-items', component: StoreItemListComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
