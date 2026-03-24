import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
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
export class ItemListOperationComponent {
  private translate = inject(TranslateService);
  private imageSvc  = inject(ItemImageService);

  @Input() editDraft!: Item;
  @Input() isCreating = false;
  @Input() brands: ItemBrand[] = [];
  @Input() categories: IItemCategory[] = [];
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

  localize(ls: MultiLangString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }
}
