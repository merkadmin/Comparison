import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { IItemCategory } from '../../../core/models/interfaces/IItemCategory';
import { MultiLangString } from '../../../core/models/interfaces/LocalizedString';

@Component({
  selector: 'app-item-category-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-category-list-operation.component.html',
})
export class ItemCategoryListOperationComponent {
  private translate = inject(TranslateService);

  @Input() editDraft!: IItemCategory;
  @Input() isCreating = false;
  @Input() parentOptions: IItemCategory[] = [];
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();

  localize(ls: MultiLangString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
