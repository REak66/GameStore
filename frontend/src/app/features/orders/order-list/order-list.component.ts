import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';
import { SpinComponent } from '../../../shared/components/spin/spin.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinComponent, SkeletonComponent],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(16px)' }),
            stagger('45ms', [
              animate(
                '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
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
    <div class="page-container">
      <h1 class="page-title">My Orders</h1>

      <app-spin *ngIf="loading" size="lg" tip="Loading orders..."></app-spin>

      <div class="orders-list" *ngIf="loading">
        <app-skeleton
          type="order-row"
          [count]="5"
          [active]="true"
        ></app-skeleton>
      </div>

      <div
        class="orders-list"
        *ngIf="!loading && orders.length > 0"
        [@listAnimation]="orders.length"
      >
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <div>
              <span class="order-number"
                >#{{ order._id.slice(-8).toUpperCase() }}</span
              >
              <span class="order-date">{{
                order.createdAt | date: 'mediumDate'
              }}</span>
            </div>
            <span class="status-badge" [class]="'status-' + order.status">{{
              order.status
            }}</span>
          </div>
          <div class="order-items">
            <div
              class="order-item"
              *ngFor="let item of order.orderItems.slice(0, 3)"
            >
              <img
                [src]="
                  item.image
                    ? apiUrl + item.image
                    : 'https://via.placeholder.com/50x50?text=?'
                "
                [alt]="item.name"
                class="item-img"
                onerror="this.src='https://via.placeholder.com/50x50?text=?'"
              />
              <span class="item-name">{{ item.name }}</span>
            </div>
            <div class="more-items" *ngIf="order.orderItems.length > 3">
              +{{ order.orderItems.length - 3 }} more items
            </div>
          </div>
          <div class="order-footer">
            <span class="total"
              >\${{ order.totalPrice | number: '1.2-2' }}</span
            >
            <a [routerLink]="['/orders', order._id]" class="btn-view"
              >View Details →</a
            >
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && orders.length === 0">
        <div class="empty-icon"><i class="fas fa-box"></i></div>
        <h2>No orders yet</h2>
        <p>Start shopping to create your first order!</p>
        <a routerLink="/products" class="btn-shop">Shop Now</a>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 20px;
        animation: pageIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes pageIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .page-title {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 32px;
        color: var(--text-white);
      }
      .orders-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .order-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid var(--border);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .order-card:hover {
        transform: translateY(-4px);
        border-color: var(--accent);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
      }
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .order-number {
        font-weight: 700;
        color: var(--text-white);
        margin-right: 12px;
      }
      .order-date {
        color: var(--text-muted);
        font-size: 0.85rem;
      }
      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: capitalize;
      }
      .status-pending {
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
      }
      .status-processing {
        background: var(--accent-light);
        color: var(--accent);
      }
      .status-delivered {
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
      }
      .status-cancelled {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
      .status-paid {
        background: rgba(6, 182, 212, 0.1);
        color: #67e8f9;
      }
      .order-items {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
      }
      .order-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .item-img {
        width: 44px;
        height: 44px;
        object-fit: cover;
        border-radius: 8px;
        background: var(--bg-secondary);
      }
      .item-name {
        flex: 1;
        font-size: 0.9rem;
        color: var(--text-white);
      }
      .item-qty {
        color: var(--text-muted);
        font-size: 0.85rem;
      }
      .more-items {
        font-size: 0.8rem;
        color: var(--text-muted);
        padding-left: 56px;
      }
      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--border);
        padding-top: 16px;
      }
      .total {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-white);
      }
      .btn-view {
        color: var(--accent);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .btn-view:hover {
        color: var(--accent-hover, var(--accent));
        transform: translateX(3px);
      }
      .empty-state {
        text-align: center;
        padding: 80px 20px;
      }
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 16px;
        color: var(--text-muted);
        animation: float 3s ease-in-out infinite;
      }
      @keyframes float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      .empty-state h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text-white);
      }
      .empty-state p {
        color: var(--text-muted);
        margin-bottom: 24px;
      }
      .btn-shop {
        display: inline-block;
        padding: 12px 28px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 4px 18px rgba(79, 110, 247, 0.2);
      }
      .btn-shop:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 26px rgba(79, 110, 247, 0.3);
      }
      @media (max-width: 900px) {
        .page-container {
          padding: 28px 16px 90px;
        }
        .page-title {
          font-size: 1.6rem;
        }
      }
      @media (max-width: 768px) {
        .page-container {
          padding: 20px 14px 90px;
        }
        .page-title {
          font-size: 1.4rem;
          margin-bottom: 20px;
        }
        .order-card {
          padding: 16px;
        }
        .btn-view {
          width: 100%;
          text-align: center;
          justify-content: center;
          border: 1px solid var(--border);
          padding: 8px;
          border-radius: 8px;
        }
      }
      @media (max-width: 480px) {
        .page-container {
          padding: 16px 12px 90px;
        }
      }

      @media (max-width: 370px) {
        .page-container {
          padding: 12px 10px 90px;
        }
        .page-title {
          font-size: 1.25rem;
        }
        .order-card {
          padding: 14px 12px;
        }
      }
    `,
  ],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  apiUrl = environment.apiUrl;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.orders || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
