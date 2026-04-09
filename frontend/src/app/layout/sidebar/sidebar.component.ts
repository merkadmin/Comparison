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

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, AfterViewInit {
  translate = inject(TranslateService);
  auth = inject(AuthService);
  private catSvc = inject(ItemCategoryService);
  public globalStaticService = inject(GlobalStaticService);

  categories = signal<IItemCategory[]>([]);

  /** Key of the currently expanded accordion section. Default: first dynamic section (Settings). */
  expandedSection = signal<string | null>('dynamic-0');

  toggleSection(key: string): void {
    this.expandedSection.update(v => v === key ? null : key);
  }

  ngOnInit(): void {
    this.catSvc.getAll().subscribe({
      next: data => this.categories.set(data.slice(0, 10)),
      error: () => { }
    });

    this.globalStaticService.setNavigationBarItem();
  }

  ngAfterViewInit(): void {
    const kt = (window as any);
    kt.KTDrawer?.init();
  }

  localize(ls: MultiLangString): string {
    return ls[this.translate.currentLang()] || ls.en;
  }
}
