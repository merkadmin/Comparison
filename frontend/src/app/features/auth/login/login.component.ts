import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService, AppLang } from '../../../core/services/translate.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private auth   = inject(AuthService);
  private router = inject(Router);
  translate      = inject(TranslateService);

  @ViewChild('googleBtn') googleBtnRef!: ElementRef;

  mode     = signal<'login' | 'signup'>('login');
  loading  = signal(false);
  error    = signal<string | null>(null);
  langOpen = signal(false);

  readonly langs: { code: AppLang; label: string; flag: string }[] = [
    { code: 'en', label: 'English',  flag: 'assets/media/flags/united-states.svg' },
    { code: 'ar', label: 'العربية', flag: 'assets/media/flags/saudi-arabia.svg'  },
    { code: 'fr', label: 'Français', flag: 'assets/media/flags/france.svg'        },
  ];

  currentFlag = computed(() =>
    this.langs.find(l => l.code === this.translate.currentLang())?.flag ?? this.langs[0].flag
  );

  setLang(code: AppLang): void {
    this.translate.setLanguage(code);
    this.langOpen.set(false);
  }

  loginEmail    = '';
  loginPassword = '';

  signupUserName = '';
  signupEmail    = '';
  signupPassword = '';
  signupConfirm  = '';

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit(): void {
    this.tryInitGoogle();
  }

  ngOnDestroy(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.cancel();
    }
  }

  private tryInitGoogle(retries = 10): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (resp: { credential: string }) => this.handleGoogleCredential(resp.credential),
      });
      google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
        theme: 'outline', size: 'large', width: 320, text: 'continue_with',
      });
    } else if (retries > 0) {
      setTimeout(() => this.tryInitGoogle(retries - 1), 300);
    }
  }

  handleGoogleCredential(idToken: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.auth.loginWithGoogle(idToken).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e?.error?.message ?? 'auth.googleError'); this.loading.set(false); },
    });
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e?.error?.message ?? 'auth.invalidCredentials'); this.loading.set(false); },
    });
  }

  onSignup(): void {
    if (!this.signupUserName || !this.signupEmail || !this.signupPassword) {
      this.error.set('auth.fillAllFields');
      return;
    }
    if (this.signupPassword !== this.signupConfirm) {
      this.error.set('auth.passwordMismatch');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.signup(this.signupUserName, this.signupEmail, this.signupPassword).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e?.error?.message ?? 'auth.signupError'); this.loading.set(false); },
    });
  }
}
