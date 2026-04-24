import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType =
  | 'text'
  | 'title'
  | 'circle'
  | 'image'
  | 'button'
  | 'rect'
  | 'product-card'
  | 'cart-item'
  | 'order-row'
  | 'table-row';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="active; else content">
      <!-- ── Repeat wrapper ── -->
      <ng-container *ngFor="let i of countArray">
        <!-- Avatar / circle -->
        <span
          *ngIf="type === 'circle'"
          class="skeleton-el skeleton-circle"
          [style.width]="size"
          [style.height]="size"
        ></span>

        <!-- Image block -->
        <span
          *ngIf="type === 'image'"
          class="skeleton-el skeleton-block"
          [style.width]="width || '100%'"
          [style.height]="height || '160px'"
          [style.border-radius]="round ? '12px' : '6px'"
        ></span>

        <!-- Title line -->
        <span
          *ngIf="type === 'title'"
          class="skeleton-el skeleton-line"
          [style.width]="width || '38%'"
          [style.height]="'20px'"
        ></span>

        <!-- Button shape -->
        <span
          *ngIf="type === 'button'"
          class="skeleton-el skeleton-block"
          [style.width]="width || '88px'"
          [style.height]="'36px'"
          style="border-radius: 100px;"
        ></span>

        <!-- Rect / generic block -->
        <span
          *ngIf="type === 'rect'"
          class="skeleton-el skeleton-block"
          [style.width]="width || '100%'"
          [style.height]="height || '120px'"
          [style.border-radius]="radius ?? (round ? '50%' : '8px')"
        ></span>

        <!-- Default: text lines -->
        <ng-container *ngIf="type === 'text'">
          <span
            *ngFor="let w of lineWidths"
            class="skeleton-el skeleton-line"
            [style.width]="w"
          ></span>
        </ng-container>

        <!-- ─── Compound: Product Card ─── -->
        <div *ngIf="type === 'product-card'" class="sk-product-card">
          <span class="skeleton-el sk-pc-image"></span>
          <div class="sk-pc-body">
            <span class="skeleton-el sk-pc-badge"></span>
            <span class="skeleton-el sk-pc-title"></span>
            <span class="skeleton-el sk-pc-stars"></span>
            <div class="sk-pc-footer">
              <span class="skeleton-el sk-pc-price"></span>
              <span class="skeleton-el sk-pc-btn"></span>
            </div>
          </div>
        </div>

        <!-- ─── Compound: Cart Item ─── -->
        <div *ngIf="type === 'cart-item'" class="sk-cart-item">
          <span class="skeleton-el sk-ci-thumb"></span>
          <div class="sk-ci-body">
            <span class="skeleton-el sk-ci-title"></span>
            <span class="skeleton-el sk-ci-sub"></span>
          </div>
          <span class="skeleton-el sk-ci-qty"></span>
          <span class="skeleton-el sk-ci-price"></span>
        </div>

        <!-- ─── Compound: Order Row ─── -->
        <div *ngIf="type === 'order-row'" class="sk-order-row">
          <span class="skeleton-el sk-or-id"></span>
          <span class="skeleton-el sk-or-date"></span>
          <span class="skeleton-el sk-or-status"></span>
          <span class="skeleton-el sk-or-price"></span>
          <span class="skeleton-el sk-or-btn"></span>
        </div>

        <!-- ─── Compound: Table Row ─── -->
        <div *ngIf="type === 'table-row'" class="sk-table-row">
          <span class="skeleton-el sk-tr-cell sk-tr-sm"></span>
          <span class="skeleton-el sk-tr-thumb"></span>
          <span class="skeleton-el sk-tr-cell sk-tr-lg"></span>
          <span class="skeleton-el sk-tr-cell sk-tr-md"></span>
          <span class="skeleton-el sk-tr-cell sk-tr-md"></span>
          <span class="skeleton-el sk-tr-cell sk-tr-sm"></span>
          <span class="skeleton-el sk-tr-cell sk-tr-sm"></span>
        </div>
      </ng-container>
    </ng-container>

    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
  styles: [
    `
      /* ── Base shimmer ── */
      .skeleton-el {
        display: block;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.05) 25%,
          rgba(255, 255, 255, 0.12) 50%,
          rgba(255, 255, 255, 0.05) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        border-radius: 6px;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* ── Light mode shimmer ── */
      :host-context(body.light-mode) .skeleton-el {
        background: linear-gradient(
          90deg,
          #dde1ee 25%,
          #eceff8 50%,
          #dde1ee 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
      }

      .skeleton-circle {
        border-radius: 50%;
        flex-shrink: 0;
      }
      .skeleton-line {
        height: 14px;
        margin-bottom: 10px;
      }
      .skeleton-line:last-child {
        margin-bottom: 0;
      }

      /* ── Product Card ── */
      .sk-product-card {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        width: 100%;
      }
      .sk-pc-image {
        height: 185px;
        width: 100%;
        border-radius: 0;
      }
      .sk-pc-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .sk-pc-badge {
        height: 18px;
        width: 56px;
        border-radius: 20px;
      }
      .sk-pc-title {
        height: 16px;
        width: 80%;
      }
      .sk-pc-stars {
        height: 13px;
        width: 90px;
        border-radius: 4px;
      }
      .sk-pc-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
      }
      .sk-pc-price {
        height: 22px;
        width: 64px;
        border-radius: 6px;
      }
      .sk-pc-btn {
        height: 34px;
        width: 88px;
        border-radius: 100px;
      }
      .sk-pc-stars {
        height: 14px;
        width: 90px;
        border-radius: 4px;
      }

      /* ── Cart Item ── */
      .sk-cart-item {
        display: flex;
        align-items: center;
        gap: 20px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 20px;
      }
      .sk-ci-thumb {
        width: 90px;
        height: 90px;
        border-radius: 12px;
        flex-shrink: 0;
      }
      .sk-ci-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .sk-ci-title {
        height: 16px;
        width: 55%;
      }
      .sk-ci-sub {
        height: 13px;
        width: 35%;
      }
      .sk-ci-qty {
        height: 40px;
        width: 100px;
        border-radius: 12px;
        flex-shrink: 0;
      }
      .sk-ci-price {
        height: 20px;
        width: 64px;
        flex-shrink: 0;
      }

      /* ── Order Row ── */
      .sk-order-row {
        display: flex;
        align-items: center;
        gap: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        padding: 18px 20px;
        margin-bottom: 12px;
      }
      .sk-or-id {
        height: 14px;
        width: 100px;
      }
      .sk-or-date {
        height: 14px;
        width: 90px;
      }
      .sk-or-status {
        height: 22px;
        width: 70px;
        border-radius: 20px;
      }
      .sk-or-price {
        height: 16px;
        width: 64px;
        margin-left: auto;
      }
      .sk-or-btn {
        height: 32px;
        width: 72px;
        border-radius: 8px;
      }

      /* ── Table Row ── */
      .sk-table-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .sk-tr-thumb {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        flex-shrink: 0;
      }
      .sk-tr-cell {
        height: 14px;
        border-radius: 6px;
      }
      .sk-tr-sm {
        width: 60px;
      }
      .sk-tr-md {
        width: 100px;
      }
      .sk-tr-lg {
        flex: 1;
      }

      /* ── Light mode: compound card backgrounds ── */
      :host-context(body.light-mode) .sk-product-card {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.07);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      }
      :host-context(body.light-mode) .sk-cart-item {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.07);
      }
      :host-context(body.light-mode) .sk-order-row {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.07);
      }
      :host-context(body.light-mode) .sk-table-row {
        border-bottom-color: rgba(0, 0, 0, 0.06);
      }
    `,
  ],
})
export class SkeletonComponent {
  /** Show skeleton (true) or real content (false) */
  @Input() active = true;
  /** Shape type */
  @Input() type: SkeletonType = 'text';

  @HostBinding('style.display')
  get hostDisplay(): string {
    return this.type === 'product-card' ? 'contents' : 'block';
  }
  /** Number of text lines (for type='text') */
  @Input() rows = 3;
  /** Repeat the skeleton N times (useful for lists/grids) */
  @Input() count = 1;
  /** Width override */
  @Input() width?: string;
  /** Height override (rect/image) */
  @Input() height?: string;
  /** Circle / avatar size */
  @Input() size = '40px';
  /** Round corners for image/rect */
  @Input() round = false;
  /** Explicit border-radius override (for rect/image, overrides 'round') */
  @Input() radius?: string;

  get countArray(): number[] {
    return Array(this.count).fill(0);
  }

  get lineWidths(): string[] {
    const widths = ['100%', '92%', '78%', '60%', '45%'];
    return widths.slice(0, this.rows);
  }
}
