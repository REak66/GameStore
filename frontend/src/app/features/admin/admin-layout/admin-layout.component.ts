import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="sidebar-brand"><i class="fas fa-gear"></i> Admin Panel</div>
        <nav class="sidebar-nav">
          <a
            routerLink="/admin"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
            ><i class="fas fa-chart-bar"></i> Dashboard</a
          >
          <a
            routerLink="/admin/products"
            routerLinkActive="active"
            class="nav-item"
            ><i class="fas fa-box"></i> Products</a
          >
          <a
            routerLink="/admin/categories"
            routerLinkActive="active"
            class="nav-item"
            ><i class="fas fa-tag"></i> Categories</a
          >
          <a
            routerLink="/admin/orders"
            routerLinkActive="active"
            class="nav-item"
            ><i class="fas fa-receipt"></i> Orders</a
          >
          <a
            routerLink="/admin/users"
            routerLinkActive="active"
            class="nav-item"
            ><i class="fas fa-users"></i> Users</a
          >
          <a
            routerLink="/admin/auth-logs"
            routerLinkActive="active"
            class="nav-item"
            ><i class="fas fa-user-shield"></i> Auth Logs</a
          >
          <div class="divider"></div>
          <a routerLink="/" class="nav-item"
            ><i class="fas fa-house"></i> Back to Store</a
          >
        </nav>
      </aside>
      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>
      <!-- Bottom nav for mobile -->
      <nav class="admin-bottom-nav">
        <a
          routerLink="/admin"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="nav-item"
          ><i class="fas fa-chart-bar"></i><span>Dashboard</span></a
        >
        <a
          routerLink="/admin/products"
          routerLinkActive="active"
          class="nav-item"
          ><i class="fas fa-box"></i><span>Products</span></a
        >
        <a
          routerLink="/admin/categories"
          routerLinkActive="active"
          class="nav-item"
          ><i class="fas fa-tag"></i><span>Categories</span></a
        >
        <a routerLink="/admin/orders" routerLinkActive="active" class="nav-item"
          ><i class="fas fa-receipt"></i><span>Orders</span></a
        >
        <a routerLink="/admin/users" routerLinkActive="active" class="nav-item"
          ><i class="fas fa-users"></i><span>Users</span></a
        >
        <a
          routerLink="/admin/auth-logs"
          routerLinkActive="active"
          class="nav-item"
          ><i class="fas fa-user-shield"></i><span>Auth Logs</span></a
        >
        <a routerLink="/" class="nav-item"
          ><i class="fas fa-house"></i><span>Store</span></a
        >
      </nav>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        display: flex;
        min-height: 100vh;
        background: var(--bg-primary);
      }
      .admin-sidebar {
        width: 240px;
        background: var(--bg-card);
        color: var(--text-white);
        padding: 24px 0;
        position: sticky;
        top: 0;
        height: 100vh;
        border-right: 1px solid var(--border);
        z-index: 10;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
      }
      .sidebar-brand {
        padding: 0 24px 24px;
        font-size: 1.2rem;
        font-weight: 700;
        border-bottom: 1px solid var(--border);
        margin-bottom: 16px;
        color: var(--text-white);
      }
      .sidebar-nav {
        display: flex;
        flex-direction: column;
      }
      .nav-item {
        display: block;
        padding: 12px 24px;
        color: var(--text-muted);
        text-decoration: none;
        transition: all 0.22s;
        font-weight: 500;
        border-left: 3px solid transparent;
      }
      .nav-item:hover,
      .nav-item.active {
        background: var(--accent-light);
        color: var(--accent);
        border-left-color: var(--accent);
        transform: translateX(3px);
      }
      .nav-item i {
        width: 18px;
        text-align: center;
        margin-right: 4px;
        font-size: 0.85rem;
      }
      .divider {
        height: 1px;
        background: var(--border);
        margin: 12px 0;
      }
      .admin-main {
        flex: 1;
        padding: 40px;
        background: var(--bg-primary);
        overflow-x: hidden;
        min-width: 0;
        min-height: 100vh;
      }

      /* Bottom nav styles */
      .admin-bottom-nav {
        display: none;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-card);
        border-top: 1px solid var(--border);
        z-index: 100;
        height: 60px;
        width: 100vw;
        box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
        justify-content: space-around;
        align-items: center;
        transition: background-color 0.4s ease;
      }
      .admin-bottom-nav .nav-item {
        flex: 1;
        text-align: center;
        padding: 0;
        color: var(--text-muted);
        border: none;
        background: none;
        font-size: 0.85rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        transition:
          color 0.2s,
          background 0.2s;
      }
      .admin-bottom-nav .nav-item.active,
      .admin-bottom-nav .nav-item:hover {
        color: var(--accent);
        background: var(--accent-light);
      }
      .admin-bottom-nav .nav-item i {
        margin: 0 0 2px 0;
        font-size: 1.1rem;
      }
      .admin-bottom-nav .nav-item span {
        font-size: 0.7rem;
        margin-top: 1px;
      }

      /* Responsive: hide sidebar, show bottom nav on mobile */
      @media (max-width: 900px) {
        .admin-layout {
          flex-direction: column;
        }
        .admin-sidebar {
          display: none;
        }
        .admin-main {
          padding: 16px 4px 80px 4px;
        }
        .admin-bottom-nav {
          display: flex !important;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AdminLayoutComponent {}
