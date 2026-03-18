import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-common-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './common-select.component.html',
})
export class CommonSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = '';
  @Input() selected: any = null;
  @Output() selectedChange = new EventEmitter<any>();
}
