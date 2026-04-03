import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { AdminService } from '../../../core/services/admin.service';
import {
  SelectComponent,
  SelectOption,
} from '../../../shared/components/select/select.component';
import { SpinComponent } from '../../../shared/components/spin/spin.component';

@Component({
  selector: 'app-auth-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent, SpinComponent],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(12px)' }),
            stagger('35ms', [
              animate(
                '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  template: `
    <div class="auth-logs">
      <h2 class="logs-title">User Authentication Logs</h2>
      <div class="logs-card">
        <form class="filter-form" (ngSubmit)="applyFilters()">
          <input
            type="text"
            placeholder="Search by user or email"
            [(ngModel)]="filters.search"
            name="search"
          />
          <app-select
            [(ngModel)]="filters.action"
            name="action"
            [options]="actionOptions"
            placeholder="All Actions"
            [clearable]="true"
          ></app-select>
          <app-select
            [(ngModel)]="filters.status"
            name="status"
            [options]="statusOptions"
            placeholder="All Status"
            [clearable]="true"
          ></app-select>
          <div class="date-range-group">
            <div class="date-field">
              <label class="date-label">From</label>
              <input type="date" [(ngModel)]="filters.from" name="from" />
            </div>
            <span class="date-sep">—</span>
            <div class="date-field">
              <label class="date-label">To</label>
              <input type="date" [(ngModel)]="filters.to" name="to" />
            </div>
          </div>
          <div class="btn-row">
            <button type="submit">Filter</button>
            <button type="button" (click)="resetFilters()">Reset</button>
          </div>
        </form>

        <div class="table-wrapper">
          <app-spin
            [spinning]="loading"
            [hasContent]="true"
            tip="Loading logs..."
          >
            <table *ngIf="logs.length > 0; else noLogs">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>IP</th>
                  <th>Device</th>
                  <th>OS</th>
                  <th>Browser</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody [@listAnimation]="logs">
                <tr
                  *ngFor="let log of logs; let i = index"
                  [class.alt-row]="i % 2 === 1"
                >
                  <td class="td-user">{{ log.user?.name || 'Guest' }}</td>
                  <td class="td-email">{{ log.email }}</td>
                  <td class="td-date">{{ log.createdAt | date: 'short' }}</td>
                  <td class="td-action">{{ log.action }}</td>
                  <td>
                    <span
                      class="status-badge"
                      [ngClass]="log.success ? 'success' : 'fail'"
                      [title]="log.success ? 'Success' : 'Fail'"
                    >
                      <i
                        class="fas"
                        [ngClass]="log.success ? 'fa-check' : 'fa-times'"
                      ></i>
                    </span>
                  </td>
                  <td>
                    <span class="ip-cell">
                      <span class="td-ip">{{ log.ip }}</span>
                      <button
                        class="copy-btn"
                        title="Copy IP"
                        (click)="copyToClipboard(log.ip)"
                      >
                        <i class="fas fa-copy"></i>
                      </button>
                    </span>
                  </td>
                  <td class="td-meta">
                    <i
                      class="fas"
                      [ngClass]="getDeviceIcon(log.deviceType)"
                    ></i>
                    {{ log.deviceType || 'unknown' }}
                  </td>
                  <td class="td-meta">
                    <i [class]="getOSIcon(log.os)"></i>
                    {{ log.os || 'unknown' }}
                  </td>
                  <td class="td-meta">
                    <i [class]="getBrowserIcon(log.browser)"></i>
                    {{ log.browser || 'unknown' }}
                  </td>
                  <td>
                    <span class="msg-cell" [title]="log.message">{{
                      log.message
                    }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </app-spin>
          <ng-template #noLogs>
            <p *ngIf="!loading" class="no-logs">
              No authentication logs found.
            </p>
          </ng-template>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="pagination.total > 0">
          <span class="pagination-info"
            >Showing {{ showingStart }}–{{ showingEnd }} of
            {{ pagination.total }}</span
          >
          <div class="pagination-controls">
            <button
              class="pg-btn"
              (click)="changePage(pagination.page - 1)"
              [disabled]="pagination.page === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <ng-container *ngFor="let p of pageNumbers">
              <span class="pg-ellipsis" *ngIf="p === null">…</span>
              <button
                class="pg-btn pg-num"
                *ngIf="p !== null"
                [class.pg-active]="p === pagination.page"
                (click)="changePage(+p)"
              >
                {{ p }}
              </button>
            </ng-container>
            <button
              class="pg-btn"
              (click)="changePage(pagination.page + 1)"
              [disabled]="pagination.page === pagination.pages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="pagination-size">
            <app-select
              [(ngModel)]="currentLimit"
              [options]="pageSizeOptions"
              [clearable]="false"
            ></app-select>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-logs {
        padding: 24px;
        animation: pageIn 0.4s ease both;
      }
      @keyframes pageIn {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .logs-title {
        font-size: 1.8rem;
        font-weight: 800;
        margin-bottom: 24px;
        color: var(--text-white);
      }
      .logs-card {
        background: var(--bg-card);
        border-radius: 16px;
        border: 1px solid var(--border);
        padding: 24px;
        transition:
          background 0.4s ease,
          border 0.4s ease;
      }
      .filter-form {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        background: var(--bg-secondary);
        padding: 16px;
        border-radius: 12px;
        border: 1px solid var(--border);
      }
      .filter-form input,
      .filter-form select {
        padding: 8px 12px;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--bg-card);
        color: var(--text-white);
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s;
      }
      .filter-form app-select {
        min-width: 150px;
      }
      .filter-form input:focus,
      .filter-form select:focus {
        border-color: var(--accent);
        background: var(--bg-secondary);
      }
      .filter-form button[type='submit'] {
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border: none;
        cursor: pointer;
        padding: 9px 20px;
        border-radius: 8px;
        font-weight: 700;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(79, 110, 247, 0.2);
      }
      .filter-form button[type='submit']:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(79, 110, 247, 0.3);
      }
      .filter-form button[type='button'] {
        background: var(--bg-card);
        color: var(--text-muted);
        border: 1.5px solid var(--border);
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s;
      }
      .filter-form button[type='button']:hover {
        background: var(--bg-secondary);
        color: var(--text-white);
      }
      .btn-row {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      /* ── Date range group ── */
      .date-range-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .date-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .date-label {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding-left: 2px;
      }
      .date-range-group input[type='date'] {
        width: 140px;
      }
      .date-sep {
        color: var(--text-muted);
        font-size: 1rem;
        margin-top: 18px;
        flex-shrink: 0;
      }

      .table-wrapper {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid var(--border);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 900px;
        background: var(--bg-card);
      }
      th {
        padding: 12px 16px;
        text-align: left;
        background: var(--bg-secondary);
        color: var(--text-muted);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--border);
      }
      td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        color: var(--text-secondary);
        font-size: 0.9rem;
        vertical-align: middle;
      }
      tr:hover td {
        background: var(--bg-secondary);
      }
      .td-user {
        color: var(--text-white) !important;
        font-weight: 700;
      }
      .td-email {
        color: var(--accent) !important;
        font-weight: 500;
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        font-size: 0.9rem;
      }
      .status-badge.success {
        color: var(--success);
        background: var(--success-light);
      }
      .status-badge.fail {
        color: var(--danger);
        background: rgba(239, 68, 68, 0.1);
      }
      .ip-cell {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .copy-btn {
        background: none;
        border: none;
        color: var(--accent);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }
      .copy-btn:hover {
        background: var(--accent-light);
      }
      .msg-cell {
        display: block;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .no-logs {
        text-align: center;
        color: var(--text-muted);
        padding: 40px;
      }

      /* ── Pagination ── */
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 20px;
        padding-top: 18px;
        border-top: 1px solid var(--border);
      }
      .pagination-info {
        font-size: 0.8rem;
        color: var(--text-muted);
        white-space: nowrap;
      }
      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .pg-btn {
        min-width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--bg-secondary);
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.82rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.18s;
        padding: 0 8px;
        font-family: inherit;
      }
      .pg-btn:hover:not(:disabled) {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--accent-light);
      }
      .pg-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .pg-btn.pg-active {
        border-color: var(--accent);
        background: var(--accent);
        color: white;
        font-weight: 700;
      }
      .pg-ellipsis {
        color: var(--text-muted);
        font-size: 0.9rem;
        padding: 0 4px;
        user-select: none;
        line-height: 34px;
      }
      .pagination-size {
        min-width: 130px;
      }

      /* ── Responsive ── */

      /* Tablet: 2-column grid for filters */
      @media (max-width: 1024px) {
        .filter-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: start;
        }
        .filter-form input[name='search'] {
          grid-column: 1 / -1;
        }
        .filter-form app-select {
          width: 100%;
        }
        .date-range-group {
          grid-column: 1 / -1;
          width: 100%;
          justify-content: flex-start;
        }
        .date-range-group input[type='date'] {
          flex: 1;
          width: auto;
          min-width: 0;
        }
        .filter-form button[type='submit'],
        .filter-form button[type='button'] {
          width: 100%;
        }
        .btn-row {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 768px) {
        .auth-logs {
          padding: 16px;
        }
        .logs-card {
          padding: 16px;
          border-radius: 12px;
        }
        .logs-title {
          font-size: 1.4rem;
          margin-bottom: 16px;
        }
        th {
          padding: 10px 12px;
          font-size: 0.7rem;
        }
        td {
          padding: 10px 12px;
          font-size: 0.82rem;
        }
        .msg-cell {
          max-width: 140px;
        }
        .pagination-bar {
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .pagination-info {
          order: 1;
        }
        .pagination-controls {
          order: 2;
        }
        .pagination-size {
          order: 3;
        }
      }

      @media (max-width: 600px) {
        .filter-form {
          grid-template-columns: 1fr;
        }
        .filter-form input[name='search'] {
          grid-column: 1;
        }
        .filter-form input,
        .filter-form app-select {
          width: 100%;
        }
        .date-range-group {
          grid-column: 1;
          flex-direction: row;
          width: 100%;
        }
        .date-range-group input[type='date'] {
          flex: 1;
          width: auto;
          min-width: 0;
          font-size: 0.82rem;
          padding: 8px 6px;
        }
        .filter-form .btn-row {
          display: flex;
          gap: 10px;
          grid-column: 1;
        }
        .filter-form button[type='submit'],
        .filter-form button[type='button'] {
          flex: 1;
        }
        .btn-row {
          grid-column: 1;
        }
      }

      @media (max-width: 480px) {
        .auth-logs {
          padding: 12px;
        }
        .logs-card {
          padding: 12px;
        }
        .logs-title {
          font-size: 1.2rem;
        }
        th {
          padding: 8px 10px;
          font-size: 0.68rem;
        }
        td {
          padding: 8px 10px;
          font-size: 0.78rem;
        }
        .msg-cell {
          max-width: 110px;
        }
        .pagination-controls {
          flex-wrap: wrap;
          justify-content: center;
        }
        .pg-btn {
          min-width: 30px;
          height: 30px;
          font-size: 0.75rem;
        }
      }

      @media (max-width: 370px) {
        .auth-logs {
          padding: 10px 8px;
        }
        .logs-card {
          padding: 10px 8px;
        }
      }
    `,
  ],
})
export class AuthLogsComponent implements OnInit {
  logs: any[] = [];
  loading = false;
  filters: { search: string; action: string | null; status: string | null; from: string; to: string } = {
    search: '',
    action: null,
    status: null,
    from: '',
    to: '',
  };
  pagination = {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  get showingStart(): number {
    return this.pagination.total === 0
      ? 0
      : (this.pagination.page - 1) * this.pagination.limit + 1;
  }
  get showingEnd(): number {
    return Math.min(
      this.pagination.page * this.pagination.limit,
      this.pagination.total,
    );
  }

  get pageNumbers(): (number | null)[] {
    const total = this.pagination.pages;
    const cur = this.pagination.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | null)[] = [1];
    if (cur > 3) pages.push(null);
    const start = Math.max(2, cur - 1);
    const end = Math.min(total - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  }

  readonly actionOptions: SelectOption[] = [
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
  ];

  readonly statusOptions: SelectOption[] = [
    { value: 'success', label: 'Success' },
    { value: 'fail', label: 'Fail' },
  ];

  readonly pageSizeOptions: SelectOption[] = [
    { value: 10, label: '10 / page' },
    { value: 25, label: '25 / page' },
    { value: 50, label: '50 / page' },
  ];

  get currentLimit() {
    return this.pagination.limit;
  }
  set currentLimit(v: number) {
    this.pagination.limit = +v;
    this.pagination.page = 1;
    this.fetchLogs();
  }

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.fetchLogs();
  }

  fetchLogs() {
    const params: any = {
      page: this.pagination.page,
      limit: this.pagination.limit,
    };
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.action) params.action = this.filters.action;
    if (this.filters.status)
      params.success =
        this.filters.status === 'success'
          ? 'true'
          : this.filters.status === 'fail'
            ? 'false'
            : undefined;
    if (this.filters.from) params.from = this.filters.from;
    if (this.filters.to) params.to = this.filters.to;

    this.loading = true;
    this.adminService.getAuthLogs(params).subscribe({
      next: (res) => {
        this.logs = res.logs || [];
        if (res.pagination) {
          this.pagination = res.pagination;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.pagination.page = 1;
    this.fetchLogs();
  }

  resetFilters() {
    this.filters = { search: '', action: null, status: null, from: '', to: '' };
    this.pagination.page = 1;
    this.fetchLogs();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.pagination.pages) {
      this.pagination.page = newPage;
      this.fetchLogs();
    }
  }

  copyToClipboard(text: string) {
    if (navigator?.clipboard) navigator.clipboard.writeText(text);
  }

  getDeviceIcon(type: string): string {
    switch ((type || '').toLowerCase()) {
      case 'desktop':
        return 'fa-desktop';
      case 'mobile':
        return 'fa-mobile-alt';
      case 'tablet':
        return 'fa-tablet-alt';
      case 'bot':
        return 'fa-robot';
      default:
        return 'fa-question';
    }
  }

  getOSIcon(os: string): string {
    if (!os || os.toLowerCase() === 'unknown') return 'fas fa-question-circle';
    const o = os.toLowerCase();
    if (o.includes('windows')) return 'fab fa-windows';
    if (o.includes('mac')) return 'fab fa-apple';
    if (o.includes('ios')) return 'fab fa-apple';
    if (o.includes('android')) return 'fab fa-android';
    if (o.includes('linux')) return 'fab fa-linux';
    return 'fas fa-question-circle';
  }

  getBrowserIcon(browser: string): string {
    if (!browser || browser.toLowerCase() === 'unknown') return 'fas fa-globe';
    const b = browser.toLowerCase();
    if (b.includes('chrome')) return 'fab fa-chrome';
    if (b.includes('firefox')) return 'fab fa-firefox';
    if (b.includes('safari')) return 'fab fa-safari';
    if (b.includes('edge')) return 'fab fa-edge';
    return 'fas fa-globe';
  }
}
