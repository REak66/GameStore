import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostListener,
  ElementRef,
  OnChanges,
  OnDestroy,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  NgZone,
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

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <!-- Trigger wrapper -->
    <div
      class="sel-root"
      [class.sel-open]="open"
      [class.sel-disabled]="disabled"
      [class.sel-multi]="multiple"
      [class.sel-error]="error"
    >
      <div
        class="sel-trigger"
        (click)="toggle()"
        [attr.tabindex]="disabled ? -1 : 0"
        (keydown)="onKeydown($event)"
        role="combobox"
        [attr.aria-expanded]="open"
        [attr.aria-label]="placeholder"
      >
        <!-- Tags (multiple) -->
        <ng-container *ngIf="multiple">
          <span
            class="sel-tag"
            *ngFor="let v of selected"
            (click)="removeTag(v, $event)"
          >
            {{ labelOf(v) }}<i class="fas fa-xmark sel-tag-x"></i>
          </span>
          <span class="sel-placeholder" *ngIf="!selected.length">{{
            placeholder
          }}</span>
        </ng-container>

        <!-- Single value -->
        <ng-container *ngIf="!multiple">
          <span class="sel-value" *ngIf="selected.length">{{
            labelOf(selected[0])
          }}</span>
          <span class="sel-placeholder" *ngIf="!selected.length">{{
            placeholder
          }}</span>
        </ng-container>

        <!-- Icons -->
        <span class="sel-icons">
          <i
            *ngIf="clearable && selected.length"
            class="fas fa-circle-xmark sel-clear"
            (click)="clear($event)"
          ></i>
          <i
            class="fas fa-chevron-down sel-arrow"
            [class.sel-arrow-up]="open"
          ></i>
        </span>
      </div>
    </div>

    <!-- Dropdown panel — teleported to document.body via CDK Overlay -->
    <ng-template #dropdownTpl>
      <div class="sel-dropdown">
        <!-- Search -->
        <div class="sel-search-wrap" *ngIf="searchable">
          <i class="fas fa-magnifying-glass sel-search-icon"></i>
          <input
            class="sel-search"
            [(ngModel)]="query"
            placeholder="Search..."
            (click)="$event.stopPropagation()"
          />
        </div>

        <!-- Options -->
        <div class="sel-list">
          <ng-container *ngFor="let opt of filteredOptions">
            <div class="sel-group-label" *ngIf="opt._isGroup">
              {{ opt.label }}
            </div>
            <div
              *ngIf="!opt._isGroup"
              class="sel-option"
              [class.sel-option-selected]="isSelected(opt.value)"
              [class.sel-option-disabled]="opt.disabled"
              (click)="selectOption(opt, $event)"
            >
              <i
                *ngIf="multiple"
                class="fas"
                [class.fa-square-check]="isSelected(opt.value)"
                [class.fa-square]="!isSelected(opt.value)"
                class="sel-check"
              ></i>
              {{ opt.label }}
            </div>
          </ng-container>
          <div class="sel-empty" *ngIf="!filteredOptions.length">
            No options
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .sel-root {
        position: relative;
      }

      .sel-trigger {
        min-height: 42px;
        background: rgba(255, 255, 255, 0.04);
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 6px 38px 6px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
        transition:
          border-color 0.18s,
          box-shadow 0.18s;
        outline: none;
        position: relative;
      }
      .sel-root:not(.sel-disabled) .sel-trigger:hover {
        border-color: rgba(79, 110, 247, 0.45);
      }
      .sel-open .sel-trigger {
        border-color: #4f6ef7;
        box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.15);
      }
      .sel-error .sel-trigger {
        border-color: #ef4444;
      }
      .sel-disabled .sel-trigger {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .sel-placeholder {
        color: #5a5e7a;
        font-size: 0.9rem;
      }
      .sel-value {
        color: #e0e3f0;
        font-size: 0.9rem;
      }

      .sel-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: rgba(79, 110, 247, 0.18);
        border: 1px solid rgba(79, 110, 247, 0.3);
        color: #a0b4ff;
        font-size: 0.8rem;
        padding: 2px 8px;
        border-radius: 6px;
      }
      .sel-tag-x {
        cursor: pointer;
        font-size: 0.7rem;
        opacity: 0.7;
      }
      .sel-tag-x:hover {
        opacity: 1;
      }

      .sel-icons {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 6px;
        color: #5a5e7a;
        font-size: 0.78rem;
      }
      .sel-clear {
        cursor: pointer;
        transition: color 0.15s;
      }
      .sel-clear:hover {
        color: #ef4444;
      }
      .sel-arrow {
        transition: transform 0.2s;
      }
      .sel-arrow-up {
        transform: rotate(-180deg);
      }

      /* ─── Light mode ────────────────────────────────────────── */
      :host-context(body.light-mode) .sel-trigger {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.12);
      }
      :host-context(body.light-mode) .sel-root:not(.sel-disabled) .sel-trigger:hover {
        border-color: rgba(79, 110, 247, 0.5);
      }
      :host-context(body.light-mode) .sel-open .sel-trigger {
        border-color: #4f6ef7;
        box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.12);
      }
      :host-context(body.light-mode) .sel-error .sel-trigger {
        border-color: #ef4444;
      }
      :host-context(body.light-mode) .sel-placeholder {
        color: #9ca0b8;
      }
      :host-context(body.light-mode) .sel-value {
        color: #11132a;
      }
      :host-context(body.light-mode) .sel-tag {
        background: rgba(79, 110, 247, 0.1);
        border-color: rgba(79, 110, 247, 0.25);
        color: #3a56d4;
      }
      :host-context(body.light-mode) .sel-icons {
        color: #9ca0b8;
      }
      :host-context(body.light-mode) .sel-clear:hover {
        color: #dc2626;
      }
    `,
  ],
})
export class SelectComponent
  implements ControlValueAccessor, OnChanges, OnDestroy {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() multiple = false;
  @Input() clearable = true;
  @Input() searchable = false;
  @Input() disabled = false;
  @Input() error = false;

  @Output() selectionChange = new EventEmitter<any>();

  @ViewChild('dropdownTpl') dropdownTpl!: TemplateRef<any>;

  open = false;
  query = '';
  selected: any[] = [];

  private overlayRef?: OverlayRef;
  private backdropSub?: Subscription;

  constructor(
    private host: ElementRef,
    private overlay: Overlay,
    private vcr: ViewContainerRef,
    private zone: NgZone,
  ) { }

  ngOnChanges() { }

  ngOnDestroy() {
    this.backdropSub?.unsubscribe();
    this.overlayRef?.dispose();
  }

  // ─── ControlValueAccessor ────────────────────────────────────────────────
  private _onChange: (v: any) => void = () => { };
  private _onTouched: () => void = () => { };

  writeValue(v: any) {
    if (v == null) {
      this.selected = [];
    } else if (Array.isArray(v)) {
      this.selected = v;
    } else {
      this.selected = [v];
    }
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

  // ─── Dropdown ────────────────────────────────────────────────────────────
  toggle() {
    if (this.disabled) return;
    this.open ? this.closePanel() : this.openPanel();
  }

  private openPanel() {
    this.open = true;
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host.nativeElement)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 4,
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetY: -4,
          },
        ])
        .withPush(false),
      width: this.host.nativeElement.offsetWidth,
      minWidth: 120,
    });

    this.overlayRef.attach(new TemplatePortal(this.dropdownTpl, this.vcr));
    this.backdropSub = this.overlayRef
      .backdropClick()
      .subscribe(() => this.zone.run(() => this.closePanel()));
  }

  private closePanel() {
    this.open = false;
    this.query = '';
    this._onTouched();
    this.backdropSub?.unsubscribe();
    this.backdropSub = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
    if (e.key === 'Escape') this.closePanel();
  }

  // ─── Selection ───────────────────────────────────────────────────────────
  selectOption(opt: SelectOption & { _isGroup?: boolean }, e: MouseEvent) {
    e.stopPropagation();
    if (opt.disabled || opt._isGroup) return;

    this.zone.run(() => {
      if (this.multiple) {
        const idx = this.selected.indexOf(opt.value);
        if (idx === -1) this.selected = [...this.selected, opt.value];
        else this.selected = this.selected.filter((v) => v !== opt.value);
        this.emit();
      } else {
        this.selected = [opt.value];
        this.emit();
        this.closePanel();
      }
    });
  }

  removeTag(v: any, e: MouseEvent) {
    e.stopPropagation();
    this.selected = this.selected.filter((x) => x !== v);
    this.emit();
  }

  clear(e: MouseEvent) {
    e.stopPropagation();
    this.selected = [];
    this.emit();
  }

  isSelected(v: any) {
    return this.selected.includes(v);
  }

  labelOf(v: any): string {
    return this.options.find((o) => o.value === v)?.label ?? String(v);
  }

  private emit() {
    const val = this.multiple ? this.selected : (this.selected[0] ?? null);
    this._onChange(val);
    this.selectionChange.emit(val);
  }

  // ─── Filtered options (with group support) ───────────────────────────────
  get filteredOptions(): (SelectOption & { _isGroup?: boolean })[] {
    const q = this.query.trim().toLowerCase();
    const base = q
      ? this.options.filter((o) => o.label.toLowerCase().includes(q))
      : this.options;

    // Insert group headers
    const hasGroups = base.some((o) => o.group);
    if (!hasGroups) return base;

    const result: (SelectOption & { _isGroup?: boolean })[] = [];
    let lastGroup = '';
    for (const o of base) {
      const g = o.group ?? '';
      if (g !== lastGroup) {
        result.push({ value: g, label: g, _isGroup: true });
        lastGroup = g;
      }
      result.push(o);
    }
    return result;
  }
}
