import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, take, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models';

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_LOGIN_TIME = 'loginTime';
const STORAGE_KEY_USER = 'user';
const AUTO_LOGOUT_MS = 60 * 60 * 1000; // Auto sign-out

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpiryTimer: ReturnType<typeof setTimeout> | null = null;
  private initializedSubject = new BehaviorSubject<boolean>(false);
  isInitialized$ = this.initializedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    if (localStorage.getItem(STORAGE_KEY_TOKEN)) {
      this.getProfile().subscribe({
        next: (res: any) => {
          if (res.success) {
            this.currentUserSubject.next(res.user);
            this.saveUserToStorage(res.user);
            this.scheduleAutoLogout();
          } else {
            this.clearAuth();
          }
          this.initializedSubject.next(true);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.clearAuth();
          } else {
            // Network error or server error — restore from cache so the user
            // is not kicked out just because the backend was temporarily unreachable.
            const cached = localStorage.getItem(STORAGE_KEY_USER);
            if (cached) {
              this.currentUserSubject.next(JSON.parse(cached));
              this.scheduleAutoLogout();
            } else {
              this.clearAuth();
            }
          }
          this.initializedSubject.next(true);
        },
      });
    } else {
      this.initializedSubject.next(true);
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
    localStorage.removeItem(STORAGE_KEY_LOGIN_TIME);
    localStorage.removeItem(STORAGE_KEY_USER);
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
          this.currentUserSubject.next(updated);
          this.saveUserToStorage(updated);
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
          const updated = { ...this.currentUser, avatar: res.avatar } as User;
          this.currentUserSubject.next(updated);
          this.saveUserToStorage(updated);
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
    localStorage.setItem(STORAGE_KEY_LOGIN_TIME, String(Date.now()));
    this.currentUserSubject.next(res.user);
    this.saveUserToStorage(res.user);
    this.initializedSubject.next(true);
    this.scheduleAutoLogout();
  }

  private saveUserToStorage(user: any): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }
}
