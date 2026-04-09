import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { IItemCategory } from '../../core/models/interfaces/IItemCategory';
import { MultiLangString } from '../../core/models/interfaces/LocalizedString';
import { AuthService } from '../../core/services/auth.service';
import { GlobalStaticService } from '../../shared/helpers/Services/global-static.service';
import { UserPageService } from '../../core/services/user-page.service';
import { NavigationBarItem } from '../../shared/helpers/NavigationBarItem';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, AfterViewInit {
  translate = inject(TranslateService);
  auth = inject(AuthService);
  private catSvc       = inject(ItemCategoryService);
  private userPageSvc  = inject(UserPageService);
  public globalStaticService = inject(GlobalStaticService);

  categories = signal<IItemCategory[]>([]);

  /** Routes the current admin user is allowed to see (empty = root sees all). */
  assignedRoutes = signal<Set<string>>(new Set());

  /** Key of the currently expanded accordion section. Default: first dynamic section (Settings). */
  expandedSection = signal<string | null>('dynamic-0');

  toggleSection(key: string): void {
    this.expandedSection.update(v => v === key ? null : key);
  }

  /** Returns true if a nav child should be visible for the current user. */
  isChildVisible(child: NavigationBarItem): boolean {
    if (!child.isForAdminUser) return true;           // non-admin items always visible
    if (!this.auth.isAdmin()) return false;           // non-admin users never see admin items
    if (this.auth.isRoot()) return true;              // root sees everything
    return this.assignedRoutes().has(child.routerLink ?? ''); // admin: check assignment
  }

  /** Returns true if a parent accordion has at least one visible child. */
  hasVisibleChildren(item: NavigationBarItem): boolean {
    if (!item.ChildrenList?.length) return true;
    return item.ChildrenList.some(c => this.isChildVisible(c));
  }

  ngOnInit(): void {
    this.catSvc.getAll().subscribe({
      next: data => this.categories.set(data.slice(0, 10)),
      error: () => { }
    });

    this.globalStaticService.setNavigationBarItem();

    // For admin (non-root) users, load their assigned page routes to filter the sidebar
    if (this.auth.isAdmin() && !this.auth.isRoot()) {
      this.userPageSvc.getMyRoutes().subscribe({
        next: routes => this.assignedRoutes.set(new Set(routes)),
        error: () => { },
      });
    }
  }

  ngAfterViewInit(): void {
    const kt = (window as any);
    kt.KTDrawer?.init();
  }

  localize(ls: MultiLangString): string {
    return ls[this.translate.currentLang()] || ls.en;
  }
}
