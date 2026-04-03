import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Full-block spinner (no content wrapper) -->
    <ng-container *ngIf="!hasContent">
      <div class="spin-standalone spin-{{ size }}">
        <span class="spin-ring"></span>
        <span class="spin-tip" *ngIf="tip">{{ tip }}</span>
      </div>
    </ng-container>

    <!-- Wrapper mode: content + overlay -->
    <div class="spin-container" *ngIf="hasContent">
      <div class="spin-overlay" *ngIf="spinning">
        <div class="spin-inner spin-{{ size }}">
          <span class="spin-ring"></span>
          <span class="spin-tip" *ngIf="tip">{{ tip }}</span>
        </div>
      </div>
      <div class="spin-content" [class.spin-blur]="spinning">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ── Standalone ── */
      .spin-standalone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        gap: 10px;
      }

      /* ── Wrapper mode ── */
      .spin-container {
        position: relative;
      }
      .spin-overlay {
        position: absolute;
        inset: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 17, 35, 0.55);
        backdrop-filter: blur(2px);
        border-radius: inherit;
      }
      .spin-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .spin-content {
        transition: opacity 0.5s;
      }
      .spin-blur {
        opacity: 0.45;
        pointer-events: none;
        user-select: none;
      }

      /* ── Ring ── */
      .spin-ring {
        display: block;
        border-radius: 50%;
        border-style: solid;
        border-color: rgba(79, 110, 247, 0.2);
        border-top-color: #4f6ef7;
        animation: spinRing 0.9s linear infinite;
      }
      @keyframes spinRing {
        to {
          transform: rotate(360deg);
        }
      }

      .spin-sm .spin-ring {
        width: 22px;
        height: 22px;
        border-width: 3px;
      }
      .spin-md .spin-ring {
        width: 38px;
        height: 38px;
        border-width: 4px;
      }
      .spin-lg .spin-ring {
        width: 56px;
        height: 56px;
        border-width: 5px;
      }

      /* Standalone sizes */
      .spin-sm.spin-standalone .spin-ring {
        width: 22px;
        height: 22px;
        border-width: 3px;
      }
      .spin-md.spin-standalone .spin-ring {
        width: 38px;
        height: 38px;
        border-width: 4px;
      }
      .spin-lg.spin-standalone .spin-ring {
        width: 56px;
        height: 56px;
        border-width: 5px;
      }

      .spin-tip {
        font-size: 0.82rem;
        color: #a0a4c0;
      }

      /* ── Light mode overrides ── */
      :host-context(body.light-mode) .spin-overlay {
        background: rgba(244, 245, 251, 0.75);
        backdrop-filter: blur(3px);
      }
      :host-context(body.light-mode) .spin-ring {
        border-color: rgba(79, 110, 247, 0.18);
        border-top-color: #4f6ef7;
      }
      :host-context(body.light-mode) .spin-tip {
        color: #545878;
      }
    `,
  ],
})
export class SpinComponent {
  /** Whether spinning is active (wrapper mode) */
  @Input() spinning = true;
  /** Optional label below the spinner */
  @Input() tip = '';
  /** Size: sm | md | lg */
  @Input() size: SpinSize = 'md';
  /** If true, acts as wrapper; toggled via ng-content detection */
  @Input() hasContent = false;
}
