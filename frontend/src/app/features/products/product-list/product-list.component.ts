import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../shared/components/select/select.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Product, Category } from '../../../core/models';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { Observable, BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductCardComponent,
    SkeletonComponent,
    SelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(16px)' }),
            stagger('40ms', [
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
    <section class="pl">
      <div class="pl-hdr">
        <div class="pl-hdr-bg"></div>
        <div class="pl-hdr-content">
          <div class="pl-breadcrumb">
            <a routerLink="/">Home</a> <i class="fas fa-chevron-right"></i>
            <span>Store</span>
          </div>
          <div class="pl-title-row">
            <h1 class="pl-title">{{ pageTitle$ | async }}</h1>
            <div class="pl-stats" *ngIf="!(loading$ | async)">
              <span class="pl-stat"><i class="fas fa-gamepad"></i> {{ total$ | async }} Games</span>
            </div>
          </div>
        </div>
      </div>
      <div class="pl-main">
        <!-- Toolbar -->
        <div class="pl-toolbar">
          <div class="pl-search-wrap" [class.focused]="plSearchFocused">
            <i class="fas fa-magnifying-glass pl-search-icon"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
              (focus)="plSearchFocused = true"
              (blur)="plSearchFocused = false"
              placeholder="Search games by name..."
            />
            <button class="pl-search-btn" (click)="loadProducts()">
              Search
            </button>
          </div>

          <div class="pl-actions">
            <button
              class="pl-filter-toggle"
              (click)="filterOpen = !filterOpen"
              [class.active]="filterOpen"
            >
              <i class="fas fa-sliders"></i>
              <span>Filters</span>
              <span class="pl-filter-badge" *ngIf="activeFilterCount > 0">{{
                activeFilterCount
              }}</span>
            </button>

            <div class="pl-sort">
              <span class="sort-lbl">Sort by:</span>
              <app-select
                [(ngModel)]="sortBy"
                [options]="sortOptions"
                (selectionChange)="onFilterChange()"
                [clearable]="false"
              ></app-select>
            </div>
          </div>
        </div>

        <div class="pl-container">
          <!-- Sidebar Filters -->
          <aside class="pl-sidebar" [class.open]="filterOpen">
            <div class="pl-sidebar-header">
              <h3><i class="fas fa-filter"></i> Refine Search</h3>
              <button class="pl-sidebar-close" (click)="filterOpen = false">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <div class="pl-filter-group">
              <label><i class="fas fa-grid-2"></i> Category</label>
              <app-select
                [(ngModel)]="selectedCategory"
                [options]="(categoryOptions$ | async) || []"
                (selectionChange)="onFilterChange()"
                [clearable]="false"
                [searchable]="false"
                placeholder="All Genres"
                class="pl-select"
              >
              </app-select>
            </div>

            <div class="pl-filter-group">
              <label><i class="fas fa-money-bill-wave"></i> Price Range</label>
              <div class="pl-price-inputs">
                <div class="pl-input-with-symbol">
                  <span>$</span>
                  <input
                    type="number"
                    [(ngModel)]="minPrice"
                    (change)="onFilterChange()"
                    placeholder="Min"
                  />
                </div>
                <span class="pl-price-sep">to</span>
                <div class="pl-input-with-symbol">
                  <span>$</span>
                  <input
                    type="number"
                    [(ngModel)]="maxPrice"
                    (change)="onFilterChange()"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div class="pl-sidebar-footer">
              <button
                class="btn-reset"
                (click)="resetFilters()"
                [disabled]="activeFilterCount === 0"
              >
                <i class="fas fa-undo"></i> Reset All
              </button>
              <button class="btn-apply" (click)="filterOpen = false">
                Apply Filters
              </button>
            </div>
          </aside>

          <!-- Main Grid -->
          <div class="pl-content">
            <!-- Active Filter Tags -->
            <div class="pl-active-filters" *ngIf="activeFilterCount > 0">
              <span class="pl-filter-tag" *ngIf="selectedCategory">
                {{ getCategoryName(selectedCategory, (categories$ | async) || []) }}
                <i
                  class="fas fa-xmark"
                  (click)="selectedCategory = ''; onFilterChange()"
                ></i>
              </span>
              <span
                class="pl-filter-tag"
                *ngIf="minPrice !== null || maxPrice !== null"
              >
                Price: \${{ minPrice || 0 }} - \${{ maxPrice || 'Any' }}
                <i
                  class="fas fa-xmark"
                  (click)="minPrice = null; maxPrice = null; onFilterChange()"
                ></i>
              </span>
              <button class="btn-clear-all" (click)="resetFilters()">
                Clear all
              </button>
            </div>


            <div *ngIf="loading$ | async" class="pl-grid">
              <app-skeleton type="product-card" [count]="8"></app-skeleton>
            </div>

            <ng-container *ngIf="!(loading$ | async)">
              <div *ngIf="(products$ | async)?.length === 0" class="pl-empty">
                <div class="empty-art">
                  <i class="fas fa-magnifying-glass"></i>
                </div>
                <h3>No matches found</h3>
                <p>
                  We couldn't find any games matching your current filters. Try
                  adjusting them or reset to start over.
                </p>
                <button (click)="resetFilters()" class="btn-reset-large">
                  Reset all filters
                </button>
              </div>

              <div
                *ngIf="((products$ | async) || []).length > 0"
                class="pl-grid"
                [@listAnimation]="(products$ | async)?.length"
              >
                <app-product-card
                  *ngFor="let product of (products$ | async)"
                  [product]="product"
                  [alreadyPurchased]="isProductPurchased(product._id)"
                  (addToCart)="onAddToCart($event)"
                  (addToWishlist)="onAddToWishlist($event)"
                  (quickView)="onQuickView($event)"
                >
                </app-product-card>
              </div>
            </ng-container>

            <!-- Pagination Bar -->
            <div class="pagination-bar" *ngIf="!(loading$ | async) && totalPages > 1">
              <span class="pagination-info">
                Page {{ currentPage }} of {{ totalPages }} &middot; {{ total$ | async }} total
              </span>
              <div class="pagination-controls">
                <button class="pg-btn" (click)="changePage(1)" [disabled]="currentPage === 1" title="First">
                  <i class="fas fa-angles-left"></i>
                </button>
                <button class="pg-btn" (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" title="Previous">
                  <i class="fas fa-angle-left"></i>
                </button>
                <ng-container *ngFor="let p of pageNumbers">
                  <span *ngIf="p === '...'" class="pg-ellipsis">...</span>
                  <button *ngIf="p !== '...'" class="pg-btn" [class.pg-active]="p === currentPage" (click)="changePage(+p)">{{ p }}</button>
                </ng-container>
                <button class="pg-btn" (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages" title="Next">
                  <i class="fas fa-angle-right"></i>
                </button>
                <button class="pg-btn" (click)="changePage(totalPages)" [disabled]="currentPage === totalPages" title="Last">
                  <i class="fas fa-angles-right"></i>
                </button>
              </div>
              <div class="pagination-size">
                <app-select
                  [(ngModel)]="pageSize"
                  [options]="pageSizeOptions"
                  (selectionChange)="onPageSizeChange()"
                  [clearable]="false"
                ></app-select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .pl-spinner-center {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
      }
      .pl-spinner-absolute {
        position: absolute;
        padding-top: 120px;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(20, 20, 30, 0.25);
        z-index: 20;
      }
      :host {
        display: block;
        min-height: 100vh;
        background: var(--bg-primary);
      }

      .pl-hdr {
        position: relative;
        height: 240px;
        background: #0d0f20;
        display: flex;
        align-items: center;
        overflow: hidden;
        border-bottom: 1px solid var(--border);

        @media (max-width: 768px) {
          height: 160px;
        }

        @media (max-width: 480px) {
          height: 130px;
        }
      }

      .pl-hdr-bg {
        position: absolute;
        inset: 0;
        background-image: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200');
        background-size: cover;
        background-position: center;
        opacity: 0.15;
        filter: grayscale(1) blur(2px);
      }

      .pl-hdr-content {
        position: relative;
        z-index: 5;
        max-width: 1440px;
        margin: 0 auto;
        width: 100%;
        padding: 0 40px;
        @media (max-width: 768px) {
          padding: 0 20px;
        }
      }

      .pl-breadcrumb {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 1px;

        a {
          color: var(--text-secondary);
          text-decoration: none;
          &:hover {
            color: var(--accent);
          }
        }
        i {
          font-size: 0.6rem;
          opacity: 0.5;
        }
        span {
          color: var(--accent);
        }
      }

      .pl-title {
        font-size: 2.8rem;
        font-weight: 900;
        color: var(--text-white);
        letter-spacing: -1.5px;
        margin: 0;

        @media (max-width: 768px) {
          font-size: 1.8rem;
          letter-spacing: -1px;
        }

        @media (max-width: 480px) {
          font-size: 1.5rem;
          letter-spacing: -0.5px;
        }

        @media (max-width: 380px) {
          font-size: 1.3rem;
        }
      }

      .pl-title-row {
        display: flex;
        align-items: flex-end;
        gap: 20px;
        flex-wrap: wrap;
      }

      .pl-stats {
        margin-top: 0;
        display: flex;
        gap: 12px;
      }

      .pl-stat {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          color: var(--accent);
          opacity: 0.8;
        }
      }

      .pl-main {
        max-width: 1440px;
        margin: -40px auto 100px;
        padding: 0 40px;
        position: relative;
        z-index: 10;

        @media (max-width: 768px) {
          padding: 0 14px;
          margin-top: -24px;
          margin-bottom: 90px;
        }

        @media (max-width: 480px) {
          padding: 0 10px;
          margin-top: -20px;
        }

        @media (max-width: 380px) {
          padding: 0 8px;
        }
      }

      .pl-toolbar {
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        margin-bottom: 32px;

        @media (max-width: 960px) {
          flex-direction: column;
          align-items: stretch;
          padding: 20px;
        }
      }

      .pl-search-wrap {
        flex: 1;
        max-width: 500px;
        display: flex;
        align-items: center;
        gap: 14px;
        background: var(--bg-secondary);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 0 8px 0 18px;
        transition: all 0.3s;

        &.focused {
          border-color: var(--accent);
          background: var(--bg-card);
          box-shadow: 0 0 0 4px var(--accent-light);
        }

        i {
          color: var(--text-secondary);
          font-size: 1rem;
        }
        input {
          flex: 1;
          min-width: 0;
          background: none;
          border: none;
          color: var(--text-white);
          padding: 14px 0;
          font-size: 0.95rem;
          outline: none;
          &::placeholder {
            color: var(--text-secondary);
            opacity: 0.6;
          }
        }
      }

      .pl-search-btn {
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 8px 20px;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          filter: brightness(1.1);
          transform: translateX(-2px);
        }
      }

      .pl-actions {
        display: flex;
        align-items: center;
        gap: 20px;
        @media (max-width: 768px) {
          width: 100%;
          justify-content: space-between;
        }
        @media (max-width: 640px) {
          flex-wrap: wrap;
          gap: 10px;
        }
      }

      .pl-filter-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        padding: 12px 20px;
        border-radius: 14px;
        color: var(--text-white);
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.25s;

        @media (min-width: 1025px) {
          display: none;
        }
        &:hover {
          background: var(--bg-card-hover);
          border-color: var(--text-secondary);
        }
        &.active {
          background: var(--accent-light);
          color: var(--accent);
          border-color: var(--accent);
        }
      }

      .pl-filter-badge {
        background: var(--accent);
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pl-sort {
        display: flex;
        align-items: center;
        gap: 12px;
        .sort-lbl {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
        }
      }

      .pl-container {
        display: flex;
        gap: 32px;
        align-items: flex-start;
      }

      .pl-sidebar {
        width: 280px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 24px;
        position: sticky;
        top: 100px;
        display: flex;
        flex-direction: column;
        gap: 24px;

        @media (max-width: 1024px) {
          position: fixed;
          top: 0;
          left: -320px;
          bottom: 0;
          z-index: 1100;
          width: 300px;
          border-radius: 0;
          padding: 30px;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          &.open {
            transform: translateX(320px);
          }
        }
      }

      .pl-sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        h3 {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--text-white);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @media (min-width: 1025px) {
          .pl-sidebar-close {
            display: none;
          }
        }
      }

      .pl-sidebar-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.2rem;
        cursor: pointer;
      }

      .pl-filter-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        label {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      .pl-select,
      .pl-input-with-symbol input {
        width: 100%;
        background: var(--bg-secondary);
        border: 1.5px solid var(--border);
        border-radius: 12px;
        padding: 12px;
        color: var(--text-white);
        font-size: 0.9rem;
        font-weight: 600;
        outline: none;
        transition: all 0.2s;
        &:focus {
          border-color: var(--accent);
          background: var(--bg-card);
        }
      }

      .pl-price-inputs {
        display: flex;
        align-items: center;
        gap: 10px;
        .pl-price-sep {
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
        }
      }

      .pl-input-with-symbol {
        position: relative;
        flex: 1;
        span {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 700;
        }
        input {
          padding-left: 24px;
        }
      }

      .pl-sidebar-footer {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
      }

      .btn-reset {
        background: none;
        border: 1px solid var(--border);
        color: var(--text-secondary);
        padding: 12px;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        &:hover:not(:disabled) {
          background: var(--danger-light);
          color: var(--danger);
          border-color: var(--danger);
        }
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .btn-apply {
        background: var(--accent);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 12px;
        font-weight: 800;
        cursor: pointer;
        @media (min-width: 1025px) {
          display: none;
        }
      }

      .pl-content {
        flex: 1;
        min-width: 0;
        position: relative;
      }

      .pl-active-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-bottom: 24px;
      }

      .pl-filter-tag {
        background: var(--bg-card);
        border: 1px solid var(--border);
        padding: 8px 14px;
        border-radius: 50px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-white);
        display: flex;
        align-items: center;
        gap: 8px;
        i {
          color: var(--text-secondary);
          cursor: pointer;
          &:hover {
            color: var(--danger);
          }
        }
      }

      .btn-clear-all {
        background: none;
        border: none;
        color: var(--accent);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        padding: 0 4px;
        &:hover {
          text-decoration: underline;
        }
      }

      .pl-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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

      .pl-empty {
        text-align: center;
        padding: 80px 20px;
        background: var(--bg-card);
        border-radius: 24px;
        border: 1px solid var(--border);
        .empty-art {
          font-size: 3rem;
          color: var(--border);
          margin-bottom: 20px;
        }
        h3 {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-white);
          margin-bottom: 12px;
        }
        p {
          color: var(--text-secondary);
          max-width: 400px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }
      }

      .btn-reset-large {
        background: var(--accent);
        color: white;
        border: none;
        padding: 14px 28px;
        border-radius: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.3);
        }
      }

      /* ── Pagination ── */
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 50px;
        padding-top: 18px;
        padding-bottom: 18px;
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
        &:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-light);
        }
        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        &.pg-active {
          border-color: var(--accent);
          background: var(--accent);
          color: white;
          font-weight: 700;
        }
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
    `,
  ],
})
export class ProductListComponent implements OnInit, OnDestroy {
  purchasedProductIds: Set<string> = new Set();
  activeFilterCount = 0;

  loadProducts() {
    this.onFilterChange();
  }

  private _products  = new BehaviorSubject<Product[]>([]);
  private _categories = new BehaviorSubject<Category[]>([]);
  private _loading   = new BehaviorSubject<boolean>(true);
  private _total     = new BehaviorSubject<number>(0);
  private destroy$   = new Subject<void>();

  products$         = this._products.asObservable();
  categories$       = this._categories.asObservable();
  loading$          = this._loading.asObservable();
  total$            = this._total.asObservable();
  categoryOptions$  = this._categories.pipe(
    map(cats => [
      { value: '', label: 'All Genres' },
      ...cats.map(c => ({ value: c._id, label: c.name }))
    ])
  );
  pageTitle$: Observable<string> = combineLatest([this._categories, of({})]).pipe(
    map(() => 'All Products')
  );
  currentPage = 1;
  totalPages = 1;
  pageSize = 12;
  searchQuery = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = '';
  filterOpen = false;
  readonly pageSizeOptions: SelectOption[] = [
    { value: 12, label: '12 / page' },
    { value: 24, label: '24 / page' },
    { value: 48, label: '48 / page' },
  ];
  readonly sortOptions: SelectOption[] = [
    { value: '', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rating' },
  ];
  plSearchFocused = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private msgService: NotificationService,
    private orderService: OrderService,
  ) {
    this.purchasedProductIds = new Set();
  }

  ngOnInit() {
    // Load categories once
    this.categoryService.getCategories().pipe(
      map(res => res.categories || []),
      catchError(() => of([])),
      takeUntil(this.destroy$)
    ).subscribe(cats => this._categories.next(cats));

    // Load purchased product IDs if logged in
    if (this.authService.isLoggedIn) {
      this.orderService.getMyOrders().pipe(
        catchError(() => of({ orders: [] })),
        takeUntil(this.destroy$)
      ).subscribe((res: any) => {
        const orders = res.orders || [];
        const ids = new Set<string>();
        orders.forEach((order: any) => {
          (order.orderItems || []).forEach((item: any) => {
            const id = typeof item.product === 'string' ? item.product : item.product?._id;
            if (id) ids.add(id);
          });
        });
        this.purchasedProductIds = ids;
      });
    }

    // Page title reacts to categories + route params
    this.pageTitle$ = combineLatest([this._categories, this.route.queryParams]).pipe(
      map(([categories, params]: [Category[], any]) => {
        if (params['search']) return `Search: "${params['search']}"`;
        if (params['category']) {
          const cat = categories.find((c) => c._id === params['category']);
          return cat ? cat.name : 'Products';
        }
        return 'All Products';
      })
    );

    // Products: subscribe independently so template conditionals never cancel the HTTP call
    this.route.queryParams.pipe(
      switchMap((params: any) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.searchQuery       = params['search']    || '';
        this.selectedCategory  = params['category']  || '';
        this.minPrice  = params['minPrice']  ? Number(params['minPrice'])  : null;
        this.maxPrice  = params['maxPrice']  ? Number(params['maxPrice'])  : null;
        this.sortBy    = params['sort']      || '';
        this.currentPage = params['page']   ? Number(params['page'])   : 1;
        this.pageSize    = params['limit']  ? Number(params['limit'])  : 12;
        this.updateActiveFilterCount();

        const filter: any = { page: this.currentPage, limit: this.pageSize };
        if (this.searchQuery)      filter.search    = this.searchQuery;
        if (this.selectedCategory) filter.category  = this.selectedCategory;
        if (this.minPrice !== null) filter.minPrice  = this.minPrice;
        if (this.maxPrice !== null) filter.maxPrice  = this.maxPrice;
        if (this.sortBy)           filter.sort      = this.sortBy;

        this._loading.next(true);
        return this.productService.getProducts(filter).pipe(
          map((res: any) => {
            this.totalPages = res.pages || 1;
            this._total.next(res.total || 0);
            this._products.next(res.products || []);
            this._loading.next(false);
          }),
          catchError(() => {
            this._total.next(0);
            this._products.next([]);
            this._loading.next(false);
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCategoryName(id: string, categories: Category[]): string {
    return categories.find((c) => c._id === id)?.name || 'Category';
  }

  isProductPurchased(productId: string): boolean {
    return this.purchasedProductIds.has(productId);
  }
  // Calculate active filter count
  private updateActiveFilterCount() {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.selectedCategory) count++;
    if (this.minPrice !== null) count++;
    if (this.maxPrice !== null) count++;
    this.activeFilterCount = count;
  }

  onFilterChange() {
    this.updateActiveFilterCount();
    this.updateParams({ page: 1 });
  }

  get pageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  onPageSizeChange() {
    this.updateParams({ page: 1, limit: this.pageSize });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.updateActiveFilterCount();
    this.router.navigate([], { queryParams: {} });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.updateParams({ page });
    window.scrollTo(0, 0);
  }

  private updateParams(overrides: any) {
    const queryParams: any = {
      search: this.searchQuery || null,
      category: this.selectedCategory || null,
      minPrice: this.minPrice !== null ? this.minPrice : null,
      maxPrice: this.maxPrice !== null ? this.maxPrice : null,
      sort: this.sortBy || null,
      page: this.currentPage,
      limit: this.pageSize,
      ...overrides,
    };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
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
      error: () => this.msgService.error('Failed to add to wishlist'),
    });
  }

  onQuickView(product: Product) {
    this.router.navigate(['/products', product._id]);
  }
}
