import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';
import { SpinComponent } from '../../../shared/components/spin/spin.component';
import { ModalService } from '../../../shared/services/modal.service';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal.component';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinComponent, ReceiptModalComponent],
  template: `
    <div class="confirmation-page confirmation-flex">
      <div class="confirmation-card" *ngIf="order">
        <div class="success-icon"><i class="fas fa-circle-check"></i></div>
        <h1>Order Placed Successfully!</h1>
        <p class="order-id">Order #{{ order._id }}</p>
        <p class="thank-you">
          Thank you for your purchase!
        </p>

        <div class="order-summary">
          <div class="summary-row">
            <span>Status:</span>
            <span class="status-badge" [class]="'status-' + order.status">
              <i [class]="getStatusIcon(order.status)"></i>
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          <div class="summary-row">
            <span>Payment:</span
            ><span>{{ getPaymentLabel(order.paymentMethod) }}</span>
          </div>
          <div class="summary-row">
            <span>Items:</span><span>{{ order.orderItems.length }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span
            ><span>\${{ order.totalPrice | number: '1.2-2' }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <a [routerLink]="['/orders', order._id]" class="btn-primary"
            >View Order Details</a
          >
          <a routerLink="/orders" class="btn-secondary">All Orders</a>
          <button (click)="continueShopping()" class="btn-tertiary">
            Continue Shopping
          </button>
        </div>
      </div>
      <app-receipt-modal *ngIf="order" [order]="order"></app-receipt-modal>
      <app-spin
        *ngIf="loading"
        size="lg"
        tip="Loading order details..."
      ></app-spin>
    </div>
  `,
  styles: [
    `
      .confirmation-page {
        min-height: 80vh;
        background: var(--bg-primary);
        padding: 40px 20px;
        transition: background-color 0.4s ease;
      }
      .confirmation-flex {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        gap: 32px;
        flex-wrap: wrap;
      }
      .confirmation-card {
        background: var(--bg-card);
        border-radius: 24px;
        padding: 48px;
        max-width: 560px;
        width: 100%;
        border: 1px solid var(--border);
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        animation: confirmIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
      }
      @keyframes confirmIn {
        from {
          opacity: 0;
          transform: translateY(40px) scale(0.92);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .success-icon {
        font-size: 5rem;
        margin-bottom: 20px;
        color: var(--success);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: iconBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
      }
      @keyframes iconBounce {
        from {
          transform: scale(0) rotate(-15deg);
          opacity: 0;
        }
        to {
          transform: scale(1) rotate(0);
          opacity: 1;
        }
      }
      h1 {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--text-white);
        margin-bottom: 8px;
      }
      .order-id {
        color: var(--accent);
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 16px;
      }
      .thank-you {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 32px;
      }
      .order-summary {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
        text-align: left;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border);
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      .summary-row:last-child {
        border: none;
      }
      .summary-row.total {
        font-weight: 700;
        color: var(--text-white);
        font-size: 1rem;
      }
      .status-badge {
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .status-pending {
        background: rgba(234, 179, 8, 0.12);
        color: #f59e0b;
      }
      .status-paid {
        background: var(--success-light);
        color: var(--success);
      }
      .status-processing {
        background: var(--accent-light);
        color: var(--accent);
      }
      .status-delivered {
        background: rgba(99, 102, 241, 0.12);
        color: #818cf8;
      }
      .status-cancelled {
        background: rgba(239, 68, 68, 0.12);
        color: var(--danger);
      }
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .btn-primary {
        padding: 14px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 700;
        transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: block;
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(79, 110, 247, 0.3);
      }
      .btn-secondary {
        padding: 12px;
        background: var(--bg-secondary);
        color: var(--text-secondary);
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        border: 2px solid var(--border);
        display: block;
        transition: all 0.22s;
      }
      .btn-secondary:hover {
        background: var(--bg-primary);
        color: var(--text-white);
        border-color: var(--accent);
      }
      .btn-tertiary {
        color: var(--accent);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        transition: color 0.2s;
        font-weight: 600;
      }
      .btn-tertiary:hover {
        color: var(--purple);
      }

      @media (max-width: 768px) {
        .confirmation-card {
          padding: 40px 24px 80px;
        }
      }
      @media (max-width: 480px) {
        .confirmation-card {
          padding: 28px 16px 80px;
        }
        .success-icon {
          font-size: 3.5rem;
        }
        h1 {
          font-size: 1.5rem;
        }
        p {
          font-size: 0.92rem;
        }
      }
      @media (max-width: 360px) {
        .confirmation-card {
          padding: 20px 12px 80px;
        }
        .success-icon {
          font-size: 3rem;
        }
        h1 {
          font-size: 1.3rem;
        }
      }
    `,
  ],
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const orderId = this.route.snapshot.queryParams['orderId'];
    if (orderId) {
      this.orderService.getOrder(orderId).subscribe({
        next: (res) => {
          this.order = res.order;
          this.loading = false;
          // Fallback: if order is still pending, try to mark it as paid
          if (this.order && this.order.status === 'pending') {
            this.orderService.payOrder(this.order._id).subscribe({
              next: (payRes) => {
                this.order = payRes.order;
              },
              error: () => {},
            });
          }
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  openReceiptModal(tpl: TemplateRef<any>) {
    this.modalService.open(tpl, {
      title: 'Order Receipt',
      width: '420px',
      closable: true,
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      paid: 'Paid',
      pending: 'Pending',
      processing: 'Processing',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return map[status] || status;
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      paid: 'fas fa-circle-check',
      pending: 'fas fa-clock',
      processing: 'fas fa-gear fa-spin',
      delivered: 'fas fa-box-open',
      cancelled: 'fas fa-ban',
    };
    return map[status] || 'fas fa-circle';
  }

  getPaymentLabel(method: string): string {
    const map: Record<string, string> = {
      credit_card: 'Credit / Debit Card',
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer',
      crypto: 'Cryptocurrency',
    };
    return map[method] || (method ? method.replace(/_/g, ' ') : '');
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }
}
