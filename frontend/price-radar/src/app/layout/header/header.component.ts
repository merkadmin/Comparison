import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  translate = inject(TranslateService);
  isDark = signal(document.documentElement.getAttribute('data-bs-theme') === 'dark');

  toggleTheme(): void {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('data-bs-theme', next);
    this.isDark.set(!this.isDark());
  }

  cycleLanguage(): void {
    this.translate.cycleLanguage();
  }
}
