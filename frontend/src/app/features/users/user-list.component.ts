import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../../core/services/user.service';
import { UserDto, UserPrivilege, CreateUserRequest } from '../../core/models/user.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { ToastService } from '../../core/services/toast.service';
import { EntityListHeaderActionsComponent } from '../../shared/components/entity-list-header-actions/entity-list-header-actions.component';
import { ActionMenuItem } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { UserListOperationComponent, UserDraft } from './user-list-operation/user-list-operation.component';
import { UserPageAssignmentComponent } from './user-page-assignment/user-page-assignment.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, EntityListHeaderActionsComponent, UserListOperationComponent, UserPageAssignmentComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private service   = inject(UserService);
  private translate = inject(TranslateService);
  private toast     = inject(ToastService);

  // ── List state ───────────────────────────────────────────────────────────
  users      = signal<UserDto[]>([]);
  loading    = signal(false);
  error      = signal<string | null>(null);
  searchTerm = signal('');
  importing  = signal(false);
  importSuccess = signal(false);
  importError   = signal<string | null>(null);

  visibleUsers = computed<UserDto[]>(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return q
      ? this.users().filter(u =>
          u.userName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.privilege.toLowerCase().includes(q))
      : this.users();
  });

  // ── Page assignment modal ─────────────────────────────────────────────────
  assigningPagesUser = signal<UserDto | null>(null);

  openPageAssignment(user: UserDto): void { this.assigningPagesUser.set(user); }
  closePageAssignment(): void { this.assigningPagesUser.set(null); }

  // ── Modal state ───────────────────────────────────────────────────────────
  editingId  = signal<number | null>(null);
  isCreating = signal(false);
  saving     = signal(false);
  editDraft: UserDraft = { userName: '', email: '', login: '', privilege: 'Regular', isActive: true };

  // ── Row selection ─────────────────────────────────────────────────────────
  selectedIds = signal<Set<number>>(new Set());

  // ── Action menus ──────────────────────────────────────────────────────────
  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() },
    { labelKey: 'common.exportList',     iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportList() },
  ];

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'user.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => {
        this.users.set([...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.translate('user.saveError'));
        this.loading.set(false);
      },
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  openCreate(): void {
    this.editDraft = { userName: '', email: '', login: '', privilege: 'Regular', isActive: true };
    this.isCreating.set(true);
    this.editingId.set(0);
  }

  openEdit(user: UserDto): void {
    this.editDraft = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      login: user.login,
      privilege: user.privilege,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
    };
    this.isCreating.set(false);
    this.editingId.set(user.id);
  }

  closeEdit(): void {
    this.editingId.set(null);
    this.isCreating.set(false);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  saveEdit(): void {
    this.saving.set(true);
    const onError = () => {
      this.saving.set(false);
      this.toast.error(this.translate.translate('user.saveError'));
    };

    if (this.isCreating()) {
      const req: CreateUserRequest = {
        userName:  this.editDraft.userName,
        email:     this.editDraft.email,
        password:  this.editDraft.password!,
        privilege: this.editDraft.privilege,
        login:     this.editDraft.login || undefined,
      };
      this.service.createUser(req).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success(this.translate.translate('user.saveSuccess'));
          this.load();
          this.closeEdit();
        },
        error: onError,
      });
    } else {
      const id = this.editingId()!;
      const payload = {
        id,
        userName:  this.editDraft.userName,
        email:     this.editDraft.email,
        login:     this.editDraft.login || this.editDraft.email,
        privilege: this.editDraft.privilege as any,
        isActive:  this.editDraft.isActive,
        avatarUrl: this.editDraft.avatarUrl ?? null,
      };
      this.service.update(id, payload as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success(this.translate.translate('user.saveSuccess'));
          this.load();
          this.closeEdit();
        },
        error: onError,
      });
    }
  }

  saveEditAndNew(): void {
    if (!this.isCreating()) return;
    this.saving.set(true);
    const onError = () => {
      this.saving.set(false);
      this.toast.error(this.translate.translate('user.saveError'));
    };
    const req: CreateUserRequest = {
      userName:  this.editDraft.userName,
      email:     this.editDraft.email,
      password:  this.editDraft.password!,
      privilege: this.editDraft.privilege,
      login:     this.editDraft.login || undefined,
    };
    this.service.createUser(req).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.translate.translate('user.saveSuccess'));
        this.load();
        this.editDraft = { userName: '', email: '', login: '', privilege: 'Regular', isActive: true };
      },
      error: onError,
    });
  }

  // ── Delete / Activate ─────────────────────────────────────────────────────
  delete(user: UserDto): void {
    if (user.privilege === 'Root') return;
    Swal.fire({
      title: this.translate.translate('user.deleteConfirm'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText:  this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.delete(user.id).subscribe({
        next: () => {
          const s = new Set(this.selectedIds());
          s.delete(user.id);
          this.selectedIds.set(s);
          this.load();
        },
      });
    });
  }

  setActive(user: UserDto, isActive: boolean): void {
    if (user.privilege === 'Root' && !isActive) return;
    if (!isActive) {
      Swal.fire({
        title: this.translate.translate('user.deactivateConfirm'),
        text:  this.translate.translate('user.deactivateConfirmText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f39c12',
        confirmButtonText: this.translate.translate('common.deactivate'),
        cancelButtonText:  this.translate.translate('common.cancel'),
      }).then(result => {
        if (!result.isConfirmed) return;
        this.service.setActive(user.id, isActive).subscribe({
          next: () => this.users.update(list => list.map(u => u.id === user.id ? { ...u, isActive } : u)),
        });
      });
    } else {
      this.service.setActive(user.id, isActive).subscribe({
        next: () => this.users.update(list => list.map(u => u.id === user.id ? { ...u, isActive } : u)),
      });
    }
  }

  deactivateSelected(): void {
    const ids = [...this.selectedIds()];
    const safe = ids.filter(id => this.users().find(u => u.id === id)?.privilege !== 'Root');
    if (!safe.length) return;
    Swal.fire({
      title: this.translate.translate('user.deactivateBulkConfirm'),
      text:  this.translate.translate('user.deactivateBulkText').replace('{count}', String(safe.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText:  this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.setActiveMany(safe, false).subscribe({
        next: () => {
          this.users.update(list => list.map(u => safe.includes(u.id) ? { ...u, isActive: false } : u));
          this.selectedIds.set(new Set());
        },
      });
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    // Filter out root users client-side
    const safe = ids.filter(id => this.users().find(u => u.id === id)?.privilege !== 'Root');
    if (!safe.length) return;
    Swal.fire({
      title: this.translate.translate('user.deleteBulkConfirm'),
      text:  this.translate.translate('user.deleteBulkText').replace('{count}', String(safe.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText:  this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.service.deleteMany(safe).subscribe({
        next: () => { this.selectedIds.set(new Set()); this.load(); },
      });
    });
  }

  // ── Row selection helpers ─────────────────────────────────────────────────
  isSelected(id: number): boolean { return this.selectedIds().has(id); }

  isAllSelected(): boolean {
    const v = this.visibleUsers();
    return v.length > 0 && v.every(u => this.selectedIds().has(u.id));
  }

  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }

  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.visibleUsers().map(u => u.id))
    );
  }

  // ── Export / Import ───────────────────────────────────────────────────────
  exportTemplate(): void {
    this.service.exportTemplate().subscribe({
      next: blob => { this.downloadBlob(blob, 'users-template.xlsx'); },
      error: () => { },
    });
  }

  exportList(): void {
    this.service.exportList().subscribe({
      next: blob => { this.downloadBlob(blob, 'users.xlsx'); },
      error: () => { },
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importing.set(true);
    this.importError.set(null);
    this.importSuccess.set(false);
    this.service.importExcel(file).subscribe({
      next: () => {
        this.importing.set(false);
        this.importSuccess.set(true);
        this.load();
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.importing.set(false);
        this.importError.set(this.translate.translate('user.importError'));
        (event.target as HTMLInputElement).value = '';
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  privilegeBadge(privilege: UserPrivilege): string {
    const map: Record<UserPrivilege, string> = {
      Root:    'badge-light-danger',
      Admin:   'badge-light-primary',
      Premium: 'badge-light-warning',
      Regular: 'badge-light-success',
    };
    return map[privilege] ?? 'badge-light-secondary';
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
