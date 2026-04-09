import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { UserPrivilege } from '../../../core/models/user.model';

export interface UserDraft {
  id?: number;
  userName: string;
  email: string;
  login: string;
  password?: string;
  privilege: UserPrivilege;
  isActive: boolean;
  avatarUrl?: string;
}

@Component({
  selector: 'app-user-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './user-list-operation.component.html',
})
export class UserListOperationComponent {
  @Input() editDraft!: UserDraft;
  @Input() isCreating = false;
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();

  /** Root cannot be assigned — there is only one root user in the system. */
  readonly privileges: UserPrivilege[] = ['Regular', 'Premium', 'Admin'];

  get isValid(): boolean {
    return !!this.editDraft.userName && !!this.editDraft.email &&
      (!this.isCreating || !!this.editDraft.password);
  }
}
