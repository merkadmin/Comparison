import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ItemBrand } from '../../../core/models/item-brand.model';

@Component({
  selector: 'app-item-brand-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './item-brand-list-operation.component.html',
})
export class ItemBrandListOperationComponent {
  @Input() editDraft!: ItemBrand;
  @Input() isCreating = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<void>();
}
