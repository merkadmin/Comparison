import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ItemService } from '../../../../../core/services/item.service';
import { ParsedItemResult } from '../../../../../core/models/item.model';

@Component({
  selector: 'app-translate-text-modal',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './translate-text-modal.component.html',
})
export class TranslateTextModalComponent {
  private itemSvc = inject(ItemService);

  @Output() filled = new EventEmitter<ParsedItemResult>();
  @Output() closed = new EventEmitter<void>();

  pasteText = '';
  parsing   = signal(false);

  fill(): void {
    if (!this.pasteText.trim()) return;
    this.parsing.set(true);
    this.itemSvc.parseText(this.pasteText).subscribe({
      next: result => {
        this.filled.emit(result);
        this.parsing.set(false);
        this.closed.emit();
      },
      error: () => this.parsing.set(false),
    });
  }
}
