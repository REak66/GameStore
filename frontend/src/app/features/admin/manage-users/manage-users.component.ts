import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { User } from '../../../core/models';
import { ConfirmService } from '../../../shared/services/confirm.service';
import {
  SelectComponent,
  SelectOption,
} from '../../../shared/components/select/select.component';
import { SpinComponent } from '../../../shared/components/spin/spin.component';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SelectComponent,
    SpinComponent,
  ],
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
    <main class="admin-main">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-users"></i> Manage Users</h1>
          <p class="subtitle">View, manage roles and control user access</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-users"></i></div>
          <div>
            <div class="stat-value">{{ users.length }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fas fa-circle-check"></i></div>
          <div>
            <div class="stat-value">{{ activeCount }}</div>
            <div class="stat-label">Active</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="fas fa-ban"></i></div>
          <div>
            <div class="stat-value">{{ inactiveCount }}</div>
            <div class="stat-label">Disabled</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow">
            <i class="fas fa-shield-halved"></i>
          </div>
          <div>
            <div class="stat-value">{{ adminCount }}</div>
            <div class="stat-label">Admins</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <app-spin
          [spinning]="loading"
          [hasContent]="true"
          tip="Loading users..."
        >
          <div class="table-toolbar">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search by name or email..."
                class="search-input"
              />
              <button
                *ngIf="searchQuery"
                class="clear-btn"
                (click)="searchQuery = ''"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="filter-group">
              <button
                class="filter-btn"
                [class.active]="roleFilter === 'all'"
                (click)="roleFilter = 'all'"
              >
                All
              </button>
              <button
                class="filter-btn"
                [class.active]="roleFilter === 'customer'"
                (click)="roleFilter = 'customer'"
              >
                Customers
              </button>
              <button
                class="filter-btn"
                [class.active]="roleFilter === 'admin'"
                (click)="roleFilter = 'admin'"
              >
                Admins
              </button>
            </div>
          </div>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="th-num">#</th>
                  <th class="th-user">User</th>
                  <th class="th-email">Email</th>
                  <th class="th-role">Role</th>
                  <th class="th-status">Status</th>
                  <th class="th-date">Joined</th>
                  <th class="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody [@listAnimation]="pagedUsers.length">
                <tr
                  *ngFor="let user of pagedUsers; let i = index"
                  class="tr-row"
                >
                  <td class="td-num">{{ showingStart + i }}</td>
                  <td class="td-user">
                    <div class="av">
                      <img
                        *ngIf="user.avatar"
                        [src]="getAvatarUrl(user.avatar)"
                        alt=""
                        class="av-img"
                        (error)="$any($event.target).style.display = 'none'"
                      />
                      <span [style.display]="user.avatar ? 'none' : ''">{{
                        user.name.charAt(0).toUpperCase()
                      }}</span>
                    </div>
                    <div class="uinfo">
                      <span class="uname">{{ user.name }}</span>
                      <span class="uid">#{{ user._id?.slice(-6) }}</span>
                    </div>
                  </td>
                  <td class="td-email">{{ user.email }}</td>
                  <td class="td-role">
                    <app-select
                      [ngModel]="user.role"
                      [options]="roleOptions"
                      [clearable]="false"
                      [disabled]="
                        !!(
                          authService.currentUser &&
                          (user.id === authService.currentUser.id ||
                            user._id === authService.currentUser.id)
                        )
                      "
                      (selectionChange)="updateRole(user, $event)"
                    ></app-select>
                  </td>
                  <td class="td-status">
                    <span
                      class="badge"
                      [class.badge-on]="user.isActive"
                      [class.badge-off]="!user.isActive"
                    >
                      <span class="dot"></span
                      >{{ user.isActive ? 'Active' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="td-date">
                    {{ user.createdAt | date: 'MMM d, yyyy' }}
                  </td>
                  <td class="td-actions">
                    <button
                      class="btn-toggle"
                      [class.btn-enable]="!user.isActive"
                      (click)="toggleStatus(user)"
                      [disabled]="
                        !!(
                          authService.currentUser &&
                          (user.id === authService.currentUser.id ||
                            user._id === authService.currentUser.id)
                        )
                      "
                    >
                      <i
                        [class]="
                          user.isActive ? 'fas fa-lock' : 'fas fa-lock-open'
                        "
                      ></i>
                      <span class="btn-label">{{ user.isActive ? 'Disable' : 'Enable' }}</span>
                    </button>
                    <button
                      class="btn-del"
                      (click)="deleteUser(user._id)"
                      title="Delete"
                      [disabled]="
                        !!(
                          authService.currentUser &&
                          (user.id === authService.currentUser.id ||
                            user._id === authService.currentUser.id)
                        )
                      "
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredUsers.length === 0 && !loading">
                  <td colspan="7" class="empty-cell">
                    <div class="empty-wrap">
                      <i class="fas fa-users-slash"></i>
                      <p>No users found</p>
                      <small>Try adjusting your search or filter</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar" *ngIf="totalItems > 0">
            <span class="pagination-info"
              >Showing {{ showingStart }}–{{ showingEnd }} of
              {{ totalItems }}</span
            >
            <div class="pagination-controls">
              <button
                class="pg-btn"
                (click)="setPage(currentPage - 1)"
                [disabled]="currentPage === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <ng-container *ngFor="let p of pageNumbers">
                <span class="pg-ellipsis" *ngIf="p === null">…</span>
                <button
                  class="pg-btn pg-num"
                  *ngIf="p !== null"
                  [class.pg-active]="p === currentPage"
                  (click)="setPage(+p)"
                >
                  {{ p }}
                </button>
              </ng-container>
              <button
                class="pg-btn"
                (click)="setPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="pagination-size">
              <app-select
                [(ngModel)]="pageSize"
                [options]="pageSizeOptions"
                [clearable]="false"
              ></app-select>
            </div>
          </div>
        </app-spin>
      </div>
    </main>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 26px;
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
      .page-header h1 {
        margin: 0 0 4px;
        font-size: 1.65rem;
        font-weight: 800;
        color: var(--text-white);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .page-header h1 i {
        color: var(--accent);
        font-size: 1.4rem;
      }
      .subtitle {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.875rem;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 24px;
      }
      .stat-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .stat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        border-color: var(--accent-light);
      }
      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 11px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }
      .stat-icon.blue {
        background: var(--accent-light);
        color: var(--accent);
      }
      .stat-icon.green {
        background: var(--success-light);
        color: var(--success);
      }
      .stat-icon.red {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
      .stat-icon.yellow {
        background: rgba(234, 179, 8, 0.1);
        color: #eab308;
      }
      .stat-value {
        font-size: 1.7rem;
        font-weight: 800;
        color: var(--text-white);
        line-height: 1;
      }
      .stat-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 3px;
        font-weight: 500;
      }

      .section-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        transition:
          background 0.4s ease,
          border 0.4s ease;
      }
      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .table-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 18px 20px;
        border-bottom: 1px solid var(--border);
      }
      .search-wrapper {
        position: relative;
        flex: 1;
        min-width: 220px;
      }
      .search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 0.8rem;
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 9px 36px;
        background: var(--bg-secondary);
        border: 1.5px solid var(--border);
        border-radius: 9px;
        color: var(--text-white);
        font-size: 0.875rem;
        outline: none;
        transition: all 0.2s;
      }
      .search-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-light);
        background: var(--bg-card);
      }
      .clear-btn {
        position: absolute;
        right: 11px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 0.78rem;
      }
      .clear-btn:hover {
        color: var(--text-white);
      }
      .filter-group {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .filter-btn {
        padding: 7px 15px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        background: var(--bg-secondary);
        border: 1.5px solid var(--border);
        color: var(--text-muted);
        transition: all 0.2s;
      }
      .filter-btn:hover {
        color: var(--accent);
        border-color: var(--accent);
      }
      .filter-btn.active {
        background: var(--accent-light);
        color: var(--accent);
        border-color: var(--accent);
      }

      .table-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
        font-size: 0.875rem;
      }
      .data-table thead tr {
        background: var(--bg-secondary);
      }
      .data-table th {
        padding: 11px 16px;
        text-align: left;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      .data-table td {
        padding: 13px 16px;
        border-top: 1px solid var(--border);
        color: var(--text-secondary);
        vertical-align: middle;
      }
      .tr-row {
        transition: background 0.15s;
      }
      .tr-row:hover {
        background: var(--bg-secondary);
      }

      .td-user {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .td-user .av {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: #fff;
        font-weight: 800;
        font-size: 0.9rem;
        vertical-align: middle;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .td-user .av .av-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .td-user .uinfo {
        display: flex;
        flex-direction: column;
      }
      .uname {
        font-weight: 600;
        color: var(--text-white);
        font-size: 0.875rem;
      }
      .uid {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.72rem;
        font-weight: 700;
      }
      .badge-on {
        background: var(--success-light);
        color: var(--success);
      }
      .badge-off {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
      .dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }
      .badge-on .dot {
        background: var(--success);
        animation: blink 2s infinite;
      }
      .badge-off .dot {
        background: var(--danger);
      }
      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.35;
        }
      }

      .btn-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        margin-right: 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1.5px solid var(--accent-light);
        background: var(--accent-light);
        color: var(--accent);
        transition: all 0.2s;
      }
      .btn-toggle:hover {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
      }
      .btn-toggle.btn-enable {
        background: var(--success-light);
        border-color: var(--success-light);
        color: var(--success);
      }
      .btn-toggle.btn-enable:hover {
        background: var(--success);
        color: white;
        border-color: var(--success);
      }
      .btn-del {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        background: rgba(239, 68, 68, 0.1);
        border: 1.5px solid rgba(239, 68, 68, 0.1);
        color: var(--danger);
        transition: all 0.2s;
      }
      .btn-del:hover {
        background: var(--danger);
        color: white;
        border-color: var(--danger);
      }

      .card-footer {
        padding: 12px 20px;
        border-top: 1px solid var(--border);
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .card-footer b {
        color: var(--accent);
      }

      /* ── Pagination ── */
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 10px;
        padding: 18px 20px 24px;
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

      @media (max-width: 600px) {
        .pagination-bar {
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 18px 16px 20px;
        }
        .pagination-info {
          order: 2;
          margin-bottom: 0;
        }
        .pagination-controls {
          order: 1;
        }
        .pagination-size {
          order: 3;
        }
      }

      @keyframes pageRowIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .page-animate tr {
        animation: pageRowIn 0.28s ease both;
      }
      .page-animate tr:nth-child(1) {
        animation-delay: 0ms;
      }
      .page-animate tr:nth-child(2) {
        animation-delay: 30ms;
      }
      .page-animate tr:nth-child(3) {
        animation-delay: 60ms;
      }
      .page-animate tr:nth-child(4) {
        animation-delay: 90ms;
      }
      .page-animate tr:nth-child(5) {
        animation-delay: 120ms;
      }

      @media (max-width: 1024px) {
        .stats-row {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
      }
      @media (max-width: 768px) {
        .stats-row {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .stat-card {
          padding: 12px 14px;
        }
        .table-toolbar {
          flex-direction: column;
          align-items: stretch;
        }
        .search-wrapper {
          min-width: unset;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .page-header h1 {
          font-size: 1.4rem;
        }
        .pagination-bar {
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .pagination-info { order: 2; }
        .pagination-controls { order: 1; }
        .pagination-size { order: 3; }
      }
      @media (max-width: 576px) {
        .btn-label {
          display: none;
        }
        .btn-toggle {
          padding: 7px 10px;
          margin-right: 6px;
        }
      }
      @media (max-width: 480px) {
        .stats-row {
          gap: 8px;
        }
        .stat-card {
          padding: 10px 12px;
        }
        .stat-value {
          font-size: 1.4rem;
        }
        .page-header h1 {
          font-size: 1.25rem;
        }
      }
      @media (max-width: 480px) {
        .modal-overlay {
          align-items: flex-end;
          padding: 0;
        }
        .modal {
          border-radius: 24px 24px 0 0;
          max-height: 92vh;
          width: 100%;
          max-width: 100%;
        }
        .modal-header {
          border-radius: 24px 24px 0 0;
          padding: 18px 16px 14px;
        }
        .modal-body {
          padding: 16px;
        }
        .modal-footer {
          padding: 12px 16px 20px;
          flex-direction: column-reverse;
        }
        .btn-cancel,
        .btn-save {
          width: 100%;
          justify-content: center;
        }
      }

      @media (max-width: 370px) {
        .page-header h1 {
          font-size: 1.1rem;
        }
        .section-card {
          padding: 12px 10px;
        }
        .stats-row {
          grid-template-columns: 1fr;
        }
        .modal-header {
          padding: 14px 12px;
        }
        .modal-body {
          padding: 12px;
        }
      }
    `,
  ],
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;

  private _searchQuery = '';
  get searchQuery() {
    return this._searchQuery;
  }
  set searchQuery(v: string) {
    this._searchQuery = v;
    this.currentPage = 1;
  }

  private _roleFilter = 'all';
  get roleFilter() {
    return this._roleFilter;
  }
  set roleFilter(v: string) {
    this._roleFilter = v;
    this.currentPage = 1;
  }

  currentPage = 1;
  private _pageSize = 10;
  get pageSize() {
    return this._pageSize;
  }
  set pageSize(v: number) {
    this._pageSize = +v;
    this.currentPage = 1;
  }

  readonly roleOptions: SelectOption[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' },
  ];

  private readonly apiBase = environment.apiUrl;

  constructor(
    private adminService: AdminService,
    private confirmService: ConfirmService,
    private notificationService: NotificationService,
    public authService: AuthService,
  ) { }

  getAvatarUrl(avatar?: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `${this.apiBase}${avatar}`;
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = '';
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        // Map _id to id for consistency with AuthService.currentUser
        this.users = (res.users || []).map((u: any) => ({ ...u, id: u._id }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get activeCount() {
    return this.users.filter((u) => u.isActive).length;
  }
  get inactiveCount() {
    return this.users.filter((u) => !u.isActive).length;
  }
  get adminCount() {
    return this.users.filter((u) => u.role === 'admin').length;
  }

  get filteredUsers(): any[] {
    let list = this.users;
    if (this._roleFilter !== 'all')
      list = list.filter((u) => u.role === this._roleFilter);
    if (!this._searchQuery) return list;
    const q = this._searchQuery.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }

  get totalItems(): number {
    return this.filteredUsers.length;
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this._pageSize));
  }
  get showingStart(): number {
    return this.totalItems === 0
      ? 0
      : (this.currentPage - 1) * this._pageSize + 1;
  }
  get showingEnd(): number {
    return Math.min(this.currentPage * this._pageSize, this.totalItems);
  }

  get pagedUsers(): any[] {
    const start = (this.currentPage - 1) * this._pageSize;
    return this.filteredUsers.slice(start, start + this._pageSize);
  }

  get pageNumbers(): (number | null)[] {
    const total = this.totalPages;
    const cur = this.currentPage;
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

  readonly pageSizeOptions: SelectOption[] = [
    { value: 10, label: '10 / page' },
    { value: 25, label: '25 / page' },
    { value: 50, label: '50 / page' },
  ];

  tableAnimating = false;
  setPage(n: number) {
    if (n < 1 || n > this.totalPages) return;
    this.currentPage = n;
  }

  updateRole(user: any, role: string) {
    // Prevent changing role for self
    if (
      this.authService.currentUser &&
      user._id === this.authService.currentUser.id
    ) {
      this.notificationService.warning('You cannot change your own role.');
      return;
    }
    this.adminService.updateUser(user._id, { role }).subscribe({
      next: () => {
        this.loadUsers();
        this.notificationService.success('User role updated successfully');
      },
      error: (err) => {
        this.notificationService.error(
          err?.error?.message || 'Failed to update user role',
        );
      },
    });
  }

  toggleStatus(user: any) {
    this.adminService
      .updateUser(user._id, { isActive: !user.isActive })
      .subscribe({ next: () => this.loadUsers() });
  }

  async deleteUser(id: string) {
    const ok = await this.confirmService.confirm({
      title: 'Delete User',
      description:
        'Are you sure you want to delete this user? This action cannot be undone.',
      type: 'danger',
      okText: 'Delete',
    });
    if (!ok) return;
    this.adminService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        if (
          err?.error?.message === 'You cannot delete your own account.' ||
          err?.error?.message?.includes('cannot delete your own')
        ) {
          this.notificationService.error('You cannot delete your own account.');
        } else {
          this.notificationService.error(
            err?.error?.message || 'Failed to delete user.'
          );
        }
      },
    });
  }
}
