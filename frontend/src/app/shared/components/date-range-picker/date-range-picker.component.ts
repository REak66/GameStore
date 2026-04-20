import {
    Component,
    Input,
    Output,
    EventEmitter,
    forwardRef,
    ElementRef,
    HostListener,
    OnDestroy,
    ViewChild,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';

export interface DateRange {
    from: string;
    to: string;
}

@Component({
    selector: 'app-date-range-picker',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateRangePickerComponent),
            multi: true,
        },
    ],
    template: `
    <div
      class="drp-root"
      [class.drp-open]="open"
      [class.drp-disabled]="disabled"
      [class.drp-has-value]="hasValue"
    >
      <div
        class="drp-trigger"
        (click)="toggle()"
        [attr.tabindex]="disabled ? -1 : 0"
        (keydown)="onKeydown($event)"
        role="button"
      >
        <i class="fas fa-calendar-week drp-icon"></i>
        <span class="drp-label" *ngIf="!hasValue">{{ placeholder }}</span>
        <span class="drp-value" *ngIf="hasValue">
          {{ formatDisplay(value.from) }} — {{ formatDisplay(value.to) }}
        </span>
        <span class="drp-icons">
          <i
            *ngIf="clearable && hasValue"
            class="fas fa-circle-xmark drp-clear"
            (click)="clear($event)"
          ></i>
          <i
            class="fas fa-chevron-down drp-arrow"
            [class.drp-arrow-up]="open"
          ></i>
        </span>
      </div>
    </div>

    <ng-template #panelTpl>
      <div class="drp-panel" (click)="$event.stopPropagation()">
        <!-- Quick presets -->
        <div class="drp-presets">
          <button
            *ngFor="let p of presets"
            class="drp-preset-btn"
            [class.drp-preset-active]="activePreset === p.key"
            (click)="applyPreset(p)"
          >
            {{ p.label }}
          </button>
        </div>

        <div class="drp-divider"></div>

        <!-- Calendars -->
        <div class="drp-calendars">
          <div class="drp-cal">
            <div class="drp-cal-header">
              <button class="drp-nav" (click)="prevMonth('left')">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="drp-cal-title">{{ monthNames[leftMonth] }} {{ leftYear }}</span>
              <button class="drp-nav" (click)="nextMonth('left')">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="drp-weekdays">
              <span *ngFor="let d of weekdays">{{ d }}</span>
            </div>
            <div class="drp-days">
              <button
                *ngFor="let day of leftDays"
                class="drp-day"
                [class.drp-day-empty]="!day"
                [class.drp-day-today]="isToday(day, leftYear, leftMonth)"
                [class.drp-day-selected]="isSelected(day, leftYear, leftMonth)"
                [class.drp-day-in-range]="isInRange(day, leftYear, leftMonth)"
                [class.drp-day-range-start]="isRangeStart(day, leftYear, leftMonth)"
                [class.drp-day-range-end]="isRangeEnd(day, leftYear, leftMonth)"
                [disabled]="!day"
                (click)="day && selectDay(day, leftYear, leftMonth)"
                (mouseenter)="day && onHoverDay(day, leftYear, leftMonth)"
              >
                {{ day || '' }}
              </button>
            </div>
          </div>

          <div class="drp-cal">
            <div class="drp-cal-header">
              <button class="drp-nav" (click)="prevMonth('right')">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="drp-cal-title">{{ monthNames[rightMonth] }} {{ rightYear }}</span>
              <button class="drp-nav" (click)="nextMonth('right')">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="drp-weekdays">
              <span *ngFor="let d of weekdays">{{ d }}</span>
            </div>
            <div class="drp-days">
              <button
                *ngFor="let day of rightDays"
                class="drp-day"
                [class.drp-day-empty]="!day"
                [class.drp-day-today]="isToday(day, rightYear, rightMonth)"
                [class.drp-day-selected]="isSelected(day, rightYear, rightMonth)"
                [class.drp-day-in-range]="isInRange(day, rightYear, rightMonth)"
                [class.drp-day-range-start]="isRangeStart(day, rightYear, rightMonth)"
                [class.drp-day-range-end]="isRangeEnd(day, rightYear, rightMonth)"
                [disabled]="!day"
                (click)="day && selectDay(day, rightYear, rightMonth)"
                (mouseenter)="day && onHoverDay(day, rightYear, rightMonth)"
              >
                {{ day || '' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="drp-footer">
          <div class="drp-range-display">
            <span class="drp-range-label">
              <i class="fas fa-calendar-day"></i>
              {{ tempFrom ? formatDisplay(tempFrom) : 'Start date' }}
            </span>
            <i class="fas fa-arrow-right drp-range-arrow"></i>
            <span class="drp-range-label">
              <i class="fas fa-calendar-day"></i>
              {{ tempTo ? formatDisplay(tempTo) : 'End date' }}
            </span>
          </div>
          <div class="drp-footer-btns">
            <button class="drp-btn-cancel" (click)="cancel()">Cancel</button>
            <button class="drp-btn-apply" [disabled]="!tempFrom || !tempTo" (click)="apply()">Apply</button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
    styles: [
        `
      :host { display: block; }

      .drp-root { position: relative; }

      .drp-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--bg-card);
        color: var(--text-white);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.88rem;
        min-height: 38px;
        user-select: none;
      }
      .drp-trigger:hover { border-color: var(--accent); }
      .drp-open .drp-trigger { border-color: var(--accent); background: var(--bg-secondary); }
      .drp-disabled .drp-trigger {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .drp-icon { color: var(--accent); font-size: 0.9rem; flex-shrink: 0; }

      .drp-label {
        color: var(--text-muted);
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .drp-value {
        color: var(--text-white);
        font-weight: 600;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.85rem;
      }

      .drp-icons { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
      .drp-clear {
        color: var(--text-muted);
        font-size: 0.85rem;
        cursor: pointer;
        transition: color 0.15s;
      }
      .drp-clear:hover { color: var(--danger); }
      .drp-arrow {
        color: var(--text-muted);
        font-size: 0.65rem;
        transition: transform 0.2s;
      }
      .drp-arrow-up { transform: rotate(180deg); }

      /* ── Panel ── */
      .drp-panel {
        background: var(--bg-card);
        border: 1.5px solid var(--border);
        border-radius: 14px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        padding: 16px;
        min-width: 560px;
        z-index: 10000;
        animation: drpFadeIn 0.2s ease;
      }
      @keyframes drpFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Presets ── */
      .drp-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }
      .drp-preset-btn {
        padding: 5px 12px;
        border-radius: 20px;
        border: 1.5px solid var(--border);
        background: var(--bg-secondary);
        color: var(--text-muted);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s;
        font-family: inherit;
      }
      .drp-preset-btn:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--accent-light);
      }
      .drp-preset-active {
        border-color: var(--accent) !important;
        background: var(--accent) !important;
        color: white !important;
      }

      .drp-divider {
        height: 1px;
        background: var(--border);
        margin-bottom: 12px;
      }

      /* ── Calendars ── */
      .drp-calendars {
        display: flex;
        gap: 16px;
      }
      .drp-cal { flex: 1; min-width: 0; }

      .drp-cal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .drp-cal-title {
        font-weight: 700;
        font-size: 0.92rem;
        color: var(--text-white);
      }
      .drp-nav {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--bg-secondary);
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        transition: all 0.15s;
      }
      .drp-nav:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--accent-light);
      }

      .drp-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        margin-bottom: 4px;
      }
      .drp-weekdays span {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        padding: 4px 0;
      }

      .drp-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }
      .drp-day {
        width: 100%;
        aspect-ratio: 1;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 0.82rem;
        font-weight: 500;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.12s;
        font-family: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .drp-day:hover:not(:disabled):not(.drp-day-empty) {
        background: var(--accent-light);
        color: var(--accent);
      }
      .drp-day-empty {
        cursor: default;
        pointer-events: none;
      }
      .drp-day-today {
        color: var(--accent);
        font-weight: 700;
        position: relative;
      }
      .drp-day-today::after {
        content: '';
        position: absolute;
        bottom: 3px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--accent);
      }

      .drp-day-in-range {
        background: var(--accent-light, rgba(79, 110, 247, 0.08));
        color: var(--text-white);
        border-radius: 0;
      }
      .drp-day-range-start {
        background: var(--accent) !important;
        color: white !important;
        border-radius: 8px 0 0 8px !important;
        font-weight: 700;
      }
      .drp-day-range-end {
        background: var(--accent) !important;
        color: white !important;
        border-radius: 0 8px 8px 0 !important;
        font-weight: 700;
      }
      .drp-day-selected.drp-day-range-start.drp-day-range-end {
        border-radius: 8px !important;
      }
      .drp-day-selected {
        background: var(--accent) !important;
        color: white !important;
        font-weight: 700;
      }

      /* ── Footer ── */
      .drp-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
        gap: 12px;
      }
      .drp-range-display {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.82rem;
      }
      .drp-range-label {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 6px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.8rem;
      }
      .drp-range-label i { font-size: 0.75rem; color: var(--accent); }
      .drp-range-arrow { color: var(--text-muted); font-size: 0.7rem; }

      .drp-footer-btns { display: flex; gap: 8px; }
      .drp-btn-cancel {
        padding: 7px 16px;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--bg-secondary);
        color: var(--text-muted);
        font-weight: 600;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
      }
      .drp-btn-cancel:hover {
        background: var(--bg-card);
        color: var(--text-white);
      }
      .drp-btn-apply {
        padding: 7px 20px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        font-weight: 700;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.18s;
        box-shadow: 0 4px 12px rgba(79, 110, 247, 0.2);
        font-family: inherit;
      }
      .drp-btn-apply:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(79, 110, 247, 0.3);
      }
      .drp-btn-apply:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── Responsive ── */
      @media (max-width: 620px) {
        .drp-panel {
          min-width: 0;
          width: 320px;
        }
        .drp-calendars {
          flex-direction: column;
          gap: 12px;
        }
        .drp-footer {
          flex-direction: column;
          align-items: stretch;
        }
        .drp-range-display { justify-content: center; }
        .drp-footer-btns { justify-content: flex-end; }
      }

      /* ── Light mode ── */
      :host-context(body.light-mode) .drp-panel {
        box-shadow: 0 12px 40px rgba(0,0,0,0.12);
      }
    `,
    ],
})
export class DateRangePickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() placeholder = 'Select date range';
    @Input() clearable = true;
    @Input() disabled = false;
    @Output() rangeChange = new EventEmitter<DateRange>();

    @ViewChild('panelTpl', { static: true }) panelTpl!: TemplateRef<any>;

    open = false;
    value: DateRange = { from: '', to: '' };

    // Temp selection state
    tempFrom = '';
    tempTo = '';
    hoverDate = '';
    selectionStep: 'from' | 'to' = 'from';
    activePreset = '';

    // Calendar state
    leftYear!: number;
    leftMonth!: number;
    rightYear!: number;
    rightMonth!: number;

    readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    readonly monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    readonly presets = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'last7', label: 'Last 7 Days' },
        { key: 'last30', label: 'Last 30 Days' },
        { key: 'thisMonth', label: 'This Month' },
        { key: 'lastMonth', label: 'Last Month' },
    ];

    private overlayRef: OverlayRef | null = null;
    private backdropSub?: Subscription;
    private onChange: (v: any) => void = () => { };
    private onTouched: () => void = () => { };

    get hasValue(): boolean {
        return !!(this.value.from && this.value.to);
    }

    get leftDays(): (number | null)[] {
        return this.buildDays(this.leftYear, this.leftMonth);
    }

    get rightDays(): (number | null)[] {
        return this.buildDays(this.rightYear, this.rightMonth);
    }

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
    ) {
        const now = new Date();
        this.leftYear = now.getFullYear();
        this.leftMonth = now.getMonth();
        this.rightYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
        this.rightMonth = (now.getMonth() + 1) % 12;
    }

    ngOnDestroy() {
        this.closePanel();
    }

    // ── ControlValueAccessor ──
    writeValue(val: DateRange | null) {
        this.value = val && val.from && val.to ? { ...val } : { from: '', to: '' };
        if (this.value.from) {
            const d = new Date(this.value.from);
            this.leftYear = d.getFullYear();
            this.leftMonth = d.getMonth();
            this.syncRight();
        }
    }

    registerOnChange(fn: any) { this.onChange = fn; }
    registerOnTouched(fn: any) { this.onTouched = fn; }
    setDisabledState(d: boolean) { this.disabled = d; }

    // ── Toggle ──
    toggle() {
        if (this.disabled) return;
        this.open ? this.closePanel() : this.openPanel();
    }

    onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggle();
        } else if (e.key === 'Escape') {
            this.closePanel();
        }
    }

    private openPanel() {
        if (this.overlayRef) return;
        this.open = true;
        this.tempFrom = this.value.from;
        this.tempTo = this.value.to;
        this.selectionStep = 'from';
        this.activePreset = '';

        if (this.value.from) {
            const d = new Date(this.value.from);
            this.leftYear = d.getFullYear();
            this.leftMonth = d.getMonth();
        } else {
            const now = new Date();
            this.leftYear = now.getFullYear();
            this.leftMonth = now.getMonth();
        }
        this.syncRight();

        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions([
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
            ])
            .withPush(true);

        this.overlayRef = this.overlay.create({
            positionStrategy,
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
        });

        const portal = new TemplatePortal(this.panelTpl, this.viewContainerRef);
        this.overlayRef.attach(portal);
        this.backdropSub = this.overlayRef.backdropClick().subscribe(() => this.cancel());
    }

    private closePanel() {
        this.open = false;
        this.backdropSub?.unsubscribe();
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    // ── Calendar logic ──
    private buildDays(year: number, month: number): (number | null)[] {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }

    private syncRight() {
        if (this.leftMonth === 11) {
            this.rightYear = this.leftYear + 1;
            this.rightMonth = 0;
        } else {
            this.rightYear = this.leftYear;
            this.rightMonth = this.leftMonth + 1;
        }
    }

    prevMonth(side: 'left' | 'right') {
        if (side === 'left') {
            if (this.leftMonth === 0) { this.leftYear--; this.leftMonth = 11; }
            else { this.leftMonth--; }
            this.syncRight();
        } else {
            if (this.rightMonth === 0) { this.rightYear--; this.rightMonth = 11; }
            else { this.rightMonth--; }
            this.leftYear = this.rightMonth === 0 ? this.rightYear - 1 : this.rightYear;
            this.leftMonth = this.rightMonth === 0 ? 11 : this.rightMonth - 1;
        }
    }

    nextMonth(side: 'left' | 'right') {
        if (side === 'left') {
            if (this.leftMonth === 11) { this.leftYear++; this.leftMonth = 0; }
            else { this.leftMonth++; }
            this.syncRight();
        } else {
            if (this.rightMonth === 11) { this.rightYear++; this.rightMonth = 0; }
            else { this.rightMonth++; }
            this.leftYear = this.rightMonth === 0 ? this.rightYear - 1 : this.rightYear;
            this.leftMonth = this.rightMonth === 0 ? 11 : this.rightMonth - 1;
        }
    }

    // ── Day selection ──
    selectDay(day: number, year: number, month: number) {
        const dateStr = this.toDateStr(year, month, day);
        if (this.selectionStep === 'from') {
            this.tempFrom = dateStr;
            this.tempTo = '';
            this.selectionStep = 'to';
            this.activePreset = '';
        } else {
            if (dateStr < this.tempFrom) {
                this.tempFrom = dateStr;
                this.tempTo = '';
                this.selectionStep = 'to';
            } else {
                this.tempTo = dateStr;
                this.selectionStep = 'from';
            }
            this.activePreset = '';
        }
    }

    onHoverDay(day: number, year: number, month: number) {
        if (this.selectionStep === 'to' && this.tempFrom) {
            this.hoverDate = this.toDateStr(year, month, day);
        }
    }

    // ── Date checks ──
    isToday(day: number | null, year: number, month: number): boolean {
        if (!day) return false;
        const now = new Date();
        return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    }

    isSelected(day: number | null, year: number, month: number): boolean {
        if (!day) return false;
        const d = this.toDateStr(year, month, day);
        return d === this.tempFrom || d === this.tempTo;
    }

    isInRange(day: number | null, year: number, month: number): boolean {
        if (!day || !this.tempFrom) return false;
        const d = this.toDateStr(year, month, day);
        const end = this.tempTo || (this.selectionStep === 'to' ? this.hoverDate : '');
        if (!end) return false;
        const rangeStart = this.tempFrom < end ? this.tempFrom : end;
        const rangeEnd = this.tempFrom < end ? end : this.tempFrom;
        return d > rangeStart && d < rangeEnd;
    }

    isRangeStart(day: number | null, year: number, month: number): boolean {
        if (!day) return false;
        const d = this.toDateStr(year, month, day);
        const end = this.tempTo || (this.selectionStep === 'to' ? this.hoverDate : '');
        if (!end || !this.tempFrom) return d === this.tempFrom;
        return d === (this.tempFrom < end ? this.tempFrom : end);
    }

    isRangeEnd(day: number | null, year: number, month: number): boolean {
        if (!day) return false;
        const d = this.toDateStr(year, month, day);
        const end = this.tempTo || (this.selectionStep === 'to' ? this.hoverDate : '');
        if (!end || !this.tempFrom) return false;
        return d === (this.tempFrom < end ? end : this.tempFrom);
    }

    // ── Presets ──
    applyPreset(preset: { key: string; label: string }) {
        const now = new Date();
        const today = this.toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
        let from = '', to = '';

        switch (preset.key) {
            case 'today':
                from = to = today;
                break;
            case 'yesterday': {
                const y = new Date(now);
                y.setDate(y.getDate() - 1);
                from = to = this.toDateStr(y.getFullYear(), y.getMonth(), y.getDate());
                break;
            }
            case 'last7': {
                const d = new Date(now);
                d.setDate(d.getDate() - 6);
                from = this.toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                to = today;
                break;
            }
            case 'last30': {
                const d = new Date(now);
                d.setDate(d.getDate() - 29);
                from = this.toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                to = today;
                break;
            }
            case 'thisMonth':
                from = this.toDateStr(now.getFullYear(), now.getMonth(), 1);
                to = today;
                break;
            case 'lastMonth': {
                const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const last = new Date(now.getFullYear(), now.getMonth(), 0);
                from = this.toDateStr(first.getFullYear(), first.getMonth(), first.getDate());
                to = this.toDateStr(last.getFullYear(), last.getMonth(), last.getDate());
                break;
            }
        }

        this.tempFrom = from;
        this.tempTo = to;
        this.activePreset = preset.key;
        this.selectionStep = 'from';

        if (from) {
            const d = new Date(from);
            this.leftYear = d.getFullYear();
            this.leftMonth = d.getMonth();
            this.syncRight();
        }
    }

    // ── Actions ──
    apply() {
        if (!this.tempFrom || !this.tempTo) return;
        const from = this.tempFrom < this.tempTo ? this.tempFrom : this.tempTo;
        const to = this.tempFrom < this.tempTo ? this.tempTo : this.tempFrom;
        this.value = { from, to };
        this.onChange(this.value);
        this.rangeChange.emit(this.value);
        this.onTouched();
        this.closePanel();
    }

    cancel() {
        this.closePanel();
    }

    clear(e: Event) {
        e.stopPropagation();
        this.value = { from: '', to: '' };
        this.tempFrom = '';
        this.tempTo = '';
        this.onChange(this.value);
        this.rangeChange.emit(this.value);
        this.onTouched();
    }

    // ── Helpers ──
    private toDateStr(year: number, month: number, day: number): string {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    formatDisplay(dateStr: string): string {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}
