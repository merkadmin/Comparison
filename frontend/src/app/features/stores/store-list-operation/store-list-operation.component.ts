import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Store, StoreType } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-list-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './store-list-operation.component.html',
})
export class StoreListOperationComponent {
  @Input() editDraft!: Store;
  @Input() isCreating = false;
  @Input() storeTypes: StoreType[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<void>();
}
