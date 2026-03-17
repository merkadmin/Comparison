import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  isDark = signal(document.documentElement.getAttribute('data-bs-theme') === 'dark');
  isRtl = signal(document.documentElement.getAttribute('dir') === 'rtl');

  toggleTheme(): void {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('data-bs-theme', next);
    this.isDark.set(!this.isDark());
  }

  toggleLanguage(): void {
    if (this.isRtl()) {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      localStorage.setItem('app-lang', 'en');
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      localStorage.setItem('app-lang', 'ar');
    }
    this.isRtl.set(!this.isRtl());
  }
}
