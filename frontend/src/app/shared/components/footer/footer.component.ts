import { Component } from '@angular/core';
import { NewsletterService } from '../../../core/services/newsletter.service';
import { NotificationService } from '../../services/notification.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  template: `
    <footer class="footer" role="contentinfo" aria-label="Site footer">
      <!-- Decorative background blur -->
      <div class="footer-blur"></div>

      <div class="footer-container">
        <!-- Newsletter Section -->
        <div class="footer-newsletter-wrap">
          <div class="footer-newsletter" aria-labelledby="newsletter-heading">
            <div class="newsletter-content">
              <h2 id="newsletter-heading">Join the community</h2>
              <p>
                Get exclusive game deals, early access to new releases, and
                community news.
              </p>
            </div>
            <form
              class="newsletter-form"
              role="form"
              aria-label="Newsletter subscription"
              autocomplete="off"
              (submit)="onSubscribe($event)"
            >
              <div class="newsletter-input-group">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                <label for="newsletter-email" class="visually-hidden">Email address</label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  aria-label="Email address"
                  required
                  autocomplete="email"
                  [(ngModel)]="newsletterEmail"
                  [disabled]="newsletterLoading"
                />
                <button
                  type="submit"
                  class="newsletter-btn"
                  aria-label="Subscribe to newsletter"
                  [disabled]="newsletterLoading || !newsletterEmail"
                  [ngClass]="{ 'btn-disabled': newsletterLoading || !newsletterEmail }"
                >
                  <span *ngIf="!newsletterLoading">Subscribe</span>
                  <span *ngIf="newsletterLoading">Sending...</span>
                  <i class="fas fa-paper-plane" aria-hidden="true"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="footer-main" aria-label="Footer navigation">
          <div class="footer-brand-section">
            <div class="footer-logo" aria-label="GameStore logo and brand">
              <div class="logo-icon">
                <img src="assets/GameShop.png" alt="GameStore logo" width="44" height="44" style="border-radius: 14px; display: block;" />
              </div>
              <span class="logo-text">GameStore</span>
            </div>
            <p class="footer-tagline">
              Experience the future of gaming. Curated titles, secure payments,
              and a community built by players.
            </p>
            <div class="social-grid" aria-label="Social media links">
              <a
                href="https://www.facebook.com/share/1AUMXofj43/?mibextid=wwXIfr"
                class="social-item"
                title="Facebook"
                aria-label="Facebook"
                tabindex="0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://t.me/reakzyy98"
                class="social-item"
                title="Telegram"
                aria-label="Telegram"
                tabindex="0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="fab fa-telegram-plane"></i>
              </a>
              <a
                href="https://www.instagram.com/reaksixty9?igsh=MWR1cmQwenlob3dnaw%3D%3D&utm_source=qr"
                class="social-item"
                title="Instagram"
                aria-label="Instagram"
                tabindex="0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <nav class="footer-nav" aria-label="Footer links">
            <div class="nav-column">
              <h3>Explore Store</h3>
              <ul class="nav-list">
                <li>
                  <a routerLink="/products" aria-label="All Products"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i> All
                    Products</a
                  >
                </li>
                <li>
                  <a
                    routerLink="/products"
                    [queryParams]="{ featured: true }"
                    aria-label="Featured Games"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i>
                    Featured Games</a
                  >
                </li>
                <li>
                  <a
                    routerLink="/products"
                    [queryParams]="{ topRated: true }"
                    aria-label="Top Rated"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i> Top
                    Rated</a
                  >
                </li>
                <li>
                  <a
                    routerLink="/products"
                    [queryParams]="{ category: 'rpg' }"
                    aria-label="RPG Adventures"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i> RPG
                    Adventures</a
                  >
                </li>
              </ul>
            </div>
            <div class="nav-column">
              <h3>Account</h3>
              <ul class="nav-list">
                <li>
                  <a routerLink="/profile" aria-label="My Profile"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i> My
                    Profile</a
                  >
                </li>
                <li>
                  <a routerLink="/orders" aria-label="Order History"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i>
                    Order History</a
                  >
                </li>
                <li>
                  <a routerLink="/wishlist" aria-label="My Wishlist"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i> My
                    Wishlist</a
                  >
                </li>
                <li>
                  <a routerLink="/cart" aria-label="Shopping Cart"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i>
                    Shopping Cart</a
                  >
                </li>
              </ul>
            </div>
            <div class="nav-column">
              <h3>Support</h3>
              <ul class="nav-list">
                <li>
                  <a routerLink="/support" [queryParams]="{tab:'help-center'}" aria-label="Help Center"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i>
                    Help Center</a
                  >
                </li>
                <li>
                  <a routerLink="/support" [queryParams]="{tab:'contact-support'}" aria-label="Contact Support"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i>
                    Contact Support</a
                  >
                </li>
                <li>
                  <a routerLink="/support" [queryParams]="{tab:'refund-policy'}" aria-label="Refund Policy"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i>
                    Refund Policy</a
                  >
                </li>
                <li>
                  <a routerLink="/support" [queryParams]="{tab:'terms-of-service'}" aria-label="Terms of Service"
                    ><i class="fas fa-chevron-right" aria-hidden="true"></i>
                    Terms of Service</a
                  >
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div class="footer-divider">
          <div class="divider-line" aria-hidden="true"></div>
        </div>

        <div class="footer-bottom">
          <div class="bottom-left">
            <p>
              &copy; {{ year }} <strong>GameStore</strong>. All rights reserved.
            </p>
          </div>
          <div class="bottom-right">
            <div class="payment-methods" aria-label="Payment methods">
              <i class="fab fa-cc-visa" aria-label="Visa" tabindex="0"></i>
              <i
                class="fab fa-cc-mastercard"
                aria-label="Mastercard"
                tabindex="0"
              ></i>
              <i class="fab fa-cc-paypal" aria-label="PayPal" tabindex="0"></i>
              <i
                class="fab fa-cc-apple-pay"
                aria-label="Apple Pay"
                tabindex="0"
              ></i>
              <i class="fab fa-bitcoin" aria-label="Bitcoin" tabindex="0"></i>
            </div>
            <div class="extra-links">
              <a href="#" aria-label="Privacy">Privacy</a>
              <a href="#" aria-label="Cookies">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      /* Visually hidden utility class for accessibility */
      .visually-hidden {
        position: absolute !important;
        height: 1px;
        width: 1px;
        overflow: hidden;
        clip: rect(1px, 1px, 1px, 1px);
        white-space: nowrap;
        border: 0;
        padding: 0;
        margin: -1px;
      }
      .footer {
        background: var(--bg-primary, #0d0f1e);
        color: var(--text-secondary, #717696);
        position: relative;
        overflow: hidden;
        margin-top: 100px;
        padding-bottom: 40px;
        border-top: 1px solid rgba(255, 255, 255, 0.03);
      }

      .footer-blur {
        position: absolute;
        top: -150px;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 300px;
        background: radial-gradient(
          circle,
          rgba(var(--accent-rgb, 79, 110, 247), 0.1) 0%,
          transparent 70%
        );
        pointer-events: none;
        z-index: 1;
      }

      .footer-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 40px;
        position: relative;
        z-index: 2;
      }

      /* Newsletter Section */
      .footer-newsletter-wrap {
        margin-bottom: 80px;
        position: relative;
        padding-top: 60px;
      }

      .footer-newsletter {
        background: var(--bg-card, rgba(22, 25, 41, 0.4));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 30px;
        padding: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 40px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
      }

      .newsletter-content h2 {
        font-size: 2.2rem;
        color: #fff;
        margin-bottom: 12px;
        font-weight: 800;
        letter-spacing: -1px;
      }

      .newsletter-content p {
        font-size: 1.1rem;
        color: var(--text-secondary);
        max-width: 500px;
        line-height: 1.6;
      }

      .newsletter-form {
        flex: 1;
        max-width: 480px;
      }

      .newsletter-input-group {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 100px;
        padding: 6px 6px 6px 24px;
        transition: all 0.3s;
        gap: 12px;
      }

      .newsletter-input-group:focus-within {
        border-color: var(--accent);
        box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.2);
        background: rgba(0, 0, 0, 0.5);
      }

      .newsletter-input-group i {
        color: var(--text-secondary);
        font-size: 1.1rem;
      }

      .newsletter-input-group input {
        flex: 1;
        background: transparent;
        border: none;
        color: #fff;
        padding: 12px 0;
        outline: none;
        font-size: 1rem;
      }

      .newsletter-btn {
        background: linear-gradient(
          135deg,
          var(--accent) 0%,
          var(--purple) 100%
        );
        color: #fff;
        border: none;
        border-radius: 100px;
        padding: 12px 28px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 1;
        pointer-events: auto;
        filter: none;
      }
      .newsletter-btn.btn-disabled {
        opacity: 0.6;
        pointer-events: none;
        filter: grayscale(0.5);
      }

      .newsletter-message {
        margin-top: 12px;
        font-size: 1rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .newsletter-message.success {
        color: #4caf50;
      }
      .newsletter-message.error {
        color: #f44336;
      }

      /* Main Section */
      .footer-main {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 80px;
        margin-bottom: 80px;
      }

      .footer-logo {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      }

      .logo-icon {
        width: 44px;
        height: 44px;
        background: linear-gradient(
          135deg,
          var(--accent) 0%,
          var(--purple) 100%
        );
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 8px 16px rgba(var(--accent-rgb), 0.3);
      }

      .logo-icon svg {
        width: 24px;
        height: 24px;
      }

      .logo-text {
        font-size: 1.8rem;
        font-weight: 800;
        color: #fff;
        letter-spacing: -1px;
      }

      .footer-tagline {
        font-size: 1.05rem;
        line-height: 1.8;
        color: var(--text-secondary);
        margin-bottom: 32px;
        max-width: 400px;
      }

      .social-grid {
        display: flex;
        gap: 16px;
      }

      .social-item {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        font-size: 1.4rem;
        transition: all 0.3s;
      }

      .social-item:hover {
        background: rgba(var(--accent-rgb), 0.1);
        border-color: var(--accent);
        color: #fff;
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      .footer-nav {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
      }

      .nav-column h3 {
        color: #fff;
        font-size: 1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 28px;
      }

      .nav-list {
        list-style: none;
      }
      .nav-list li {
        margin-bottom: 16px;
      }
      .nav-list a {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 1rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .nav-list a i {
        font-size: 0.7rem;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.2s;
      }

      .nav-list a:hover {
        color: var(--accent);
        transform: translateX(5px);
      }

      .nav-list a:hover i {
        opacity: 1;
        transform: translateX(0);
      }

      /* Divider & Back to Top */
      .footer-divider {
        position: relative;
        height: 1px;
        margin-bottom: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .divider-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.06) 50%,
          transparent
        );
      }

      .back-to-top {
        width: 50px;
        height: 50px;
        background: var(--bg-card, #1e2235);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent);
        cursor: pointer;
        z-index: 5;
        transition: all 0.3s;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      .back-to-top:hover {
        background: var(--accent);
        color: #fff;
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(var(--accent-rgb), 0.3);
      }

      /* Bottom Bar */
      .footer-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
      }

      .bottom-left p {
        font-size: 0.92rem;
        color: var(--text-muted, #5a5e7a);
      }

      .bottom-left strong {
        color: #fff;
      }

      .bottom-right {
        display: flex;
        align-items: center;
        gap: 32px;
      }

      .payment-methods {
        display: flex;
        gap: 16px;
        font-size: 1.6rem;
        color: var(--text-muted);
      }

      .payment-methods i:hover {
        color: var(--text-secondary);
      }

      .extra-links {
        display: flex;
        gap: 24px;
      }
      .extra-links a {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.92rem;
        transition: color 0.2s;
      }
      .extra-links a:hover {
        color: #fff;
      }

      /* Media Queries */
      @media (max-width: 1200px) {
        .footer-main {
          grid-template-columns: 1fr;
          gap: 48px;
        }
        .footer-newsletter {
          flex-direction: column;
          text-align: center;
          padding: 40px;
        }
        .newsletter-content p {
          margin: 0 auto 24px;
        }
        .newsletter-form {
          width: 100%;
          max-width: 100%;
        }
      }

      @media (max-width: 768px) {
        .footer {
          margin-top: 48px;
          padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px) + 20px);
        }
        .footer-container {
          padding: 0 20px;
        }
        .footer-newsletter-wrap {
          padding-top: 36px;
          margin-bottom: 48px;
        }
        .footer-newsletter {
          flex-direction: column;
          text-align: center;
          padding: 28px 24px;
          border-radius: 20px;
          gap: 24px;
        }
        .newsletter-content h2 {
          font-size: 1.6rem;
          letter-spacing: -0.5px;
        }
        .newsletter-content p {
          font-size: 0.95rem;
          margin: 0 auto;
        }
        .newsletter-input-group {
          padding: 5px 5px 5px 16px;
        }
        .newsletter-btn {
          padding: 10px 18px;
          font-size: 0.9rem;
        }
        .footer-main {
          gap: 36px;
          margin-bottom: 48px;
        }
        .footer-logo {
          margin-bottom: 16px;
        }
        .logo-text {
          font-size: 1.5rem;
        }
        .footer-tagline {
          font-size: 0.95rem;
          margin-bottom: 24px;
        }
        .social-item {
          width: 42px;
          height: 42px;
          font-size: 1.2rem;
          border-radius: 12px;
        }
        .footer-nav {
          grid-template-columns: 1fr 1fr;
          gap: 28px 20px;
        }
        .nav-column h3 {
          font-size: 0.8rem;
          margin-bottom: 16px;
          letter-spacing: 1px;
        }
        .nav-list li {
          margin-bottom: 12px;
        }
        .nav-list a {
          font-size: 0.92rem;
        }
        .footer-divider {
          margin-bottom: 28px;
        }
        .footer-bottom {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .bottom-right {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          width: 100%;
        }
        .payment-methods {
          font-size: 1.4rem;
          gap: 12px;
        }
        .extra-links {
          gap: 20px;
        }
        .bottom-left p {
          font-size: 0.85rem;
        }
      }

      @media (max-width: 480px) {
        .footer-newsletter {
          padding: 24px 18px;
          border-radius: 16px;
        }
        .newsletter-content h2 {
          font-size: 1.4rem;
        }
        .newsletter-content p {
          font-size: 0.88rem;
        }
        .newsletter-input-group {
          flex-wrap: wrap;
          border-radius: 14px;
          padding: 10px 12px;
          gap: 8px;
        }
        .newsletter-input-group input {
          padding: 0;
          min-width: 0;
          width: 100%;
        }
        .newsletter-btn {
          width: 100%;
          justify-content: center;
          border-radius: 10px;
        }
        .footer-nav {
          grid-template-columns: 1fr 1fr;
          gap: 24px 16px;
        }
        .social-grid {
          gap: 12px;
        }
        .social-item {
          width: 40px;
          height: 40px;
          font-size: 1.1rem;
        }
        .payment-methods {
          font-size: 1.3rem;
          flex-wrap: wrap;
          gap: 10px;
        }
      }

      @media (max-width: 380px) {
        .footer-container {
          padding: 0 16px;
        }
        .footer-newsletter-wrap {
          padding-top: 28px;
          margin-bottom: 36px;
        }
        .footer-newsletter {
          padding: 20px 14px;
        }
        .newsletter-content h2 {
          font-size: 1.25rem;
        }
        .footer-nav {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .nav-column h3 {
          margin-bottom: 12px;
        }
        .logo-text {
          font-size: 1.35rem;
        }
        .footer-tagline {
          font-size: 0.88rem;
        }
        .footer-main {
          gap: 28px;
          margin-bottom: 36px;
        }
      }

      /* ────────────────────────────────────
         LIGHT MODE OVERRIDES
      ──────────────────────────────────── */
      :host-context(body.light-mode) .footer {
        background: #f4f5fb;
        color: #545878;
        border-top: 1px solid rgba(0, 0, 0, 0.07);
      }

      :host-context(body.light-mode) .footer-blur {
        background: radial-gradient(
          circle,
          rgba(79, 110, 247, 0.07) 0%,
          transparent 70%
        );
      }

      :host-context(body.light-mode) .footer-newsletter {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.07);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
      }

      :host-context(body.light-mode) .newsletter-content h2 {
        color: #11132a;
      }

      :host-context(body.light-mode) .newsletter-content p {
        color: #545878;
      }

      :host-context(body.light-mode) .newsletter-input-group {
        background: #f4f5fb;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      :host-context(body.light-mode) .newsletter-input-group:focus-within {
        background: #ffffff;
        border-color: var(--accent);
        box-shadow: 0 0 20px rgba(79, 110, 247, 0.15);
      }

      :host-context(body.light-mode) .newsletter-input-group i {
        color: #90949e;
      }

      :host-context(body.light-mode) .newsletter-input-group input {
        color: #11132a;
      }

      :host-context(body.light-mode) .newsletter-input-group input::placeholder {
        color: #90949e;
      }

      :host-context(body.light-mode) .logo-text {
        color: #11132a;
      }

      :host-context(body.light-mode) .footer-tagline {
        color: #545878;
      }

      :host-context(body.light-mode) .social-item {
        background: #eceef8;
        border: 1px solid rgba(0, 0, 0, 0.07);
        color: #545878;
      }

      :host-context(body.light-mode) .social-item:hover {
        background: rgba(79, 110, 247, 0.1);
        border-color: var(--accent);
        color: var(--accent);
      }

      :host-context(body.light-mode) .nav-column h3 {
        color: #11132a;
      }

      :host-context(body.light-mode) .nav-list a {
        color: #545878;
      }

      :host-context(body.light-mode) .nav-list a:hover {
        color: var(--accent);
      }

      :host-context(body.light-mode) .divider-line {
        background: linear-gradient(
          90deg,
          transparent,
          rgba(0, 0, 0, 0.08) 50%,
          transparent
        );
      }

      :host-context(body.light-mode) .back-to-top {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
      }

      :host-context(body.light-mode) .back-to-top:hover {
        background: var(--accent);
        color: #fff;
        box-shadow: 0 15px 30px rgba(79, 110, 247, 0.25);
      }

      :host-context(body.light-mode) .bottom-left p {
        color: #90949e;
      }

      :host-context(body.light-mode) .bottom-left strong {
        color: #11132a;
      }

      :host-context(body.light-mode) .payment-methods {
        color: #90949e;
      }

      :host-context(body.light-mode) .payment-methods i:hover {
        color: #545878;
      }

      :host-context(body.light-mode) .extra-links a {
        color: #90949e;
      }

      :host-context(body.light-mode) .extra-links a:hover {
        color: #11132a;
      }
    `,
  ],
})
export class FooterComponent {
  year = new Date().getFullYear();
  newsletterEmail = '';
  newsletterLoading = false;
  newsletterMessage = '';
  newsletterSuccess = false;

  constructor(
    private newsletterService: NewsletterService,
    private notificationService: NotificationService
  ) { }

  onSubscribe(event: Event) {
    event.preventDefault();
    if (!this.newsletterEmail) return;
    this.newsletterLoading = true;
    this.newsletterMessage = '';
    this.newsletterSuccess = false;
    this.newsletterService.subscribe(this.newsletterEmail).subscribe({
      next: (res) => {
        this.newsletterMessage = res.message || 'Subscribed successfully!';
        this.newsletterSuccess = true;
        this.newsletterEmail = '';
        if (this.newsletterSuccess) {
          this.notificationService.success('Subscribed successfully!', 'You have joined the newsletter.');
        }
      },
      error: (err) => {
        this.newsletterMessage = err?.error?.message || 'Subscription failed.';
        this.newsletterSuccess = false;
      },
      complete: () => {
        this.newsletterLoading = false;
      },
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
