import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ProductType } from '../../../../core/models/product-type.model';

@Component({
  selector: 'app-product-type-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './product-type-list-operation.component.html',
})
export class ProductTypeListOperationComponent {
  @Input() editDraft!: ProductType;
  @Input() isCreating = false;
  @Input() saving = false;

  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();
  @Output() savedAndNew = new EventEmitter<void>();
  @Output() navigate    = new EventEmitter<1 | -1>();
}
