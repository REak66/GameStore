import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Product } from '../../../core/models';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  template: `
    <div class="pc">
      <div class="pc-img-wrap">
        <img
          [src]="imageUrl"
          [alt]="product.name"
          class="pc-img"
          onerror="this.src='https://placehold.co/300x180/1e2235/4f6ef7?text=Game'"
        />
        <div class="pc-img-overlay"></div>
        <div class="pc-badges">
          <span class="badge b-hot" *ngIf="product.featured">HOT</span>
          <span class="badge b-new" *ngIf="isNew">NEW</span>
        </div>
        <div class="pc-actions">
          <button
            class="pa-btn pa-btn-wish"
            (click)="onWishlist($event)"
            title="Wishlist"
          >
            <i class="fas fa-heart"></i>
          </button>
          <button
            class="pa-btn"
            (click)="onQuickView($event)"
            title="Quick view"
          >
            <i class="fas fa-eye"></i>
          </button>
        </div>
        <!-- Download count -->
        <div class="pc-download-count">
          <span>Downloads: {{ product.downloadCount || 0 }}</span>
        </div>
      </div>

      <div class="pc-body">
        <div class="pc-genre" *ngIf="categoryName">
          <i class="fas fa-tag pc-genre-icon"></i> {{ categoryName }}
        </div>
        <h3 class="pc-name">
          <a [routerLink]="['/products', product._id]">{{ product.name }}</a>
        </h3>
        <div class="pc-meta">
          <div class="pc-rating">
            <app-star-rating [rating]="product.rating"></app-star-rating>
            <span class="rv">({{ product.numReviews }})</span>
          </div>
        </div>
        <div class="pc-footer">
          <div class="pc-price">
            <span class="eth-price"
              >\${{ product.price | number: '1.2-2' }}</span
            >
          </div>
          <div class="pc-btns">
            <button
              class="btn-history"
              [routerLink]="['/products', product._id]"
              title="View Details"
            >
              <i class="fas fa-info-circle"></i>
            </button>
            <button
              class="btn-cart"
              *ngIf="!alreadyPurchased"
              (click)="onAddToCart($event)"
            >
              <i class="fas fa-cart-shopping"></i>
              Add
            </button>
            <button
              *ngIf="alreadyPurchased"
              class="btn-owner"
              [class.btn-owner--pop]="ownerAnimating"
              (click)="onOwner($event)"
              title="You own this game — view order"
            >
              <span class="btn-owner__ripple" [class.ripple-run]="ownerAnimating"></span>
              <i class="fas fa-crown"></i>
              <span>Owner</span>
              <i class="fas fa-arrow-right btn-owner__arrow"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .pc {
        background: var(--bg-card);
        backdrop-filter: blur(40px) saturate(1.4);
        -webkit-backdrop-filter: blur(40px) saturate(1.4);
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid var(--border);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        transition:
          transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.3s ease,
          border-color 0.3s ease;
        animation: cardEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;

        &:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          border-color: var(--accent);
        }

        &.out-of-stock {
          opacity: 0.6;
          filter: grayscale(0.5);
        }
      }

      @keyframes cardEnter {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Image */
      .pc-img-wrap {
        position: relative;
        height: 185px;
        overflow: hidden;

        @media (max-width: 580px) {
          height: 160px;
        }
      }

      .pc-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .pc:hover .pc-img {
        transform: scale(1.15);
      }

      .pc-img-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.6) 0%,
          transparent 60%
        );
        pointer-events: none;
      }

      /* Badges */
      .pc-badges {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        gap: 6px;
        z-index: 5;
      }

      .badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #fff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

        &.b-hot {
          background: var(--danger);
        }
        &.b-new {
          background: var(--success);
        }
        &.b-out {
          background: var(--text-secondary);
          opacity: 0.9;
        }
      }

      /* Action buttons */
      .pc-actions {
        position: absolute;
        top: 12px;
        right: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        opacity: 0;
        transform: translateX(15px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 5;
      }

      .pc:hover .pc-actions {
        opacity: 1;
        transform: translateX(0);
      }

      /* On touch/mobile: always show actions */
      @media (hover: none) {
        .pc-actions {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .pa-btn {
        width: 36px;
        height: 36px;
        background: var(--bg-secondary);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border);
        border-radius: 12px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: pointer;

        &:hover {
          background: var(--accent);
          color: #fff;
          border-color: transparent;
          transform: scale(1.2) rotate(8deg);
          box-shadow: 0 6px 15px rgba(79, 110, 247, 0.4);
        }

        &.pa-btn-wish:hover {
          background: #ff4d91;
          box-shadow: 0 6px 15px rgba(255, 77, 145, 0.4);
        }
      }

      /* Download count */
      .pc-download-count {
        position: absolute;
        bottom: 8px;
        left: 10px;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(6px);
        color: rgba(255, 255, 255, 0.75);
        font-size: 0.65rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        pointer-events: none;
        z-index: 4;
      }

      /* Body */
      .pc-body {
        padding: 20px 16px 16px;
      }

      .pc-genre {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .pc-name {
        font-size: 1rem;
        font-weight: 800;
        margin-bottom: 10px;
        line-height: 1.4;

        a {
          color: var(--text-white);
          text-decoration: none;
          transition: color 0.2s;
          &:hover {
            color: var(--accent);
          }
        }
      }

      .pc-meta {
        margin-bottom: 16px;
      }

      .pc-rating {
        display: flex;
        align-items: center;
        gap: 8px;
        .rv {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
      }

      /* Footer */
      .pc-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .pc-price {
        display: flex;
        flex-direction: column;
      }

      .eth-price {
        font-size: 1.2rem;
        font-weight: 900;
        color: var(--text-white);
        line-height: 1;
      }

      .usd-price {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-weight: 600;
        margin-top: 4px;
        &.out {
          color: var(--danger);
        }
      }

      .pc-btns {
        display: flex;
        gap: 8px;
      }

      .btn-history {
        width: 38px;
        height: 38px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 12px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        cursor: pointer;

        &:hover {
          background: var(--bg-card-hover);
          color: var(--text-white);
          border-color: var(--text-secondary);
        }
      }

      .btn-cart {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        border: none;
        border-radius: 12px;
        color: #fff;
        font-size: 0.85rem;
        font-weight: 800;
        transition: all 0.3s;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(79, 110, 247, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 110, 247, 0.5);
          filter: brightness(1.1);
        }

        &:disabled {
          background: var(--border);
          color: var(--text-secondary);
          cursor: not-allowed;
          box-shadow: none;
        }
      }

      .btn-owner {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 14px;
        background: linear-gradient(135deg, #b8860b, #ffd700);
        border: none;
        border-radius: 12px;
        color: #1a1a1a;
        font-size: 0.85rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        transition: transform 0.18s ease, box-shadow 0.18s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);

          .btn-owner__arrow {
            opacity: 1;
            transform: translateX(0);
          }
        }

        &--pop {
          animation: ownerPop 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        &__arrow {
          font-size: 0.75rem;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        &__ripple {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.4);
          transform: scale(0);
          opacity: 0;

          &.ripple-run {
            animation: rippleExpand 0.48s ease-out forwards;
          }
        }
      }

      @keyframes ownerPop {
        0%   { transform: scale(1); }
        35%  { transform: scale(0.9); }
        70%  { transform: scale(1.08); }
        100% { transform: scale(1); }
      }

      @keyframes rippleExpand {
        0%   { transform: scale(0); opacity: 1; }
        100% { transform: scale(2.8); opacity: 0; }
      }

      /* ── Mobile responsive ── */
      @media (max-width: 480px) {
        .pc-img-wrap {
          height: 145px;
        }

        .pc-body {
          padding: 12px 11px 11px;
        }

        .pc-name {
          font-size: 0.88rem;
          margin-bottom: 8px;
        }

        .pc-meta {
          margin-bottom: 10px;
        }

        .pc-footer {
          gap: 8px;
        }

        .eth-price {
          font-size: 1rem;
        }

        .pc-btns {
          gap: 6px;
        }

        .btn-history {
          width: 34px;
          height: 34px;
          border-radius: 10px;
        }

        .btn-cart {
          padding: 8px 11px;
          font-size: 0.78rem;
          gap: 6px;
          border-radius: 10px;
        }

        .btn-owner {
          padding: 8px 10px;
          font-size: 0.78rem;
          gap: 5px;
          border-radius: 10px;

          .btn-owner__arrow {
            display: none;
          }
        }

        .pc-badges {
          top: 8px;
          left: 8px;
        }

        .badge {
          padding: 3px 8px;
          font-size: 0.6rem;
        }

        .pc-download-count {
          font-size: 0.6rem;
          padding: 3px 7px;
        }
      }

      @media (max-width: 380px) {
        .pc-img-wrap {
          height: 120px;
        }

        .pc-body {
          padding: 10px 10px 10px;
        }

        .pc-name {
          font-size: 0.82rem;
          margin-bottom: 6px;
        }

        .pc-meta {
          margin-bottom: 8px;
        }

        .pc-genre {
          font-size: 0.62rem;
          margin-bottom: 5px;
        }

        .eth-price {
          font-size: 0.92rem;
        }

        .btn-cart {
          padding: 7px 9px;
          gap: 5px;
        }

        .btn-owner {
          padding: 7px 9px;
        }

        .btn-history {
          width: 30px;
          height: 30px;
        }
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() alreadyPurchased: boolean = false;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  ownerAnimating = false;
  private readonly apiBase = environment.apiUrl;

  constructor(private router: Router) {}

  onOwner(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.ownerAnimating = true;
    setTimeout(() => {
      this.ownerAnimating = false;
      this.router.navigate(['/orders']);
    }, 480);
  }

  get imageUrl(): string {
    if (!this.product.image)
      return 'https://placehold.co/300x180/1e2235/4f6ef7?text=Game';
    if (this.product.image.startsWith('http')) return this.product.image;
    return `${this.apiBase}${this.product.image}`;
  }

  get categoryName(): string {
    if (!this.product.category) return '';
    return typeof this.product.category === 'string'
      ? ''
      : (this.product.category as any).name;
  }

  get isNew(): boolean {
    const created = new Date(this.product.createdAt);
    const now = new Date();
    return now.getTime() - created.getTime() < 7 * 24 * 60 * 60 * 1000;
  }

  onAddToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onWishlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.addToWishlist.emit(this.product);
  }

  onQuickView(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.quickView.emit(this.product);
  }
}
