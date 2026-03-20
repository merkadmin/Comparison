import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonDropDownMenuActionButton } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonImageUploadButton } from '../../shared/components/commonActions/common-image-upload-button/common-image-upload-button';
import { CommonListHeaderActions } from '../../shared/components/common-list-header-actions/common-list-header-actions';
import { ItemListOperationComponent } from '../items/item-list-operation/item-list-operation.component';
import { ItemListComponent } from '../items/item-list.component';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonSelectComponent, CommonDropDownMenuActionButton, CommonImageUploadButton, CommonListHeaderActions, ItemListOperationComponent],
  templateUrl: '../items/item-list.component.html',
  styleUrl: '../items/item-list.component.less',
})
export class FavoritesListComponent extends ItemListComponent {
  protected override get favoritesOnly(): boolean { return true; }
}
