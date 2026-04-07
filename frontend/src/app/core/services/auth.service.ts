import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, UserDto } from '../models/user.model';
import { GlobalStaticService } from '../../shared/helpers/Services/global-static.service';
import { UserRole } from '../../shared/helpers/StaticEnums';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private globalStatic = inject(GlobalStaticService);
  private base = environment.apiUrl;

  private _user = signal<UserDto | null>(this.loadUser());

  readonly currentUser = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.privilege === 'Admin');

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password })
      .pipe(tap(r => this.storeAuth(r)));
  }

  signup(userName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/signup`, { userName, email, password })
      .pipe(tap(r => this.storeAuth(r)));
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/google`, { idToken })
      .pipe(tap(r => this.storeAuth(r)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.globalStatic.CurrentLoggeduserName = '';
    this.globalStatic.currentLoggedUserRole = UserRole.Regular;
    this.globalStatic.CurrentLoggedUserID = 0;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeAuth(r: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    this._user.set(r.user);
    this.applyUserToGlobal(r.user);
  }

  private loadUser(): UserDto | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const user: UserDto | null = raw ? JSON.parse(raw) : null;
      if (user) this.applyUserToGlobal(user);
      return user;
    } catch {
      return null;
    }
  }

  private applyUserToGlobal(user: UserDto): void {
    this.globalStatic.CurrentLoggeduserName = user.userName;
    this.globalStatic.CurrentLoggedUserID = user.id;
    this.globalStatic.currentLoggedUserRole =
      user.privilege === 'Admin' ? UserRole.Admin :
        user.privilege === 'Premium' ? UserRole.Premium :
          UserRole.Regular;
  }
}
