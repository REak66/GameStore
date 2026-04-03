import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';
import {
  SelectComponent,
  SelectOption,
} from '../../../shared/components/select/select.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { SpinComponent } from '../../../shared/components/spin/spin.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-manage-orders',
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
        <h1>Manage Orders</h1>
        <div class="header-actions">
          <button
            class="btn-export btn-pdf"
            (click)="exportPDF()"
            title="Export as PDF"
          >
            <i class="fas fa-file-pdf"></i> PDF
          </button>
          <button
            class="btn-export btn-excel"
            (click)="exportExcel()"
            title="Export as Excel"
          >
            <i class="fas fa-file-excel"></i> Excel
          </button>
        </div>
      </div>

      <!-- Toolbar: search + filters + status -->
      <div class="toolbar">
        <div class="search-wrap">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Search by customer name..."
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchChange($event)"
          />
          <button
            *ngIf="searchText"
            class="search-clear"
            (click)="clearSearch()"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="date-range">
          <input
            type="date"
            class="date-input"
            [(ngModel)]="dateFrom"
            (change)="loadOrders()"
            placeholder="From"
          />
          <span class="date-sep">→</span>
          <input
            type="date"
            class="date-input"
            [(ngModel)]="dateTo"
            (change)="loadOrders()"
            placeholder="To"
          />
          <button
            *ngIf="dateFrom || dateTo"
            class="btn-clear-date"
            (click)="clearDates()"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <app-select
          [(ngModel)]="filterStatus"
          [options]="filterStatusOptions"
          [clearable]="false"
          (selectionChange)="loadOrders()"
        ></app-select>
      </div>

      <div class="section-card">
        <app-spin
          [spinning]="loading"
          [hasContent]="true"
          tip="Loading orders..."
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody [@listAnimation]="orders">
              <tr *ngFor="let order of orders; trackBy: trackById">
                <td class="order-id">
                  #{{ order._id.slice(-8).toUpperCase() }}
                </td>
                <td>{{ getUser(order) }}</td>
                <td>{{ order.orderItems.length }}</td>
                <td>\${{ order.totalPrice | number: '1.2-2' }}</td>
                <td>
                  <app-select
                    [ngModel]="order.status"
                    [options]="orderStatusOptions"
                    [clearable]="false"
                    [disabled]="updatingOrders.has(order._id)"
                    (selectionChange)="updateStatus(order._id, $event)"
                  ></app-select>
                </td>
                <td>{{ order.createdAt | date: 'shortDate' }}</td>
                <td class="actions-cell">
                  <a [routerLink]="['/orders', order._id]" class="btn-view"
                    >View</a
                  >
                </td>
              </tr>
              <tr *ngIf="orders.length === 0 && !loading">
                <td colspan="7" class="empty">No orders found</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination-bar" *ngIf="totalOrders > 0">
            <span class="pagination-info"
              >Showing {{ showingStart }}–{{ showingEnd }} of
              {{ totalOrders }}</span
            >
            <div class="pagination-controls">
              <button
                class="pg-btn"
                (click)="goToPage(currentPage - 1)"
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
                  (click)="goToPage(+p)"
                >
                  {{ p }}
                </button>
              </ng-container>
              <button
                class="pg-btn"
                (click)="goToPage(currentPage + 1)"
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
      .admin-layout {
        display: flex;
        min-height: 100vh;
      }
      .admin-sidebar {
        width: 240px;
        background: #0d0f1e;
        color: white;
        padding: 24px 0;
        position: sticky;
        top: 0;
        height: 100vh;
        border-right: 1px solid rgba(255, 255, 255, 0.07);
        animation: sidebarIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes sidebarIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .sidebar-brand {
        padding: 0 24px 24px;
        font-size: 1.2rem;
        font-weight: 700;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 16px;
      }
      .sidebar-nav {
        display: flex;
        flex-direction: column;
      }
      .nav-item {
        display: block;
        padding: 12px 24px;
        color: #9ca3af;
        text-decoration: none;
        transition: all 0.22s;
        font-weight: 500;
        border-left: 3px solid transparent;
      }
      .nav-item:hover,
      .nav-item.active {
        background: rgba(79, 110, 247, 0.1);
        color: #a5b4fc;
        border-left-color: #4f6ef7;
        transform: translateX(3px);
      }
      .nav-item i {
        width: 18px;
        text-align: center;
        margin-right: 4px;
        font-size: 0.85rem;
      }
      .divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.07);
        margin: 12px 0;
      }
      .admin-main {
        flex: 1;
        padding: 32px;
        background: #0f1123;
        overflow-x: hidden;
        min-width: 0;
        animation: pageIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
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

      /* Page header */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 16px;
      }
      .page-header h1 {
        font-size: 1.8rem;
        font-weight: 700;
        color: #e8eaf6;
      }
      .header-actions {
        display: flex;
        gap: 10px;
      }
      .btn-export {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 9px 16px;
        border: none;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition:
          opacity 0.2s,
          transform 0.15s;
      }
      .btn-export:hover {
        opacity: 0.85;
        transform: translateY(-1px);
      }
      .btn-pdf {
        background: #e74c3c;
        color: #fff;
      }
      .btn-excel {
        background: #27ae60;
        color: #fff;
      }

      /* Toolbar */
      .toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .search-wrap {
        position: relative;
        flex: 1;
        min-width: 200px;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6b7280;
        font-size: 0.85rem;
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 10px 36px 10px 36px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: #e8eaf6;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.25s;
        box-sizing: border-box;
      }
      .search-input::placeholder {
        color: #6b7280;
      }
      .search-input:focus {
        border-color: #4f6ef7;
      }
      .search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        transition: color 0.2s;
      }
      .search-clear:hover {
        color: #e8eaf6;
      }
      .date-range {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .date-input {
        padding: 9px 10px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: #e8eaf6;
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.25s;
      }
      .date-input {
        padding: 9px 10px;
        border: 2px solid var(--border);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-white);
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.25s;
      }
      .date-input:focus {
        border-color: var(--accent);
      }
      .date-input::-webkit-calendar-picker-indicator {
        filter: invert(1);
        opacity: 0.5;
        cursor: pointer;
      }
      .date-sep {
        color: var(--text-muted);
        font-size: 0.9rem;
      }
      .btn-clear-date {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px 8px;
        font-size: 0.9rem;
        transition: color 0.2s;
      }
      .btn-clear-date:hover {
        color: var(--text-white);
      }
      .section-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid var(--border);
        animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
        overflow-x: auto;
      }
      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
      }
      .data-table th {
        text-align: left;
        padding: 12px 16px;
        background: var(--bg-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .data-table td {
        padding: 14px 16px;
        border-top: 1px solid var(--border);
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      .data-table tbody tr {
        transition: background 0.18s;
      }
      .data-table tbody tr:hover {
        background: var(--bg-secondary);
      }
      .order-id {
        font-family: monospace;
        font-weight: 600;
        color: var(--accent);
      }
      .customer-name {
        font-weight: 600;
        color: var(--text-white);
      }
      .customer-email {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .amount {
        font-weight: 700;
        color: var(--text-white);
      }
      .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        display: inline-block;
      }
      .status-badge.pending {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
      }
      .status-badge.completed {
        background: var(--success-light);
        color: var(--success);
      }
      .status-badge.cancelled {
        background: rgba(239, 68, 68, 0.15);
        color: var(--danger);
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .btn-view,
      .btn-status {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.2s;
      }
      .btn-view {
        background: var(--accent-light);
        color: var(--accent);
      }
      .btn-view:hover {
        background: var(--accent);
        color: white;
      }
      .btn-status {
        background: var(--bg-secondary);
        color: var(--text-muted);
        border: 1px solid var(--border);
      }
      .btn-status:hover {
        border-color: var(--accent);
        color: var(--accent);
      }
      .empty {
        text-align: center;
        color: var(--text-muted);
        padding: 40px;
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: overlayIn 0.2s ease both;
      }
      @keyframes overlayIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .modal {
        background: var(--bg-card);
        border-radius: 20px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid var(--border);
        animation: modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
      }
      @keyframes modalIn {
        from {
          transform: scale(0.88) translateY(20px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        background: var(--bg-card);
        z-index: 10;
      }
      .modal-header h2 {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-white);
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-muted);
        transition:
          color 0.2s,
          transform 0.2s;
      }
      .modal-close:hover {
        color: var(--text-white);
        transform: rotate(90deg);
      }
      .modal-body {
        padding: 24px;
      }
      .order-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }
      .info-item label {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-bottom: 4px;
        font-weight: 600;
      }
      .info-item span {
        font-weight: 600;
        color: var(--text-white);
      }
      .items-list {
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }
      .item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
      }
      .item-row:last-child {
        border-bottom: none;
      }
      .item-name {
        font-weight: 600;
        color: var(--text-white);
      }
      .item-qty {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .item-price {
        font-weight: 700;
        color: var(--text-white);
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

      @media (max-width: 768px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .page-header h1 {
          font-size: 1.4rem;
        }
        .header-actions {
          width: 100%;
        }
        .btn-export {
          flex: 1;
          justify-content: center;
        }
        .toolbar {
          flex-direction: column;
          align-items: stretch;
        }
        .search-wrap {
          min-width: unset;
          width: 100%;
        }
        .date-range {
          flex-wrap: wrap;
        }
        .date-input {
          flex: 1;
          min-width: 120px;
        }
        .section-card {
          padding: 16px;
        }
        .pagination-bar {
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .pagination-info { order: 2; }
        .pagination-controls { order: 1; }
        .pagination-size { order: 3; }
        .modal-overlay {
          align-items: flex-end;
        }
        .modal {
          border-radius: 24px 24px 0 0;
          max-height: 92vh;
          width: 100%;
          max-width: 100%;
          margin: 0;
        }
        .modal-header {
          border-radius: 24px 24px 0 0;
        }
        .order-info-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }
      @media (max-width: 600px) {
        .pagination-bar {
          flex-direction: column;
          align-items: center;
          gap: 16px;
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
      @media (max-width: 480px) {
        .page-header h1 {
          font-size: 1.4rem;
        }
        .section-card {
          padding: 16px;
        }
        .order-info-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 370px) {
        .page-header h1 {
          font-size: 1.2rem;
        }
        .section-card {
          padding: 12px 10px;
        }
      }
    `,
  ],
})
export class ManageOrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  filterStatus = '';
  updatingOrders = new Set<string>();

  // search & date
  searchText = '';
  dateFrom = '';
  dateTo = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // pagination
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  private _pageSize = 10;
  get pageSize() {
    return this._pageSize;
  }
  set pageSize(v: number) {
    this._pageSize = +v;
    this.currentPage = 1;
    this.loadOrders();
  }

  get showingStart(): number {
    return this.totalOrders === 0
      ? 0
      : (this.currentPage - 1) * this._pageSize + 1;
  }
  get showingEnd(): number {
    return Math.min(this.currentPage * this._pageSize, this.totalOrders);
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

  readonly filterStatusOptions: SelectOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  readonly orderStatusOptions: SelectOption[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  constructor(
    private orderService: OrderService,
    private notification: NotificationService,
  ) {}

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadOrders();
      });
    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchText = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  clearDates() {
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadOrders();
  }

  loadOrders() {
    const params: any = { page: this.currentPage, limit: this._pageSize };
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.searchText.trim()) params.search = this.searchText.trim();
    if (this.dateFrom) params.dateFrom = this.dateFrom;
    if (this.dateTo) params.dateTo = this.dateTo;
    this.loading = true;
    this.orderService.getAllOrders(params).subscribe({
      next: (res) => {
        this.orders = res.orders || [];
        this.totalOrders = res.total || 0;
        this.totalPages = res.pages || 1;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  trackById(_index: number, order: any): string {
    return order._id;
  }

  getUser(order: any): string {
    if (!order.user) return 'Unknown';
    return typeof order.user === 'string'
      ? order.user
      : order.user.name || order.user.email;
  }

  updateStatus(orderId: string, status: string) {
    if (!status || this.updatingOrders.has(orderId)) return;
    const order = this.orders.find((o: any) => (o as any)._id === orderId);
    if (!order) return;
    const previousStatus = (order as any).status;
    if (previousStatus === status) return;
    (order as any).status = status;
    this.updatingOrders.add(orderId);
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.updatingOrders.delete(orderId);
      },
      error: () => {
        (order as any).status = previousStatus;
        this.updatingOrders.delete(orderId);
        this.notification.error(
          'Failed to update order status. Please try again.',
        );
      },
    });
  }

  /** Build flat rows for export from currently loaded orders */
  private buildExportRows(): any[][] {
    return this.orders.map((o) => [
      '#' + (o as any)._id.slice(-8).toUpperCase(),
      this.getUser(o),
      (o as any).orderItems.length,
      '$' + (o as any).totalPrice.toFixed(2),
      (o as any).status,
      new Date((o as any).createdAt).toLocaleDateString(),
    ]);
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Orders Report', 14, 15);
    autoTable(doc, {
      head: [['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date']],
      body: this.buildExportRows(),
      startY: 22,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 110, 247] },
    });
    doc.save('orders.pdf');
  }

  exportExcel() {
    const headers = [
      'Order ID',
      'Customer',
      'Items',
      'Total',
      'Status',
      'Date',
    ];
    const rows = this.buildExportRows();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 20 },
      { wch: 7 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, 'orders.xlsx');
  }
}
