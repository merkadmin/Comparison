import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ItemCategoryService } from '../../../core/services/item-category.service';
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
  private categoryService = inject(ItemCategoryService);

  @Input() editDraft!: IItemCategory;
  @Input() isCreating = false;
  @Input() parentOptions: IItemCategory[] = [];
  @Input() saving = false;

  @Output() closed       = new EventEmitter<void>();
  @Output() saved        = new EventEmitter<void>();
  @Output() savedAndNew  = new EventEmitter<void>();
  @Output() imageRemoved = new EventEmitter<void>();

  /** Locally staged file — not yet uploaded to the server. */
  pendingFile: File | null = null;
  pendingPreviewUrl: string | null = null;

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (this.pendingPreviewUrl) URL.revokeObjectURL(this.pendingPreviewUrl);
    this.pendingFile = file;
    this.pendingPreviewUrl = URL.createObjectURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  removePendingFile(): void {
    if (this.pendingPreviewUrl) URL.revokeObjectURL(this.pendingPreviewUrl);
    this.pendingFile = null;
    this.pendingPreviewUrl = null;
  }

  clearPending(): void {
    this.removePendingFile();
  }

  imgUrl(path: string): string {
    return this.categoryService.resolveImageUrl(path);
  }

  localize(ls: MultiLangString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
