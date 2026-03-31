import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { CommonListHeaderActions } from '../common-list-header-actions/common-list-header-actions';
import { ActionMenuItem } from '../commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { ViewMode } from '../commonActions/common-view-mode/common-view-mode';

@Component({
  selector: 'app-entity-list-header-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe, CommonListHeaderActions],
  templateUrl: './entity-list-header-actions.component.html',
  styleUrls: ['./entity-list-header-actions.component.less'],
})
export class EntityListHeaderActionsComponent {
  auth = inject(AuthService);

  @Input() entityPrefix = '';
  @Input() titleKey?: string;

  @Input() viewMode?: ViewMode;
  @Output() viewModeChange = new EventEmitter<ViewMode>();

  @Input() selectedCount = 0;
  @Input() bulkMainLabelKey = 'common.deactivate';
  @Input() bulkMainIconClass = 'ki-minus-circle';
  @Input() bulkMainColor = 'light-danger';
  @Input() bulkMenuItems: ActionMenuItem[] = [];
  @Output() bulkMainClick = new EventEmitter<void>();

  @Input() searchPlaceholderKey?: string;
  @Output() searchChange = new EventEmitter<string>();

  @Input() importing = false;
  @Input() importMenuItems: ActionMenuItem[] = [];
  @Output() fileSelected = new EventEmitter<Event>();

  @Input() importSuccess = false;
  @Input() importSuccessKey?: string;
  @Input() importErrorMessage: string | null = null;
  @Output() importSuccessClose = new EventEmitter<void>();
  @Output() importErrorClose = new EventEmitter<void>();

  @Input() addNewLabelKey?: string;
  @Output() create = new EventEmitter<void>();

  get resolvedTitleKey(): string {
    return this.titleKey ?? `${this.entityPrefix}.title`;
  }

  get resolvedSearchPlaceholderKey(): string | undefined {
    return this.searchPlaceholderKey ?? `${this.entityPrefix}.searchPlaceholder`;
  }

  get resolvedImportSuccessKey(): string {
    return this.importSuccessKey ?? `${this.entityPrefix}.importSuccess`;
  }

  get resolvedAddNewLabelKey(): string {
    return this.addNewLabelKey ?? `${this.entityPrefix}.addNew`;
  }
}
