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

  ngOnInit(): void {
    this.catSvc.getAll().subscribe({
      next: data => this.categories.set(data.slice(0, 10)),
      error: () => { }
    });

    this.globalStaticService.setNavigationBarItem();
  }

  ngAfterViewInit(): void {
    // Metronic's KTMenu initialises before Angular renders, so re-init here
    // to pick up the conditionally rendered admin menu items.
    const kt = (window as any);
    kt.KTMenu?.init();
    kt.KTDrawer?.init();
  }

  localize(ls: MultiLangString): string {
    return ls[this.translate.currentLang()] || ls.en;
  }
}
