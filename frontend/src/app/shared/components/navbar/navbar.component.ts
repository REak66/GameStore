import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  filter,
  takeUntil,
} from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { PopconfirmDirective } from '../popconfirm/popconfirm.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PopconfirmDirective],
  template: `
    <nav class="navbar" [class.navbar-scrolled]="isScrolled">
      <div class="navbar-container">
        <!-- Brand -->
        <a routerLink="/" class="navbar-brand">
          <span class="brand-text">GameStore</span>
        </a>

        <!-- Search -->
        <div class="navbar-search">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Search games..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onInput($event)"
            (focus)="onFocus()"
            (keydown)="onKeyDown($event)"
            (keyup.enter)="triggerSearch()"
            autocomplete="off"
          />
          <button
            *ngIf="searchQuery"
            class="clear-btn"
            (click)="clearSearch()"
            title="Clear search"
            tabindex="-1"
          >
            <i class="fas fa-xmark"></i>
          </button>
          <button class="filter-btn" title="Filters" (click)="goToProducts()">
            <i class="fas fa-sliders"></i>
          </button>

          <!-- Desktop Suggestions Dropdown -->
          <div
            class="suggestions-drop"
            *ngIf="suggestionsOpen && suggestions.length && searchFocused"
          >
            <div class="suggestions-header">
              <i class="fas fa-bolt"></i> Quick Results
            </div>
            <button
              class="suggestion-item"
              *ngFor="let s of suggestions; let i = index"
              [class.highlighted]="i === selectedSuggestion"
              (click)="pickSuggestion(s)"
            >
              <img
                class="sug-img"
                [src]="getSugImage(s)"
                onerror="this.src='https://placehold.co/40x40/1e2235/4f6ef7?text=G'"
                [alt]="s.name"
              />
              <div class="sug-info">
                <span class="sug-name">{{ s.name }}</span>
                <span class="sug-price">\${{ s.price | number: '1.2-2' }}</span>
              </div>
              <span class="sug-cat" *ngIf="s.category?.name">{{
                s.category.name
              }}</span>
            </button>
            <button class="sug-view-all" (click)="triggerSearch()">
              View all results for "{{ searchQuery }}"
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Right actions -->
        <div class="navbar-actions">
          <!-- Connect / Login -->
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/auth/login" class="btn-connect"
              ><i class="fas fa-user-plus"></i> Connect</a
            >
          </ng-container>

          <!-- Lang tag -->
          <span class="lang-tag"><i class="fas fa-globe"></i> Eng</span>

          <!-- Theme toggle -->
          <button
            class="theme-toggle-btn"
            (click)="toggleTheme()"
            [title]="
              (themeService.isDarkMode$ | async)
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode'
            "
          >
            <i
              class="fas"
              [class.fa-sun]="themeService.isDarkMode$ | async"
              [class.fa-moon]="!(themeService.isDarkMode$ | async)"
            ></i>
          </button>

          <!-- User menu -->
          <div class="user-menu" *ngIf="isLoggedIn">
            <button
              class="user-btn"
              (click)="toggleMenu()"
              [class.active]="menuOpen"
            >
              <span class="avatar">
                <img
                  *ngIf="userAvatar"
                  [src]="userAvatar"
                  alt="avatar"
                  class="avatar-img"
                  (error)="onAvatarError($event)"
                />
                <span
                  class="avatar-initial"
                  [style.display]="userAvatar ? 'none' : 'flex'"
                  >{{ userInitial }}</span
                >
              </span>
              <span class="user-name-label">{{ userName }}</span>
              <i
                class="fas fa-chevron-down chevron"
                [class.rotated]="menuOpen"
              ></i>
            </button>
            <div class="dropdown" *ngIf="menuOpen">
              <div class="dd-header">Account Settings</div>
              <a
                routerLink="/profile"
                class="dropdown-item"
                (click)="closeMenu()"
              >
                <i class="fas fa-user"></i>
                Profile
              </a>
              <a
                routerLink="/orders"
                class="dropdown-item"
                (click)="closeMenu()"
              >
                <i class="fas fa-receipt"></i>
                Orders
              </a>
              <a
                routerLink="/wishlist"
                class="dropdown-item"
                (click)="closeMenu()"
              >
                <i class="fas fa-heart"></i>
                Wishlist
              </a>
              <div class="dd-divider" *ngIf="isAdmin"></div>
              <a
                routerLink="/admin"
                class="dropdown-item"
                *ngIf="isAdmin"
                (click)="closeMenu()"
              >
                <i class="fas fa-gear-complex"></i>
                Admin Dashboard
              </a>
              <div class="dd-divider"></div>
              <button
                class="dropdown-item danger"
                appPopconfirm="Sign out?"
                popDescription="Are you sure you want to sign out?"
                popOkText="Yes"
                popCancelText="No"
                popPlacement="bottom"
                (popConfirm)="logout()"
              >
                <i class="fas fa-right-from-bracket"></i>
                Sign Out
              </button>
            </div>
          </div>

          <!-- Mobile actions -->
          <div class="mobile-actions">
            <button
              class="mobile-search-btn"
              [class.active]="searchOpen"
              (click)="toggleSearch()"
              title="Search"
            >
              <i
                class="fas"
                [class.fa-magnifying-glass]="!searchOpen"
                [class.fa-xmark]="searchOpen"
              ></i>
            </button>

            <!-- Mobile user avatar button (shown when logged in) -->
            <div class="mobile-user-wrap" *ngIf="isLoggedIn">
              <button
                class="mobile-user-btn"
                [class.active]="mobileUserOpen"
                (click)="toggleMobileUser()"
                aria-label="Account menu"
              >
                <span class="mu-avatar">
                  <img
                    *ngIf="userAvatar"
                    [src]="userAvatar"
                    alt="avatar"
                    class="mu-avatar-img"
                    (error)="onAvatarError($event)"
                  />
                  <span
                    class="mu-avatar-initial"
                    [style.display]="userAvatar ? 'none' : 'flex'"
                  >{{ userInitial }}</span>
                </span>
              </button>

              <!-- Mobile account dropdown -->
              <div class="mobile-user-dropdown" *ngIf="mobileUserOpen">
                <!-- User info header -->
                <div class="mud-header">
                  <span class="mu-avatar mud-avatar-sm">
                    <img
                      *ngIf="userAvatar"
                      [src]="userAvatar"
                      alt="avatar"
                      class="mu-avatar-img"
                      (error)="onAvatarError($event)"
                    />
                    <span
                      class="mu-avatar-initial"
                      [style.display]="userAvatar ? 'none' : 'flex'"
                    >{{ userInitial }}</span>
                  </span>
                  <div class="mud-user-info">
                    <span class="mud-name">{{ userName }}</span>
                    <span class="mud-role">{{ isAdmin ? 'Administrator' : 'Member' }}</span>
                  </div>
                </div>
                <div class="mud-divider"></div>

                <!-- Nav items -->
                <a routerLink="/profile" class="mud-item" (click)="closeMobileUser()">
                  <i class="fas fa-user"></i>
                  <span>Profile</span>
                </a>
                <a routerLink="/orders" class="mud-item" (click)="closeMobileUser()">
                  <i class="fas fa-receipt"></i>
                  <span>Orders</span>
                </a>
                <a routerLink="/wishlist" class="mud-item" (click)="closeMobileUser()">
                  <i class="fas fa-heart"></i>
                  <span>Wishlist</span>
                </a>
                <ng-container *ngIf="isAdmin">
                  <div class="mud-divider"></div>
                  <a routerLink="/admin" class="mud-item mud-admin" (click)="closeMobileUser()">
                    <i class="fas fa-shield-halved"></i>
                    <span>Admin Dashboard</span>
                  </a>
                </ng-container>
                <div class="mud-divider"></div>
                <button
                  class="mud-item mud-signout"
                  appPopconfirm="Sign out?"
                  popDescription="Are you sure you want to sign out?"
                  popOkText="Yes"
                  popCancelText="No"
                  popPlacement="bottom"
                  (popConfirm)="logout()"
                >
                  <i class="fas fa-right-from-bracket"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Mobile search overlay and bar row -->
      <div *ngIf="searchOpen" class="mobile-search-container">
        <div class="mobile-search-overlay" (click)="searchOpen = false"></div>
        <div class="mobile-search-row show">
          <div
            class="mobile-search-inner"
            [class.focused]="mobileSearchFocused"
          >
            <i class="fas fa-magnifying-glass msr-icon"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onInput($event)"
              (keydown)="onKeyDown($event)"
              (focus)="mobileSearchFocused = true"
              (blur)="mobileSearchFocused = false"
              (keyup.enter)="triggerSearch(); searchOpen = false"
              placeholder="Search games..."
              class="msr-input"
              autocomplete="off"
              autofocus
            />
            <button
              class="msr-clear"
              *ngIf="searchQuery"
              (click)="clearSearch()"
              tabindex="-1"
            >
              <i class="fas fa-xmark"></i>
            </button>
            <button
              class="msr-go"
              (click)="triggerSearch(); searchOpen = false"
            >
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <!-- Mobile suggestions -->
          <div
            class="mobile-suggestions"
            *ngIf="suggestionsOpen && suggestions.length"
          >
            <div class="mobile-sug-header">Search results</div>
            <button
              class="suggestion-item"
              *ngFor="let s of suggestions; let i = index"
              [class.highlighted]="i === selectedSuggestion"
              (click)="pickSuggestion(s); searchOpen = false"
            >
              <img
                class="sug-img"
                [src]="getSugImage(s)"
                onerror="this.src='https://placehold.co/40x40/1e2235/4f6ef7?text=G'"
                [alt]="s.name"
              />
              <div class="sug-info">
                <span class="sug-name">{{ s.name }}</span>
                <span class="sug-price">\${{ s.price | number: '1.2-2' }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile user dropdown backdrop -->
      <div
        class="mobile-user-backdrop"
        *ngIf="mobileUserOpen"
        (click)="closeMobileUser()"
      ></div>

      <!-- Mobile drawer (side-drawer style) -->
      <div
        class="mobile-drawer-overlay"
        *ngIf="mobileMenuOpen"
        (click)="closeMobileMenu()"
      ></div>
      <div class="mobile-drawer" [class.open]="mobileMenuOpen">
        <div class="drawer-header">
          <img src="assets/GameShop.png" alt="Logo" class="drawer-logo" />
          <button class="drawer-close" (click)="closeMobileMenu()">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <div class="drawer-content">
          <div class="drawer-section">
            <span class="section-label">Main Menu</span>
            <a
              routerLink="/"
              class="drawer-link"
              (click)="closeMobileMenu()"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              <i class="fas fa-house"></i> Home
            </a>
            <a
              routerLink="/products"
              class="drawer-link"
              (click)="closeMobileMenu()"
              routerLinkActive="active"
            >
              <i class="fas fa-gamepad"></i> All Games
            </a>
          </div>

          <div class="drawer-section">
            <span class="section-label">Shopping</span>
            <a
              routerLink="/cart"
              class="drawer-link"
              (click)="closeMobileMenu()"
              routerLinkActive="active"
            >
              <i class="fas fa-cart-shopping"></i> My Cart
              <span class="drawer-badge" *ngIf="cartCount > 0">{{
                cartCount
              }}</span>
            </a>
            <a
              routerLink="/wishlist"
              class="drawer-link"
              (click)="closeMobileMenu()"
              routerLinkActive="active"
              *ngIf="isLoggedIn"
            >
              <i class="fas fa-heart"></i> Wishlist
            </a>
          </div>

          <div class="drawer-section" *ngIf="isLoggedIn">
            <span class="section-label">Account</span>
            <a
              routerLink="/profile"
              class="drawer-link"
              (click)="closeMobileMenu()"
              routerLinkActive="active"
            >
              <i class="fas fa-user-circle"></i> Profile
            </a>
            <a
              routerLink="/orders"
              class="drawer-link"
              (click)="closeMobileMenu()"
              routerLinkActive="active"
            >
              <i class="fas fa-receipt"></i> Orders
            </a>
            <a
              routerLink="/admin"
              class="drawer-link"
              *ngIf="isAdmin"
              (click)="closeMobileMenu()"
              routerLinkActive="active"
            >
              <i class="fas fa-shield-halved"></i> Admin Panel
            </a>
          </div>

          <div class="drawer-section" *ngIf="!isLoggedIn">
            <span class="section-label">Joining</span>
            <a
              routerLink="/auth/login"
              class="drawer-link connect-link"
              (click)="closeMobileMenu()"
            >
              <i class="fas fa-right-to-bracket"></i> Login
            </a>
            <a
              routerLink="/auth/register"
              class="drawer-link"
              (click)="closeMobileMenu()"
            >
              <i class="fas fa-user-plus"></i> Sign Up
            </a>
          </div>
        </div>

        <div class="drawer-footer" *ngIf="isLoggedIn">
          <button
            class="logout-btn"
            appPopconfirm="Sign out?"
            popDescription="Are you sure you want to sign out?"
            (popConfirm)="logout()"
          >
            <i class="fas fa-right-from-bracket"></i> Sign Out
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .navbar {
        background: var(--bg-card);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 1000;
        transition: all 0.3s ease;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);

        &.navbar-scrolled {
          background: rgba(var(--bg-card-rgb), 0.85);
          padding-block: 4px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
      }

      .navbar-container {
        max-width: 1440px;
        margin: 0 auto;
        padding: 0 24px;
        height: var(--navbar-h, 68px);
        display: flex;
        align-items: center;
        justify-content: space-between;

        @media (max-width: 768px) {
          height: 64px;
          padding: 0 16px;
        }
      }

      /* Brand */
      .navbar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        margin-right: 32px;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.02);
        }

        .logo-circle {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3);

          img {
            width: 30px;
            height: 30px;
            object-fit: contain;
          }
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--text-white);
          letter-spacing: -0.5px;

          @media (max-width: 480px) {
            display: none;
          }
        }
      }

      /* Search */
      .navbar-search {
        flex: 1;
        max-width: 440px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--bg-secondary);
        border: 1.5px solid var(--border);
        border-radius: 14px;
        padding: 0 16px;
        position: relative;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-light);
          background: var(--bg-card);
          max-width: 480px;
        }
      }

      .search-icon {
        color: var(--text-secondary);
        font-size: 0.95rem;
        opacity: 0.8;
      }

      .search-input {
        flex: 1;
        background: none;
        border: none;
        color: var(--text-white);
        font-size: 0.95rem;
        padding: 12px 0;
        outline: none;
        min-width: 0;

        &::placeholder {
          color: var(--text-secondary);
          opacity: 0.6;
        }
      }

      .clear-btn,
      .filter-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        border-radius: 8px;
        transition: all 0.2s;

        &:hover {
          background: var(--bg-secondary);
          color: var(--accent);
        }
      }

      .clear-btn:hover {
        color: var(--danger);
        background: rgba(var(--danger-rgb), 0.1);
      }

      /* Suggestions Dropdown */
      .suggestions-drop {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        right: 0;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        z-index: 1100;
        animation: dropdownIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes dropdownIn {
        from {
          opacity: 0;
          transform: translateY(-12px) scale(0.97);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .suggestions-header {
        padding: 12px 16px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--border);
      }

      .suggestion-item {
        width: 100%;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 14px;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;

        &:hover,
        &.highlighted {
          background: var(--accent-light);
        }

        .sug-img {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .sug-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sug-name {
          color: var(--text-white);
          font-size: 0.95rem;
          font-weight: 600;
        }

        .sug-price {
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 700;
        }

        .sug-cat {
          font-size: 0.7rem;
          padding: 2px 8px;
          background: var(--bg-secondary);
          border-radius: 20px;
          color: var(--text-secondary);
        }
      }

      .sug-view-all {
        width: 100%;
        padding: 14px;
        background: var(--bg-secondary);
        border: none;
        border-top: 1px solid var(--border);
        color: var(--accent);
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: var(--accent-light);
        }
      }

      /* Actions */
      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-left: auto;
      }

      .btn-connect {
        padding: 10px 22px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border-radius: 14px;
        font-size: 0.9rem;
        font-weight: 700;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 4px 15px rgba(79, 110, 247, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 110, 247, 0.45);
          filter: brightness(1.1);
        }
      }

      .lang-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--bg-card-hover);
          color: var(--text-white);
        }
      }

      .theme-toggle-btn {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 12px;
        width: 42px;
        height: 42px;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

        &:hover {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
          transform: rotate(15deg) scale(1.1);
        }
      }

      /* User Menu */
      .user-menu {
        position: relative;
      }

      .user-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 12px 6px 6px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover,
        &.active {
          background: var(--bg-card-hover);
          border-color: var(--accent);
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          color: white;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-name-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-white);
        }

        .chevron {
          font-size: 0.75rem;
          color: var(--text-secondary);
          transition: transform 0.3s ease;

          &.rotated {
            transform: rotate(180deg);
          }
        }
      }

      .dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 12px);
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 18px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        min-width: 240px;
        padding: 10px;
        z-index: 1200;
        animation: dropdownIn 0.25s ease both;
      }

      .dd-header {
        padding: 12px 14px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        color: var(--text-secondary);
        font-weight: 600;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
        background: none;
        border: none;
        width: 100%;
        text-align: left;

        i {
          font-size: 1.1rem;
          width: 20px;
          display: flex;
          justify-content: center;
        }

        &:hover {
          background: var(--accent-light);
          color: var(--accent);
          transform: translateX(4px);
        }

        &.danger {
          color: var(--danger);

          &:hover {
            background: rgba(var(--danger-rgb, 239), 68, 68, 0.1);
          }
        }
      }

      .dd-divider {
        height: 1px;
        background: var(--border);
        margin: 10px 0;
      }

      /* Mobile Controls */
      .mobile-actions {
        display: none;
        align-items: center;
        gap: 8px;
      }

      .mobile-search-btn {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--bg-secondary);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          background: var(--bg-card-hover);
          color: var(--text-white);
          border-color: var(--accent);
        }

        &.active {
          background: linear-gradient(135deg, var(--accent), var(--purple));
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(var(--accent-rgb), 0.45);

          i {
            animation: spinIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        }
      }

      @keyframes spinIn {
        from { transform: rotate(-90deg) scale(0.5); opacity: 0; }
        to   { transform: rotate(0deg)   scale(1);   opacity: 1; }
      }

      .mobile-menu-btn {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        border: 1.5px solid var(--border);
        background: var(--bg-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: inherit;
        }

        &:hover {
          border-color: var(--accent);
          transform: scale(1.05);

          .bar { background: var(--accent); }
        }

        &.active {
          border-color: transparent;
          box-shadow: 0 4px 18px rgba(var(--accent-rgb), 0.5);
          transform: scale(1.05);

          &::before { opacity: 1; }

          .bar { background: #fff; }

          .bar-1 {
            transform: translateY(6px) rotate(45deg);
          }
          .bar-2 {
            opacity: 0;
            transform: scaleX(0);
          }
          .bar-3 {
            transform: translateY(-6px) rotate(-45deg);
          }
        }

        .hamburger {
          width: 18px;
          height: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .bar {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--text-secondary);
          border-radius: 3px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center;
        }

        .bar-1 { width: 100%; }
        .bar-2 { width: 75%; align-self: flex-end; }
        .bar-3 { width: 100%; }

        &:hover .bar-2 { width: 100%; }

        &.active .bar-2 { width: 100%; }
      }

      @media (max-width: 1024px) {
        .user-name-label,
        .chevron,
        .lang-tag {
          display: none;
        }

        .user-btn {
          padding: 4px;
          border-radius: 50%;
        }
      }

      @media (max-width: 768px) {
        .navbar-container {
          padding: 0 16px;
          justify-content: space-between;
        }

        .navbar-search {
          display: none;
        }

        .mobile-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .navbar-actions {
          margin-left: 0;
          gap: 8px;
          display: flex;
          align-items: center;
        }

        .btn-connect,
        .lang-tag,
        .user-menu {
          display: none;
        }

        .navbar-brand {
          margin-right: 0;
          .logo-circle {
            width: 36px;
            height: 36px;
          }
        }
      }

      /* Mobile Search Container */
      .mobile-search-container {
        position: fixed;
        inset: 0;
        z-index: 2000;
      }

      .mobile-search-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .mobile-search-row {
        position: relative;
        background: rgba(var(--bg-card-rgb), 0.95);
        backdrop-filter: blur(20px);
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
        animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);

        .mobile-search-inner {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 0 16px;
          transition: all 0.25s;

          &.focused {
            border-color: var(--accent);
            background: var(--bg-card);
            box-shadow: 0 0 0 4px var(--accent-light);
          }
        }

        .msr-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-white);
          padding: 14px 0;
          outline: none;
          font-size: 1.05rem;
          font-weight: 500;
        }

        .msr-icon {
          color: var(--text-secondary);
          opacity: 0.7;
        }

        .msr-clear {
          background: none;
          border: none;
          color: var(--text-secondary);
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          &:hover {
            background: rgba(var(--danger-rgb), 0.1);
            color: var(--danger);
          }
        }

        .msr-go {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
          transition: transform 0.2s;
          &:active {
            transform: scale(0.9);
          }
        }
      }

      .mobile-suggestions {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 60vh;
        overflow-y: auto;

        .mobile-sug-header {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 700;
          margin-bottom: 4px;
        }
      }

      .mobile-drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 1000;
        animation: fadeIn 0.4s ease both;
      }

      .mobile-drawer {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 320px;
        max-width: 85%;
        background: var(--bg-card);
        z-index: 1001;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: -20px 0 50px rgba(0, 0, 0, 0.4);
        border-left: 1px solid var(--border);

        &.open {
          transform: translateX(0);
        }
      }

      .drawer-header {
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
        min-height: 64px;

        .drawer-logo {
          height: 28px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.2));
        }

        .drawer-close {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: var(--bg-card-hover);
            color: var(--danger);
            border-color: var(--danger);
          }
        }
      }

      .drawer-content {
        flex: 1;
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        gap: 28px;
        overflow-y: auto;
      }

      .drawer-section {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .section-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 800;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
          padding-left: 12px;
          opacity: 0.6;
        }
      }

      .drawer-link {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 18px;
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.98rem;
        text-decoration: none;
        border-radius: 16px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        border: 1px solid transparent;

        i {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
          color: var(--accent);
          transition: all 0.3s;
        }

        &:hover,
        &.active {
          background: var(--bg-secondary);
          color: var(--text-white);
          border-color: var(--border);

          i {
            transform: scale(1.1);
            color: var(--accent);
          }
        }

        &.active {
          background: var(--accent-light);
          color: var(--accent);
          border-color: rgba(var(--accent-rgb), 0.2);
        }

        &.connect-link {
          background: linear-gradient(135deg, var(--accent), var(--purple));
          color: white;
          border: none;
          box-shadow: 0 8px 16px rgba(var(--accent-rgb), 0.3);

          i {
            color: white;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(var(--accent-rgb), 0.4);
            filter: brightness(1.1);
          }
        }

        .drawer-badge {
          position: absolute;
          right: 18px;
          background: var(--danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 4px 8px rgba(var(--danger-rgb), 0.3);
        }
      }

      .drawer-footer {
        padding: 20px;
        border-top: 1px solid var(--border);
        background: rgba(var(--bg-card-rgb), 0.3);

        .logout-btn {
          width: 100%;
          padding: 16px;
          background: rgba(var(--danger-rgb, 239), 68, 68, 0.08);
          color: var(--danger);
          border: 1px solid rgba(var(--danger-rgb, 239), 68, 68, 0.15);
          border-radius: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;

          i {
            font-size: 1.1rem;
          }

          &:hover {
            background: var(--danger);
            color: white;
            box-shadow: 0 8px 20px rgba(var(--danger-rgb), 0.3);
            border-color: transparent;
          }
        }
      }

      /* ─── Mobile User Avatar Button + Dropdown ─── */
      .mobile-user-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1099;
      }

      .mobile-user-wrap {
        position: relative;
      }

      .mobile-user-btn {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--bg-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;

        &:hover,
        &.active {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }

        .mu-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .mu-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mu-avatar-initial {
          color: #fff;
          font-weight: 800;
          font-size: 1rem;
        }
      }

      .mobile-user-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 240px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 18px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
        z-index: 1100;
        padding: 8px;
        animation: dropdownIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        overflow: hidden;
      }

      .mud-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;

        .mud-avatar-sm {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;

          .mu-avatar-img { width: 100%; height: 100%; object-fit: cover; }
          .mu-avatar-initial { color: #fff; font-weight: 800; font-size: 0.95rem; }
        }

        .mud-user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .mud-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-white);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mud-role {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }

      .mud-divider {
        height: 1px;
        background: var(--border);
        margin: 6px 0;
      }

      .mud-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        border-radius: 12px;
        transition: all 0.2s;
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;

        i {
          font-size: 1rem;
          width: 18px;
          text-align: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        &:hover {
          background: var(--accent-light);
          color: var(--text-white);
          transform: translateX(3px);
        }

        &.mud-admin {
          i { color: var(--purple); }
          &:hover { background: rgba(var(--purple-rgb, 139, 92, 246), 0.1); }
        }

        &.mud-signout {
          i { color: var(--danger); }
          color: var(--danger);
          &:hover {
            background: rgba(var(--danger-rgb, 239, 68, 68), 0.1);
            transform: translateX(3px);
          }
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchQuery = '';
  menuOpen = false;
  mobileMenuOpen = false;
  searchOpen = false;
  searchFocused = false;
  mobileSearchFocused = false;
  cartCount = 0;
  mobileUserOpen = false;
  suggestions: any[] = [];
  suggestionsOpen = false;
  suggestionsLoading = false;
  selectedSuggestion = -1;
  isScrolled = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private cartService: CartService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router,
    private elRef: ElementRef,
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe((cart) => {
      this.cartCount = cart?.items?.length || 0;
    });

    // Sync search input when navigating to /products with a search param
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects || '';
        this.mobileUserOpen = false;
        if (url.startsWith('/products')) {
          const qs = url.split('?')[1] || '';
          const params = new URLSearchParams(qs);
          this.searchQuery = params.get('search') || '';
        }
      });

    // Debounced suggestions pipeline
    this.search$
      .pipe(
        debounceTime(280),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((query) => {
          if (query.trim().length < 2) {
            this.suggestions = [];
            this.suggestionsOpen = false;
            this.suggestionsLoading = false;
            return [];
          }
          this.suggestionsLoading = true;
          return this.productService.getProducts({ search: query, limit: 6 });
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.suggestions = (res?.products || []).slice(0, 6);
          this.suggestionsOpen = this.suggestions.length > 0;
          this.suggestionsLoading = false;
          this.selectedSuggestion = -1;
        },
        error: () => {
          this.suggestionsLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeSuggestions();
      this.mobileUserOpen = false;
    }
  }

  private readonly apiBase = environment.apiUrl;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }
  get userName(): string {
    return this.authService.currentUser?.name || '';
  }
  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }
  get userAvatar(): string {
    const av = this.authService.currentUser?.avatar;
    if (!av) return '';
    if (av.startsWith('http')) return av;
    return `${this.apiBase}${av}`;
  }
  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const initial = img.nextElementSibling as HTMLElement;
    if (initial) initial.style.display = 'flex';
  }

  triggerSearch() {
    const value = this.searchQuery?.trim();
    if (value) {
      this.router.navigate(['/products'], { queryParams: { search: value } });
    }
  }

  onInput(value: string) {
    this.selectedSuggestion = -1;
    this.search$.next(value);
  }

  onFocus() {
    this.searchFocused = true;
    if (this.searchQuery.trim().length >= 2 && this.suggestions.length) {
      this.suggestionsOpen = true;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.suggestionsOpen) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSuggestion = Math.min(
        this.selectedSuggestion + 1,
        this.suggestions.length - 1,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSuggestion = Math.max(this.selectedSuggestion - 1, -1);
    } else if (event.key === 'Escape') {
      this.closeSuggestions();
    } else if (event.key === 'Enter' && this.selectedSuggestion >= 0) {
      event.preventDefault();
      this.pickSuggestion(this.suggestions[this.selectedSuggestion]);
    }
  }

  pickSuggestion(product: any) {
    this.searchQuery = product.name;
    this.closeSuggestions();
    this.router.navigate(['/products', product._id]);
  }

  clearSearch() {
    this.searchQuery = '';
    this.search$.next('');
    this.closeSuggestions();
  }

  closeSuggestions() {
    this.suggestionsOpen = false;
    this.searchFocused = false;
    this.selectedSuggestion = -1;
  }

  getSugImage(product: any): string {
    const img =
      product.image || (product.images?.length ? product.images[0] : '');
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${this.apiBase}${img}`;
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  closeMenu() {
    this.menuOpen = false;
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) { this.searchOpen = false; this.mobileUserOpen = false; }
  }
  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
  toggleMobileUser() {
    this.mobileUserOpen = !this.mobileUserOpen;
    if (this.mobileUserOpen) { this.searchOpen = false; this.mobileMenuOpen = false; }
  }
  closeMobileUser() {
    this.mobileUserOpen = false;
  }
  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    if (this.searchOpen) {
      this.mobileMenuOpen = false;
      this.mobileUserOpen = false;
    } else {
      this.closeSuggestions();
    }
  }

  logout() {
    this.authService.logout();
    this.cartService.clearLocalCart();
    this.closeMenu();
    this.closeMobileMenu();
    this.closeMobileUser();
    this.notificationService.success('Signed out successfully');
    this.router.navigate(['/']);
  }
}
