import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ItemService } from '../../../../../core/services/item.service';
import { ParsedDomResult } from '../../../../../core/models/item.model';

@Component({
  selector: 'app-translate-dom-modal',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './translate-dom-modal.component.html',
})
export class TranslateDomModalComponent {
  private itemSvc = inject(ItemService);

  @Output() filled = new EventEmitter<ParsedDomResult>();
  @Output() closed = new EventEmitter<void>();

  domText = '';
  parsing = signal(false);

  fill(): void {
    if (!this.domText.trim()) return;
    this.parsing.set(true);
    this.itemSvc.parseDom(this.domText).subscribe({
      next: result => {
        this.filled.emit(result);
        this.parsing.set(false);
        this.closed.emit();
      },
      error: () => this.parsing.set(false),
    });
  }
}
