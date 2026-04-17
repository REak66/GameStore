import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmState } from '../../services/confirm.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="confirm-overlay"
      *ngIf="state.visible"
      (click)="onOverlay($event)"
    >
      <div class="confirm-bubble" role="dialog" aria-modal="true">
        <div class="confirm-icon-row">
          <span class="confirm-icon ci-{{ state.config.type || 'default' }}">
            <i
              *ngIf="state.config.icon; else defaultIcon"
              [class]="state.config.icon"
            ></i>
            <ng-template #defaultIcon>
              <i
                *ngIf="state.config.type === 'danger'"
                class="fas fa-triangle-exclamation"
              ></i>
              <i
                *ngIf="state.config.type === 'warning'"
                class="fas fa-circle-exclamation"
              ></i>
              <i
                *ngIf="!state.config.type || state.config.type === 'default'"
                class="fas fa-circle-question"
              ></i>
            </ng-template>
          </span>
          <div class="confirm-text">
            <p class="confirm-title">
              {{ state.config.title || 'Are you sure?' }}
            </p>
            <p class="confirm-desc" *ngIf="state.config.description">
              {{ state.config.description }}
            </p>
          </div>
        </div>
        <div class="confirm-actions">
          <button class="btn-cfm-cancel" (click)="answer(false)">
            {{ state.config.cancelText || 'No' }}
          </button>
          <button
            class="btn-cfm-ok btn-cfm-{{ state.config.type || 'default' }}"
            (click)="answer(true)"
          >
            {{ state.config.okText || 'Yes' }}
          </button>
        </div>
        <div class="confirm-arrow"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .confirm-overlay {
        position: fixed;
        inset: 0;
        z-index: 1500;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .confirm-bubble {
        background: #1e2235;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 18px 20px 16px;
        width: 300px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
        animation: bubblePop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }
      @keyframes bubblePop {
        from {
          opacity: 0;
          transform: scale(0.85);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .confirm-icon-row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .confirm-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }
      .ci-default {
        background: rgba(79, 110, 247, 0.15);
        color: #4f6ef7;
      }
      .ci-danger {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .ci-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      .confirm-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 4px;
      }
      .confirm-desc {
        font-size: 0.82rem;
        color: #a0a4c0;
        line-height: 1.4;
      }

      .confirm-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .btn-cfm-cancel {
        padding: 7px 16px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a0a4c0;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.18s;
      }
      .btn-cfm-cancel:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .btn-cfm-ok {
        padding: 7px 16px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.18s;
      }
      .btn-cfm-default {
        background: #4f6ef7;
        color: #fff;
      }
      .btn-cfm-default:hover {
        background: #3d5cf5;
      }
      .btn-cfm-danger {
        background: #ef4444;
        color: #fff;
      }
      .btn-cfm-danger:hover {
        background: #dc2626;
      }
      .btn-cfm-warning {
        background: #f59e0b;
        color: #0f1123;
      }
      .btn-cfm-warning:hover {
        background: #d97706;
      }
    `,
  ],
})
export class ConfirmHostComponent implements OnInit, OnDestroy {
  state!: ConfirmState;
  private sub!: Subscription;

  constructor(private confirmService: ConfirmService) { }

  ngOnInit() {
    this.sub = this.confirmService.state$.subscribe((s) => (this.state = s));
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  answer(v: boolean) {
    this.confirmService._resolve(v);
  }
  onOverlay(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('confirm-overlay')) {
      this.confirmService._resolve(false);
    }
  }
}
