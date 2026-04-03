import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models';

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_USER = 'user';
const STORAGE_KEY_LOGIN_TIME = 'loginTime';
const AUTO_LOGOUT_MS = 2 * 60 * 1000; // Auto sign-out

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
        this.scheduleAutoLogout();
      } catch {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }
  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
  get token(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  register(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        if (res.success) this.setAuth(res);
      }),
    );
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (res.success) this.setAuth(res);
      }),
    );
  }

  logout(reason?: string): void {
    this.http.post(`${this.apiUrl}/logout`, reason ? { reason } : {}).subscribe({ error: () => { } });
    this.clearAuth();
  }

  clearAuth(): void {
    this.clearAutoLogoutTimer();
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_LOGIN_TIME);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private scheduleAutoLogout(): void {
    this.clearAutoLogoutTimer();
    const loginTime = Number(localStorage.getItem(STORAGE_KEY_LOGIN_TIME));
    const elapsed = loginTime ? Date.now() - loginTime : AUTO_LOGOUT_MS;
    const remaining = AUTO_LOGOUT_MS - elapsed;
    if (remaining <= 0) {
      this.logout('auto');
      return;
    }
    this.tokenExpiryTimer = setTimeout(() => this.logout('auto'), remaining);
  }

  private clearAutoLogoutTimer(): void {
    if (this.tokenExpiryTimer !== null) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data).pipe(
      tap((res: any) => {
        if (res.success) {
          const updated = { ...this.currentUser, ...res.user };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
      }),
    );
  }

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.apiUrl}/profile/avatar`, formData).pipe(
      tap((res: any) => {
        if (res.success) {
          const updated = { ...this.currentUser, avatar: res.avatar };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
          this.currentUserSubject.next(updated as User);
        }
      }),
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reset-password/${token}`, {
      password,
    });
  }

  private setAuth(res: any): void {
    localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
    localStorage.setItem(STORAGE_KEY_LOGIN_TIME, String(Date.now()));
    this.currentUserSubject.next(res.user);
    this.scheduleAutoLogout();
  }
}
