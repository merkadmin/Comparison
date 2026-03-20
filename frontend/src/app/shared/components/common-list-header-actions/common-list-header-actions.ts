import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { CommonViewModeComponent, ViewMode } from '../commonActions/common-view-mode/common-view-mode';
import { CommonGridColumnsButton, GridColumns } from '../commonActions/common-grid-columns-button/common-grid-columns-button';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonSearchComponent } from '../common-search/common-search.component';

@Component({
  selector: 'app-common-list-header-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe, CommonViewModeComponent, CommonGridColumnsButton, CommonDropDownMenuActionButton, CommonSearchComponent],
  templateUrl: './common-list-header-actions.html',
})
export class CommonListHeaderActions {
  auth = inject(AuthService);

  @Input() titleKey = '';

  // View mode toggle — omit to hide
  @Input() viewMode?: ViewMode;
  @Output() viewModeChange = new EventEmitter<ViewMode>();

  // Grid columns — shown only when viewMode === 'cards'
  @Input() columns?: GridColumns;
  @Output() columnsChange = new EventEmitter<GridColumns>();

  // Bulk action — shown when isAdmin && selectedCount > 0 && bulkMainLabelKey set
  @Input() selectedCount = 0;
  @Input() bulkMainLabelKey = 'common.deactivate';
  @Input() bulkMainIconClass = 'ki-minus-circle';
  @Input() bulkMainColor = 'light-warning';
  @Input() bulkMenuItems: ActionMenuItem[] = [];
  @Output() bulkMainClick = new EventEmitter<void>();

  // Search — omit searchPlaceholderKey to hide
  @Input() searchPlaceholderKey?: string;
  @Output() searchChange = new EventEmitter<string>();

  // Import — shown when isAdmin && importMenuItems.length > 0
  @Input() importing = false;
  @Input() importMenuItems: ActionMenuItem[] = [];
  @Output() fileSelected = new EventEmitter<Event>();

  // Alerts
  @Input() importSuccess = false;
  @Input() importSuccessKey = '';
  @Input() importErrorMessage: string | null = null;
  @Output() importSuccessClose = new EventEmitter<void>();
  @Output() importErrorClose = new EventEmitter<void>();
}
