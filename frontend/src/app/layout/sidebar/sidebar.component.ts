import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { IItemCategory } from '../../core/models/interfaces/IItemCategory';
import { MultiLangString } from '../../core/models/interfaces/LocalizedString';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  translate = inject(TranslateService);
  auth = inject(AuthService);
  private catSvc = inject(ItemCategoryService);

  categories = signal<IItemCategory[]>([]);

  ngOnInit(): void {
    this.catSvc.getAll().subscribe({
      next: data => this.categories.set(data.slice(0, 10)),
      error: () => { }
    });
  }

  localize(ls: MultiLangString): string {
    return ls[this.translate.currentLang()] || ls.en;
  }
}
