import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-common-search',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './common-search.component.html',
})
export class CommonSearchComponent implements OnInit, OnDestroy {
  @Input() placeholderKey = 'common.search';
  @Input() debounceMs = 300;
  @Output() searchChange = new EventEmitter<string>();

  value = '';

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.input$.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => this.searchChange.emit(term));
  }

  onInput(): void {
    this.input$.next(this.value);
  }

  clear(): void {
    this.value = '';
    this.input$.next('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
