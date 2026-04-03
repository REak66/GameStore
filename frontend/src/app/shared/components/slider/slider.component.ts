import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostListener,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
  template: `
    <div class="slider-root" [class.slider-disabled]="disabled">
      <!-- Optional marks / labels row -->
      <div class="slider-wrapper">
        <div
          class="slider-track-area"
          (mousedown)="onTrackDown($event)"
          (touchstart)="onTrackTouch($event)"
          #trackEl
        >
          <!-- Background track -->
          <div class="slider-rail"></div>

          <!-- Filled track -->
          <div
            class="slider-fill"
            [style.left]="range ? fillLeft + '%' : '0'"
            [style.width]="range ? fillWidth + '%' : fillSingle + '%'"
          ></div>

          <!-- Marks -->
          <ng-container *ngIf="marks">
            <span
              *ngFor="let m of markList"
              class="slider-mark"
              [style.left]="m.pct + '%'"
              [class.slider-mark-active]="isMarkActive(m.value)"
            >
            </span>
          </ng-container>

          <!-- Thumb(s) -->
          <div
            class="slider-thumb"
            [style.left]="range ? leftPct + '%' : fillSingle + '%'"
            [class.slider-thumb-focus]="dragTarget === 'low'"
            (mousedown)="onThumbDown($event, 'low')"
            (touchstart)="onThumbTouch($event, 'low')"
            tabindex="0"
            (keydown)="onThumbKey($event, 'low')"
            role="slider"
            [attr.aria-valuemin]="min"
            [attr.aria-valuemax]="max"
            [attr.aria-valuenow]="range ? rangeLow : value"
          >
            <div class="slider-tooltip" *ngIf="tooltip !== 'never'">
              {{ range ? rangeLow : value }}
            </div>
          </div>

          <div
            class="slider-thumb"
            *ngIf="range"
            [style.left]="rightPct + '%'"
            [class.slider-thumb-focus]="dragTarget === 'high'"
            (mousedown)="onThumbDown($event, 'high')"
            (touchstart)="onThumbTouch($event, 'high')"
            tabindex="0"
            (keydown)="onThumbKey($event, 'high')"
            role="slider"
            [attr.aria-valuemin]="min"
            [attr.aria-valuemax]="max"
            [attr.aria-valuenow]="rangeHigh"
          >
            <div class="slider-tooltip" *ngIf="tooltip !== 'never'">
              {{ rangeHigh }}
            </div>
          </div>
        </div>

        <!-- Mark labels -->
        <div class="slider-marks-labels" *ngIf="marks">
          <span
            *ngFor="let m of markList"
            class="slider-mark-label"
            [style.left]="m.pct + '%'"
            [class.slider-mark-label-active]="isMarkActive(m.value)"
          >
            {{ m.label }}
          </span>
        </div>
      </div>

      <!-- Min / Max labels -->
      <div class="slider-bounds" *ngIf="showBounds">
        <span>{{ min }}</span>
        <span>{{ max }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .slider-root {
        padding: 6px 0;
        user-select: none;
      }
      .slider-disabled {
        opacity: 0.45;
        pointer-events: none;
      }

      .slider-wrapper {
        position: relative;
      }
      .slider-track-area {
        position: relative;
        height: 20px;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0 8px;
      }

      .slider-rail {
        position: absolute;
        left: 8px;
        right: 8px;
        height: 4px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 100px;
      }
      .slider-fill {
        position: absolute;
        height: 4px;
        background: linear-gradient(90deg, #4f6ef7, #7c3aed);
        border-radius: 100px;
        transition:
          left 0.05s,
          width 0.05s;
      }

      .slider-thumb {
        position: absolute;
        transform: translateX(-50%);
        width: 18px;
        height: 18px;
        background: #fff;
        border: 3px solid #4f6ef7;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(79, 110, 247, 0.45);
        cursor: grab;
        z-index: 2;
        transition:
          transform 0.15s,
          box-shadow 0.15s,
          border-color 0.15s;
        outline: none;
      }
      .slider-thumb:hover,
      .slider-thumb-focus {
        transform: translateX(-50%) scale(1.25);
        box-shadow:
          0 0 0 5px rgba(79, 110, 247, 0.2),
          0 2px 10px rgba(79, 110, 247, 0.5);
      }
      .slider-thumb:active {
        cursor: grabbing;
      }

      /* Tooltip */
      .slider-tooltip {
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        background: #1e2235;
        border: 1px solid rgba(79, 110, 247, 0.35);
        color: #fff;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .slider-thumb:hover .slider-tooltip,
      .slider-thumb-focus .slider-tooltip {
        opacity: 1;
      }

      /* Marks */
      .slider-mark {
        position: absolute;
        width: 6px;
        height: 6px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        top: 50%;
      }
      .slider-mark-active {
        background: #4f6ef7;
      }
      .slider-marks-labels {
        position: relative;
        height: 20px;
      }
      .slider-mark-label {
        position: absolute;
        transform: translateX(-50%);
        font-size: 0.72rem;
        color: #5a5e7a;
        top: 4px;
        white-space: nowrap;
      }
      .slider-mark-label-active {
        color: #a0a4c0;
      }

      /* Bounds */
      .slider-bounds {
        display: flex;
        justify-content: space-between;
        padding: 0 8px;
        margin-top: 2px;
        font-size: 0.75rem;
        color: #5a5e7a;
      }

      /* ── Light mode overrides ──────────────────────────────────────── */
      :host-context(body.light-mode) .slider-rail {
        background: rgba(0, 0, 0, 0.1);
      }

      :host-context(body.light-mode) .slider-thumb {
        background: #fff;
        border-color: #4f6ef7;
        box-shadow: 0 2px 8px rgba(79, 110, 247, 0.3);
      }
      :host-context(body.light-mode) .slider-thumb:hover,
      :host-context(body.light-mode) .slider-thumb-focus {
        box-shadow:
          0 0 0 5px rgba(79, 110, 247, 0.15),
          0 2px 10px rgba(79, 110, 247, 0.35);
      }

      :host-context(body.light-mode) .slider-tooltip {
        background: #ffffff;
        border: 1px solid rgba(79, 110, 247, 0.4);
        color: #1e2235;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }

      :host-context(body.light-mode) .slider-mark {
        background: rgba(0, 0, 0, 0.15);
      }
      :host-context(body.light-mode) .slider-mark-active {
        background: #4f6ef7;
      }

      :host-context(body.light-mode) .slider-mark-label {
        color: #9ca3af;
      }
      :host-context(body.light-mode) .slider-mark-label-active {
        color: #4f6ef7;
      }

      :host-context(body.light-mode) .slider-bounds {
        color: #9ca3af;
      }
    `,
  ],
})
export class SliderComponent implements ControlValueAccessor {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() range = false;
  @Input() disabled = false;
  @Input() tooltip: 'always' | 'hover' | 'never' = 'hover';
  @Input() showBounds = false;
  /** Pass { value: label } object, e.g. { 25: '25', 50: 'Mid', 75: '75' } */
  @Input() marks: Record<number, string> | null = null;

  @Output() valueChange = new EventEmitter<number | [number, number]>();

  value = 0;
  rangeLow = 0;
  rangeHigh = 100;

  dragTarget: 'low' | 'high' | null = null;
  private trackRect: DOMRect | null = null;

  constructor(
    private el: ElementRef,
    private cd: ChangeDetectorRef,
  ) { }

  // ─── ControlValueAccessor ───────────────────────────────────────────────
  private _onChange: (v: any) => void = () => { };
  private _onTouched: () => void = () => { };

  writeValue(v: any) {
    if (this.range && Array.isArray(v)) {
      this.rangeLow = this.clamp(v[0]);
      this.rangeHigh = this.clamp(v[1]);
    } else if (typeof v === 'number') {
      this.value = this.clamp(v);
    }
    this.cd.markForCheck();
  }
  registerOnChange(fn: any) {
    this._onChange = fn;
  }
  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }
  setDisabledState(d: boolean) {
    this.disabled = d;
  }

  // ─── Computed percentages ────────────────────────────────────────────────
  get fillSingle(): number {
    return this.toPct(this.value);
  }
  get leftPct(): number {
    return this.toPct(this.rangeLow);
  }
  get rightPct(): number {
    return this.toPct(this.rangeHigh);
  }
  get fillLeft(): number {
    return this.toPct(this.rangeLow);
  }
  get fillWidth(): number {
    return this.toPct(this.rangeHigh) - this.toPct(this.rangeLow);
  }

  get markList() {
    if (!this.marks) return [];
    return Object.entries(this.marks).map(([k, label]) => ({
      value: Number(k),
      label: label as string,
      pct: this.toPct(Number(k)),
    }));
  }

  isMarkActive(v: number) {
    if (this.range) return v >= this.rangeLow && v <= this.rangeHigh;
    return v <= this.value;
  }

  // ─── Drag ───────────────────────────────────────────────────────────────
  onThumbDown(e: MouseEvent, target: 'low' | 'high') {
    e.stopPropagation();
    e.preventDefault();
    this.startDrag(target);
  }
  onThumbTouch(e: TouchEvent, target: 'low' | 'high') {
    e.stopPropagation();
    this.startDrag(target);
  }
  onTrackDown(e: MouseEvent) {
    const pct = this.getEventPct(e);
    const val = this.snapToStep(this.fromPct(pct));
    if (!this.range) {
      this.value = val;
      this.emit();
    } else {
      // Move closest thumb
      const distLow = Math.abs(val - this.rangeLow);
      const distHigh = Math.abs(val - this.rangeHigh);
      if (distLow <= distHigh) {
        this.rangeLow = val;
      } else {
        this.rangeHigh = val;
      }
      this.emit();
    }
    this.startDrag(
      !this.range
        ? 'low'
        : Math.abs(val - this.rangeLow) <= Math.abs(val - this.rangeHigh)
          ? 'low'
          : 'high',
    );
  }
  onTrackTouch(e: TouchEvent) {
    const pct = this.getTouchPct(e);
    const val = this.snapToStep(this.fromPct(pct));
    if (!this.range) {
      this.value = val;
      this.emit();
    } else {
      const distLow = Math.abs(val - this.rangeLow);
      const distHigh = Math.abs(val - this.rangeHigh);
      if (distLow <= distHigh) this.rangeLow = val;
      else this.rangeHigh = val;
      this.emit();
    }
  }

  private startDrag(target: 'low' | 'high') {
    this.dragTarget = target;
    const trackEl = this.el.nativeElement.querySelector('.slider-track-area');
    if (trackEl) this.trackRect = trackEl.getBoundingClientRect();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.dragTarget || !this.trackRect) return;
    this.applyDrag(this.pctFromClient(e.clientX), this.dragTarget);
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (!this.dragTarget || !this.trackRect) return;
    const t = e.touches[0];
    this.applyDrag(this.pctFromClient(t.clientX), this.dragTarget);
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onDragEnd() {
    if (this.dragTarget) {
      this._onTouched();
      this.dragTarget = null;
      this.cd.markForCheck();
    }
  }

  private applyDrag(pct: number, target: 'low' | 'high') {
    const val = this.snapToStep(this.fromPct(pct));
    if (!this.range) {
      this.value = val;
    } else if (target === 'low') {
      this.rangeLow = Math.min(val, this.rangeHigh - this.step);
    } else {
      this.rangeHigh = Math.max(val, this.rangeLow + this.step);
    }
    this.emit();
    this.cd.markForCheck();
  }

  onThumbKey(e: KeyboardEvent, target: 'low' | 'high') {
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = this.step;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -this.step;
    if (!delta) return;
    e.preventDefault();
    if (!this.range) {
      this.value = this.clamp(this.value + delta);
    } else if (target === 'low') {
      this.rangeLow = this.clamp(
        Math.min(this.rangeLow + delta, this.rangeHigh - this.step),
      );
    } else {
      this.rangeHigh = this.clamp(
        Math.max(this.rangeHigh + delta, this.rangeLow + this.step),
      );
    }
    this.emit();
    this.cd.markForCheck();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  private emit() {
    const v = this.range
      ? ([this.rangeLow, this.rangeHigh] as [number, number])
      : this.value;
    this._onChange(v);
    this.valueChange.emit(v);
  }

  private toPct(v: number): number {
    return ((v - this.min) / (this.max - this.min)) * 100;
  }
  private fromPct(pct: number): number {
    return this.min + (pct / 100) * (this.max - this.min);
  }
  private clamp(v: number): number {
    return Math.min(this.max, Math.max(this.min, v));
  }
  private snapToStep(v: number): number {
    return this.clamp(Math.round(v / this.step) * this.step);
  }

  private getEventPct(e: MouseEvent): number {
    const trackEl = this.el.nativeElement.querySelector('.slider-track-area');
    const rect = trackEl?.getBoundingClientRect() ?? { left: 0, width: 1 };
    return this.pctFromClient(e.clientX, rect);
  }
  private getTouchPct(e: TouchEvent): number {
    const trackEl = this.el.nativeElement.querySelector('.slider-track-area');
    const rect = trackEl?.getBoundingClientRect() ?? { left: 0, width: 1 };
    return this.pctFromClient(e.touches[0].clientX, rect);
  }
  private pctFromClient(
    clientX: number,
    rect: DOMRect | { left: number; width: number } = this.trackRect ?? {
      left: 0,
      width: 1,
    },
  ): number {
    const raw = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, raw));
  }
}
