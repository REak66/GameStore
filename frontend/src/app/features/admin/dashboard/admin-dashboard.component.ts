import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { OrderService } from '../../../core/services/order.service';
import { SpinComponent } from '../../../shared/components/spin/spin.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinComponent],
  template: `
    <div class="admin-header">
      <h1>Dashboard</h1>
      <p>Welcome back, Admin!</p>
    </div>

    <app-spin *ngIf="loading" size="lg" tip="Loading dashboard..."></app-spin>

    <!-- Stats Cards -->
    <div class="stats-grid" *ngIf="stats">
      <div class="stat-card blue">
        <div class="stat-icon"><i class="fas fa-users"></i></div>
        <div class="stat-info">
          <h3>{{ stats.totalUsers }}</h3>
          <p>Total Users</p>
        </div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon"><i class="fas fa-box"></i></div>
        <div class="stat-info">
          <h3>{{ stats.totalProducts }}</h3>
          <p>Products</p>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon"><i class="fas fa-receipt"></i></div>
        <div class="stat-info">
          <h3>{{ stats.totalOrders }}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
        <div class="stat-info">
          <h3>\${{ stats.totalSales | number: '1.0-0' }}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="section-card">
      <div class="section-header">
        <h2>Recent Orders</h2>
        <a routerLink="/admin/orders" class="see-all">View All →</a>
      </div>
      <div class="table-wrapper">
        <table class="data-table" *ngIf="stats?.recentOrders?.length">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of stats.recentOrders">
              <td class="order-id">#{{ order._id.slice(-8).toUpperCase() }}</td>
              <td>{{ getOrderUser(order) }}</td>
              <td>\${{ order.totalPrice | number: '1.2-2' }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + order.status">{{
                  order.status
                }}</span>
              </td>
              <td>{{ order.createdAt | date: 'shortDate' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="empty-table" *ngIf="!stats?.recentOrders?.length">
          No orders yet
        </div>
      </div>
    </div>

    <!-- Monthly Sales Summary -->
    <div class="section-card chart-section" *ngIf="stats?.monthlySales?.length">
      <div class="chart-header">
        <div>
          <h2 class="chart-title">Monthly Revenue</h2>
          <p class="chart-subtitle">Last 12 months of sales performance</p>
        </div>
        <div class="chart-pill">
          <span class="pill-label">Period Total</span>
          <span class="pill-value"
            >\${{ getPeriodTotal() | number: '1.0-0' }}</span
          >
        </div>
      </div>
      <div class="chart-body">
        <div class="y-labels">
          <span>{{ getYLabel(1.0) }}</span>
          <span>{{ getYLabel(0.75) }}</span>
          <span>{{ getYLabel(0.5) }}</span>
          <span>{{ getYLabel(0.25) }}</span>
          <span>$0</span>
        </div>
        <div class="chart-canvas">
          <div class="gridlines">
            <div class="gridline"></div>
            <div class="gridline"></div>
            <div class="gridline"></div>
            <div class="gridline"></div>
            <div class="gridline"></div>
          </div>
          <div class="bars-row">
            <div
              class="bar-col"
              *ngFor="let month of stats.monthlySales.slice(-12); let i = index"
              [style.animation-delay]="i * 0.04 + 's'"
            >
              <div
                class="bar-fill"
                [style.height.px]="getBarHeight(month.sales)"
              >
                <span class="bar-tip"
                  >\${{ month.sales | number: '1.0-0' }}</span
                >
              </div>
              <span class="bar-label">{{ getMonthName(month._id.month) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-header {
        margin-bottom: 32px;
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
      .admin-header h1 {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-white);
      }
      .admin-header p {
        color: var(--text-muted);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 32px;
      }
      .stat-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        border: 1px solid var(--border);
        animation: statIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transition:
          transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.25s,
          background-color 0.4s ease;
      }
      @keyframes statIn {
        from {
          opacity: 0;
          transform: translateY(24px) scale(0.92);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
      }
      .stat-icon {
        font-size: 2rem;
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
      }
      .stat-info h3 {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--text-white);
      }
      .stat-info p {
        color: var(--text-muted);
        font-size: 0.85rem;
      }
      .stat-card.blue {
        border-left: 4px solid #4f6ef7;
      }
      .stat-card.green {
        border-left: 4px solid #4ade80;
      }
      .stat-card.purple {
        border-left: 4px solid #8b5cf6;
      }
      .stat-card.orange {
        border-left: 4px solid #f59e0b;
      }

      .section-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid var(--border);
        margin-bottom: 24px;
        animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
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
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .section-header h2 {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-white);
        margin-bottom: 0;
      }
      .see-all {
        color: var(--accent);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        transition: color 0.2s;
      }
      .see-all:hover {
        color: var(--purple);
      }
      .table-wrapper {
        overflow-x: auto;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
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
        font-weight: 700;
        color: var(--accent);
      }
      .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: capitalize;
      }
      .status-pending {
        background: rgba(251, 191, 36, 0.12);
        color: #fbbf24;
      }
      .status-processing {
        background: var(--accent-light);
        color: var(--accent);
      }
      .status-delivered {
        background: var(--success-light);
        color: var(--success);
      }
      .status-cancelled {
        background: rgba(239, 68, 68, 0.12);
        color: var(--danger);
      }
      .status-paid {
        background: rgba(6, 182, 212, 0.12);
        color: #06b6d4;
      }
      .empty-table {
        text-align: center;
        padding: 40px;
        color: var(--text-muted);
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 28px;
      }
      .chart-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-white);
      }
      .chart-subtitle {
        color: var(--text-muted);
        font-size: 0.82rem;
        margin-top: 4px;
      }
      .chart-pill {
        background: var(--accent-light);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px 18px;
        text-align: right;
      }
      .pill-label {
        display: block;
        font-size: 0.66rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin-bottom: 3px;
      }
      .pill-value {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--accent);
      }
      .chart-body {
        display: flex;
        gap: 10px;
      }
      .y-labels {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 24px;
        min-width: 48px;
      }
      .y-labels span {
        font-size: 0.66rem;
        color: var(--text-muted);
      }
      .chart-canvas {
        flex: 1;
        position: relative;
      }
      .gridlines {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: none;
      }
      .gridline {
        width: 100%;
        height: 1px;
        background: var(--border);
      }
      .bars-row {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        height: 190px;
        position: relative;
      }
      .bar-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex: 1;
        animation: barIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes barIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .bar-fill {
        width: 100%;
        background: linear-gradient(to top, var(--accent), var(--purple));
        border-radius: 6px 6px 0 0;
        min-height: 4px;
        position: relative;
        transition: all 0.25s;
        cursor: pointer;
      }
      .bar-col:hover .bar-fill {
        box-shadow: 0 0 15px var(--accent-light);
        filter: brightness(1.2);
      }
      .bar-tip {
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-card);
        color: var(--text-white);
        font-size: 0.7rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s;
        border: 1px solid var(--border);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      .bar-col:hover .bar-tip {
        opacity: 1;
      }
      .bar-label {
        font-size: 0.68rem;
        color: var(--text-muted);
        font-weight: 600;
        height: 18px;
        display: flex;
        align-items: center;
      }

      @media (max-width: 1024px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 768px) {
        .chart-header {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
        }
        .chart-pill {
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pill-label {
          display: inline;
          margin-bottom: 0;
          margin-right: 8px;
        }
        .chart-body {
          flex-direction: column;
          gap: 8px;
        }
        .y-labels {
          flex-direction: row;
          justify-content: space-between;
          padding-bottom: 0;
          min-width: auto;
          order: 2;
        }
        .chart-canvas {
          order: 1;
        }
        .bars-row {
          height: 140px;
        }
        .gridlines {
          bottom: 0;
        }
      }
      @media (max-width: 480px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
        .bars-row {
          height: 100px;
          gap: 4px;
        }
        .bar-label {
          font-size: 0.52rem;
        }
        .admin-header h1 {
          font-size: 1.4rem;
        }
        .stat-card {
          padding: 16px;
        }
        .stat-info h3 {
          font-size: 1.4rem;
        }
        .section-card {
          padding: 18px 14px;
        }
        .data-table th,
        .data-table td {
          padding: 10px 10px;
          font-size: 0.8rem;
        }
      }

      @media (max-width: 370px) {
        .admin-header h1 {
          font-size: 1.2rem;
        }
        .stat-info h3 {
          font-size: 1.2rem;
        }
        .section-card {
          padding: 14px 10px;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  maxSales = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.loading = false;
        if (this.stats?.monthlySales?.length) {
          this.maxSales = Math.max(
            ...this.stats.monthlySales.map((m: any) => m.sales),
          );
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getOrderUser(order: any): string {
    if (!order.user) return 'Unknown';
    return typeof order.user === 'string' ? order.user : order.user.name;
  }

  getBarHeight(sales: number): number {
    if (!this.maxSales) return 4;
    return Math.max(4, (sales / this.maxSales) * 160);
  }

  getMonthName(month: number): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1] || '';
  }

  getPeriodTotal(): number {
    if (!this.stats?.monthlySales) return 0;
    return this.stats.monthlySales.reduce(
      (sum: number, m: any) => sum + m.sales,
      0,
    );
  }

  getYLabel(fraction: number): string {
    const val = this.maxSales * fraction;
    if (val >= 1000)
      return (
        '$' +
        (val >= 10000 ? Math.round(val / 1000) : (val / 1000).toFixed(1)) +
        'K'
      );
    return '$' + Math.round(val);
  }
}
