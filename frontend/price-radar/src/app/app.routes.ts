import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItemCategoryListComponent } from './features/item-categories/item-category-list.component';
import { ItemBrandListComponent } from './features/item-brands/item-brand-list.component';
import { ItemListComponent } from './features/items/item-list.component';
import { ItemPackageListComponent } from './features/item-packages/item-package-list.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'item-categories', component: ItemCategoryListComponent },
      { path: 'item-brands', component: ItemBrandListComponent },
      { path: 'items', component: ItemListComponent },
      { path: 'item-packages', component: ItemPackageListComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
