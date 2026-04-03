import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertState } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="alert-backdrop"
      *ngIf="state.open"
      (click)="onBackdropClick($event)"
    >
      <div
        class="alert-card alert-{{ state.type }}"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-label]="state.title"
      >
        <!-- Icon circle -->
        <div class="alert-icon-wrap">
          <div class="alert-icon-ring"></div>
          <span class="alert-icon">
            <i *ngIf="state.type === 'success'" class="fas fa-check"></i>
            <i *ngIf="state.type === 'error'" class="fas fa-xmark"></i>
            <i
              *ngIf="state.type === 'warning'"
              class="fas fa-triangle-exclamation"
            ></i>
            <i *ngIf="state.type === 'info'" class="fas fa-circle-info"></i>
          </span>
        </div>

        <!-- Text -->
        <p class="alert-title">{{ state.title }}</p>
        <p class="alert-desc" *ngIf="state.description">
          {{ state.description }}
        </p>

        <!-- OK button -->
        <button class="alert-btn alert-btn-{{ state.type }}" (click)="close()">
          OK
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .alert-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        animation: alertFadeIn 0.18s ease;
      }
      @keyframes alertFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .alert-card {
        background: #1a1d2e;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 20px;
        padding: 40px 32px 32px;
        width: 340px;
        max-width: calc(100vw - 32px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
        animation: alertSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }
      @keyframes alertSlideUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Accent top border */
      .alert-success {
        border-top: 3px solid #22c55e;
      }
      .alert-error {
        border-top: 3px solid #ef4444;
      }
      .alert-warning {
        border-top: 3px solid #f59e0b;
      }
      .alert-info {
        border-top: 3px solid #4f6ef7;
      }

      /* Icon */
      .alert-icon-wrap {
        position: relative;
        width: 72px;
        height: 72px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }

      .alert-icon-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        animation: alertRingPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes alertRingPulse {
        from {
          transform: scale(0.6);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .alert-success .alert-icon-ring {
        background: rgba(34, 197, 94, 0.15);
        border: 2px solid rgba(34, 197, 94, 0.35);
      }
      .alert-error .alert-icon-ring {
        background: rgba(239, 68, 68, 0.15);
        border: 2px solid rgba(239, 68, 68, 0.35);
      }
      .alert-warning .alert-icon-ring {
        background: rgba(245, 158, 11, 0.15);
        border: 2px solid rgba(245, 158, 11, 0.35);
      }
      .alert-info .alert-icon-ring {
        background: rgba(79, 110, 247, 0.15);
        border: 2px solid rgba(79, 110, 247, 0.35);
      }

      .alert-icon {
        position: relative;
        z-index: 1;
        font-size: 1.8rem;
        animation: alertIconPop 0.35s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)
          both;
      }
      @keyframes alertIconPop {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .alert-success .alert-icon {
        color: #22c55e;
      }
      .alert-error .alert-icon {
        color: #ef4444;
      }
      .alert-warning .alert-icon {
        color: #f59e0b;
      }
      .alert-info .alert-icon {
        color: #4f6ef7;
      }

      /* Text */
      .alert-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #fff;
        text-align: center;
        margin: 0 0 8px;
        letter-spacing: 0.01em;
      }
      .alert-desc {
        font-size: 0.9rem;
        color: #a0a4c0;
        text-align: center;
        line-height: 1.5;
        margin: 0 0 24px;
      }

      /* Button */
      .alert-btn {
        margin-top: 24px;
        width: 100%;
        padding: 12px 0;
        border-radius: 12px;
        border: none;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        letter-spacing: 0.02em;
        transition: all 0.18s;
      }
      .alert-btn-success {
        background: #22c55e;
        color: #fff;
      }
      .alert-btn-success:hover {
        background: #16a34a;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
      }
      .alert-btn-error {
        background: #ef4444;
        color: #fff;
      }
      .alert-btn-error:hover {
        background: #dc2626;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
      }
      .alert-btn-warning {
        background: #f59e0b;
        color: #0f1123;
      }
      .alert-btn-warning:hover {
        background: #d97706;
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
      }
      .alert-btn-info {
        background: #4f6ef7;
        color: #fff;
      }
      .alert-btn-info:hover {
        background: #3d5cf5;
        box-shadow: 0 0 20px rgba(79, 110, 247, 0.4);
      }
    `,
  ],
})
export class AlertHostComponent implements OnInit, OnDestroy {
  state!: AlertState;
  private sub!: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.sub = this.alertService.state$.subscribe((s) => (this.state = s));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  close() {
    this.alertService.close();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('alert-backdrop')) {
      this.close();
    }
  }
}
