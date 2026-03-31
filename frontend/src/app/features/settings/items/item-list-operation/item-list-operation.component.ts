import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../../core/services/translate.service';
import { ItemImageService } from '../../../../core/services/item-image.service';
import { Item } from '../../../../core/models/item.model';
import { SpecificationCategory, SpecificationFieldDef } from '../../../../core/services/static-lookup.service';
import { IItemCategory } from '../../../../core/models/interfaces/IItemCategory';
import { MultiLangString } from '../../../../core/models/interfaces/LocalizedString';
import { ItemBrand } from '../../../../core/models/item-brand.model';
import { ProductType } from '../../../../core/models/product-type.model';

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
  @Input() productTypes: ProductType[] = [];
  @Input() specCategories: SpecificationCategory[] = [];
  @Input() saving = false;

  /** Locally staged files selected by the user — not yet uploaded to the server. */
  pendingFiles: File[] = [];
  /** Object URLs for previewing pending files. */
  pendingPreviewUrls: string[] = [];

  /** The parentCategoryId whose children are currently visible in the select. null = root. */
  currentCategoryParentId: number | null = null;
  /** The value currently chosen in the select (null = placeholder). */
  selectedCategoryInLevel: number | null = null;
  /** Stack of parentCategoryId values navigated through — used by the back arrow. */
  categoryNavStack: (number | null)[] = [];

  /** Tracks which spec sections are expanded in the form. */
  specSections: Record<string, boolean> = {};

  toggleSpecSection(key: string): void {
    this.specSections[key] = !this.specSections[key];
  }

  /** Get or initialize the spec data for a category. */
  getCategorySpecs(categoryName: string): Record<string, any> {
    if (!this.editDraft.specifications) this.editDraft.specifications = {};
    const key = categoryName.charAt(0).toLowerCase() + categoryName.slice(1);
    if (!this.editDraft.specifications[key]) this.editDraft.specifications[key] = {};
    return this.editDraft.specifications[key];
  }

  /** Category key used for data storage (camelCase). */
  catKey(name: string): string {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  /** Get the list of field entries for a spec category. */
  getFieldEntries(cat: SpecificationCategory): { key: string; def: SpecificationFieldDef }[] {
    return Object.entries(cat.fields).map(([key, def]) => ({ key, def }));
  }

  /** Toggle a value in a string-array spec field within a category. */
  toggleSpecArray(categoryName: string, field: string, value: string): void {
    const specs = this.getCategorySpecs(categoryName);
    const arr: string[] = specs[field] ?? [];
    const idx = arr.indexOf(value);
    if (idx >= 0) { arr.splice(idx, 1); } else { arr.push(value); }
    specs[field] = [...arr];
  }

  isSpecSelected(categoryName: string, field: string, value: string): boolean {
    const specs = this.getCategorySpecs(categoryName);
    return (specs[field] as string[] | undefined)?.includes(value) ?? false;
  }

  /** Get/set a string field value within a category. */
  getSpecValue(categoryName: string, field: string): any {
    return this.getCategorySpecs(categoryName)[field] ?? '';
  }

  setSpecValue(categoryName: string, field: string, value: any): void {
    this.getCategorySpecs(categoryName)[field] = value;
  }

  /** Get/set a boolean field value within a category. */
  getSpecBool(categoryName: string, field: string): boolean {
    return this.getCategorySpecs(categoryName)[field] ?? false;
  }

  setSpecBool(categoryName: string, field: string, value: boolean): void {
    this.getCategorySpecs(categoryName)[field] = value;
  }

  /** Get a comma-separated string[] field as a display string. */
  getSpecArrayAsString(categoryName: string, field: string): string {
    const arr = this.getCategorySpecs(categoryName)[field];
    return Array.isArray(arr) ? arr.join(', ') : '';
  }

  /** Set a string[] field from a comma-separated input. */
  setSpecArrayFromString(categoryName: string, field: string, value: string): void {
    this.getCategorySpecs(categoryName)[field] = value ? value.split(',').map(s => s.trim()) : [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editDraft']) {
      this.clearPendingFiles();
      this.initCategoryPath();
      if (!this.editDraft.specifications) this.editDraft.specifications = {};
    }
    if (changes['categories']) {
      this.initCategoryPath();
    }
  }

  private clearPendingFiles(): void {
    this.pendingPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    this.pendingFiles = [];
    this.pendingPreviewUrls = [];
  }

  onFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length) return;
    files.forEach(f => {
      this.pendingFiles = [...this.pendingFiles, f];
      this.pendingPreviewUrls = [...this.pendingPreviewUrls, URL.createObjectURL(f)];
    });
    (event.target as HTMLInputElement).value = '';
  }

  removePendingImage(index: number): void {
    URL.revokeObjectURL(this.pendingPreviewUrls[index]);
    this.pendingFiles = this.pendingFiles.filter((_, i) => i !== index);
    this.pendingPreviewUrls = this.pendingPreviewUrls.filter((_, i) => i !== index);
  }

  private initCategoryPath(): void {
    this.currentCategoryParentId = null;
    this.selectedCategoryInLevel = null;
    this.categoryNavStack = [];
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

  onCategoryChange(categoryId: number | null): void {
    if (!categoryId) {
      this.selectedCategoryInLevel = null;
      return;
    }
    if (this.hasChildren(categoryId)) {
      this.categoryNavStack = [...this.categoryNavStack, this.currentCategoryParentId];
      this.currentCategoryParentId = categoryId;
      this.selectedCategoryInLevel = null;
    } else {
      if (!this.editDraft.categoryIds.includes(categoryId)) {
        this.editDraft.categoryIds = [...this.editDraft.categoryIds, categoryId];
      }
      this.currentCategoryParentId = null;
      this.selectedCategoryInLevel = null;
      this.categoryNavStack = [];
    }
  }

  removeCategoryId(id: number): void {
    this.editDraft.categoryIds = this.editDraft.categoryIds.filter(x => x !== id);
  }

  toggleProductType(id: number): void {
    const ids = this.editDraft.productTypeIds;
    this.editDraft.productTypeIds = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
  }

  isProductTypeSelected(id: number): boolean {
    return this.editDraft.productTypeIds.includes(id);
  }

  goBackCategory(): void {
    if (!this.categoryNavStack.length) return;
    const drilledIntoId = this.currentCategoryParentId;
    const newStack = [...this.categoryNavStack];
    const poppedParent = newStack.pop() ?? null;
    this.categoryNavStack = newStack;
    this.currentCategoryParentId = poppedParent;
    this.selectedCategoryInLevel = drilledIntoId;
  }

  @Output() closed       = new EventEmitter<void>();
  @Output() saved        = new EventEmitter<void>();
  @Output() savedAndNew  = new EventEmitter<void>();
  @Output() imageRemoved = new EventEmitter<number>();

  imgUrl(path: string): string {
    return this.imageSvc.resolveUrl(path);
  }

  getCategoryLabel(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? this.localize(cat.name) : String(id);
  }

  localize(ls: MultiLangString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
