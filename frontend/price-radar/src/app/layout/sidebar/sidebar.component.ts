import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  isRtl = signal(document.documentElement.getAttribute('dir') === 'rtl');

  // In RTL: drawer slides from the right ("start" = right in RTL)
  // In LTR: drawer slides from the left ("start" = left in LTR)
  drawerDirection = computed(() => 'start');

  /** Called by header when language is toggled */
  updateDirection(): void {
    this.isRtl.set(document.documentElement.getAttribute('dir') === 'rtl');
  }
}
