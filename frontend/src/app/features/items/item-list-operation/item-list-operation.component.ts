import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/services/translate.service';
import { ItemImageService } from '../../../core/services/item-image.service';
import { Item } from '../../../core/models/item.model';
import { ItemCategory, LocalizedString } from '../../../core/models/item-category.model';
import { ItemBrand } from '../../../core/models/item-brand.model';
import { ProductItemType } from '../../../core/models/product-item-type.model';
import { ProductInformation } from '../../../core/models/product-information.model';

@Component({
  selector: 'app-item-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-list-operation.component.html',
})
export class ItemListOperationComponent {
  private translate = inject(TranslateService);
  private imageSvc  = inject(ItemImageService);

  @Input() editDraft!: Item;
  @Input() brands: ItemBrand[] = [];
  @Input() categories: ItemCategory[] = [];
  @Input() productItemTypes: ProductItemType[] = [];
  @Input() productInfos: ProductInformation[] = [];
  @Input() uploadingImages = false;

  @Output() closed              = new EventEmitter<void>();
  @Output() saved               = new EventEmitter<void>();
  @Output() priceAdded          = new EventEmitter<void>();
  @Output() priceRemoved        = new EventEmitter<number>();
  @Output() imageFilesSelected  = new EventEmitter<Event>();
  @Output() imageRemoved        = new EventEmitter<number>();

  imgUrl(path: string): string {
    return this.imageSvc.resolveUrl(path);
  }

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
