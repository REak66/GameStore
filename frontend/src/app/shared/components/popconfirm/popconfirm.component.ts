import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popconfirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pfc-overlay" (mousedown)="onOverlay($event)">
      <div
        #bubble
        class="pfc-bubble pfc-{{ placement }}"
        [class.pfc-visible]="positioned"
        [style.top.px]="top"
        [style.left.px]="left"
        (mousedown)="$event.stopPropagation()"
      >
        <!-- Icon + Text -->
        <div class="pfc-header">
          <span class="pfc-icon pfc-icon-{{ type }}">
            <i
              *ngIf="type === 'danger'"
              class="fas fa-triangle-exclamation"
            ></i>
            <i *ngIf="type === 'warning'" class="fas fa-circle-exclamation"></i>
            <i *ngIf="type === 'default'" class="fas fa-circle-question"></i>
          </span>
          <div>
            <p class="pfc-title">{{ title }}</p>
            <p class="pfc-desc" *ngIf="description">{{ description }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="pfc-actions">
          <button class="pfc-btn-cancel" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="pfc-btn-ok pfc-ok-{{ type }}" (click)="onOk()">
            {{ okText }}
          </button>
        </div>

        <!-- Arrow -->
        <span class="pfc-arrow"></span>
      </div>
    </div>
  `,
  styles: [
    `
      .pfc-overlay {
        position: fixed;
        inset: 0;
        z-index: 1400;
      }

      .pfc-bubble {
        position: fixed;
        width: 260px;
        background: #1e2235;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 14px 16px 12px;
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.55),
          0 0 0 1px rgba(79, 110, 247, 0.08);
        opacity: 0;
        transform: scale(0.88);
        transition:
          opacity 0.15s ease,
          transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
      }
      .pfc-bubble.pfc-visible {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }

      /* ── Header ── */
      .pfc-header {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin-bottom: 12px;
      }
      .pfc-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
      }
      .pfc-icon-default {
        background: rgba(79, 110, 247, 0.15);
        color: #4f6ef7;
      }
      .pfc-icon-danger {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .pfc-icon-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      .pfc-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 3px;
        line-height: 1.3;
      }
      .pfc-desc {
        font-size: 0.8rem;
        color: #a0a4c0;
        line-height: 1.4;
      }

      /* ── Actions ── */
      .pfc-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .pfc-btn-cancel {
        padding: 6px 14px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a0a4c0;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.15s;
      }
      .pfc-btn-cancel:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .pfc-btn-ok {
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.15s;
      }
      .pfc-ok-default {
        background: #4f6ef7;
        color: #fff;
      }
      .pfc-ok-default:hover {
        background: #3d5cf5;
      }
      .pfc-ok-danger {
        background: #ef4444;
        color: #fff;
      }
      .pfc-ok-danger:hover {
        background: #dc2626;
      }
      .pfc-ok-warning {
        background: #f59e0b;
        color: #0f1123;
      }
      .pfc-ok-warning:hover {
        background: #d97706;
      }

      /* ── Arrow ── */
      .pfc-arrow {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #1e2235;
      }
      /* top → arrow pokes downward from bubble bottom */
      .pfc-top .pfc-arrow {
        bottom: -6px;
        left: 50%;
        margin-left: -5px;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transform: rotate(45deg);
      }
      /* bottom → arrow pokes upward from bubble top */
      .pfc-bottom .pfc-arrow {
        top: -6px;
        left: 50%;
        margin-left: -5px;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        transform: rotate(45deg);
      }
      /* left → arrow pokes rightward from bubble right */
      .pfc-left .pfc-arrow {
        right: -6px;
        top: 50%;
        margin-top: -5px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        transform: rotate(45deg);
      }
      /* right → arrow pokes leftward from bubble left */
      .pfc-right .pfc-arrow {
        left: -6px;
        top: 50%;
        margin-top: -5px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        transform: rotate(45deg);
      }

      /* ══════════════ Light Mode ══════════════ */
      :host-context(body.light-mode) .pfc-bubble {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.12),
          0 0 0 1px rgba(79, 110, 247, 0.1);
      }

      :host-context(body.light-mode) .pfc-title {
        color: #11132a;
      }
      :host-context(body.light-mode) .pfc-desc {
        color: #545878;
      }

      :host-context(body.light-mode) .pfc-btn-cancel {
        background: rgba(0, 0, 0, 0.04);
        border-color: rgba(0, 0, 0, 0.1);
        color: #545878;
      }
      :host-context(body.light-mode) .pfc-btn-cancel:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #11132a;
      }

      :host-context(body.light-mode) .pfc-arrow {
        background: #ffffff;
      }
      :host-context(body.light-mode) .pfc-top .pfc-arrow,
      :host-context(body.light-mode) .pfc-bottom .pfc-arrow,
      :host-context(body.light-mode) .pfc-left .pfc-arrow,
      :host-context(body.light-mode) .pfc-right .pfc-arrow {
        border-color: rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class PopconfirmComponent implements AfterViewInit {
  @Input() title = 'Are you sure?';
  @Input() description?: string;
  @Input() okText = 'Yes';
  @Input() cancelText = 'No';
  @Input() type: 'default' | 'danger' | 'warning' = 'default';
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() anchorRect!: DOMRect;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() outsideClick = new EventEmitter<void>();

  top = -9999;
  left = -9999;
  positioned = false;

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewInit() {
    const bubble = this.el.nativeElement.querySelector(
      '.pfc-bubble',
    ) as HTMLElement;
    if (!bubble || !this.anchorRect) return;

    requestAnimationFrame(() => {
      const bw = bubble.offsetWidth;
      const bh = bubble.offsetHeight;
      const ar = this.anchorRect;
      const gap = 10;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let t = 0,
        l = 0;
      switch (this.placement) {
        case 'top':
          t = ar.top - bh - gap;
          l = ar.left + ar.width / 2 - bw / 2;
          break;
        case 'bottom':
          t = ar.bottom + gap;
          l = ar.left + ar.width / 2 - bw / 2;
          break;
        case 'left':
          t = ar.top + ar.height / 2 - bh / 2;
          l = ar.left - bw - gap;
          break;
        case 'right':
          t = ar.top + ar.height / 2 - bh / 2;
          l = ar.right + gap;
          break;
      }

      // Clamp to viewport
      this.left = Math.max(8, Math.min(l, vw - bw - 8));
      this.top = Math.max(8, Math.min(t, vh - bh - 8));
      this.positioned = true;
      this.cdr.detectChanges();
    });
  }

  onOk() {
    this.confirmed.emit();
  }
  onCancel() {
    this.cancelled.emit();
  }

  onOverlay(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('pfc-overlay')) {
      this.outsideClick.emit();
    }
  }
}
