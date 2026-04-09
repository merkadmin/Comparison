import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../../core/services/translate.service';
import { ItemImageService } from '../../../../core/services/item-image.service';
import { Item, ParsedItemResult, ParsedDomResult } from '../../../../core/models/item.model';

import { SpecificationCategory, SpecificationFieldDef } from '../../../../core/services/static-lookup.service';
import { IItemCategory } from '../../../../core/models/interfaces/IItemCategory';
import { MultiLangString } from '../../../../core/models/interfaces/LocalizedString';
import { ItemBrand } from '../../../../core/models/item-brand.model';
import { ProductType } from '../../../../core/models/product-type.model';
import { TranslateTextModalComponent } from './translate-text-modal/translate-text-modal.component';
import { TranslateDomModalComponent } from './translate-dom-modal/translate-dom-modal.component';

@Component({
  selector: 'app-item-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TranslateTextModalComponent, TranslateDomModalComponent],
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
  /** Index of the pending file the user wants as cover image (null = none chosen). */
  pendingCoverIndex: number | null = null;

  /** Rows in the categories table — each row has its own drill-down navigator state. */
  categoryRows: {
    id: string;
    categoryId: number | null;
    currentParentId: number | null;
    navStack: (number | null)[];
  }[] = [];
  private rowCounter = 0;

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
      this.initCategoryRows();
      if (!this.editDraft.specifications) {
        this.editDraft.specifications = {};
        this.specSections = {};
      } else {
        // Auto-expand sections that have saved data
        this.specSections = {};
        Object.keys(this.editDraft.specifications).forEach(key => {
          const catData = this.editDraft.specifications![key];
          if (catData && Object.keys(catData).length > 0) {
            this.specSections[key] = true;
          }
        });
      }
    }
    if (changes['categories']) {
      this.initCategoryRows();
    }
  }

  setCoverImage(img: string): void {
    this.editDraft.imageUrl = img;
  }

  isCover(img: string): boolean {
    return this.editDraft.imageUrl === img;
  }

  private clearPendingFiles(): void {
    this.pendingPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    this.pendingFiles = [];
    this.pendingPreviewUrls = [];
    this.pendingCoverIndex = null;
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
    if (this.pendingCoverIndex === index) this.pendingCoverIndex = null;
    else if (this.pendingCoverIndex !== null && this.pendingCoverIndex > index) this.pendingCoverIndex--;
  }

  private emptyRow(): (typeof this.categoryRows)[number] {
    return { id: String(++this.rowCounter), categoryId: null, currentParentId: null, navStack: [] };
  }

  private initCategoryRows(): void {
    this.rowCounter = 0;
    this.categoryRows = (this.editDraft.categoryIds ?? []).map(id => ({
      ...this.emptyRow(),
      categoryId: id,
    }));
  }

  addCategoryRow(): void {
    this.categoryRows = [...this.categoryRows, this.emptyRow()];
  }

  removeCategoryRow(rowId: string): void {
    this.categoryRows = this.categoryRows.filter(r => r.id !== rowId);
    this.syncCategoryIds();
  }

  getRowCurrentCategories(rowId: string): IItemCategory[] {
    const row = this.categoryRows.find(r => r.id === rowId);
    return this.categories.filter(c => (c.parentCategoryId ?? null) === (row?.currentParentId ?? null));
  }

  getRowLevelName(rowId: string): string {
    const row = this.categoryRows.find(r => r.id === rowId);
    if (!row?.currentParentId) return '';
    const cat = this.categories.find(c => c.id === row.currentParentId);
    return cat ? this.localize(cat.name) : '';
  }

  hasChildren(categoryId: number): boolean {
    return this.categories.some(c => c.parentCategoryId === categoryId);
  }

  onRowCategorySelect(rowId: string, categoryId: number | null): void {
    if (!categoryId) return;
    this.categoryRows = this.categoryRows.map(r => {
      if (r.id !== rowId) return r;
      if (this.hasChildren(categoryId)) {
        return { ...r, navStack: [...r.navStack, r.currentParentId], currentParentId: categoryId };
      }
      return { ...r, categoryId };
    });
    this.syncCategoryIds();
  }

  rowGoBack(rowId: string): void {
    this.categoryRows = this.categoryRows.map(r => {
      if (r.id !== rowId || !r.navStack.length) return r;
      const newStack = [...r.navStack];
      const parent = newStack.pop() ?? null;
      return { ...r, navStack: newStack, currentParentId: parent };
    });
  }

  clearRowCategory(rowId: string): void {
    this.categoryRows = this.categoryRows.map(r =>
      r.id === rowId ? { ...r, categoryId: null, currentParentId: null, navStack: [] } : r
    );
    this.syncCategoryIds();
  }

  private syncCategoryIds(): void {
    this.editDraft.categoryIds = this.categoryRows
      .filter(r => r.categoryId !== null)
      .map(r => r.categoryId as number);
  }

  getCategoryPath(id: number): string {
    const parts: string[] = [];
    let current = this.categories.find(c => c.id === id);
    while (current) {
      parts.unshift(this.localize(current.name));
      current = current.parentCategoryId
        ? this.categories.find(c => c.id === current!.parentCategoryId)
        : undefined;
    }
    return parts.join(' › ');
  }

  toggleProductType(id: number): void {
    const ids = this.editDraft.productTypeIds;
    this.editDraft.productTypeIds = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
  }

  isProductTypeSelected(id: number): boolean {
    return this.editDraft.productTypeIds.includes(id);
  }

  @Output() closed       = new EventEmitter<void>();
  @Output() saved        = new EventEmitter<void>();
  @Output() savedAndNew  = new EventEmitter<void>();
  @Output() imageRemoved = new EventEmitter<number>();

  showTextModal = false;
  showDomModal  = false;

  onTextFilled(result: ParsedItemResult): void {
    if (result.name)             this.editDraft.name             = result.name;
    if (result.modelName)        this.editDraft.modelName        = result.modelName;
    if (result.barcode)          this.editDraft.barcode          = result.barcode;
    if (result.aboutThisItem)    this.editDraft.aboutThisItem    = result.aboutThisItem;
    if (result.briefDescription) this.editDraft.briefDescription = result.briefDescription;
    if (result.brandId)          this.editDraft.brandId          = result.brandId;
  }

  onDomFilled(result: ParsedDomResult): void {
    if (result.name)             this.editDraft.name             = result.name;
    if (result.modelName)        this.editDraft.modelName        = result.modelName;
    if (result.barcode)          this.editDraft.barcode          = result.barcode;
    if (result.brandId)          this.editDraft.brandId          = result.brandId;
    if (result.aboutThisItem)    this.editDraft.aboutThisItem    = result.aboutThisItem;
    if (result.briefDescription) this.editDraft.briefDescription = result.briefDescription;
    if (result.description)      this.editDraft.description      = result.description;
    if (result.specifications) {
      this.editDraft.specifications = {
        ...(this.editDraft.specifications ?? {}),
        ...result.specifications,
      };
    }
  }

  imgUrl(path: string): string {
    return this.imageSvc.resolveUrl(path);
  }

  localize(ls: MultiLangString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
