import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ItemCategory, LocalizedString } from '../../../core/models/item-category.model';

@Component({
  selector: 'app-item-category-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-category-list-operation.component.html',
})
export class ItemCategoryListOperationComponent {
  private translate = inject(TranslateService);

  @Input() editDraft!: ItemCategory;
  @Input() isCreating = false;
  @Input() parentOptions: ItemCategory[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<void>();

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
