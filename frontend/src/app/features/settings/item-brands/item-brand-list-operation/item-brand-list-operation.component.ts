import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ItemBrand } from '../../../../core/models/item-brand.model';
import { ItemBrandService } from '../../../../core/services/item-brand.service';
import { ProductType } from '../../../../core/models/product-type.model';
import { Country } from '../../../../core/models/country.model';

@Component({
  selector: 'app-item-brand-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-brand-list-operation.component.html',
})
export class ItemBrandListOperationComponent {
  private brandService = inject(ItemBrandService);

  @Input() editDraft!: ItemBrand;
  @Input() isCreating = false;
  @Input() saving = false;
  @Input() productTypes: ProductType[] = [];
  @Input() countries: Country[] = [];

  @Output() closed       = new EventEmitter<void>();
  @Output() saved        = new EventEmitter<void>();
  @Output() savedAndNew  = new EventEmitter<void>();
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() navigate     = new EventEmitter<1 | -1>();

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

  clearPending(): void { this.removePendingFile(); }

  imgUrl(path: string): string { return this.brandService.resolveImageUrl(path); }

  hasProductType(id: number): boolean {
    return (this.editDraft.productTypeIds ?? []).includes(id);
  }

  toggleProductType(id: number): void {
    const current = this.editDraft.productTypeIds ?? [];
    this.editDraft.productTypeIds = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
  }
}
