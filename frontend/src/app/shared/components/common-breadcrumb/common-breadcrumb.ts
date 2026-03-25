import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IItemCategory } from '../../../core/models/interfaces/IItemCategory';
import { TranslateService } from '../../../core/services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-common-breadcrumb',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './common-breadcrumb.html',
  styleUrl: './common-breadcrumb.less',
})
export class CommonBreadcrumb {
  private router    = inject(Router);
  private translate = inject(TranslateService);

  @Input() navStack: IItemCategory[] = [];
  @Input() selectedLeaf: IItemCategory | null = null;

  /** Route navigated to when at root level (no stack, no leaf). */
  @Input() rootRoute: string = '/shop';
  /** Base route segment used for category navigation, e.g. '/shop/by-category'. */
  @Input() categoryRoute: string = '/shop/by-category';

  /** Emitted after back navigation — parent can use this to clear search etc. */
  @Output() backClicked  = new EventEmitter<void>();
  @Output() rootClicked  = new EventEmitter<void>();
  @Output() crumbClicked = new EventEmitter<number>();

  goBack(): void {
    const stack = this.navStack;
    if (this.selectedLeaf) {
      stack.length > 0
        ? this.router.navigate([this.categoryRoute, stack[stack.length - 1].id])
        : this.router.navigate([this.rootRoute]);
    } else {
      stack.length > 1
        ? this.router.navigate([this.categoryRoute, stack[stack.length - 2].id])
        : this.router.navigate([this.rootRoute]);
    }
    this.backClicked.emit();
  }

  localize(cat: IItemCategory): string {
    const lang = this.translate.currentLang();
    return cat.name[lang] || cat.name['en'];
  }
}
