import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="animated-bg">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="rp1" cx="50%" cy="50%" fx="0.441602%" fy="50%" r=".5">
              <animate attributeName="fx" dur="34s" values="0%;3%;0%" repeatCount="indefinite"></animate>
              <stop offset="0%" stop-color="rgba(0, 191, 255, 1)"></stop>
              <stop offset="100%" stop-color="rgba(0, 191, 255, 0)"></stop>
            </radialGradient>
            <radialGradient id="rp2" cx="50%" cy="50%" fx="2.68147%" fy="50%" r=".5">
              <animate attributeName="fx" dur="23.5s" values="0%;3%;0%" repeatCount="indefinite"></animate>
              <stop offset="0%" stop-color="rgba(255, 0, 255, 1)"></stop>
              <stop offset="100%" stop-color="rgba(255, 0, 255, 0)"></stop>
            </radialGradient>
            <radialGradient id="rp3" cx="50%" cy="50%" fx="0.836536%" fy="50%" r=".5">
              <animate attributeName="fx" dur="21.5s" values="0%;3%;0%" repeatCount="indefinite"></animate>
              <stop offset="0%" stop-color="rgba(138, 43, 226, 1)"></stop>
              <stop offset="100%" stop-color="rgba(138, 43, 226, 0)"></stop>
            </radialGradient>
          </defs>
          <rect x="13%" y="1%" width="100%" height="100%" fill="url(#rp1)" transform="rotate(334 50 50)">
            <animate attributeName="x" dur="20s" values="25%;0%;25%" repeatCount="indefinite"></animate>
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="17s" repeatCount="indefinite"/>
          </rect>
          <rect x="-2%" y="35%" width="100%" height="100%" fill="url(#rp2)" transform="rotate(255 50 50)">
            <animate attributeName="x" dur="23s" values="-25%;0%;-25%" repeatCount="indefinite"></animate>
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="18s" repeatCount="indefinite"/>
          </rect>
          <rect x="9%" y="14%" width="100%" height="100%" fill="url(#rp3)" transform="rotate(139 50 50)">
            <animate attributeName="x" dur="25s" values="0%;25%;0%" repeatCount="indefinite"></animate>
            <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="19s" repeatCount="indefinite"/>
          </rect>
        </svg>
      </div>

      <div class="glass-card">
        <div class="card-header">
          <div class="logo">
            <img src="assets/GameShop.png" alt="GameShop Logo" class="logo-img" />
            <span class="logo-text">GameStore</span>
          </div>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <ng-container *ngIf="!success">
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label>New Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="Min. 6 characters"
                  autocomplete="new-password"
                />
                <button type="button" class="toggle-pw" (click)="showPassword = !showPassword" tabindex="-1">
                  <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Confirm Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  [type]="showConfirm ? 'text' : 'password'"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  autocomplete="new-password"
                />
                <button type="button" class="toggle-pw" (click)="showConfirm = !showConfirm" tabindex="-1">
                  <svg *ngIf="!showConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading">
              <span class="btn-content">
                <span class="btn-text">{{ loading ? 'Resetting...' : 'Reset Password' }}</span>
                <svg *ngIf="!loading" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </button>
          </form>
        </ng-container>

        <div *ngIf="success" class="success-msg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>Your password has been reset successfully!</p>
          <p class="redirect-note">Redirecting to login...</p>
        </div>

        <p class="auth-footer">
          <a routerLink="/auth/login">← Back to login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .logo-img {
      width: 72px; height: 72px; object-fit: contain;
      border-radius: 16px; background: rgba(255,255,255,0.1);
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.18); margin-bottom: 0;
    }
    @media (max-width: 600px) { .logo-img { width: 56px; height: 56px; } }

    .auth-page {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; padding: 20px;
      position: relative; overflow: hidden; background: #0a0014;
    }
    .animated-bg { position: fixed; inset: 0; z-index: 0; }
    .animated-bg svg { width: 100%; height: 100%; }

    .glass-card {
      position: relative; z-index: 10; width: 100%; max-width: 440px;
      padding: 44px 40px;
      background: rgba(20, 20, 40, 0.35);
      backdrop-filter: blur(40px) saturate(1.4);
      -webkit-backdrop-filter: blur(40px) saturate(1.4);
      border-radius: 24px; border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 25px 60px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(138,43,226,0.15), inset 0 1px 1px rgba(255,255,255,0.1);
      animation: cardIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(40px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .card-header { text-align: center; margin-bottom: 32px; }
    .logo { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 28px; }
    .logo-text { font-size: 1.6rem; font-weight: 800; color: white; letter-spacing: -0.5px; }
    .card-header h1 { font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 8px; }
    .card-header p { color: rgba(255,255,255,0.55); font-size: 0.95rem; }

    .auth-form { margin-bottom: 20px; }
    .form-group { margin-bottom: 24px; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.75); margin-bottom: 10px; }

    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      width: 18px; height: 18px; color: rgba(255,255,255,0.35); pointer-events: none;
    }
    .form-group input {
      width: 100%; padding: 14px 48px 14px 48px;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; font-size: 1rem; color: white; outline: none;
      transition: all 0.3s ease; box-sizing: border-box;
    }
    .form-group input::placeholder { color: rgba(255,255,255,0.3); }
    .form-group input:focus {
      border-color: rgba(255,255,255,0.28); background: rgba(255,255,255,0.1);
      box-shadow: 0 0 0 3px rgba(138,43,226,0.12);
    }

    .toggle-pw {
      position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; padding: 0;
      color: rgba(255,255,255,0.35); display: flex; align-items: center;
    }
    .toggle-pw svg { width: 18px; height: 18px; }
    .toggle-pw:hover { color: rgba(255,255,255,0.7); }

    .btn-submit {
      width: 100%; padding: 16px 24px;
      background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #ec4899 100%);
      border: none; border-radius: 50px; font-size: 1rem; font-weight: 700;
      color: white; cursor: pointer; position: relative; overflow: hidden;
      transition: all 0.3s ease; box-shadow: 0 4px 25px rgba(139,92,246,0.4);
    }
    .btn-submit::before {
      content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }
    .btn-submit:hover::before { left: 100%; }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 35px rgba(139,92,246,0.5); }
    .btn-submit:active:not(:disabled) { transform: scale(0.98); }
    .btn-submit:disabled { cursor: not-allowed; opacity: 0.6; }
    .btn-content { display: flex; align-items: center; justify-content: center; gap: 10px; }
    .btn-icon { width: 18px; height: 18px; transition: transform 0.3s ease; }
    .btn-submit:hover:not(:disabled) .btn-icon { transform: translateX(4px); }

    .success-msg { text-align: center; padding: 24px 0; }
    .success-msg svg { width: 48px; height: 48px; color: #10b981; margin-bottom: 16px; }
    .success-msg p { color: rgba(255,255,255,0.7); font-size: 0.95rem; line-height: 1.6; }
    .redirect-note { color: rgba(255,255,255,0.4) !important; font-size: 0.85rem !important; margin-top: 8px; }

    .auth-footer { text-align: center; color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-top: 20px; }
    .auth-footer a { color: white; font-weight: 600; text-decoration: none; transition: opacity 0.2s ease; }
    .auth-footer a:hover { opacity: 0.8; }

    @media (max-width: 480px) {
      .glass-card { padding: 32px 24px; border-radius: 20px; }
      .card-header h1 { font-size: 1.5rem; }
    }

    /* Light mode */
    :host-context(body.light-mode) .auth-page { background: #ede9ff; }
    :host-context(body.light-mode) .glass-card {
      background: rgba(255,255,255,0.78); border-color: rgba(139,92,246,0.18);
      box-shadow: 0 25px 60px -12px rgba(100,60,180,0.14), inset 0 1px 1px rgba(255,255,255,0.95);
    }
    :host-context(body.light-mode) .logo-text { color: #1a1040; }
    :host-context(body.light-mode) .card-header h1 { color: #1a1040; }
    :host-context(body.light-mode) .card-header p { color: #6b5aa0; }
    :host-context(body.light-mode) .form-group label { color: #4a3870; }
    :host-context(body.light-mode) .input-icon { color: rgba(80,50,140,0.4); }
    :host-context(body.light-mode) .form-group input {
      background: rgba(255,255,255,0.9); border-color: rgba(139,92,246,0.22); color: #1a1040;
    }
    :host-context(body.light-mode) .form-group input::placeholder { color: #b0a0d0; }
    :host-context(body.light-mode) .form-group input:focus {
      border-color: rgba(139,92,246,0.5); background: #ffffff; box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
    }
    :host-context(body.light-mode) .toggle-pw { color: rgba(80,50,140,0.4); }
    :host-context(body.light-mode) .success-msg p { color: #4a3870; }
    :host-context(body.light-mode) .auth-footer { color: #6b5aa0; }
    :host-context(body.light-mode) .auth-footer a { color: #7c3aed; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  loading = false;
  success = false;
  showPassword = false;
  showConfirm = false;
  private token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private msgService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.msgService.error('Invalid or missing reset token');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  onSubmit(): void {
    if (!this.password || this.password.length < 6) {
      this.msgService.error('Password must be at least 6 characters');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.msgService.error('Passwords do not match');
      return;
    }
    this.loading = true;
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/auth/login']), 2500);
      },
      error: (err) => {
        this.loading = false;
        this.msgService.error(err.error?.message ?? 'Reset failed. The link may have expired.');
      },
    });
  }
}
