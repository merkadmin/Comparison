import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

export interface ActionMenuItem {
  labelKey: string;
  iconClass: string;
  iconPaths?: number;
  color?: string;
  action: () => void;
}

@Component({
  selector: 'app-common-drop-down-menu-action-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './common-drop-down-menu-action-button.html',
  styleUrl: './common-drop-down-menu-action-button.less',
})
export class CommonDropDownMenuActionButton {
  @Input() mainLabelKey: string = '';
  @Input() mainIconClass: string = 'ki-minus-circle';
  @Input() mainIconPaths: number = 2;
  @Input() mainIconSize: string = '2';
  @Input() mainColor: string = 'warning';
  @Input() mainButtonClass: string = '';
  @Input() count: number = 0;
  @Input() menuEnd: boolean = false;
  @Input() groupClass: string = '';
  @Output() mainClick = new EventEmitter<void>();
  @Input() menuItems: ActionMenuItem[] = [];

  getPathRange(n: number = 2): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
}
