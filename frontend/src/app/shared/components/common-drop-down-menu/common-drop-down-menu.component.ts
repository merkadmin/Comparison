import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface DropDownMenuItem {
  labelKey: string;
  iconClass: string;
  iconPaths?: number;
  action: () => void;
}

@Component({
  selector: 'app-common-drop-down-menu',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './common-drop-down-menu.component.html',
})
export class CommonDropDownMenuComponent {
  @Input() items: DropDownMenuItem[] = [];

  getPathRange(count: number = 2): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
}
