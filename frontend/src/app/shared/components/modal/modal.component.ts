import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalState } from '../../services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="modal-backdrop"
      *ngIf="state.open"
      (click)="onBackdropClick($event)"
    >
      <div
        class="modal-wrap"
        [style.width]="state.width"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="modal-header" *ngIf="state.title || state.closable">
          <span class="modal-title">{{ state.title }}</span>
          <button
            class="modal-close"
            *ngIf="state.closable"
            (click)="close()"
            aria-label="Close"
          >
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <ng-container
            *ngIf="state.content"
            [ngTemplateOutlet]="state.content"
            [ngTemplateOutletContext]="state.context"
          >
          </ng-container>
        </div>

        <!-- Footer -->
        <div class="modal-footer" *ngIf="state.footer !== null">
          <ng-container *ngIf="state.footer" [ngTemplateOutlet]="state.footer">
          </ng-container>
          <ng-container *ngIf="state.footer === undefined">
            <button class="btn-modal-cancel" (click)="close()">Cancel</button>
            <button class="btn-modal-ok" (click)="close()">OK</button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.18s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-wrap {
        background: var(--bg-card, #1e2235);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        border-radius: 16px;
        max-width: calc(100vw - 32px);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
        animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(24px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px 0;
      }
      .modal-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-white, #fff);
        letter-spacing: 0.01em;
      }
      .modal-close {
        width: 32px;
        height: 32px;
        background: rgba(128, 128, 128, 0.1);
        border: none;
        border-radius: 8px;
        color: var(--text-secondary, #a0a4c0);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.18s;
      }
      .modal-close:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }

      .modal-body {
        padding: 20px 24px;
        overflow-y: auto;
        flex: 1;
        color: var(--text-secondary, #c8ccdf);
      }
      .modal-footer {
        padding: 0 24px 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .btn-modal-cancel {
        padding: 8px 20px;
        border-radius: 10px;
        background: rgba(128, 128, 128, 0.1);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
        color: var(--text-secondary, #a0a4c0);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.18s;
      }
      .btn-modal-cancel:hover {
        background: rgba(128, 128, 128, 0.18);
        color: var(--text-white, #fff);
      }
      .btn-modal-ok {
        padding: 8px 20px;
        border-radius: 10px;
        background: var(--accent, #4f6ef7);
        border: none;
        color: #fff;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s;
      }
      .btn-modal-ok:hover {
        background: var(--accent-dark, #3d5cf5);
        box-shadow: 0 0 16px rgba(79, 110, 247, 0.45);
      }

      /* ── Light mode overrides ── */
      :host-context(body.light-mode) .modal-backdrop {
        background: rgba(0, 0, 0, 0.35);
      }
      :host-context(body.light-mode) .modal-wrap {
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15);
      }
    `,
  ],
})
export class ModalComponent implements OnInit, OnDestroy {
  state!: ModalState;
  private sub!: Subscription;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
    this.sub = this.modalService.state$.subscribe((s) => (this.state = s));
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  close() {
    this.modalService.close();
  }

  onBackdropClick(e: MouseEvent) {
    if (
      (e.target as HTMLElement).classList.contains('modal-backdrop') &&
      this.state.closable
    ) {
      this.close();
    }
  }
}
