import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ItemImageService } from '../../../core/services/item-image.service';
import { Item } from '../../../core/models/item.model';
import { IItemCategory } from '../../../core/models/interfaces/IItemCategory';
import { MultiLangString } from '../../../core/models/interfaces/LocalizedString';
import { ItemBrand } from '../../../core/models/item-brand.model';
import { ProductItemType } from '../../../core/models/product-item-type.model';
import { ProductInformation } from '../../../core/models/product-information.model';

@Component({
  selector: 'app-item-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-list-operation.component.html',
  styleUrl: './item-list-operation.component.less',
})
export class ItemListOperationComponent implements OnChanges {
  private translate = inject(TranslateService);
  private imageSvc  = inject(ItemImageService);

  @Input() editDraft!: Item;
  @Input() isCreating = false;
  @Input() brands: ItemBrand[] = [];
  @Input() categories: IItemCategory[] = [];
  @Input() productItemTypes: ProductItemType[] = [];
  @Input() productInfos: ProductInformation[] = [];
  @Input() uploadingImages = false;
  @Input() saving = false;

  /** The parentCategoryId whose children are currently visible in the select. null = root. */
  currentCategoryParentId: number | null = null;
  /** The value currently chosen in the select (null = placeholder). */
  selectedCategoryInLevel: number | null = null;
  /** Stack of parentCategoryId values navigated through — used by the back arrow. */
  categoryNavStack: (number | null)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editDraft'] || changes['categories']) {
      this.initCategoryPath();
    }
  }

  private initCategoryPath(): void {
    const catId = this.editDraft?.itemCategoryId;
    this.currentCategoryParentId = null;
    this.selectedCategoryInLevel = null;
    this.categoryNavStack = [];
    if (!catId || !this.categories.length) return;

    const cat = this.categories.find(c => c.id === catId);
    if (!cat) return;

    // Show the level that contains the saved category.
    this.currentCategoryParentId = cat.parentCategoryId ?? null;
    this.selectedCategoryInLevel = catId;

    // Build the back-navigation stack (root → parent of current level).
    const stack: (number | null)[] = [];
    let levelParent: number | null | undefined = cat.parentCategoryId;
    while (levelParent != null) {
      const levelCat = this.categories.find(c => c.id === levelParent);
      stack.unshift(levelCat?.parentCategoryId ?? null);
      levelParent = levelCat?.parentCategoryId;
    }
    this.categoryNavStack = stack;
  }

  get currentLevelCategories(): IItemCategory[] {
    return this.categories.filter(c =>
      (c.parentCategoryId ?? null) === this.currentCategoryParentId
    );
  }

  get currentLevelName(): string {
    if (this.currentCategoryParentId === null) return '';
    const cat = this.categories.find(c => c.id === this.currentCategoryParentId);
    return cat ? this.localize(cat.name) : '';
  }

  hasChildren(categoryId: number): boolean {
    return this.categories.some(c => c.parentCategoryId === categoryId);
  }

  get isLeafSelected(): boolean {
    return !!this.selectedCategoryInLevel && !this.hasChildren(this.selectedCategoryInLevel);
  }

  onCategoryChange(categoryId: number | null): void {
    if (!categoryId) {
      this.selectedCategoryInLevel = null;
      this.editDraft.itemCategoryId = 0;
      return;
    }
    if (this.hasChildren(categoryId)) {
      // Drill into this category's children.
      this.categoryNavStack.push(this.currentCategoryParentId);
      this.currentCategoryParentId = categoryId;
      this.selectedCategoryInLevel = null;
      this.editDraft.itemCategoryId = 0;
    } else {
      // Leaf — finalise the selection.
      this.selectedCategoryInLevel = categoryId;
      this.editDraft.itemCategoryId = categoryId;
    }
  }

  goBackCategory(): void {
    if (!this.categoryNavStack.length) return;
    this.currentCategoryParentId = this.categoryNavStack.pop() ?? null;
    this.selectedCategoryInLevel = null;
    this.editDraft.itemCategoryId = 0;
  }

  @Output() closed              = new EventEmitter<void>();
  @Output() saved               = new EventEmitter<void>();
  @Output() savedAndNew         = new EventEmitter<void>();
  @Output() priceAdded          = new EventEmitter<void>();
  @Output() priceRemoved        = new EventEmitter<number>();
  @Output() imageFilesSelected  = new EventEmitter<Event>();
  @Output() imageRemoved        = new EventEmitter<number>();

  imgUrl(path: string): string {
    return this.imageSvc.resolveUrl(path);
  }

  localize(ls: MultiLangString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
