import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

export interface ActionMenuItem {
  labelKey: string;
  /** Optional raw label — displayed as-is, overrides labelKey translation. */
  label?: string;
  iconClass: string;
  iconPaths?: number;
  color?: string;
  action: () => void;
  /** Child items rendered as a hover/click submenu. */
  children?: ActionMenuItem[];
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
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Output() mainClick = new EventEmitter<void>();
  @Input() menuItems: ActionMenuItem[] = [];

  /** Key of the currently open submenu (the item's labelKey). */
  openSubmenuKey = signal<string | null>(null);

  toggleSubmenu(key: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openSubmenuKey.update(v => v === key ? null : key);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openSubmenuKey.set(null);
  }

  getPathRange(n: number = 2): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
}
