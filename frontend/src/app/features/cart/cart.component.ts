import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart, CartItem } from '../../core/models';
import { SpinComponent } from '../../shared/components/spin/spin.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { environment } from '../../../environments/environment';

const TAX_RATE = 0.1;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinComponent, SkeletonComponent],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateX(-18px)' }),
            stagger('45ms', [
              animate(
                '400ms cubic-bezier(0.16, 1, 0.3, 1)',
                style({ opacity: 1, transform: 'translateX(0)' }),
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
      <h1 class="page-title">Shopping Cart</h1>

      <div class="cart-layout" *ngIf="cart && cart.items.length > 0">
        <!-- Cart Items -->
        <div class="cart-items" [@listAnimation]="cart.items.length">
          <div class="cart-item" *ngFor="let item of cart.items">
            <img
              [src]="getProductImage(item)"
              [alt]="getProductName(item)"
              class="item-image"
              onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'"
            />
            <div class="item-details">
              <h3 class="item-name">
                <a [routerLink]="['/products', getProductId(item)]">{{
                  getProductName(item)
                }}</a>
              </h3>
              <p class="item-price">
                \${{ item.price | number: '1.2-2' }} each
              </p>
            </div>
            <div class="item-subtotal">
              \${{ item.price | number: '1.2-2' }}
            </div>
            <button class="remove-btn" (click)="removeItem(item._id)">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <div class="cart-actions">
            <button class="btn-clear" (click)="clearCart()">
              <i class="fas fa-trash-can"></i> Clear Cart
            </button>
            <a routerLink="/products" class="btn-continue"
              ><i class="fas fa-arrow-left"></i> Continue Shopping</a
            >
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal ({{ cart.items.length }} items)</span>
            <span>\${{ cart.totalPrice | number: '1.2-2' }}</span>
          </div>
          <div class="summary-row">
            <span>Tax (10%)</span>
            <span>\${{ cart.totalPrice * TAX_RATE | number: '1.2-2' }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-total">
            <span>Total</span>
            <span>\${{ getTotal() | number: '1.2-2' }}</span>
          </div>
          <button class="btn-checkout" (click)="checkout()">
            Proceed to Checkout →
          </button>
          <div class="security-note">
            <i class="fas fa-lock"></i> Secure checkout powered by GameStore
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <div class="empty-cart" *ngIf="!cart || cart.items.length === 0">
        <div class="empty-icon"><i class="fas fa-cart-shopping"></i></div>
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart and start shopping!</p>
        <a routerLink="/products" class="btn-shop">Start Shopping</a>
      </div>

      <app-spin *ngIf="loading" size="lg" tip="Loading cart..."></app-spin>

      <!-- Skeleton cart layout -->
      <div class="sk-cart-wrap" *ngIf="loading">
        <div class="cart-layout">
          <div class="cart-items">
            <app-skeleton
              type="cart-item"
              [count]="3"
              [active]="true"
            ></app-skeleton>
          </div>
          <div class="order-summary">
            <app-skeleton
              type="title"
              [active]="true"
              width="50%"
            ></app-skeleton>
            <app-skeleton type="text" [active]="true" [rows]="3"></app-skeleton>
            <app-skeleton
              type="rect"
              [active]="true"
              height="52px"
            ></app-skeleton>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 1200px;
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
        color: var(--text-white);
        margin-bottom: 32px;
      }
      .cart-layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 32px;
      }
      .cart-items {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .cart-item {
        display: flex;
        align-items: center;
        gap: 20px;
        background: var(--bg-card);
        border-radius: 16px;
        padding: 20px;
        border: 1px solid var(--border);
        transition: all 0.25s ease;
      }
      .cart-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
      .item-image {
        width: 90px;
        height: 90px;
        object-fit: cover;
        border-radius: 12px;
        background: var(--bg-secondary);
      }
      .item-details {
        flex: 1;
      }
      .item-name {
        font-weight: 600;
        margin-bottom: 4px;
      }
      .item-name a {
        color: var(--text-white);
        text-decoration: none;
        transition: color 0.2s;
      }
      .item-name a:hover {
        color: var(--accent);
      }
      .item-price {
        color: var(--text-muted);
        font-size: 0.9rem;
      }
      .item-subtotal {
        font-weight: 700;
        font-size: 1.1rem;
        min-width: 80px;
        text-align: right;
        color: var(--text-white);
      }
      .remove-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 1rem;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .remove-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
      .cart-actions {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        align-items: center;
      }
      .btn-clear {
        background: none;
        border: 1.5px solid var(--danger);
        color: var(--danger);
        padding: 8px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }
      .btn-clear:hover {
        background: rgba(239, 68, 68, 0.1);
      }
      .btn-continue {
        color: var(--accent);
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: gap 0.2s;
      }
      .btn-continue:hover {
        gap: 12px;
      }
      .order-summary {
        background: var(--bg-card);
        border-radius: 20px;
        padding: 28px;
        border: 1px solid var(--border);
        height: fit-content;
        position: sticky;
        top: 100px;
      }
      .order-summary h2 {
        font-size: 1.3rem;
        font-weight: 700;
        margin-bottom: 20px;
        color: var(--text-white);
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 14px;
        color: var(--text-muted);
        font-size: 0.95rem;
      }
      .summary-divider {
        height: 1px;
        background: var(--border);
        margin: 16px 0;
      }
      .summary-total {
        display: flex;
        justify-content: space-between;
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--text-white);
        margin-bottom: 24px;
      }
      .btn-checkout {
        width: 100%;
        padding: 16px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        margin-bottom: 12px;
        box-shadow: 0 4px 18px rgba(79, 110, 247, 0.2);
      }
      .btn-checkout:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 26px rgba(79, 110, 247, 0.3);
      }
      .security-note {
        text-align: center;
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .empty-cart {
        text-align: center;
        padding: 100px 20px;
        animation: pageIn 0.5s ease both;
      }
      .empty-icon {
        font-size: 5rem;
        margin-bottom: 20px;
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
      .empty-cart h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text-white);
      }
      .empty-cart p {
        color: var(--text-muted);
        margin-bottom: 24px;
      }
      .btn-shop {
        display: inline-block;
        padding: 14px 32px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 700;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 4px 18px rgba(79, 110, 247, 0.2);
      }
      .btn-shop:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 26px rgba(79, 110, 247, 0.3);
      }
      @media (max-width: 900px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }
        .order-summary {
          position: static;
        }
        .page-container {
          padding: 28px 16px 90px;
        }
      }
      @media (max-width: 600px) {
        .page-title {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }
        .cart-item {
          flex-wrap: wrap;
          gap: 10px;
          padding: 14px;
        }
        .item-image {
          width: 64px;
          height: 64px;
          border-radius: 10px;
        }
        .item-subtotal {
          min-width: auto;
        }
        .cart-actions {
          flex-direction: column;
          gap: 10px;
          align-items: stretch;
        }
        .btn-continue {
          justify-content: center;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .btn-checkout {
          padding: 14px;
          font-size: 0.95rem;
        }
      }
      @media (max-width: 400px) {
        .page-container {
          padding: 16px 10px 90px;
        }
        .item-details {
          font-size: 0.9rem;
        }
      }

      @media (max-width: 370px) {
        .cart-item {
          padding: 12px 10px;
        }
        .item-image {
          width: 54px;
          height: 54px;
        }
        .item-name a {
          font-size: 0.9rem;
        }
        .item-subtotal {
          font-size: 0.95rem;
        }
        .page-title {
          font-size: 1.3rem;
        }
        .order-summary {
          padding: 20px 14px;
        }
      }
    `,
  ],
})
export class CartComponent implements OnInit {
  readonly TAX_RATE = TAX_RATE;
  cart: Cart | null = null;
  loading = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loading = true;
    if (this.authService.isLoggedIn) {
      this.cartService.getCart().subscribe({
        next: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
    });
  }

  getProductName(item: CartItem): string {
    if (!item.product) return 'Unknown Product';
    return typeof item.product === 'string'
      ? 'Product'
      : (item.product as any).name;
  }

  getProductImage(item: CartItem): string {
    if (!item.product || typeof item.product === 'string') return '';
    const img = (item.product as any).image;
    return img ? environment.apiUrl + img : '';
  }

  getProductId(item: CartItem): string {
    if (!item.product) return '';
    return typeof item.product === 'string'
      ? item.product
      : (item.product as any)._id;
  }

  removeItem(itemId: string) {
    this.cartService.removeFromCart(itemId).subscribe();
  }

  clearCart() {
    this.cartService.clearCart().subscribe();
  }

  getTotal(): number {
    if (!this.cart) return 0;
    const tax = this.cart.totalPrice * TAX_RATE;
    return this.cart.totalPrice + tax;
  }

  checkout() {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
