import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  NotificationItem,
} from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-container">
      <div
        *ngFor="let n of items; trackBy: trackById"
        class="notif-card notif-{{ n.type }}"
      >
        <div class="notif-left">
          <span class="notif-icon">
            <i *ngIf="n.type === 'success'" class="fas fa-circle-check"></i>
            <i *ngIf="n.type === 'error'" class="fas fa-circle-xmark"></i>
            <i
              *ngIf="n.type === 'warning'"
              class="fas fa-triangle-exclamation"
            ></i>
            <i *ngIf="n.type === 'info'" class="fas fa-circle-info"></i>
          </span>
        </div>
        <div class="notif-body">
          <p class="notif-title">{{ n.title }}</p>
          <p class="notif-desc" *ngIf="n.description">{{ n.description }}</p>
        </div>
        <button
          class="notif-close"
          (click)="dismiss(n.id)"
          aria-label="Dismiss"
        >
          <i class="fas fa-xmark"></i>
        </button>
        <div
          class="notif-progress"
          [style.animation-duration]="n.duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .notif-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2100;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 360px;
        width: calc(100vw - 40px);
        pointer-events: none;
      }
      .notif-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: #1e2235;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 14px 14px 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        pointer-events: all;
        animation: notifSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        position: relative;
        overflow: hidden;
      }
      @keyframes notifSlideIn {
        from {
          opacity: 0;
          transform: translateX(40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .notif-icon {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
      }
      .notif-success .notif-icon {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
      }
      .notif-error .notif-icon {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .notif-warning .notif-icon {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
      .notif-info .notif-icon {
        background: rgba(79, 110, 247, 0.15);
        color: #4f6ef7;
      }

      .notif-body {
        flex: 1;
        min-width: 0;
      }
      .notif-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 3px;
      }
      .notif-desc {
        font-size: 0.82rem;
        color: #a0a4c0;
        line-height: 1.4;
      }

      .notif-close {
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        margin-top: -2px;
        background: transparent;
        border: none;
        color: #5a5e7a;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transition: all 0.18s;
      }
      .notif-close:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #a0a4c0;
      }

      /* Progress bar */
      .notif-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.2);
        animation: notifProgress linear forwards;
        width: 100%;
      }
      @keyframes notifProgress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
      .notif-success .notif-progress {
        background: #22c55e;
      }
      .notif-error .notif-progress {
        background: #ef4444;
      }
      .notif-warning .notif-progress {
        background: #f59e0b;
      }
      .notif-info .notif-progress {
        background: #4f6ef7;
      }

      /* Left accent bar */
      .notif-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        border-radius: 14px 0 0 14px;
      }
      .notif-success::before {
        background: #22c55e;
      }
      .notif-error::before {
        background: #ef4444;
      }
      .notif-warning::before {
        background: #f59e0b;
      }
      .notif-info::before {
        background: #4f6ef7;
      }

      /* ── Light mode overrides ── */
      :host-context(body.light-mode) .notif-card {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      :host-context(body.light-mode) .notif-title {
        color: #111827;
      }
      :host-context(body.light-mode) .notif-desc {
        color: #6b7280;
      }
      :host-context(body.light-mode) .notif-close {
        color: #9ca3af;
      }
      :host-context(body.light-mode) .notif-close:hover {
        background: rgba(0, 0, 0, 0.06);
        color: #374151;
      }
      :host-context(body.light-mode) .notif-success .notif-icon {
        background: rgba(34, 197, 94, 0.12);
        color: #16a34a;
      }
      :host-context(body.light-mode) .notif-error .notif-icon {
        background: rgba(239, 68, 68, 0.12);
        color: #dc2626;
      }
      :host-context(body.light-mode) .notif-warning .notif-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #d97706;
      }
      :host-context(body.light-mode) .notif-info .notif-icon {
        background: rgba(79, 110, 247, 0.12);
        color: #4f6ef7;
      }
      :host-context(body.light-mode) .notif-progress {
        background: rgba(0, 0, 0, 0.1);
      }
      :host-context(body.light-mode) .notif-success .notif-progress {
        background: #16a34a;
      }
      :host-context(body.light-mode) .notif-error .notif-progress {
        background: #dc2626;
      }
      :host-context(body.light-mode) .notif-warning .notif-progress {
        background: #d97706;
      }
      :host-context(body.light-mode) .notif-info .notif-progress {
        background: #4f6ef7;
      }
    `,
  ],
})
export class NotificationHostComponent implements OnInit, OnDestroy {
  items: NotificationItem[] = [];
  private sub!: Subscription;

  constructor(private notifService: NotificationService) { }

  ngOnInit() {
    this.sub = this.notifService.items$.subscribe((i) => (this.items = i));
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  dismiss(id: number) {
    this.notifService.dismiss(id);
  }
  trackById(_: number, n: NotificationItem) {
    return n.id;
  }
}
