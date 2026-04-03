import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,
  Router,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ScrollToBottomComponent } from './shared/components/scroll-to-bottom/scroll-to-bottom.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { ThemeService } from './core/services/theme.service';
import { MessageHostComponent } from './shared/components/message/message-host.component';
import { NotificationHostComponent } from './shared/components/notification/notification-host.component';
import { ConfirmHostComponent } from './shared/components/confirm/confirm-host.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoadingService } from './core/services/loading.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    MessageHostComponent,
    NotificationHostComponent,
    ConfirmHostComponent,
    ModalComponent,
    ScrollToBottomComponent,
  ],
  template: `
    <div class="app-shell">
      <!-- ── Left Icon Sidebar ── -->
      <aside class="sidebar" *ngIf="!isAuthPage">
        <div class="sb-logo">
          <a routerLink="/" class="logo-wrap">
            <img
              src="assets/GameShop.png"
              alt="GameStore Logo"
              style="width:48px; height:48px; object-fit:contain;"
            />
          </a>
        </div>

        <nav class="sb-nav">
          <a
            routerLink="/"
            routerLinkActive="sb-active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="sb-item"
            title="Home"
          >
            <i class="fas fa-house"></i>
          </a>

          <a
            routerLink="/products"
            routerLinkActive="sb-active"
            class="sb-item"
            title="Games"
          >
            <i class="fas fa-gamepad"></i>
          </a>

          <a
            routerLink="/wishlist"
            routerLinkActive="sb-active"
            class="sb-item"
            title="Wishlist"
            *ngIf="isLoggedIn"
          >
            <i class="fas fa-heart"></i>
          </a>

          <a
            routerLink="/cart"
            routerLinkActive="sb-active"
            class="sb-item"
            title="Cart"
          >
            <i class="fas fa-cart-shopping"></i>
            <span class="cart-dot" *ngIf="cartCount > 0">{{
              cartCount > 9 ? '9+' : cartCount
            }}</span>
          </a>

          <a
            routerLink="/orders"
            routerLinkActive="sb-active"
            class="sb-item"
            title="My Orders"
            *ngIf="isLoggedIn"
          >
            <i class="fas fa-file-lines"></i>
          </a>

          <a
            routerLink="/admin"
            routerLinkActive="sb-active"
            class="sb-item"
            title="Admin Panel"
            *ngIf="isAdmin"
          >
            <i class="fas fa-gear"></i>
          </a>
        </nav>

        <div class="sb-bottom">
          <a
            routerLink="/profile"
            routerLinkActive="sb-active"
            class="sb-item"
            title="My Profile"
            *ngIf="isLoggedIn"
          >
            <div class="avatar-sb">
              <img
                *ngIf="userAvatar"
                [src]="userAvatar"
                alt="avatar"
                class="avatar-sb-img"
                (error)="onAvatarError($event)"
              />
              <span *ngIf="!userAvatar">{{ userInitial }}</span>
            </div>
          </a>
          <a
            routerLink="/auth/login"
            class="sb-item"
            title="Login"
            *ngIf="!isLoggedIn"
          >
            <i class="fas fa-right-to-bracket"></i>
          </a>
        </div>
      </aside>

      <!-- ── Main content ── -->
      <div class="content-wrap" [class.full-w]="isAuthPage">
        <app-navbar *ngIf="!isAuthPage"></app-navbar>
        <main class="main-area">
          <router-outlet></router-outlet>
        </main>
        <app-footer *ngIf="!isAuthPage"></app-footer>
        <app-scroll-to-bottom></app-scroll-to-bottom>
      </div>
    </div>

    <!-- ── Mobile Bottom Nav (shown only on mobile when not auth page) ── -->
    <nav class="mobile-bottom-nav" *ngIf="!isAuthPage">
      <a
        routerLink="/"
        routerLinkActive="mbn-active"
        [routerLinkActiveOptions]="{ exact: true }"
        class="mbn-item"
        title="Home"
      >
        <i class="fas fa-house"></i>
        <span>Home</span>
      </a>
      <a
        routerLink="/products"
        routerLinkActive="mbn-active"
        class="mbn-item"
        title="Games"
      >
        <i class="fas fa-gamepad"></i>
        <span>Games</span>
      </a>
      <a
        routerLink="/cart"
        routerLinkActive="mbn-active"
        class="mbn-item mbn-cart"
        title="Cart"
      >
        <i class="fas fa-cart-shopping"></i>
        <span class="cart-badge" *ngIf="cartCount > 0">{{
          cartCount > 9 ? '9+' : cartCount
        }}</span>
        <span>Cart</span>
      </a>
      <a
        routerLink="/wishlist"
        routerLinkActive="mbn-active"
        class="mbn-item"
        title="Wishlist"
        *ngIf="isLoggedIn"
      >
        <i class="fas fa-heart"></i>
        <span>Wishlist</span>
      </a>
      <a
        routerLink="/auth/login"
        routerLinkActive="mbn-active"
        class="mbn-item"
        title="Login"
        *ngIf="!isLoggedIn"
      >
        <i class="fas fa-right-to-bracket"></i>
        <span>Login</span>
      </a>
      <a
        routerLink="/profile"
        routerLinkActive="mbn-active"
        class="mbn-item"
        title="Profile"
        *ngIf="isLoggedIn"
      >
        <div class="mbn-avatar">
          <img
            *ngIf="userAvatar"
            [src]="userAvatar"
            alt="avatar"
            class="mbn-avatar-img"
            (error)="onAvatarError($event)"
          />
          <span *ngIf="!userAvatar">{{ userInitial }}</span>
        </div>
        <span>Profile</span>
      </a>
    </nav>

    <!-- ── Global UI Hosts ── -->
    <app-message-host></app-message-host>
    <app-notification-host></app-notification-host>
    <app-confirm-host></app-confirm-host>
    <app-modal></app-modal>
  `,
  styles: [
    `
      .app-shell {
        display: flex;
        min-height: 100vh;
      }

      /* ── Sidebar ── */
      .sidebar {
        width: var(--sidebar-w, 84px);
        min-height: 100vh;
        background: var(--bg-secondary);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 18px 0;
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 300;
        animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-84px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .sb-logo {
        margin-bottom: 28px;
      }

      .logo-wrap {
        width: 46px;
        height: 46px;
        background: linear-gradient(
          135deg,
          var(--accent) 0%,
          var(--purple) 100%
        );
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        color: #fff;
        transition:
          transform 0.25s,
          box-shadow 0.25s;
        box-shadow: 0 4px 15px rgba(79, 110, 247, 0.4);
      }
      .logo-wrap:hover {
        transform: scale(1.08) rotate(-4deg);
        box-shadow: 0 6px 22px rgba(79, 110, 247, 0.6);
      }

      .sb-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
        padding: 0 14px;
      }
      .sb-item {
        width: 46px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 13px;
        color: var(--text-secondary);
        transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        text-decoration: none;
      }
      .sb-item:hover {
        background: var(--accent-light);
        color: var(--text-white);
        transform: scale(1.1);
      }
      .sb-item.sb-active {
        background: var(--accent-light);
        color: var(--accent);
        box-shadow: 0 0 14px rgba(79, 110, 247, 0.25);
      }
      .sb-item i {
        font-size: 1.15rem;
      }

      /* Stagger sidebar items */
      .sb-nav .sb-item {
        animation: fadeInSb 0.4s both;
        @for $i from 1 through 6 {
          &:nth-child(#{$i}) {
            animation-delay: #{0.1s + ($i * 0.05s)};
          }
        }
      }

      @keyframes fadeInSb {
        from {
          opacity: 0;
          transform: translateX(-16px) scale(0.85);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .cart-item {
        position: relative;
      }
      .cart-dot {
        position: absolute;
        top: 5px;
        right: 5px;
        min-width: 15px;
        height: 15px;
        background: var(--danger);
        color: white;
        border-radius: 50%;
        font-size: 0.58rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 3px;
        animation: scaleInPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes scaleInPop {
        from {
          opacity: 0;
          transform: scale(0);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .sb-bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 0 14px;
      }
      .avatar-sb {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: 700;
        color: white;
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
      }
      .avatar-sb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        display: block;
      }
      .avatar-sb:hover {
        transform: scale(1.12);
      }

      /* ── Content ── */
      .content-wrap {
        margin-left: var(--sidebar-w, 84px);
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        min-width: 0;
        overflow-x: hidden;
      }
      .content-wrap.full-w {
        margin-left: 0;
      }
      .main-area {
        flex: 1;
      }

      /* ── Mobile Bottom Nav ── */
      .mobile-bottom-nav {
        display: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 72px;
        background: rgba(var(--bg-card-rgb), 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid var(--border);
        z-index: 1000;
        padding: 0 16px;
        justify-content: space-around;
        align-items: center;
        animation: slideUpNav 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
      }

      @keyframes slideUpNav {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .mbn-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.65rem;
        font-weight: 700;
        height: 100%;
        padding: 0 12px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        min-width: 64px;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 24px;
          height: 3px;
          background: var(--accent);
          border-radius: 0 0 4px 4px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      }

      .mbn-item:active {
        transform: scale(0.9);
      }

      .mbn-item.mbn-active {
        color: var(--accent);

        &::after {
          transform: translateX(-50%) scaleX(1);
        }

        i {
          transform: translateY(-2px);
          filter: drop-shadow(0 0 10px rgba(var(--accent-rgb), 0.5));
        }
      }

      .mbn-item i {
        font-size: 1.4rem;
        transition: transform 0.3s;
      }

      .mbn-cart {
        position: relative;
      }

      .cart-badge {
        position: absolute;
        top: 8px;
        right: 12px;
        min-width: 18px;
        height: 18px;
        background: var(--danger);
        color: white;
        border-radius: 50%;
        font-size: 0.65rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid var(--bg-card);
        box-shadow: 0 4px 10px rgba(var(--danger-rgb), 0.4);
      }

      .mbn-avatar {
        width: 26px;
        height: 26px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 800;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border: 1.5px solid transparent;
        transition: all 0.2s;
      }

      .mbn-active .mbn-avatar {
        border-color: var(--accent);
        box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.3);
      }

      .mbn-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      @media (max-width: 768px) {
        .sidebar {
          display: none;
        }
        .content-wrap {
          margin-left: 0;
        }
        .mobile-bottom-nav {
          display: flex;
        }
      }

      /* iOS safe area support */
      @supports (padding-bottom: env(safe-area-inset-bottom)) {
        .mobile-bottom-nav {
          height: calc(72px + env(safe-area-inset-bottom));
          padding-bottom: env(safe-area-inset-bottom);
        }
      }

      /* Ensure adequate touch targets */
      @media (max-width: 768px) {
        .mbn-item {
          min-height: 44px;
          padding: 8px 10px;
          flex: 1;
          justify-content: center;
        }
        .mbn-item span {
          font-size: 0.6rem;
        }
        .mbn-item i {
          font-size: 1.25rem;
        }
      }
      @media (max-width: 360px) {
        .mbn-item {
          padding: 6px 6px;
        }
        .mbn-item span {
          display: none;
        }
        .mbn-item i {
          font-size: 1.3rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  public title = 'GameStore';
  isAuthPage = false;
  cartCount = 0;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private cartService: CartService,
    private router: Router,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isAuthPage = (e.urlAfterRedirects || e.url).startsWith('/auth');
      });

    this.cartService.cart$.subscribe((cart) => {
      this.cartCount = cart?.items?.length || 0;
    });
  }

  private readonly apiBase = environment.apiUrl;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }
  get userInitial(): string {
    return (this.authService.currentUser?.name || 'U').charAt(0).toUpperCase();
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
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'flex';
  }

  loading$ = this.loadingService.loading$;
}
