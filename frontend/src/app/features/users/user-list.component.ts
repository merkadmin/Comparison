import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserDto } from '../../core/models/user.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private service   = inject(UserService);
  private translate = inject(TranslateService);

  users      = signal<UserDto[]>([]);
  loading    = signal(false);
  error      = signal<string | null>(null);
  searchTerm = signal('');

  visibleUsers = computed<UserDto[]>(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return q
      ? this.users().filter(u =>
          u.userName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.privilege.toLowerCase().includes(q))
      : this.users();
  });

  privilegeBadge(privilege: string): string {
    const map: Record<string, string> = {
      Root:    'badge-light-danger',
      Admin:   'badge-light-primary',
      Premium: 'badge-light-warning',
      Regular: 'badge-light-success',
    };
    return map[privilege] ?? 'badge-light-secondary';
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: data => {
        this.users.set([...data].sort((a, b) => (b as any).id - (a as any).id));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.translate('common.loadError'));
        this.loading.set(false);
      },
    });
  }
}
