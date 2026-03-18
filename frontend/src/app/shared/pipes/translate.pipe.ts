import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '../../core/services/translate.service';

/**
 * Usage: {{ 'common.name' | translate }}
 *
 * The pipe is impure so it re-evaluates whenever the language signal changes,
 * causing all translated strings in the UI to update instantly on language switch.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(key: string): string {
    // Reading currentLang() registers this pipe as a signal consumer —
    // Angular re-runs transform() automatically when the language changes.
    this.translateService.currentLang();
    return this.translateService.translate(key);
  }
}
