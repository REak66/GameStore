import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, MessageItem } from '../../services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="msg-container">
      <div
        *ngFor="let m of messages; trackBy: trackById"
        class="msg-item msg-{{ m.type }}"
        (click)="dismiss(m.id)"
      >
        <span class="msg-icon">
          <i *ngIf="m.type === 'success'" class="fas fa-circle-check"></i>
          <i *ngIf="m.type === 'error'" class="fas fa-circle-xmark"></i>
          <i
            *ngIf="m.type === 'warning'"
            class="fas fa-triangle-exclamation"
          ></i>
          <i *ngIf="m.type === 'info'" class="fas fa-circle-info"></i>
          <i
            *ngIf="m.type === 'loading'"
            class="fas fa-circle-notch msg-spin"
          ></i>
        </span>
        <span class="msg-text">{{ m.text }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .msg-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        pointer-events: none;
      }
      .msg-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 20px;
        border-radius: 100px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        pointer-events: all;
        cursor: pointer;
        animation: msgSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        backdrop-filter: blur(12px);
        border: 1px solid transparent;
        white-space: nowrap;
      }
      @keyframes msgSlideDown {
        from {
          opacity: 0;
          transform: translateY(-14px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .msg-icon {
        font-size: 1rem;
        display: flex;
        align-items: center;
      }
      .msg-text {
        line-height: 1.4;
      }

      .msg-success {
        background: rgba(22, 197, 94, 0.15);
        color: #22c55e;
        border-color: rgba(22, 197, 94, 0.3);
      }
      .msg-error {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.3);
      }
      .msg-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border-color: rgba(245, 158, 11, 0.3);
      }
      .msg-info {
        background: rgba(79, 110, 247, 0.15);
        color: #4f6ef7;
        border-color: rgba(79, 110, 247, 0.3);
      }
      .msg-loading {
        background: rgba(160, 164, 192, 0.12);
        color: #a0a4c0;
        border-color: rgba(160, 164, 192, 0.2);
      }

      .msg-spin {
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Light mode overrides ── */
      :host-context(body.light-mode) .msg-item {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        backdrop-filter: blur(8px);
      }
      :host-context(body.light-mode) .msg-success {
        background: rgba(22, 163, 74, 0.1);
        color: #15803d;
        border-color: rgba(22, 163, 74, 0.35);
      }
      :host-context(body.light-mode) .msg-error {
        background: rgba(220, 38, 38, 0.1);
        color: #b91c1c;
        border-color: rgba(220, 38, 38, 0.35);
      }
      :host-context(body.light-mode) .msg-warning {
        background: rgba(217, 119, 6, 0.1);
        color: #b45309;
        border-color: rgba(217, 119, 6, 0.35);
      }
      :host-context(body.light-mode) .msg-info {
        background: rgba(59, 80, 220, 0.1);
        color: #3b50dc;
        border-color: rgba(59, 80, 220, 0.3);
      }
      :host-context(body.light-mode) .msg-loading {
        background: rgba(100, 106, 140, 0.1);
        color: #64698c;
        border-color: rgba(100, 106, 140, 0.25);
      }
    `,
  ],
})
export class MessageHostComponent implements OnInit, OnDestroy {
  messages: MessageItem[] = [];
  private sub!: Subscription;

  constructor(private msgService: MessageService) { }

  ngOnInit() {
    this.sub = this.msgService.messages$.subscribe((m) => (this.messages = m));
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  dismiss(id: number) {
    this.msgService.dismiss(id);
  }
  trackById(_: number, m: MessageItem) {
    return m.id;
  }
}
