import { Component } from '@angular/core';
import { CommonItemsListCardViewParent } from '../../../shared/components/common-items-list-card-view-parent/common-items-list-card-view-parent';

@Component({
  selector: 'app-shop-by-category',
  standalone: true,
  imports: [CommonItemsListCardViewParent],
  templateUrl: './shop-by-category.component.html',
  styleUrl: './shop-by-category.component.less',
})
export class ShopByCategoryComponent {}
