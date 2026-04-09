import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AppPage } from '../../../core/models/app-page.model';
import { AppPageService } from '../../../core/services/app-page.service';
import { UserPageService } from '../../../core/services/user-page.service';
import { UserDto } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-user-page-assignment',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './user-page-assignment.component.html',
})
export class UserPageAssignmentComponent implements OnInit {
  @Input() user!: UserDto;
  @Output() closed = new EventEmitter<void>();

  private appPageService  = inject(AppPageService);
  private userPageService = inject(UserPageService);
  private toast           = inject(ToastService);
  private translate       = inject(TranslateService);

  allPages       = signal<AppPage[]>([]);
  assignedIds    = signal<Set<number>>(new Set());
  loading        = signal(true);
  saving         = signal(false);

  ngOnInit(): void {
    // Load all pages and assigned page IDs in parallel
    let pagesLoaded = false;
    let assignedLoaded = false;

    const checkDone = () => {
      if (pagesLoaded && assignedLoaded) this.loading.set(false);
    };

    this.appPageService.getAll().subscribe({
      next: pages => {
        this.allPages.set([...pages].sort((a, b) => a.orderIndex - b.orderIndex));
        pagesLoaded = true;
        checkDone();
      },
      error: () => { pagesLoaded = true; checkDone(); },
    });

    this.userPageService.getPageIdsByUser(this.user.id).subscribe({
      next: ids => {
        this.assignedIds.set(new Set(ids));
        assignedLoaded = true;
        checkDone();
      },
      error: () => { assignedLoaded = true; checkDone(); },
    });
  }

  isAssigned(pageId: number): boolean {
    return this.assignedIds().has(pageId);
  }

  toggle(pageId: number): void {
    const s = new Set(this.assignedIds());
    s.has(pageId) ? s.delete(pageId) : s.add(pageId);
    this.assignedIds.set(s);
  }

  selectAll(): void {
    this.assignedIds.set(new Set(this.allPages().map(p => p.id)));
  }

  clearAll(): void {
    this.assignedIds.set(new Set());
  }

  save(): void {
    this.saving.set(true);
    this.userPageService.setUserPages(this.user.id, [...this.assignedIds()]).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.translate.translate('userPage.saveSuccess'));
        this.closed.emit();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error(this.translate.translate('userPage.saveError'));
      },
    });
  }
}
