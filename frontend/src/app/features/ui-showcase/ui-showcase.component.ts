import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalService } from '../../shared/services/modal.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConfirmService } from '../../shared/services/confirm.service';

import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { SpinComponent } from '../../shared/components/spin/spin.component';
import { SliderComponent } from '../../shared/components/slider/slider.component';
import {
  SelectComponent,
  SelectOption,
} from '../../shared/components/select/select.component';
import { PopconfirmDirective } from '../../shared/components/popconfirm/popconfirm.directive';

@Component({
  selector: 'app-ui-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SkeletonComponent,
    SpinComponent,
    SliderComponent,
    SelectComponent,
    PopconfirmDirective,
  ],
  template: `
    <!-- ─────────────────────────────────────────────
         UI Component Showcase
    ───────────────────────────────────────────── -->
    <div class="showcase-root">
      <h1 class="sc-page-title">
        <i class="fas fa-layer-group"></i>
        UI Components
      </h1>
      <p class="sc-page-sub">A live showcase of all shared UI components.</p>

      <!-- ══════════════ MODAL ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title">
          <i class="fas fa-window-restore"></i> Modal
        </h2>
        <div class="sc-row">
          <button class="sc-btn" (click)="openBasicModal()">Basic Modal</button>
          <button class="sc-btn sc-btn-purple" (click)="openNoFooterModal()">
            No Footer
          </button>
          <button
            class="sc-btn sc-btn-danger"
            (click)="openCustomFooterModal()"
          >
            Custom Footer
          </button>
        </div>
      </section>

      <!-- ══════════════ MESSAGE ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title">
          <i class="fas fa-comment-dots"></i> Message
        </h2>
        <div class="sc-row">
          <button
            class="sc-btn sc-btn-success"
            (click)="msg.success('Operation completed successfully!')"
          >
            Success
          </button>
          <button
            class="sc-btn sc-btn-danger"
            (click)="msg.error('Something went wrong. Please try again.')"
          >
            Error
          </button>
          <button
            class="sc-btn sc-btn-warning"
            (click)="msg.warning('Your session is about to expire.')"
          >
            Warning
          </button>
          <button
            class="sc-btn"
            (click)="msg.info('A new update is available.')"
          >
            Info
          </button>
          <button class="sc-btn sc-btn-muted" (click)="loadingMsg()">
            Loading
          </button>
        </div>
      </section>

      <!-- ══════════════ CONFIRM ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title">
          <i class="fas fa-circle-question"></i> Confirm
        </h2>
        <div class="sc-row">
          <button class="sc-btn" (click)="confirmDefault()">
            Default confirm
          </button>
          <button class="sc-btn sc-btn-danger" (click)="confirmDanger()">
            Delete confirm
          </button>
          <button class="sc-btn sc-btn-warning" (click)="confirmWarning()">
            Warning confirm
          </button>
        </div>
        <p class="sc-result" *ngIf="confirmResult !== null">
          Result:
          <strong
            [class.text-success]="confirmResult"
            [class.text-danger]="!confirmResult"
          >
            {{ confirmResult ? 'Confirmed ✓' : 'Cancelled ✗' }}
          </strong>
        </p>
      </section>

      <!-- ══════════════ POPCONFIRM ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title">
          <i class="fas fa-comment-dots"></i> Popconfirm
        </h2>
        <div class="sc-row">
          <button
            class="sc-btn"
            appPopconfirm="Save changes?"
            popDescription="Your current progress will be saved."
            popOkText="Save"
            popCancelText="Discard"
            (popConfirm)="onPopconfirm(true, 'default')"
            (popCancel)="onPopconfirm(false, 'default')"
          >
            Default
          </button>

          <button
            class="sc-btn sc-btn-danger"
            appPopconfirm="Delete this item?"
            popDescription="This action cannot be undone."
            popType="danger"
            popOkText="Delete"
            popPlacement="top"
            (popConfirm)="onPopconfirm(true, 'danger')"
            (popCancel)="onPopconfirm(false, 'danger')"
          >
            Danger (top)
          </button>

          <button
            class="sc-btn sc-btn-warning"
            appPopconfirm="Proceed with caution?"
            popDescription="This may affect other users."
            popType="warning"
            popPlacement="bottom"
            (popConfirm)="onPopconfirm(true, 'warning')"
            (popCancel)="onPopconfirm(false, 'warning')"
          >
            Warning (bottom)
          </button>

          <button
            class="sc-btn sc-btn-purple"
            appPopconfirm="Really sure?"
            popType="default"
            popPlacement="right"
            (popConfirm)="onPopconfirm(true, 'right')"
            (popCancel)="onPopconfirm(false, 'right')"
          >
            Right placement
          </button>
        </div>
        <p class="sc-result" *ngIf="popconfirmResult !== null">
          Result:
          <strong
            [class.text-success]="popconfirmResult.confirmed"
            [class.text-danger]="!popconfirmResult.confirmed"
          >
            {{ popconfirmResult.confirmed ? '✓ Confirmed' : '✗ Cancelled' }}
            <span style="color:#5a5e7a; font-weight:400;">
              — {{ popconfirmResult.variant }}</span
            >
          </strong>
        </p>
      </section>

      <!-- ══════════════ NOTIFICATION ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title"><i class="fas fa-bell"></i> Notification</h2>
        <div class="sc-row">
          <button
            class="sc-btn sc-btn-success"
            (click)="
              notif.success(
                'Purchase Complete',
                'Your order #4821 has been placed.'
              )
            "
          >
            Success
          </button>
          <button
            class="sc-btn sc-btn-danger"
            (click)="
              notif.error(
                'Payment Failed',
                'Card declined. Please check your details.'
              )
            "
          >
            Error
          </button>
          <button
            class="sc-btn sc-btn-warning"
            (click)="
              notif.warning('Stock Low', 'Only 2 copies of this game remain.')
            "
          >
            Warning
          </button>
          <button
            class="sc-btn"
            (click)="
              notif.info(
                'New Achievement',
                'You unlocked the Early Bird badge.'
              )
            "
          >
            Info
          </button>
        </div>
      </section>

      <!-- ══════════════ SKELETON ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title"><i class="fas fa-ghost"></i> Skeleton</h2>
        <div
          class="sc-row"
          style="align-items:flex-start; flex-wrap:wrap; gap:24px;"
        >
          <!-- Card skeleton -->
          <div class="skeleton-demo-card">
            <app-skeleton
              type="image"
              height="120px"
              [active]="skeletonActive"
            ></app-skeleton>
            <div
              style="padding: 12px; display:flex; flex-direction:column; gap:8px;"
            >
              <app-skeleton
                type="title"
                [active]="skeletonActive"
              ></app-skeleton>
              <app-skeleton
                type="text"
                [rows]="2"
                [active]="skeletonActive"
              ></app-skeleton>
              <app-skeleton
                type="button"
                [active]="skeletonActive"
              ></app-skeleton>
            </div>
          </div>

          <!-- Avatar skeleton -->
          <div style="display:flex; align-items:center; gap:12px;">
            <app-skeleton
              type="circle"
              size="52px"
              [active]="skeletonActive"
            ></app-skeleton>
            <div style="display:flex; flex-direction:column; gap:8px; flex:1;">
              <app-skeleton
                type="title"
                width="60%"
                [active]="skeletonActive"
              ></app-skeleton>
              <app-skeleton
                type="text"
                [rows]="1"
                [active]="skeletonActive"
              ></app-skeleton>
            </div>
          </div>
        </div>
        <div class="sc-row" style="margin-top:14px;">
          <button class="sc-btn" (click)="skeletonActive = !skeletonActive">
            Toggle ({{ skeletonActive ? 'Loading' : 'Loaded' }})
          </button>
        </div>
      </section>

      <!-- ══════════════ SPIN ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title"><i class="fas fa-spinner"></i> Spin</h2>
        <div
          class="sc-row"
          style="align-items:flex-start; gap:32px; flex-wrap:wrap;"
        >
          <!-- Standalone sizes -->
          <div class="spin-demo-box">
            <p class="sc-label">SM</p>
            <app-spin size="sm" tip=""></app-spin>
          </div>
          <div class="spin-demo-box">
            <p class="sc-label">MD</p>
            <app-spin size="md" tip="Loading..."></app-spin>
          </div>
          <div class="spin-demo-box">
            <p class="sc-label">LG</p>
            <app-spin size="lg" tip="Please wait"></app-spin>
          </div>

          <!-- Wrapper mode -->
          <div style="flex:1; min-width:200px;">
            <p class="sc-label">Wrapper mode</p>
            <app-spin
              [hasContent]="true"
              [spinning]="spinWrapping"
              size="md"
              tip="Syncing..."
            >
              <div class="spin-content-demo">
                <p>Game data is loaded here.</p>
                <p style="color:#5a5e7a;">Score: 18,450 pts</p>
              </div>
            </app-spin>
            <button
              class="sc-btn"
              style="margin-top:10px;"
              (click)="spinWrapping = !spinWrapping"
            >
              {{ spinWrapping ? 'Stop' : 'Start' }} Spinning
            </button>
          </div>
        </div>
      </section>

      <!-- ══════════════ SLIDER ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title"><i class="fas fa-sliders"></i> Slider</h2>
        <div class="sc-slider-grid">
          <div class="sc-slider-row">
            <span class="sc-label">Basic ({{ sliderVal }})</span>
            <app-slider
              [(ngModel)]="sliderVal"
              [min]="0"
              [max]="100"
              [showBounds]="true"
            ></app-slider>
          </div>

          <div class="sc-slider-row">
            <span class="sc-label">Step 10 ({{ sliderStep }})</span>
            <app-slider
              [(ngModel)]="sliderStep"
              [min]="0"
              [max]="100"
              [step]="10"
              [showBounds]="true"
              [marks]="stepMarks"
            ></app-slider>
          </div>

          <div class="sc-slider-row">
            <span class="sc-label"
              >Range ({{ sliderRange[0] }} – {{ sliderRange[1] }})</span
            >
            <app-slider
              [(ngModel)]="sliderRange"
              [range]="true"
              [min]="0"
              [max]="200"
              [showBounds]="true"
            ></app-slider>
          </div>

          <div class="sc-slider-row">
            <span class="sc-label"
              >Price filter ({{ priceRange[0] }} – {{ priceRange[1] }})</span
            >
            <app-slider
              [(ngModel)]="priceRange"
              [range]="true"
              [min]="0"
              [max]="500"
              [step]="5"
              [showBounds]="true"
            ></app-slider>
          </div>
        </div>
      </section>

      <!-- ══════════════ SELECT ══════════════ -->
      <section class="sc-section">
        <h2 class="sc-sec-title"><i class="fas fa-chevron-down"></i> Select</h2>
        <div class="sc-select-grid">
          <div class="sc-field">
            <label class="sc-label">Basic ({{ basicSel }})</label>
            <app-select
              [options]="genreOptions"
              placeholder="Pick a genre"
              [(ngModel)]="basicSel"
            ></app-select>
          </div>

          <div class="sc-field">
            <label class="sc-label">Searchable</label>
            <app-select
              [options]="gameOptions"
              placeholder="Search game..."
              [(ngModel)]="searchSel"
              [searchable]="true"
            ></app-select>
            <span class="sc-hint">Selected: {{ searchSel || '—' }}</span>
          </div>

          <div class="sc-field">
            <label class="sc-label">Multiple tags</label>
            <app-select
              [options]="tagOptions"
              placeholder="Choose tags..."
              [(ngModel)]="multiSel"
              [multiple]="true"
              [searchable]="true"
            ></app-select>
            <span class="sc-hint"
              >Selected: {{ multiSel.join(', ') || '—' }}</span
            >
          </div>

          <div class="sc-field">
            <label class="sc-label">Grouped</label>
            <app-select
              [options]="groupedOptions"
              placeholder="Choose platform..."
              [(ngModel)]="groupSel"
            ></app-select>
            <span class="sc-hint">Selected: {{ groupSel || '—' }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- ── Modal templates ── -->
    <ng-template #basicModalTpl>
      <p>
        This is a basic modal. You can put any content here — forms, images,
        details, etc.
      </p>
      <p style="color:#5a5e7a; margin-top:8px; font-size:0.85rem;">
        Click outside or press the ✕ button to close.
      </p>
    </ng-template>

    <ng-template #noFooterTpl>
      <p>
        This modal has no footer. Pass <code>footer: null</code> to hide it.
      </p>
    </ng-template>

    <ng-template #customFooterTpl let-ctx>
      <p>This modal has a custom footer with its own buttons.</p>
    </ng-template>
    <ng-template #customFooterBtnsTpl>
      <button class="sc-btn sc-btn-muted" (click)="modalSvc.close()">
        Close
      </button>
      <button
        class="sc-btn sc-btn-success"
        (click)="modalSvc.close(); msg.success('Saved!')"
      >
        Save
      </button>
    </ng-template>
  `,
  styles: [
    `
      .showcase-root {
        max-width: 860px;
        margin: 0 auto;
        padding: 40px 24px 80px;
      }
      .sc-page-title {
        font-size: 1.8rem;
        font-weight: 800;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 6px;
      }
      .sc-page-title i {
        color: #4f6ef7;
      }
      .sc-page-sub {
        color: #5a5e7a;
        margin-bottom: 40px;
      }

      .sc-section {
        background: #1e2235;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
      }
      .sc-sec-title {
        font-size: 1rem;
        font-weight: 700;
        color: #a0a4c0;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        font-size: 0.82rem;
      }
      .sc-sec-title i {
        color: #4f6ef7;
      }

      .sc-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      /* Buttons */
      .sc-btn {
        padding: 8px 18px;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.18s;
        background: rgba(79, 110, 247, 0.18);
        color: #a0b4ff;
        border: 1px solid rgba(79, 110, 247, 0.25);
      }
      .sc-btn:hover {
        background: rgba(79, 110, 247, 0.3);
        color: #fff;
      }
      .sc-btn-success {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
        border-color: rgba(34, 197, 94, 0.25);
      }
      .sc-btn-success:hover {
        background: rgba(34, 197, 94, 0.3);
      }
      .sc-btn-danger {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border-color: rgba(239, 68, 68, 0.25);
      }
      .sc-btn-danger:hover {
        background: rgba(239, 68, 68, 0.3);
      }
      .sc-btn-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.25);
      }
      .sc-btn-warning:hover {
        background: rgba(245, 158, 11, 0.3);
      }
      .sc-btn-purple {
        background: rgba(139, 92, 246, 0.18);
        color: #c4b5fd;
        border-color: rgba(139, 92, 246, 0.3);
      }
      .sc-btn-purple:hover {
        background: rgba(139, 92, 246, 0.35);
      }
      .sc-btn-muted {
        background: rgba(255, 255, 255, 0.06);
        color: #a0a4c0;
        border-color: rgba(255, 255, 255, 0.1);
      }
      .sc-btn-muted:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .sc-result {
        margin-top: 14px;
        font-size: 0.88rem;
        color: #a0a4c0;
      }
      .text-success {
        color: #22c55e;
      }
      .text-danger {
        color: #ef4444;
      }

      /* Skeleton demo */
      .skeleton-demo-card {
        width: 200px;
        background: #161929;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      /* Spin demo */
      .spin-demo-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .spin-content-demo {
        background: #161929;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .spin-content-demo p {
        color: #c8ccdf;
        font-size: 0.9rem;
      }

      /* Slider demo */
      .sc-slider-grid {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .sc-slider-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      /* Select demo */
      .sc-select-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .sc-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sc-hint {
        font-size: 0.78rem;
        color: #5a5e7a;
      }

      .sc-label {
        font-size: 0.82rem;
        color: #a0a4c0;
        font-weight: 500;
      }

      code {
        background: rgba(79, 110, 247, 0.15);
        color: #a0b4ff;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 0.82rem;
      }
    `,
  ],
})
export class UiShowcaseComponent {
  @ViewChild('basicModalTpl') basicModalTpl!: TemplateRef<any>;
  @ViewChild('noFooterTpl') noFooterTpl!: TemplateRef<any>;
  @ViewChild('customFooterTpl') customFooterTpl!: TemplateRef<any>;
  @ViewChild('customFooterBtnsTpl') customFooterBtnsTpl!: TemplateRef<any>;

  // state
  skeletonActive = true;
  spinWrapping = true;
  confirmResult: boolean | null = null;
  popconfirmResult: { confirmed: boolean; variant: string } | null = null;

  // Slider values
  sliderVal = 40;
  sliderStep = 30;
  sliderRange: [number, number] = [20, 70];
  priceRange: [number, number] = [10, 80];
  stepMarks = { 0: '0', 25: '25', 50: '50', 75: '75', 100: '100' };

  // Select values
  basicSel = '';
  searchSel = '';
  multiSel: string[] = [];
  groupSel = '';

  genreOptions: SelectOption[] = [
    { value: 'action', label: 'Action' },
    { value: 'rpg', label: 'RPG' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'sports', label: 'Sports' },
    { value: 'puzzle', label: 'Puzzle' },
    { value: 'horror', label: 'Horror' },
  ];

  gameOptions: SelectOption[] = [
    { value: 'elden-ring', label: 'Elden Ring' },
    { value: 'cyberpunk', label: 'Cyberpunk 2077' },
    { value: 'gta6', label: 'GTA VI' },
    { value: 'zelda-totk', label: 'Zelda: TotK' },
    { value: 'baldurs-gate', label: "Baldur's Gate 3" },
    { value: 'diablo4', label: 'Diablo IV' },
    { value: 'starfield', label: 'Starfield' },
    { value: 'hogwarts', label: 'Hogwarts Legacy' },
  ];

  tagOptions: SelectOption[] = [
    { value: 'open-world', label: 'Open World' },
    { value: 'multiplayer', label: 'Multiplayer' },
    { value: 'story-rich', label: 'Story Rich' },
    { value: 'indie', label: 'Indie' },
    { value: 'co-op', label: 'Co-op' },
    { value: 'pvp', label: 'PvP' },
    { value: '4k', label: '4K Ready' },
  ];

  groupedOptions: SelectOption[] = [
    { value: 'pc', label: 'PC', group: 'Desktop' },
    { value: 'mac', label: 'macOS', group: 'Desktop' },
    { value: 'ps5', label: 'PlayStation 5', group: 'Console' },
    { value: 'xbox-x', label: 'Xbox Series X', group: 'Console' },
    { value: 'switch', label: 'Nintendo Switch', group: 'Handheld' },
    { value: 'steam', label: 'Steam Deck', group: 'Handheld' },
  ];

  constructor(
    public modalSvc: ModalService,
    public msg: NotificationService,
    public notif: NotificationService,
    private confirm: ConfirmService,
  ) {}

  openBasicModal() {
    this.modalSvc.open(this.basicModalTpl, {
      title: 'Game Details',
      width: '480px',
    });
  }
  openNoFooterModal() {
    this.modalSvc.open(this.noFooterTpl, { title: 'Info', footer: null });
  }
  openCustomFooterModal() {
    this.modalSvc.open(this.customFooterTpl, {
      title: 'Save Changes?',
      footer: this.customFooterBtnsTpl,
    });
  }

  loadingMsg() {
    const id = this.msg.info('Uploading save file…', undefined, 0);
    setTimeout(() => {
      this.msg.dismiss(id);
      this.msg.success('Save file uploaded!');
    }, 2500);
  }

  async confirmDefault() {
    this.confirmResult = null;
    this.confirmResult = await this.confirm.confirm({
      title: 'Confirm Action',
      description: 'Are you sure you want to proceed?',
      okText: 'Confirm',
      cancelText: 'Cancel',
    });
  }

  async confirmDanger() {
    this.confirmResult = null;
    this.confirmResult = await this.confirm.confirm({
      title: 'Delete Item',
      description: 'This action cannot be undone.',
      type: 'danger',
      okText: 'Delete',
      cancelText: 'Keep',
    });
    if (this.confirmResult) this.msg.success('Item deleted.');
  }

  async confirmWarning() {
    this.confirmResult = null;
    this.confirmResult = await this.confirm.confirm({
      title: 'Clear Cart',
      description: 'All items will be removed from your cart.',
      type: 'warning',
      okText: 'Clear',
      cancelText: 'Cancel',
    });
  }

  onPopconfirm(confirmed: boolean, variant: string) {
    this.popconfirmResult = { confirmed, variant };
  }
}
