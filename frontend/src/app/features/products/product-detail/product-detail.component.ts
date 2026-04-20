import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { SpinComponent } from '../../../shared/components/spin/spin.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { Product, Review } from '../../../core/models';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, tap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StarRatingComponent,
    SpinComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container" *ngIf="(product$ | async) as vm">
      <ng-container *ngIf="!vm.loading && vm.product; else loadingTpl">
        <!-- Breadcrumb -->
        <nav class="pd-breadcrumb">
          <a routerLink="/">Home</a>
          <i class="fas fa-chevron-right"></i>
          <a routerLink="/products">Store</a>
          <i class="fas fa-chevron-right"></i>
          <span>{{ vm.product.name }}</span>
        </nav>

        <!-- 2-Column Product Layout -->
        <div class="product-layout">
          <!-- Gallery -->
          <div class="gallery">
            <div class="main-image">
              <img
                [src]="getImageUrl(vm.product.image)"
                [alt]="vm.product.name"
                onerror="this.src='https://placehold.co/600x440/1e2235/4f6ef7?text=Game'"
              />
            </div>
            <div class="img-meta-strip">
              <span class="img-meta-badge featured-badge" *ngIf="vm.product.featured">
                <i class="fas fa-fire"></i> Featured
              </span>
              <span class="img-meta-badge dl-badge">
                <i class="fas fa-download"></i> {{ vm.product.downloadCount || 0 }} Downloads
              </span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="product-details">
            <span class="category-badge" *ngIf="getCategoryName(vm.product)">
              <i class="fas fa-tag"></i> {{ getCategoryName(vm.product) }}
            </span>
            <h1>{{ vm.product.name }}</h1>
            <div class="rating-row">
              <app-star-rating [rating]="vm.product.rating || 0"></app-star-rating>
              <span class="rating-text">{{ vm.product.rating | number: '1.1-1' }}</span>
              <span class="reviews-count">({{ vm.product.numReviews }} reviews)</span>
            </div>
            <div class="price-row">
              <span class="price">\${{ vm.product.price | number: '1.2-2' }}</span>
            </div>
            <p class="description">{{ vm.product.description }}</p>
            <div class="action-buttons">
              <ng-container *ngIf="!vm.alreadyPurchased; else purchasedBadge">
                <button class="btn-cart" (click)="addToCart(vm.product)">
                  <i class="fas fa-cart-shopping"></i> Add to Cart
                </button>
              </ng-container>
              <ng-template #purchasedBadge>
                <button
                  class="owner-badge"
                  [class.owner-badge--pop]="ownerBtnAnimating"
                  (click)="goToOrder(vm.purchasedOrderId)"
                  title="View your order"
                >
                  <span class="owner-badge__ripple" [class.ripple-run]="ownerBtnAnimating"></span>
                  <i class="fas fa-crown owner-badge__icon"></i>
                  <span class="owner-badge__text">You Own This Game</span>
                  <i class="fas fa-arrow-right owner-badge__arrow"></i>
                </button>
              </ng-template>
              <button class="btn-wishlist" (click)="addToWishlist(vm.product)" title="Add to Wishlist">
                <i class="fas fa-heart"></i>
              </button>
            </div>
            <div class="product-meta">
              <div class="meta-item">
                <span>Category:</span>
                <strong>{{ getCategoryName(vm.product) || 'N/A' }}</strong>
              </div>
              <div class="meta-item">
                <span>Status:</span>
                <strong *ngIf="!vm.alreadyPurchased" [class.text-green]="vm.product.status === 'active'">{{ vm.product.status }}</strong>
                <strong *ngIf="vm.alreadyPurchased" class="text-owner"><i class="fas fa-crown"></i> Owner</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews-section">
          <h2>Customer Reviews</h2>
          <ng-container *ngIf="isLoggedIn; else loginPromptTpl">
            <form class="review-form" (ngSubmit)="submitReview(vm.product)">
              <h3>Write a Review</h3>
              <div class="star-input">
                <span *ngFor="let s of [1,2,3,4,5]" class="star-btn" [class.active]="s <= reviewRating" (click)="reviewRating = s">
                  <i class="fas fa-star"></i>
                </span>
              </div>
              <textarea [(ngModel)]="reviewComment" name="reviewComment" placeholder="Share your experience..." rows="4" class="review-textarea"></textarea>
              <button type="submit" class="btn-submit-review" [disabled]="!reviewRating || !reviewComment">Submit Review</button>
            </form>
          </ng-container>
          <ng-template #loginPromptTpl>
            <div class="login-prompt"><a routerLink="/auth/login">Login to write a review</a></div>
          </ng-template>
          <div class="reviews-list">
            <ng-container *ngIf="vm.product.reviews?.length; else noReviewsTpl">
              <div class="review-item" *ngFor="let review of vm.product.reviews">
                <div class="review-header">
                  <div class="reviewer-avatar">
                    <img *ngIf="getReviewAvatar(review.user)" [src]="getAvatarUrl(getReviewAvatar(review.user))" alt="" class="av-img" (error)="onAvatarError($event)">
                    <span [style.display]="getReviewAvatar(review.user) ? 'none' : 'flex'">{{ review.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <strong>{{ review.name }}</strong>
                    <div class="review-date">{{ review.createdAt | date: 'mediumDate' }}</div>
                  </div>
                  <app-star-rating [rating]="review.rating" style="margin-left: auto;"></app-star-rating>
                </div>
                <p class="review-comment">{{ review.comment }}</p>
              </div>
            </ng-container>
            <ng-template #noReviewsTpl>
              <div class="no-reviews"><p>No reviews yet. Be the first to review!</p></div>
            </ng-template>
          </div>
        </div>
      </ng-container>
      <ng-template #loadingTpl>
        <app-spin size="lg" tip="Loading product..."></app-spin>
        <div class="page-container sk-detail">
          <div class="sk-breadcrumb"><app-skeleton type="title" [active]="true" width="22%"></app-skeleton></div>
          <div class="product-layout">
            <div class="gallery">
              <app-skeleton type="image" [active]="true" height="400px" [round]="true"></app-skeleton>
              <div class="sk-thumbs">
                <app-skeleton *ngFor="let t of [1,2,3]" type="image" [active]="true" width="80px" height="80px" [round]="true"></app-skeleton>
              </div>
            </div>
            <div class="product-details">
              <app-skeleton type="button" [active]="true" width="72px"></app-skeleton>
              <app-skeleton type="title" [active]="true" width="75%"></app-skeleton>
              <app-skeleton type="title" [active]="true" width="50%"></app-skeleton>
              <app-skeleton type="title" [active]="true" width="30%"></app-skeleton>
              <app-skeleton type="text" [active]="true" [rows]="3"></app-skeleton>
              <app-skeleton type="rect" [active]="true" height="52px"></app-skeleton>
              <div style="display:flex;gap:12px;margin-top:16px">
                <app-skeleton type="rect" [active]="true" height="52px"></app-skeleton>
                <app-skeleton type="image" [active]="true" width="52px" height="52px" [round]="true"></app-skeleton>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
      <div class="not-found" *ngIf="!vm.loading && !vm.product">
        <h2>Product not found</h2>
        <a routerLink="/products" class="btn-back">← Back to Products</a>
      </div>
    </div>
  `,
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<{ product: Product | null; alreadyPurchased: boolean; purchasedOrderId: string | null; loading: boolean }> = of({ product: null, alreadyPurchased: false, purchasedOrderId: null, loading: true });
  ownerBtnAnimating = false;
  reviewRating = 0;
  reviewComment = '';
  private readonly apiBase = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router,
    private msgService: NotificationService,
  ) { }

  ngOnInit() {
    this.product$ = this.route.params.pipe(
      switchMap((params) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return this.productService.getProduct(params['id']).pipe(
          switchMap((res) => of({ product: res.product, alreadyPurchased: !!res.alreadyPurchased, purchasedOrderId: res.purchasedOrderId || null, loading: false })),
          catchError(() => of({ product: null, alreadyPurchased: false, purchasedOrderId: null, loading: false })),
          startWith({ product: null, alreadyPurchased: false, purchasedOrderId: null, loading: true })
        );
      })
    );
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  getAvatarUrl(avatar?: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `${this.apiBase}${avatar}`;
  }

  getReviewAvatar(user: string | { name: string; avatar?: string }): string {
    if (typeof user === 'string') return '';
    return user.avatar || '';
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'flex';
  }

  getCategoryName(product: Product): string {
    if (!product?.category) return '';
    return typeof product.category === 'string' ? '' : (product.category as any).name;
  }

  getImageUrl(image?: string): string {
    if (!image) return 'https://placehold.co/600x440/1e2235/4f6ef7?text=Game';
    if (image.startsWith('http')) return image;
    return `${this.apiBase}${image}`;
  }

  goToOrder(orderId: string | null) {
    this.ownerBtnAnimating = true;
    setTimeout(() => {
      this.ownerBtnAnimating = false;
      if (orderId) {
        this.router.navigate(['/orders', orderId]);
      } else {
        this.router.navigate(['/orders']);
      }
    }, 480);
  }

  addToWishlist(product: Product) {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.wishlistService.addToWishlist(product._id).subscribe({
      next: () => this.msgService.success('Added to wishlist!'),
      error: () => this.msgService.error('Failed to add to wishlist'),
    });
  }

  addToCart(product: Product) {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.cartService.addToCart(product._id).subscribe({
      next: () => {
        this.msgService.success('Added to cart!');
        this.router.navigate(['/cart']);
      },
      error: (err) =>
        this.msgService.error(err.error?.message || 'Failed to add to cart'),
    });
  }

  submitReview(product: Product) {
    if (!this.reviewRating || !this.reviewComment) return;
    this.productService
      .addReview(product._id, {
        rating: this.reviewRating,
        comment: this.reviewComment,
      })
      .subscribe({
        next: () => {
          this.msgService.success('Review submitted!');
          this.reviewRating = 0;
          this.reviewComment = '';
          // Optionally, reload product reviews
          this.ngOnInit();
        },
        error: (err) =>
          this.msgService.error(
            err.error?.message || 'Failed to submit review',
          ),
      });
  }
}
