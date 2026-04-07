import { Injectable, signal, computed } from '@angular/core';
import { en } from '../i18n/en';
import { ar } from '../i18n/ar';
import { fr } from '../i18n/fr';

export type AppLang = 'en' | 'ar' | 'fr';
export type TranslationDict = { [key: string]: string | TranslationDict };

const TRANSLATIONS: Record<AppLang, TranslationDict> = { en, ar, fr };

const LANG_META: Record<AppLang, { dir: 'ltr' | 'rtl'; htmlLang: string; label: string }> = {
  en: { dir: 'ltr', htmlLang: 'en', label: 'EN' },
  ar: { dir: 'rtl', htmlLang: 'ar', label: 'ع'  },
  fr: { dir: 'ltr', htmlLang: 'fr', label: 'FR' },
};

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private _lang = signal<AppLang>(this._loadSaved());

  /** Reactive current language — use in templates with translate.currentLang() */
  readonly currentLang = this._lang.asReadonly();

  /** Reactive direction — 'ltr' | 'rtl' */
  readonly dir = computed(() => LANG_META[this._lang()].dir);

  /** Label shown on the language toggle button */
  readonly langLabel = computed(() => LANG_META[this._lang()].label);

  /** True when current language is RTL */
  readonly isRtl = computed(() => this.dir() === 'rtl');

  /** Resolves a dot-notation key (e.g. 'common.name') against the nested translation object. */
  translate(key: string): string {
    const parts = key.split('.');
    let node: string | TranslationDict = TRANSLATIONS[this._lang()];
    for (const part of parts) {
      if (typeof node !== 'object' || node === null) return key;
      node = node[part];
      if (node === undefined) return key;
    }
    return typeof node === 'string' ? node : key;
  }

  setLanguage(lang: AppLang): void {
    this._lang.set(lang);
    localStorage.setItem('app-lang', lang);
    document.documentElement.setAttribute('dir', LANG_META[lang].dir);
    document.documentElement.setAttribute('lang', LANG_META[lang].htmlLang);
  }

  /** Cycle: en → ar → fr → en */
  cycleLanguage(): void {
    const order: AppLang[] = ['en', 'ar', 'fr'];
    const next = order[(order.indexOf(this._lang()) + 1) % order.length];
    this.setLanguage(next);
  }

  private _loadSaved(): AppLang {
    const saved = localStorage.getItem('app-lang') as AppLang | null;
    if (saved && saved in TRANSLATIONS) return saved;
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang === 'ar') return 'ar';
    if (htmlLang === 'fr') return 'fr';
    return 'en';
  }
}
