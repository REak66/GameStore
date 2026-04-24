import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { OrderService } from '../../core/services/order.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import {
  SelectComponent,
  SelectOption,
} from '../../shared/components/select/select.component';
import { NotificationService } from '../../shared/services/notification.service';
import { Product, Category } from '../../core/models';
import { environment } from '../../../environments/environment';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    SkeletonComponent,
    SelectComponent,
    FormsModule,
    AnimateOnScroll,
  ],
  template: `
    <!-- ══ HERO BANNER (full-width above layout) ══ -->
    <section
      class="hero-banner"
      *ngIf="heroProducts.length > 0 || loadingProducts"
    >
      <app-skeleton
        *ngIf="loadingProducts"
        type="rect"
        height="100%"
        radius="0"
        [active]="true"
      ></app-skeleton>
      <ng-container *ngIf="!loadingProducts && heroProducts.length > 0">
        <!-- Slides -->
        <div class="hero-slides">
          <div
            class="hero-slide"
            *ngFor="let p of heroProducts; let i = index"
            [class.active]="i === heroIndex"
          >
            <img
              [src]="getProductImage(p)"
              [alt]="p.name"
              onerror="this.src='https://placehold.co/1200x420/1e2235/4f6ef7?text=Featured+Game'"
            />
            <div class="hero-gradient"></div>
            <div class="hero-content">
              <div class="hero-badges">
                <span class="hbadge hbadge-hot" *ngIf="p.featured"
                  ><i class="fas fa-fire"></i> Featured</span
                >
                <span class="hbadge hbadge-new" *ngIf="isNew(p)"
                  ><i class="fas fa-certificate"></i> New</span
                >
                <span class="hbadge hbadge-cat">
                  <i
                    [class]="getCategoryIconClass($any(p.category)?.name || '')"
                  ></i>
                  {{ $any(p.category)?.name || 'Game' }}
                </span>
              </div>
              <h1 class="hero-title">{{ p.name }}</h1>
              <div class="hero-rating">
                <span class="hr-stars">
                  <i
                    class="fas fa-star"
                    *ngFor="let s of [1, 2, 3, 4, 5]; let si = index"
                    [class.filled]="si < (p.rating || 0)"
                    [class.half]="
                      si === floorRating(p.rating) && p.rating % 1 >= 0.5
                    "
                  ></i>
                </span>
                <span class="hr-score">{{ (p.rating || 0).toFixed(1) }}</span>
                <span class="hr-reviews"
                  >({{ p.numReviews | number }} reviews)</span
                >
              </div>
              <p class="hero-desc">
                {{
                  p.description ||
                    'Experience the most immersive gameplay of the season.'
                    | slice: 0 : 110
                }}…
              </p>
              <div class="hero-actions">
                <a [routerLink]="['/products', p._id]" class="btn-hero-buy">
                  <i class="fas fa-bolt"></i> Get for \${{
                    p.price | number: '1.2-2'
                  }}
                </a>
                <button
                  class="btn-hero-wish"
                  (click)="onAddToWishlist(p)"
                  title="Add to wishlist"
                >
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Dot indicators (mobile) -->
        <div class="hero-dots" *ngIf="heroProducts.length > 1">
          <button
            class="dot"
            *ngFor="let p of heroProducts; let i = index"
            [class.active]="i === heroIndex"
            (click)="goToSlide(i)"
          ></button>
        </div>
        <!-- Thumbnail strip (desktop) -->
        <div class="hero-thumbs" *ngIf="heroProducts.length > 1">
          <button
            class="hero-thumb"
            *ngFor="let p of heroProducts; let i = index"
            [class.active]="i === heroIndex"
            (click)="goToSlide(i)"
          >
            <img
              [src]="getProductImage(p)"
              [alt]="p.name"
              onerror="this.src='https://placehold.co/120x70/1e2235/4f6ef7?text=Game'"
            />
            <div class="thumb-overlay"></div>
            <span class="thumb-name"
              >{{ p.name | slice: 0 : 18
              }}{{ p.name.length > 18 ? '…' : '' }}</span
            >
            <div class="thumb-active-bar"></div>
          </button>
        </div>
      </ng-container>
    </section>

    <!-- ── Just Dropped (horizontal scroll) ── -->
    <section
      class="arrivals-section"
      *ngIf="loadingProducts || newArrivals.length > 0"
      pAnimateOnScroll
      enterClass="animate-fadeinup"
      leaveClass="animate-fadeout"
    >
      <div class="arrivals-inner">
        <div class="section-header">
          <div class="sh-left">
            <span class="sh-accent sh-accent-green"></span>
            <h2>Just Dropped</h2>
            <span class="badge-new-tag" *ngIf="!loadingProducts"
              ><i class="fas fa-certificate"></i> NEW</span
            >
          </div>
          <div class="sh-arrivals-right" *ngIf="!loadingProducts">
            <span class="arrivals-count">{{ newArrivals.length }} titles</span>
            <a routerLink="/products" class="see-all-link"
              >See All <i class="fas fa-arrow-right"></i
            ></a>
          </div>
        </div>
        <div class="arrivals-scroll-wrap">
          <div class="arrivals-scroll" #arrivalsScroll *ngIf="!loadingProducts">
            <a
              *ngFor="let p of newArrivals"
              [routerLink]="['/products', p._id]"
              class="arrival-card"
            >
              <div class="arrival-img-wrap">
                <img
                  [src]="getProductImage(p)"
                  [alt]="p.name"
                  onerror="this.src='https://placehold.co/210x135/1e2235/4f6ef7?text=Game'"
                />
                <div class="arrival-img-overlay"></div>
                <span class="arrival-new-badge" *ngIf="isNew(p)"
                  ><i class="fas fa-certificate"></i
                ></span>
                <span
                  class="arrival-price"
                  [class.arrival-price-free]="p.price === 0"
                >
                  {{
                    p.price === 0 ? 'Free' : '\\$' + (p.price | number: '1.2-2')
                  }}
                </span>
                <div class="arrival-hover-actions">
                  <button
                    class="arrival-btn-cart"
                    (click)="
                      $event.preventDefault();
                      $event.stopPropagation();
                      onAddToCart(p)
                    "
                    title="Add to cart"
                  >
                    <i class="fas fa-cart-plus"></i>
                  </button>
                  <button
                    class="arrival-btn-wish"
                    (click)="
                      $event.preventDefault();
                      $event.stopPropagation();
                      onAddToWishlist(p)
                    "
                    title="Wishlist"
                  >
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
              </div>
              <div class="arrival-info">
                <p class="arrival-name">
                  {{ p.name | slice: 0 : 28
                  }}{{ p.name.length > 28 ? '\\u2026' : '' }}
                </p>
                <div class="arrival-meta">
                  <i
                    [class]="getCategoryIconClass($any(p.category)?.name || '')"
                  ></i>
                  <span>{{ $any(p.category)?.name || 'Game' }}</span>
                </div>
                <div class="arrival-footer">
                  <div class="arrival-stars">
                    <span
                      *ngFor="let s of [1, 2, 3, 4, 5]"
                      class="star"
                      [class.filled]="s <= p.rating"
                      >★</span
                    >
                    <span class="arrival-rating-val">{{
                      (p.rating || 0).toFixed(1)
                    }}</span>
                  </div>
                </div>
              </div>
            </a>
          </div>
          <div class="arrivals-scroll" *ngIf="loadingProducts">
            <div
              *ngFor="let i of [1, 2, 3, 4, 5, 6]"
              class="arrival-card"
              style="pointer-events: none;"
            >
              <app-skeleton type="rect" height="132px"></app-skeleton>
              <div
                class="arrival-info"
                style="display:flex; flex-direction:column; gap:8px;"
              >
                <app-skeleton type="title" width="80%"></app-skeleton>
                <div style="display:flex; justify-content:space-between;">
                  <app-skeleton
                    type="text"
                    [rows]="1"
                    width="40%"
                  ></app-skeleton>
                  <app-skeleton
                    type="text"
                    [rows]="1"
                    width="20%"
                  ></app-skeleton>
                </div>
              </div>
            </div>
          </div>
          <div class="arrivals-fade-right"></div>
        </div>
      </div>
    </section>

    <div class="page-layout">
      <!-- ════ CENTER FEED ════ -->
      <div class="center-feed">
        <!-- ── Stats bar ── -->
        <ng-container *ngIf="loadingProducts">
          <app-skeleton
            type="rect"
            height="68px"
            width="100%"
            style="border-radius: 18px; overflow: hidden; display: block;"
          ></app-skeleton>
        </ng-container>
        <div
          class="stats-bar"
          *ngIf="!loadingProducts && allProducts.length > 0"
          pAnimateOnScroll
          enterClass="animate-fadein"
          leaveClass="animate-fadeout"
        >
          <div class="stat-chip">
            <span class="stat-icon stat-icon-blue"
              ><i class="fas fa-gamepad"></i
            ></span>
            <div class="stat-text">
              <span class="stat-val">{{ allProducts.length }}</span>
              <span class="stat-lbl">Games</span>
            </div>
          </div>
          <div class="stat-chip">
            <span class="stat-icon stat-icon-purple"
              ><i class="fas fa-tags"></i
            ></span>
            <div class="stat-text">
              <span class="stat-val">{{ categories.length }}</span>
              <span class="stat-lbl">Genres</span>
            </div>
          </div>
          <div class="stat-chip">
            <span class="stat-icon stat-icon-red"
              ><i class="fas fa-fire"></i
            ></span>
            <div class="stat-text">
              <span class="stat-val">{{ featuredProducts.length }}</span>
              <span class="stat-lbl">Featured</span>
            </div>
          </div>
          <div class="stat-chip">
            <span class="stat-icon stat-icon-gold"
              ><i class="fas fa-star"></i
            ></span>
            <div class="stat-text">
              <span class="stat-val">{{ avgRating | number: '1.1-1' }}</span>
              <span class="stat-lbl">Avg Rating</span>
            </div>
          </div>
        </div>

        <!-- ── Category Filter Pills ── -->
        <div class="filter-pills-wrap" *ngIf="loadingCategories">
          <div class="filter-pills">
            <app-skeleton
              type="button"
              [count]="7"
              width="96px"
              height="38px"
              [active]="true"
            ></app-skeleton>
          </div>
        </div>

        <div
          class="filter-pills-wrap"
          *ngIf="!loadingCategories"
          pAnimateOnScroll
          enterClass="animate-fadeindown"
          leaveClass="animate-fadeout"
          (mouseenter)="pausePillScroll()"
          (mouseleave)="resumePillScroll()"
        >
          <div class="filter-pills" #filterPills>
            <button
              class="pill"
              [class.active]="activeCategory === 'all'"
              (click)="filterBy('all')"
            >
              <i class="fas fa-th-large"></i> All
            </button>
            <button
              class="pill"
              *ngFor="let cat of categories"
              [class.active]="activeCategory === cat._id"
              (click)="filterBy(cat._id)"
            >
              <i [class]="getCategoryIconClass(cat.name)"></i> {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- ── Games Grid ── -->
        <section
          class="games-section"
          pAnimateOnScroll
          enterClass="animate-fadeinup"
          leaveClass="animate-fadeout"
        >
          <div class="section-header">
            <div class="sh-left">
              <span class="sh-accent"></span>
              <h2>{{ activeCategoryName }}</h2>
              <span class="item-count" *ngIf="filteredProducts.length > 0"
                >({{ filteredProducts.length }})</span
              >
            </div>
            <div class="sh-right">
              <div class="sort-wrap">
                <app-select
                  [(ngModel)]="sortOrder"
                  [options]="homeSortOptions"
                  [clearable]="false"
                  (selectionChange)="onSortChange($event)"
                ></app-select>
              </div>
              <a routerLink="/products" class="see-all-link"
                >See All <i class="fas fa-arrow-right"></i
              ></a>
            </div>
          </div>

          <div class="games-grid" *ngIf="loadingProducts">
            <app-skeleton
              type="product-card"
              [count]="8"
              [active]="true"
            ></app-skeleton>
          </div>

          <div
            class="games-grid"
            *ngIf="!loadingProducts && filteredProducts.length > 0"
          >
            <app-product-card
              *ngFor="let product of filteredProducts"
              [product]="product"
              [alreadyPurchased]="purchasedProductIds.has(product._id)"
              (addToCart)="onAddToCart($event)"
              (addToWishlist)="onAddToWishlist($event)"
              (quickView)="onQuickView($event)"
            >
            </app-product-card>
          </div>

          <div
            class="empty-state"
            *ngIf="!loadingProducts && filteredProducts.length === 0"
          >
            <div class="empty-icon"><i class="fas fa-gamepad"></i></div>
            <p class="empty-title">No games found</p>
            <p class="empty-text">
              {{
                activeCategory === 'all'
                  ? 'Check back soon for new titles!'
                  : 'No games in this category yet.'
              }}
            </p>
            <div class="empty-actions">
              <button
                class="btn-pill"
                (click)="filterBy('all')"
                *ngIf="activeCategory !== 'all'"
              >
                <i class="fas fa-th-large"></i> View All Games
              </button>
              <a routerLink="/products" class="btn-pill btn-pill-outline">
                <i class="fas fa-search"></i> Browse Store
              </a>
            </div>
          </div>
        </section>
      </div>
      <!-- /center-feed -->

      <!-- ════ RIGHT PANEL ════ -->
      <aside
        class="right-panel"
        pAnimateOnScroll
        enterClass="animate-fadeinright"
        leaveClass="animate-fadeout"
      >
        <!-- Library / Balance Card -->
        <div class="rp-card finance-card">
          <div class="finance-header">
            <div class="finance-header-left">
              <span class="finance-avatar"><i class="fas fa-wallet"></i></span>
              <span class="rp-title">Your Library</span>
            </div>
            <button class="rp-more">···</button>
          </div>
          <div class="finance-body">
            <div class="finance-chips">
              <span class="fchip fchip-blue"
                ><i class="fas fa-gamepad"></i> Owned</span
              >
              <span class="fchip fchip-pink"
                ><i class="fas fa-heart"></i> Wishlist</span
              >
              <span class="fchip fchip-gold"
                ><i class="fas fa-star"></i> Featured</span
              >
              <button class="fchip fchip-add">+ Add</button>
            </div>
            <div class="balance-label">Total Spent</div>
            <div class="balance-val">
              \${{ totalSpentWhole }}<span>.{{ totalSpentCents }}</span>
            </div>
            <div class="balance-trend" [class.negative-trend]="spentTrend < 0">
              <i
                class="fas"
                [class.fa-arrow-trend-up]="spentTrend >= 0"
                [class.fa-arrow-trend-down]="spentTrend < 0"
              ></i>
              {{ spentTrend >= 0 ? '+' : ''
              }}{{ spentTrend | number: '1.0-0' }}% this month
            </div>
            <div class="sparkline">
              <svg viewBox="0 0 160 50" preserveAspectRatio="none">
                <polyline
                  points="0,40 30,35 60,38 90,20 120,25 160,10"
                  fill="none"
                  stroke="#4f6ef7"
                  stroke-width="2.5"
                />
                <polyline
                  points="0,40 30,35 60,38 90,20 120,25 160,10 160,50 0,50"
                  fill="url(#spark-grad)"
                  stroke="none"
                  opacity="0.18"
                />
                <defs>
                  <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4f6ef7" />
                    <stop offset="100%" stop-color="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <a routerLink="/cart" class="btn-topup"
              ><i class="fas fa-cart-shopping"></i> Go to Cart +</a
            >
          </div>
        </div>

        <!-- Categories -->
        <div class="rp-card">
          <div class="rp-card-header">
            <span class="rp-title">Categories</span>
            <a routerLink="/products" class="rp-see-all">See All ›</a>
          </div>
          <ng-container *ngIf="loadingCategories">
            <app-skeleton
              type="rect"
              [count]="6"
              [active]="true"
              height="36px"
              [round]="true"
            ></app-skeleton>
          </ng-container>
          <div class="cat-list" *ngIf="!loadingCategories">
            <a
              *ngFor="let cat of categories"
              [routerLink]="['/products']"
              [queryParams]="{ category: cat._id }"
              class="cat-row"
            >
              <span class="cat-icon-sm"
                ><i [class]="getCategoryIconClass(cat.name)"></i
              ></span>
              <span class="cat-row-name">{{ cat.name }}</span>
              <span class="cat-arrow">›</span>
            </a>
            <a routerLink="/products" class="cat-row cat-all">
              <span class="cat-icon-sm cat-icon-all"
                ><i class="fas fa-store"></i
              ></span>
              <span class="cat-row-name">All Products</span>
              <span class="cat-arrow">›</span>
            </a>
          </div>
        </div>

        <!-- Top Rated -->
        <div class="rp-card" *ngIf="loadingProducts || topRated.length > 0">
          <div class="rp-card-header">
            <span class="rp-title"
              ><i
                class="fas fa-trophy"
                style="color:#f59e0b;margin-right:6px;font-size:0.85rem"
              ></i
              >Top Rated</span
            >
            <a
              routerLink="/products"
              class="rp-see-all"
              *ngIf="!loadingProducts"
              >See All ›</a
            >
          </div>
          <div class="history-list" *ngIf="loadingProducts">
            <div
              *ngFor="let i of [1, 2, 3, 4, 5]"
              class="history-row"
              style="pointer-events: none;"
            >
              <app-skeleton
                type="rect"
                height="40px"
                width="40px"
              ></app-skeleton>
              <div
                style="flex:1; display:flex; flex-direction:column; gap:6px;"
              >
                <app-skeleton type="title" width="70%"></app-skeleton>
                <app-skeleton type="text" [rows]="1" width="40%"></app-skeleton>
              </div>
            </div>
          </div>
          <div class="history-list" *ngIf="!loadingProducts">
            <a
              *ngFor="let p of topRated; let i = index"
              [routerLink]="['/products', p._id]"
              class="history-row"
            >
              <div
                class="rank-badge"
                [class.rank-gold]="i === 0"
                [class.rank-silver]="i === 1"
                [class.rank-bronze]="i === 2"
              >
                {{ i + 1 }}
              </div>
              <div class="history-thumb">
                <img
                  [src]="getProductImage(p)"
                  [alt]="p.name"
                  onerror="this.src='https://placehold.co/40x40/1e2235/4f6ef7?text=G'"
                />
              </div>
              <div class="history-info">
                <span class="history-name"
                  >{{ p.name | slice: 0 : 20
                  }}{{ p.name.length > 20 ? '…' : '' }}</span
                >
                <span class="history-stars">
                  <span
                    *ngFor="let s of [1, 2, 3, 4, 5]"
                    class="star-sm"
                    [class.filled]="s <= p.rating"
                    >★</span
                  >
                  <span class="rv-sm">({{ p.numReviews }})</span>
                </span>
              </div>
              <span class="history-price"
                >\${{ p.price | number: '1.2-2' }}</span
              >
            </a>
          </div>
        </div>

        <!-- New Arrivals mini list -->
        <div class="rp-card" *ngIf="loadingProducts || newArrivals.length > 0">
          <div class="rp-card-header">
            <span class="rp-title"
              ><i
                class="fas fa-certificate"
                style="color:#22c55e;margin-right:6px;font-size:0.85rem"
              ></i
              >New Arrivals</span
            >
            <a
              routerLink="/products"
              class="rp-see-all"
              *ngIf="!loadingProducts"
              >See All ›</a
            >
          </div>
          <div class="history-list" *ngIf="loadingProducts">
            <div
              *ngFor="let i of [1, 2, 3, 4]"
              class="history-row"
              style="pointer-events: none;"
            >
              <app-skeleton
                type="rect"
                height="40px"
                width="40px"
              ></app-skeleton>
              <div
                style="flex:1; display:flex; flex-direction:column; gap:6px;"
              >
                <app-skeleton type="title" width="70%"></app-skeleton>
                <app-skeleton type="text" [rows]="1" width="40%"></app-skeleton>
              </div>
            </div>
          </div>
          <div class="history-list" *ngIf="!loadingProducts">
            <a
              *ngFor="let p of newArrivals.slice(0, 4)"
              [routerLink]="['/products', p._id]"
              class="history-row"
            >
              <div class="history-thumb">
                <img
                  [src]="getProductImage(p)"
                  [alt]="p.name"
                  onerror="this.src='https://placehold.co/40x40/1e2235/4f6ef7?text=G'"
                />
              </div>
              <div class="history-info">
                <span class="history-name"
                  >{{ p.name | slice: 0 : 20
                  }}{{ p.name.length > 20 ? '…' : '' }}</span
                >
                <span class="history-meta">
                  <i
                    [class]="getCategoryIconClass($any(p.category)?.name || '')"
                  ></i>
                  {{ $any(p.category)?.name || 'Game' }}
                </span>
              </div>
              <span class="history-price"
                >\${{ p.price | number: '1.2-2' }}</span
              >
            </a>
          </div>
        </div>
      </aside>
    </div>
    <!-- /page-layout -->
  `,
  styles: [
    `
      :host {
        display: block;
        overflow-x: hidden;
      }

      /* ══ Hero Banner (full-width) ══ */
      .hero-banner {
        position: relative;
        width: 100%;
        height: 520px;
        overflow: hidden;
        background: #0d0f1c;

        @media (max-width: 768px) {
          height: 480px;
        }

        @media (max-width: 580px) {
          height: 400px;
        }

        @media (max-width: 380px) {
          height: 360px;
        }
      }

      .hero-slides {
        position: relative;
        height: 100%;
        overflow: hidden;
      }

      .hero-slide {
        position: absolute;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        transform: translateX(60px);
        transition:
          opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);

        &.active {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
          animation: slideIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;

          img {
            transform: scale(1);
          }
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.08);
          transition: transform 8s ease;
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(80px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .hero-gradient {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(
            90deg,
            rgba(10, 12, 24, 0.98) 0%,
            rgba(10, 12, 24, 0.82) 35%,
            rgba(10, 12, 24, 0.35) 58%,
            transparent 78%
          ),
          linear-gradient(
            to top,
            rgba(10, 12, 24, 0.85) 0%,
            rgba(10, 12, 24, 0.2) 30%,
            transparent 55%
          ),
          radial-gradient(
            ellipse at top right,
            rgba(0, 0, 0, 0.5) 0%,
            transparent 60%
          );
      }

      .hero-content {
        position: absolute;
        bottom: 0;
        left: 0;
        padding: 60px 48px;
        max-width: 650px;
        z-index: 5;

        @media (max-width: 960px) {
          padding: 40px;
        }

        @media (max-width: 768px) {
          padding: 28px 20px;
          max-width: 100%;
          margin-bottom: 36px;
        }

        @media (max-width: 480px) {
          padding: 20px 16px;
          margin-bottom: 52px;
        }

        @media (max-width: 380px) {
          padding: 16px 14px;
          margin-bottom: 44px;
        }
      }

      .hero-slide.active {
        .hero-badges {
          animation: heroItemIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .hero-title {
          animation: heroItemIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .hero-rating {
          animation: heroItemIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
        }
        .hero-desc {
          animation: heroItemIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
        .hero-actions {
          animation: heroItemIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }
      }

      @keyframes heroItemIn {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .hero-badges {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }

      .hbadge {
        padding: 8px 16px;
        border-radius: 50px;
        font-size: 0.72rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &.hbadge-hot {
          background: rgba(239, 68, 68, 0.2);
          color: #ff5c5c;
          border-color: rgba(239, 68, 68, 0.2);
        }
        &.hbadge-new {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.15);
        }
        &.hbadge-cat {
          background: rgba(79, 110, 247, 0.15);
          color: #a5b4fc;
          border-color: rgba(79, 110, 247, 0.15);
        }
      }

      .hero-title {
        font-size: clamp(2.2rem, 6vw, 3.8rem);
        font-weight: 950;
        color: #fff;
        line-height: 1.05;
        margin-bottom: 16px;
        letter-spacing: -2px;
        text-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

        @media (max-width: 768px) {
          font-size: clamp(1.6rem, 8vw, 2.5rem);
          letter-spacing: -1px;
        }

        @media (max-width: 380px) {
          font-size: clamp(1.4rem, 9vw, 2rem);
          letter-spacing: -0.5px;
        }
      }

      .hero-desc {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;
        margin-bottom: 36px;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        max-width: 520px;

        @media (max-width: 768px) {
          font-size: 0.95rem;
          margin-bottom: 24px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 380px) {
          font-size: 0.88rem;
          margin-bottom: 18px;
          -webkit-line-clamp: 2;
        }
      }

      .hero-actions {
        display: flex;
        gap: 20px;
        align-items: center;

        @media (max-width: 480px) {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
      }

      .btn-hero-buy {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 18px 44px;
        border-radius: 50px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: #fff;
        font-size: 1.1rem;
        font-weight: 850;
        text-decoration: none;
        box-shadow: 0 10px 30px rgba(79, 110, 247, 0.4);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

        @media (max-width: 768px) {
          padding: 14px 32px;
          font-size: 1rem;
        }

        @media (max-width: 480px) {
          width: 100%;
          padding: 16px 24px;
        }

        &:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 16px 40px rgba(79, 110, 247, 0.6);
          filter: brightness(1.1);
        }
      }

      .btn-hero-wish {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 1.5px solid rgba(255, 255, 255, 0.2);
        color: #ff4d91;
        font-size: 1.35rem;
        cursor: pointer;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

        @media (max-width: 480px) {
          display: none; /* Hide circle wish on very small, it complicates layout */
        }

        &:hover {
          background: rgba(255, 77, 145, 0.2);
          border-color: #ff4d91;
          transform: scale(1.1) rotate(5deg);
        }
      }

      .hero-live {
        position: absolute;
        top: 24px;
        right: 24px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 8px 16px;
        border-radius: 50px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10;
      }

      .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        animation: blink 1.2s infinite;
        box-shadow: 0 0 10px #22c55e;
      }

      @keyframes blink {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(0.8);
        }
      }

      /* Hero Rating */
      .hero-rating {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
      }

      .hr-stars {
        display: flex;
        gap: 3px;
      }
      .hr-stars i {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.2);
      }
      .hr-stars i.filled {
        color: #f59e0b;
      }
      .hr-stars i.half {
        color: #f59e0b;
        opacity: 0.7;
      }
      .hr-score {
        font-size: 0.9rem;
        font-weight: 900;
        color: #f59e0b;
      }
      .hr-reviews {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 500;
      }

      /* Dots (mobile) */
      .hero-dots {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 10;
        @media (max-width: 580px) {
          bottom: 12px;
        }
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        border: none;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

        &.active {
          width: 32px;
          border-radius: 6px;
          background: var(--accent);
          box-shadow: 0 0 15px var(--accent);
        }
      }

      /* Thumbnail strip */
      .hero-thumbs {
        position: absolute;
        right: 32px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 10;

        @media (max-width: 960px) {
          display: none;
        }
      }

      .hero-thumb {
        position: relative;
        width: 130px;
        height: 76px;
        border-radius: 14px;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        padding: 0;
        opacity: 0.5;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }

        &.active {
          opacity: 1;
          border-color: var(--accent);
          transform: scale(1.1) translateX(-8px);
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.5),
            0 0 0 3px rgba(79, 110, 247, 0.3);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .thumb-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.7) 0%,
          transparent 60%
        );
      }

      .thumb-name {
        position: absolute;
        bottom: 6px;
        left: 8px;
        right: 8px;
        font-size: 0.65rem;
        font-weight: 800;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ══ Page Layout ══ */
      .page-layout {
        display: flex;
        gap: 32px;
        max-width: 1440px;
        margin: 0 auto;
        padding: 32px 24px 100px;
        align-items: flex-start;

        @media (max-width: 1200px) {
          padding: 24px 16px 80px;
        }

        @media (max-width: 768px) {
          padding: 20px 12px 90px;
          gap: 20px;
        }

        @media (max-width: 480px) {
          padding: 16px 10px 90px;
        }
      }

      .center-feed {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 32px;

        @media (max-width: 768px) {
          gap: 20px;
        }
      }

      /* Stats Bar */
      .stats-bar {
        display: flex;
        align-items: center;
        gap: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 16px 24px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        margin-bottom: 8px;

        @media (max-width: 900px) {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 20px;
        }

        @media (max-width: 480px) {
          padding: 16px;
          gap: 12px;
        }
      }

      .stat-chip {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        min-width: 0;

        &:not(:last-child) {
          border-right: 1.5px solid var(--border);

          @media (max-width: 900px) {
            &:nth-child(odd) {
              border-right: 1.5px solid var(--border);
            }
            &:nth-child(even) {
              border-right: none;
            }
          }
        }

        @media (max-width: 900px) {
          justify-content: flex-start;
          padding: 0 10px;
        }
      }

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;

        &.stat-icon-blue {
          background: rgba(79, 110, 247, 0.15);
          color: #4f6ef7;
        }
        &.stat-icon-purple {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }
        &.stat-icon-red {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        &.stat-icon-gold {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
      }

      .stat-text {
        display: flex;
        flex-direction: column;

        .stat-val {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-white);
          line-height: 1.2;
        }
        .stat-lbl {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      /* Category Filter Pills */
      .filter-pills-wrap {
        position: relative;
        overflow: hidden;
        &::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 60px;
          background: linear-gradient(to right, transparent, var(--bg-primary));
          pointer-events: none;
        }
      }

      .filter-pills {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding: 10px 10px 10px 10px;
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .pill {
        padding: 10px 24px;
        border-radius: 50px;
        background: var(--bg-card);
        border: 1.5px solid var(--border);
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 10px;

        i {
          opacity: 0.7;
          font-size: 1rem;
        }

        @media (max-width: 480px) {
          padding: 8px 14px;
          font-size: 0.8rem;
          gap: 6px;
        }

        &:hover:not(.active) {
          background: var(--bg-card-hover);
          border-color: var(--text-secondary);
          color: var(--text-white);
          transform: translateY(-2px);
        }

        &.active {
          background: linear-gradient(135deg, var(--accent), var(--purple));
          border-color: transparent;
          color: #fff;
          box-shadow: 0 8px 20px rgba(79, 110, 247, 0.35);
          i {
            opacity: 1;
          }
        }
      }

      /* Games Section */
      .games-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;

        @media (max-width: 640px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .sh-left {
          display: flex;
          align-items: center;
          gap: 14px;

          h2 {
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--text-white);
            letter-spacing: -0.5px;
          }
          .item-count {
            font-size: 0.85rem;
            color: var(--text-secondary);
            background: var(--bg-card);
            padding: 4px 12px;
            border-radius: 10px;
            border: 1px solid var(--border);
          }
        }

        .sh-right {
          display: flex;
          align-items: center;
          gap: 16px;
          @media (max-width: 640px) {
            width: 100%;
            justify-content: space-between;
          }
        }

        .sh-arrivals-right {
          display: flex;
          align-items: center;
          gap: 16px;
          @media (max-width: 640px) {
            width: 100%;
            justify-content: space-between;
          }

          .arrivals-count {
            font-size: 0.85rem;
            color: var(--text-secondary);
            background: var(--bg-secondary);
            padding: 4px 12px;
            border-radius: 10px;
            font-weight: 600;
          }
        }
      }

      .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 24px;

        @media (max-width: 900px) {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 600px) {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (max-width: 360px) {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }

      /* Arrivals Section */
      .arrivals-section {
        background: rgba(0, 0, 0, 0.2);
        border-block: 1px solid var(--border);
        padding: 40px 0;

        @media (max-width: 768px) {
          padding: 24px 0;
        }

        @media (max-width: 480px) {
          padding: 20px 0;
        }
      }

      .arrivals-inner {
        max-width: 1440px;
        margin: 0 auto;
        padding: 0 24px;

        @media (max-width: 768px) {
          padding: 0 12px;
        }
      }

      .arrivals-scroll-wrap {
        position: relative;
        margin-top: 24px;

        .arrivals-fade-right {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to right, transparent, var(--bg-primary));
          z-index: 5;
          pointer-events: none;
        }
      }

      .arrivals-scroll {
        display: flex;
        gap: 20px;
        overflow-x: auto;
        padding: 20px 20px 20px 20px;
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .arrival-card {
        width: 260px;
        flex-shrink: 0;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        overflow: hidden;
        text-decoration: none;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);

        @media (max-width: 768px) {
          width: 200px;
          border-radius: 18px;
        }

        @media (max-width: 480px) {
          width: 170px;
          border-radius: 14px;
        }

        &:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
          border-color: var(--accent);
        }

        .arrival-img-wrap {
          height: 160px;
          position: relative;
          overflow: hidden;

          @media (max-width: 768px) {
            height: 135px;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        &:hover img {
          transform: scale(1.12);
        }
      }

      .arrival-info {
        padding: 18px;

        .arrival-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-white);
          margin-bottom: 6px;
          letter-spacing: -0.2px;
        }
        .arrival-meta {
          font-size: 0.82rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
      }

      /* Right Panel */
      .right-panel {
        width: 340px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        position: sticky;
        top: 100px;

        @media (max-width: 1200px) {
          display: none;
        }
      }

      .rp-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .rp-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .rp-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-white);
        }
        .rp-see-all {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent);
          text-decoration: none;
        }
      }

      .finance-card {
        padding: 0;
        overflow: hidden;

        .finance-header {
          background: linear-gradient(
            135deg,
            rgba(79, 110, 247, 0.15) 0%,
            rgba(124, 58, 237, 0.12) 100%
          );
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .finance-body {
          padding: 24px;
        }

        .finance-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .fchip {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-secondary);

          i {
            font-size: 0.8rem;
          }
          &.fchip-blue {
            color: #60a5fa;
            background: rgba(96, 165, 250, 0.1);
            border-color: rgba(96, 165, 250, 0.2);
          }
          &.fchip-pink {
            color: #f472b6;
            background: rgba(244, 114, 182, 0.1);
            border-color: rgba(244, 114, 182, 0.2);
          }
          &.fchip-gold {
            color: #fbbf24;
            background: rgba(251, 191, 36, 0.1);
            border-color: rgba(251, 191, 36, 0.2);
          }
          &.fchip-add {
            cursor: pointer;
            &:hover {
              background: var(--bg-card-hover);
              color: var(--text-white);
            }
          }
        }

        .balance-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
      .balance-val {
        font-size: 2.4rem;
        font-weight: 900;
        color: var(--text-white);
        line-height: 1;
        letter-spacing: -1.5px;
        margin: 12px 0 8px;
        display: flex;
        align-items: baseline;

        span {
          font-size: 1.2rem;
          color: var(--text-secondary);
          opacity: 0.6;
          margin-left: 2px;
        }
      }

      .balance-trend {
        font-size: 0.85rem;
        font-weight: 700;
        color: #4ade80;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 20px;

        &.negative-trend {
          color: #f87171;
        }
        i {
          font-size: 0.75rem;
        }
      }

      .btn-topup {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 16px;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: #fff;
        font-weight: 800;
        text-decoration: none;
        margin-top: 24px;
        box-shadow: 0 8px 25px rgba(79, 110, 247, 0.35);
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(79, 110, 247, 0.5);
        }
      }

      .cat-list {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .cat-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 600;
          transition: all 0.2s;

          i {
            color: var(--accent);
            font-size: 1.1rem;
          }

          &:hover {
            background: var(--bg-secondary);
            color: var(--text-white);
            transform: translateX(6px);
          }
        }
      }

      .history-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .history-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px;
          border-radius: 16px;
          text-decoration: none;
          transition: background 0.2s;

          &:hover {
            background: var(--bg-secondary);
          }

          .history-thumb {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            overflow: hidden;
          }
          .history-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .history-name {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--text-white);
          }
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('filterPills') filterPillsRef!: ElementRef<HTMLElement>;

  featuredProducts: Product[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  newArrivals: Product[] = [];
  topRated: Product[] = [];
  categories: Category[] = [];

  loadingProducts = true;
  loadingCategories = true;
  purchasedProductIds: Set<string> = new Set();

  // Hero carousel
  heroProducts: Product[] = [];
  heroIndex = 0;
  heroProgress = 0;
  private heroTimer: any;
  private progressTimer: any;
  private readonly SLIDE_DURATION = 5000;

  // Pill auto-scroll
  private pillScrollInterval: any;
  private pillScrollDirection = 1;
  private pillScrollPaused = false;

  // Total Spent
  totalSpentWhole = '0';
  totalSpentCents = '00';
  spentTrend = 0;

  // Filter / sort
  activeCategory = 'all';
  sortOrder = 'default';

  private readonly API_URL = environment.apiUrl;

  readonly homeSortOptions: SelectOption[] = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price ↑' },
    { value: 'price-desc', label: 'Price ↓' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'newest', label: 'Newest' },
  ];

  get activeCategoryName(): string {
    if (this.activeCategory === 'all') return 'All Games';
    return (
      this.categories.find((c) => c._id === this.activeCategory)?.name ||
      'Games'
    );
  }

  get avgRating(): number {
    if (!this.allProducts.length) return 0;
    return (
      this.allProducts.reduce((s, p) => s + (p.rating || 0), 0) /
      this.allProducts.length
    );
  }

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    public authService: AuthService,
    private wishlistService: WishlistService,
    private orderService: OrderService,
    private router: Router,
    private msgService: NotificationService,
  ) { }

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.productService.getFeaturedProducts().subscribe({
      next: (res) => {
        this.featuredProducts = res.products || [];
        this.heroProducts = this.featuredProducts.slice(0, 5);
        if (this.heroProducts.length > 1) this.startCarousel();
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
      },
    });

    this.productService.getProducts({ limit: 100 }).subscribe({
      next: (res) => {
        this.allProducts = res.products || [];
        this.computeFiltered();
        this.newArrivals = [...this.allProducts]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 8);
        this.topRated = [...this.allProducts]
          .sort((a, b) => b.rating - a.rating || b.numReviews - a.numReviews)
          .slice(0, 5);
      },
      error: () => { },
    });

    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = (res.categories || []).slice(0, 8);
        this.loadingCategories = false;
        setTimeout(() => this.startPillAutoScroll(), 400);
      },
      error: () => {
        this.loadingCategories = false;
      },
    });

    if (this.authService.isLoggedIn) {
      this.orderService.getMyOrders().subscribe({
        next: (res) => {
          const orders: any[] = res.orders || res || [];
          const completed = orders.filter((o: any) => o.status !== 'cancelled');
          const ids = new Set<string>();
          completed.forEach((o: any) => {
            (o.orderItems || []).forEach((item: any) => {
              const id = typeof item.product === 'string' ? item.product : item.product?._id;
              if (id) ids.add(id);
            });
          });
          this.purchasedProductIds = ids;
          const total = completed.reduce(
            (sum: number, o: any) => sum + (o.totalPrice || 0),
            0,
          );
          const formatted = total.toFixed(2).split('.');
          this.totalSpentWhole = Number(formatted[0]).toLocaleString();
          this.totalSpentCents = formatted[1];

          const now = new Date();
          const thisMonthTotal = completed
            .filter((o: any) => {
              const d = new Date(o.createdAt);
              return (
                d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth()
              );
            })
            .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);

          const lastMonthDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1,
          );
          const lastMonthTotal = completed
            .filter((o: any) => {
              const d = new Date(o.createdAt);
              return (
                d.getFullYear() === lastMonthDate.getFullYear() &&
                d.getMonth() === lastMonthDate.getMonth()
              );
            })
            .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);

          this.spentTrend =
            lastMonthTotal === 0
              ? thisMonthTotal > 0
                ? 100
                : 0
              : Math.round(
                ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100,
              );
        },
        error: () => { },
      });
    }
  }

  ngOnDestroy() {
    this.stopCarousel();
    this.stopPillAutoScroll();
  }

  // ── Pill auto-scroll ──
  private startPillAutoScroll() {
    this.stopPillAutoScroll();
    this.pillScrollDirection = 1;
    this.pillScrollInterval = setInterval(() => {
      if (this.pillScrollPaused) return;
      const el = this.filterPillsRef?.nativeElement;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (this.pillScrollDirection === 1) {
        el.scrollLeft += 1;
        if (el.scrollLeft >= maxScroll) this.pillScrollDirection = -1;
      } else {
        el.scrollLeft -= 1;
        if (el.scrollLeft <= 0) this.pillScrollDirection = 1;
      }
    }, 16);
  }

  private stopPillAutoScroll() {
    clearInterval(this.pillScrollInterval);
  }

  pausePillScroll() {
    this.pillScrollPaused = true;
  }

  resumePillScroll() {
    this.pillScrollPaused = false;
  }

  // ── Carousel ──
  private startCarousel() {
    this.heroProgress = 0;
    this.stopCarousel();
    const step = 100 / (this.SLIDE_DURATION / 100);
    this.progressTimer = setInterval(() => {
      this.heroProgress += step;
      if (this.heroProgress >= 100) {
        this.heroProgress = 0;
        this.heroIndex = (this.heroIndex + 1) % this.heroProducts.length;
      }
    }, 100);
  }

  private stopCarousel() {
    clearInterval(this.heroTimer);
    clearInterval(this.progressTimer);
  }

  prevHero() {
    this.heroIndex =
      (this.heroIndex - 1 + this.heroProducts.length) %
      this.heroProducts.length;
    this.heroProgress = 0;
  }

  nextHero() {
    this.heroIndex = (this.heroIndex + 1) % this.heroProducts.length;
    this.heroProgress = 0;
  }

  goToSlide(i: number) {
    this.heroIndex = i;
    this.heroProgress = 0;
  }

  // ── Filter / Sort ──
  filterBy(categoryId: string) {
    this.activeCategory = categoryId;
    this.computeFiltered();
  }

  onSortChange(_val?: any) {
    this.computeFiltered();
  }

  private computeFiltered() {
    let list =
      this.activeCategory === 'all'
        ? [...this.allProducts]
        : this.allProducts.filter((p) => {
          const catId =
            typeof p.category === 'string' ? p.category : p.category?._id;
          return catId === this.activeCategory;
        });

    switch (this.sortOrder) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }
    this.filteredProducts = list;
  }

  // ── Helpers ──
  getProductImage(p: Product): string {
    if (!p.image) return 'https://placehold.co/300x180/1e2235/4f6ef7?text=Game';
    return p.image.startsWith('http') ? p.image : this.API_URL + p.image;
  }

  isNew(p: Product): boolean {
    return Date.now() - new Date(p.createdAt).getTime() < SEVEN_DAYS_MS;
  }

  getCategoryIconClass(name: string): string {
    const icons: { [key: string]: string } = {
      action: 'fas fa-bolt',
      indie: 'fas fa-star',
      adventure: 'fas fa-map',
      rpg: 'fas fa-hat-wizard',
      strategy: 'fas fa-chess',
      shooter: 'fas fa-crosshairs',
      casual: 'fas fa-dice',
      racing: 'fas fa-flag-checkered',
      puzzle: 'fas fa-puzzle-piece',
      simulation: 'fas fa-earth-americas',
      horror: 'fas fa-skull',
      fighting: 'fas fa-hand-fist',
      platform: 'fas fa-gamepad',
      sports: 'fas fa-futbol',
      electronics: 'fas fa-mobile-screen',
      clothing: 'fas fa-shirt',
      books: 'fas fa-book',
      beauty: 'fas fa-spa',
      food: 'fas fa-pizza-slice',
      toys: 'fas fa-gamepad',
      jewelry: 'fas fa-ring',
      garden: 'fas fa-seedling',
      automotive: 'fas fa-car',
    };
    return icons[(name || '').toLowerCase()] || 'fas fa-gamepad';
  }

  onAddToCart(product: Product) {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.cartService.addToCart(product._id).subscribe({
      next: () => this.msgService.success('Added to cart!'),
      error: (err) =>
        this.msgService.error(err.error?.message || 'Failed to add to cart'),
    });
  }

  onAddToWishlist(product: Product) {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.wishlistService.addToWishlist(product._id).subscribe({
      next: () => this.msgService.success('Added to wishlist!'),
      error: (err) =>
        this.msgService.error(
          err.error?.message || 'Failed to add to wishlist',
        ),
    });
  }

  onQuickView(product: Product) {
    this.router.navigate(['/products', product._id]);
  }

  floorRating(rating: number): number {
    return Math.floor(rating || 0);
  }
}
