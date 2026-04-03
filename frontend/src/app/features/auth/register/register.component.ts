import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <!-- Animated Gradient Background -->
      <div class="animated-bg">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient
              id="rg1"
              cx="50%"
              cy="50%"
              fx="0.441602%"
              fy="50%"
              r=".5"
            >
              <animate
                attributeName="fx"
                dur="34s"
                values="0%;3%;0%"
                repeatCount="indefinite"
              ></animate>
              <stop offset="0%" stop-color="rgba(0, 191, 255, 1)"></stop>
              <stop offset="100%" stop-color="rgba(0, 191, 255, 0)"></stop>
            </radialGradient>
            <radialGradient
              id="rg2"
              cx="50%"
              cy="50%"
              fx="2.68147%"
              fy="50%"
              r=".5"
            >
              <animate
                attributeName="fx"
                dur="23.5s"
                values="0%;3%;0%"
                repeatCount="indefinite"
              ></animate>
              <stop offset="0%" stop-color="rgba(255, 0, 255, 1)"></stop>
              <stop offset="100%" stop-color="rgba(255, 0, 255, 0)"></stop>
            </radialGradient>
            <radialGradient
              id="rg3"
              cx="50%"
              cy="50%"
              fx="0.836536%"
              fy="50%"
              r=".5"
            >
              <animate
                attributeName="fx"
                dur="21.5s"
                values="0%;3%;0%"
                repeatCount="indefinite"
              ></animate>
              <stop offset="0%" stop-color="rgba(138, 43, 226, 1)"></stop>
              <stop offset="100%" stop-color="rgba(138, 43, 226, 0)"></stop>
            </radialGradient>
            <radialGradient
              id="rg4"
              cx="50%"
              cy="50%"
              fx="4.56417%"
              fy="50%"
              r=".5"
            >
              <animate
                attributeName="fx"
                dur="23s"
                values="0%;5%;0%"
                repeatCount="indefinite"
              ></animate>
              <stop offset="0%" stop-color="rgba(0, 128, 255, 1)"></stop>
              <stop offset="100%" stop-color="rgba(0, 128, 255, 0)"></stop>
            </radialGradient>
            <radialGradient
              id="rg5"
              cx="50%"
              cy="50%"
              fx="2.65405%"
              fy="50%"
              r=".5"
            >
              <animate
                attributeName="fx"
                dur="24.5s"
                values="0%;5%;0%"
                repeatCount="indefinite"
              ></animate>
              <stop offset="0%" stop-color="rgba(255, 0, 128, 1)"></stop>
              <stop offset="100%" stop-color="rgba(255, 0, 128, 0)"></stop>
            </radialGradient>
          </defs>
          <rect
            x="13.744%"
            y="1.18473%"
            width="100%"
            height="100%"
            fill="url(#rg1)"
            transform="rotate(334.41 50 50)"
          >
            <animate
              attributeName="x"
              dur="20s"
              values="25%;0%;25%"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              dur="21s"
              values="0%;25%;0%"
              repeatCount="indefinite"
            ></animate>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="17s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x="-2.17916%"
            y="35.4267%"
            width="100%"
            height="100%"
            fill="url(#rg2)"
            transform="rotate(255.072 50 50)"
          >
            <animate
              attributeName="x"
              dur="23s"
              values="-25%;0%;-25%"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              dur="24s"
              values="0%;50%;0%"
              repeatCount="indefinite"
            ></animate>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="18s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x="9.00483%"
            y="14.5733%"
            width="100%"
            height="100%"
            fill="url(#rg3)"
            transform="rotate(139.903 50 50)"
          >
            <animate
              attributeName="x"
              dur="25s"
              values="0%;25%;0%"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              dur="12s"
              values="0%;25%;0%"
              repeatCount="indefinite"
            ></animate>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 50 50"
              to="0 50 50"
              dur="19s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x="20%"
            y="60%"
            width="100%"
            height="100%"
            fill="url(#rg4)"
            transform="rotate(200 50 50)"
          >
            <animate
              attributeName="x"
              dur="19s"
              values="10%;40%;10%"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              dur="22s"
              values="60%;30%;60%"
              repeatCount="indefinite"
            ></animate>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="20s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x="60%"
            y="10%"
            width="100%"
            height="100%"
            fill="url(#rg5)"
            transform="rotate(100 50 50)"
          >
            <animate
              attributeName="x"
              dur="22s"
              values="60%;30%;60%"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              dur="18s"
              values="10%;40%;10%"
              repeatCount="indefinite"
            ></animate>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 50 50"
              to="0 50 50"
              dur="21s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      </div>

      <!-- Frosted Glass Card -->
      <div class="glass-card">
        <div class="card-header">
          <div class="logo">
            <img
              src="assets/GameShop.png"
              alt="GameShop Logo"
              class="logo-img"
            />
            <span class="logo-text">GameStore</span>
          </div>
          <h1>Create Account</h1>
          <p>Join the ultimate gaming community</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
          <div
            class="form-group"
            [class.focused]="nameFocused"
            [class.has-value]="name"
          >
            <label for="name">Full Name</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                id="name"
                [(ngModel)]="name"
                name="name"
                required
                placeholder="Full Name"
                (focus)="nameFocused = true"
                (blur)="nameFocused = false"
                autocomplete="name"
              />
            </div>
          </div>

          <div
            class="form-group"
            [class.focused]="emailFocused"
            [class.has-value]="email"
          >
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="you&#64;example.com"
                (focus)="emailFocused = true"
                (blur)="emailFocused = false"
                autocomplete="email"
              />
            </div>
          </div>

          <div
            class="form-group"
            [class.focused]="passwordFocused"
            [class.has-value]="password"
          >
            <label for="password">Password</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                placeholder="Min. 6 characters"
                (focus)="passwordFocused = true"
                (blur)="passwordFocused = false"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg
                  *ngIf="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  *ngIf="showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <div class="password-strength" *ngIf="password">
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  [style.width]="passwordStrength.percent + '%'"
                  [class]="passwordStrength.cls"
                ></div>
              </div>
              <span class="strength-label" [class]="passwordStrength.cls">{{
                passwordStrength.label
              }}</span>
            </div>
          </div>

          <div
            class="form-group"
            [class.focused]="confirmPasswordFocused"
            [class.has-value]="confirmPassword"
          >
            <label for="confirmPassword">Confirm Password</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Repeat your password"
                (focus)="confirmPasswordFocused = true"
                (blur)="confirmPasswordFocused = false"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="showConfirmPassword = !showConfirmPassword"
                tabindex="-1"
              >
                <svg
                  *ngIf="!showConfirmPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  *ngIf="showConfirmPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <div class="match-indicator" *ngIf="confirmPassword">
              <svg
                *ngIf="passwordsMatch"
                class="match-icon success"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg
                *ngIf="!passwordsMatch"
                class="match-icon error"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span [class]="passwordsMatch ? 'success' : 'error'">
                {{
                  passwordsMatch ? 'Passwords match' : 'Passwords do not match'
                }}
              </span>
            </div>
          </div>

          <div class="terms-group">
            <label class="terms-checkbox">
              <input
                type="checkbox"
                [(ngModel)]="acceptTerms"
                name="acceptTerms"
                required
              />
              <span class="checkmark"></span>
              <span class="terms-text"
                >I agree to the
                <a href="#" (click)="$event.preventDefault()"
                  >Terms of Service</a
                >
                and
                <a href="#" (click)="$event.preventDefault()"
                  >Privacy Policy</a
                ></span
              >
            </label>
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="loading || !acceptTerms || !passwordsMatch"
            [class.loading]="loading"
          >
            <span class="btn-content">
              <span class="btn-text">Create Account</span>
              <svg
                class="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
            <span class="btn-loader">
              <svg class="spinner" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="3"
                  fill="none"
                  stroke-dasharray="32"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/auth/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .logo-img {
        width: 72px;
        height: 72px;
        object-fit: contain;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.18);
        margin-bottom: 0;
        transition:
          width 0.2s,
          height 0.2s;
      }

      @media (max-width: 600px) {
        .logo-img {
          width: 56px;
          height: 56px;
        }
      }
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        position: relative;
        overflow: hidden;
        background: #0a0014;
      }

      .animated-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
      }

      .animated-bg svg {
        width: 100%;
        height: 100%;
      }

      .glass-card {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 480px;
        padding: 44px 40px;
        background: rgba(20, 20, 40, 0.35);
        backdrop-filter: blur(40px) saturate(1.4);
        -webkit-backdrop-filter: blur(40px) saturate(1.4);
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow:
          0 25px 60px -12px rgba(0, 0, 0, 0.5),
          0 0 80px -20px rgba(138, 43, 226, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.1);
        animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(40px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .card-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 24px;
      }

      .logo-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .logo-icon svg {
        width: 28px;
        height: 28px;
        color: white;
      }

      .logo-text {
        font-size: 1.6rem;
        font-weight: 800;
        color: white;
      }

      .card-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: white;
        margin-bottom: 8px;
      }

      .card-header p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.95rem;
      }

      .auth-form {
        margin-bottom: 20px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 10px;
        transition: color 0.3s ease;
      }

      .form-group.focused label {
        color: #fff;
      }

      .input-wrapper {
        position: relative;
      }

      .input-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.4);
        transition: color 0.3s ease;
        pointer-events: none;
      }

      .form-group.focused .input-icon {
        color: rgba(255, 255, 255, 0.8);
      }

      .form-group input {
        width: 100%;
        padding: 14px 16px 14px 48px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        font-size: 1rem;
        color: white;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }

      .form-group input::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }

      .form-group input:focus {
        border-color: rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.12);
      }

      .toggle-password {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toggle-password svg {
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.4);
        transition: color 0.2s ease;
      }

      .toggle-password:hover svg {
        color: rgba(255, 255, 255, 0.7);
      }

      .password-strength {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 10px;
      }

      .strength-bar {
        flex: 1;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
      }

      .strength-fill {
        height: 100%;
        border-radius: 2px;
        transition: all 0.3s ease;
      }

      .strength-fill.weak {
        background: #ef4444;
      }
      .strength-fill.medium {
        background: #f59e0b;
      }
      .strength-fill.strong {
        background: #10b981;
      }

      .strength-label {
        font-size: 0.75rem;
        font-weight: 500;
        min-width: 60px;
      }

      .strength-label.weak {
        color: #ef4444;
      }
      .strength-label.medium {
        color: #f59e0b;
      }
      .strength-label.strong {
        color: #10b981;
      }

      .match-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        font-size: 0.8rem;
      }

      .match-icon {
        width: 16px;
        height: 16px;
      }

      .match-icon.success {
        color: #10b981;
      }
      .match-icon.error {
        color: #ef4444;
      }

      .match-indicator .success {
        color: #10b981;
      }
      .match-indicator .error {
        color: #ef4444;
      }

      .terms-group {
        margin-bottom: 24px;
      }

      .terms-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.7);
        user-select: none;
      }

      .terms-checkbox input {
        display: none;
      }

      .terms-checkbox .checkmark {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.08);
        position: relative;
        transition: all 0.2s ease;
        margin-top: 2px;
      }

      .terms-checkbox input:checked + .checkmark {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .terms-checkbox input:checked + .checkmark::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 5px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .terms-text a {
        color: white;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .terms-text a:hover {
        opacity: 0.8;
      }

      .btn-submit {
        width: 100%;
        padding: 16px 24px;
        background: linear-gradient(
          135deg,
          #8b5cf6 0%,
          #d946ef 50%,
          #ec4899 100%
        );
        border: none;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 700;
        color: white;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 25px rgba(139, 92, 246, 0.4);
      }

      .btn-submit::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s ease;
      }

      .btn-submit:hover::before {
        left: 100%;
      }

      .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 35px rgba(139, 92, 246, 0.5);
      }

      .btn-submit:active:not(:disabled) {
        transform: scale(0.98);
      }

      .btn-submit:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .btn-icon {
        width: 18px;
        height: 18px;
        transition: transform 0.3s ease;
      }

      .btn-submit:hover:not(:disabled) .btn-icon {
        transform: translateX(4px);
      }

      .btn-loader {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .btn-submit.loading .btn-content {
        opacity: 0;
      }

      .btn-submit.loading .btn-loader {
        display: block;
      }

      .spinner {
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .auth-footer {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
      }

      .auth-footer a {
        color: white;
        font-weight: 600;
        text-decoration: none;
        transition: opacity 0.2s ease;
      }

      .auth-footer a:hover {
        opacity: 0.8;
      }

      @media (max-width: 480px) {
        .glass-card {
          padding: 32px 24px;
          border-radius: 20px;
        }

        .card-header h1 {
          font-size: 1.5rem;
        }
      }

      /* ===========================
         LIGHT MODE OVERRIDES
         =========================== */
      :host-context(body.light-mode) .auth-page {
        background: #ede9ff;
      }

      :host-context(body.light-mode) .glass-card {
        background: rgba(255, 255, 255, 0.78);
        border-color: rgba(139, 92, 246, 0.18);
        box-shadow:
          0 25px 60px -12px rgba(100, 60, 180, 0.14),
          0 0 80px -20px rgba(138, 43, 226, 0.08),
          inset 0 1px 1px rgba(255, 255, 255, 0.95);
      }

      :host-context(body.light-mode) .logo-text {
        color: #1a1040;
      }

      :host-context(body.light-mode) .card-header h1 {
        color: #1a1040;
      }

      :host-context(body.light-mode) .card-header p {
        color: #6b5aa0;
      }

      :host-context(body.light-mode) .form-group label {
        color: #4a3870;
      }

      :host-context(body.light-mode) .form-group.focused label {
        color: #1a1040;
      }

      :host-context(body.light-mode) .input-icon {
        color: rgba(80, 50, 140, 0.4);
      }

      :host-context(body.light-mode) .form-group.focused .input-icon {
        color: rgba(80, 50, 140, 0.75);
      }

      :host-context(body.light-mode) .form-group input {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(139, 92, 246, 0.22);
        color: #1a1040;
      }

      :host-context(body.light-mode) .form-group input::placeholder {
        color: #b0a0d0;
      }

      :host-context(body.light-mode) .form-group input:focus {
        border-color: rgba(139, 92, 246, 0.5);
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
      }

      :host-context(body.light-mode) .toggle-password svg {
        color: rgba(80, 50, 140, 0.4);
      }

      :host-context(body.light-mode) .toggle-password:hover svg {
        color: rgba(80, 50, 140, 0.8);
      }

      :host-context(body.light-mode) .terms-label {
        color: #5a4a80;
      }

      :host-context(body.light-mode) .terms-label .checkmark {
        border-color: rgba(139, 92, 246, 0.3);
        background: rgba(139, 92, 246, 0.05);
      }

      :host-context(body.light-mode)
        .terms-label
        input:checked
        + .checkmark {
        background: rgba(139, 92, 246, 0.18);
        border-color: rgba(139, 92, 246, 0.5);
      }

      :host-context(body.light-mode)
        .terms-label
        input:checked
        + .checkmark::after {
        border-color: #6d28d9;
      }

      :host-context(body.light-mode) .terms-label a {
        color: #7c3aed;
      }

      :host-context(body.light-mode) .auth-footer {
        color: #6b5aa0;
      }

      :host-context(body.light-mode) .auth-footer a {
        color: #7c3aed;
      }

      :host-context(body.light-mode) .auth-footer a:hover {
        color: #4c1d95;
        opacity: 1;
      }
    `,
  ],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  nameFocused = false;
  emailFocused = false;
  passwordFocused = false;
  confirmPasswordFocused = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private msgService: NotificationService,
  ) { }

  get passwordStrength() {
    const p = this.password;
    if (!p) return { percent: 0, label: '', cls: '' };

    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) return { percent: 33, label: 'Weak', cls: 'weak' };
    if (score <= 3) return { percent: 66, label: 'Medium', cls: 'medium' };
    return { percent: 100, label: 'Strong', cls: 'strong' };
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword && this.password.length > 0;
  }

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.msgService.error('Please fill in all fields');
      return;
    }

    // Email Validation
    if (this.email.length > 255) {
      this.msgService.error('Email must not exceed 255 characters');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.msgService.error(
        'Must follow email format (example: example@gmail.com)',
      );
      return;
    }

    if (!this.passwordsMatch) {
      this.msgService.error('Passwords do not match');
      return;
    }
    if (this.password.length < 6) {
      this.msgService.error('Password must be at least 6 characters');
      return;
    }
    if (!this.acceptTerms) {
      this.msgService.error('Please accept the terms and conditions');
      return;
    }

    this.loading = true;
    this.authService
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.msgService.success('Account created! Please sign in.');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.loading = false;
          this.msgService.error(err.error?.message || 'Registration failed');
        },
      });
  }
}
