import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
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
  private translate = inject(TranslateService);

  @Input() navStack: IItemCategory[] = [];
  @Input() selectedLeaf: IItemCategory | null = null;

  @Output() rootClicked  = new EventEmitter<void>();
  @Output() crumbClicked = new EventEmitter<number>();

  localize(cat: IItemCategory): string {
    const lang = this.translate.currentLang();
    return cat.name[lang] || cat.name['en'];
  }
}
