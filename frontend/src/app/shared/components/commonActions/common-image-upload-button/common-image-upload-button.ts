import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ItemImageService } from '../../../../core/services/item-image.service';

@Component({
  selector: 'app-common-image-upload-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './common-image-upload-button.html',
})
export class CommonImageUploadButton {
  private imageService = inject(ItemImageService);

  @Input() itemId!: number;
  @Input() categoryId!: number;
  @Input() labelKey  = 'common.uploadImages';
  @Input() iconClass = 'ki-file-up';
  @Input() color     = 'light-info';
  @Input() size      = 'sm';

  /** Emits the new relative paths that were just uploaded */
  @Output() uploaded = new EventEmitter<string[]>();

  uploading = signal(false);

  onFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length) return;

    this.uploading.set(true);
    this.imageService.upload(this.itemId, this.categoryId, files).subscribe({
      next: (paths) => {
        this.uploading.set(false);
        this.uploaded.emit(paths);
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.uploading.set(false);
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
