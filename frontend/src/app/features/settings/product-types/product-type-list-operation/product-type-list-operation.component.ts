import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ProductType } from '../../../../core/models/product-type.model';
import { ProductTypeService } from '../../../../core/services/product-type.service';

@Component({
  selector: 'app-product-type-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './product-type-list-operation.component.html',
})
export class ProductTypeListOperationComponent {
  private typeService = inject(ProductTypeService);

  @Input() editDraft!: ProductType;
  @Input() isCreating = false;
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();
  @Output() navigate    = new EventEmitter<1 | -1>();
  @Output() imageRemoved = new EventEmitter<void>();

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

  imgUrl(path: string): string {
    return this.typeService.resolveImageUrl(path);
  }
}
