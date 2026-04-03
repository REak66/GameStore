import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../shared/services/notification.service';
import { environment } from '../../../environments/environment';

type SupportTab = 'help-center' | 'contact-support' | 'refund-policy' | 'terms-of-service';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="support-page">
      <!-- Page Header -->
      <div class="support-hero">
        <div class="hero-blur"></div>
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-headset"></i>
          </div>
          <h1>Support Center</h1>
          <p>We're here to help. Find answers, contact us, or read our policies.</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="support-tabs-wrap">
        <nav class="support-tabs" role="tablist" aria-label="Support sections">
          <button
            *ngFor="let tab of tabs"
            class="tab-btn"
            [class.active]="activeTab === tab.id"
            (click)="setTab(tab.id)"
            role="tab"
            [attr.aria-selected]="activeTab === tab.id"
          >
            <i [class]="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="support-content">

        <!-- ── Help Center ── -->
        <section *ngIf="activeTab === 'help-center'" class="tab-panel fade-in" role="tabpanel">
          <div class="section-header">
            <h2><i class="fas fa-question-circle"></i> Help Center</h2>
            <p>Browse frequently asked questions to quickly find the answer you need.</p>
          </div>

          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search questions…"
              [(ngModel)]="faqSearch"
              aria-label="Search FAQ"
            />
          </div>

          <div class="faq-list">
            <div
              class="faq-item"
              *ngFor="let item of filteredFaqs"
              [class.open]="item.open"
            >
              <button class="faq-question" (click)="item.open = !item.open" [attr.aria-expanded]="item.open">
                <span>{{ item.question }}</span>
                <i class="fas" [class.fa-plus]="!item.open" [class.fa-minus]="item.open"></i>
              </button>
              <div class="faq-answer" *ngIf="item.open">
                <p>{{ item.answer }}</p>
              </div>
            </div>
            <p class="no-results" *ngIf="filteredFaqs.length === 0">
              No matching questions found.
            </p>
          </div>
        </section>

        <!-- ── Contact Support ── -->
        <section *ngIf="activeTab === 'contact-support'" class="tab-panel fade-in" role="tabpanel">
          <div class="section-header">
            <h2><i class="fas fa-envelope-open-text"></i> Contact Support</h2>
            <p>Can't find your answer? Send us a message and we'll respond within 24 hours.</p>
          </div>

          <div class="contact-grid">
            <!-- Contact Cards -->
            <div class="contact-cards">
              <div class="contact-card">
                <div class="card-icon"><i class="fas fa-bolt"></i></div>
                <h3>Live Chat</h3>
                <p>Available Mon–Fri, 9 AM – 6 PM (UTC+7). Fastest response.</p>
                <a href="https://t.me/reakzyy98" target="_blank" rel="noopener noreferrer" class="btn btn-accent">
                  <i class="fab fa-telegram-plane"></i> Start Chat
                </a>
              </div>
              <div class="contact-card">
                <div class="card-icon"><i class="fas fa-envelope"></i></div>
                <h3>Email Support</h3>
                <p>For detailed issues or billing inquiries. Reply within 24 hours.</p>
                <a href="mailto:support@gamestore.com" class="btn btn-outline">
                  <i class="fas fa-paper-plane"></i> Send Email
                </a>
              </div>
              <div class="contact-card">
                <div class="card-icon"><i class="fab fa-facebook-f"></i></div>
                <h3>Social Media</h3>
                <p>Reach us on Facebook for quick non-sensitive questions.</p>
                <a href="https://www.facebook.com/share/1AUMXofj43/" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                  <i class="fab fa-facebook"></i> Message Us
                </a>
              </div>
            </div>

            <!-- Contact Form -->
            <form class="contact-form" (submit)="onContactSubmit($event)" autocomplete="off">
              <h3>Send a Message</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="contact-name">Your Name</label>
                  <input id="contact-name" type="text" name="name" [(ngModel)]="contactForm.name"
                    placeholder="John Doe" required />
                </div>
                <div class="form-group">
                  <label for="contact-email">Email Address</label>
                  <input id="contact-email" type="email" name="email" [(ngModel)]="contactForm.email"
                    placeholder="john@example.com" required />
                </div>
              </div>
              <div class="form-group">
                <label>Subject</label>
                <div class="custom-select" [class.open]="showSubjectMenu">
                  <button type="button" class="select-trigger"
                    (click)="showSubjectMenu = !showSubjectMenu"
                    (blur)="closeSubjectMenuDelayed()">
                    <ng-container *ngIf="contactForm.subject; else noSubject">
                      <i [class]="getSubjectOpt(contactForm.subject)?.icon"
                         [style.color]="getSubjectOpt(contactForm.subject)?.color"></i>
                      <span>{{ getSubjectOpt(contactForm.subject)?.label }}</span>
                    </ng-container>
                    <ng-template #noSubject>
                      <span class="select-placeholder">Select a topic…</span>
                    </ng-template>
                    <i class="fas fa-chevron-down select-arrow"></i>
                  </button>
                  <div class="select-menu" *ngIf="showSubjectMenu">
                    <button
                      *ngFor="let opt of subjectOptions"
                      type="button"
                      class="select-option"
                      [class.selected]="contactForm.subject === opt.value"
                      (mousedown)="selectSubject(opt.value)">
                      <span class="opt-icon" [style.color]="opt.color"><i [class]="opt.icon"></i></span>
                      <span class="opt-label">{{ opt.label }}</span>
                      <i class="fas fa-check opt-check" *ngIf="contactForm.subject === opt.value"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="contact-message">Message</label>
                <textarea id="contact-message" name="message" [(ngModel)]="contactForm.message"
                  placeholder="Describe your issue in detail…" rows="5" required></textarea>
              </div>
              <button type="submit" class="btn btn-accent btn-full" [disabled]="contactLoading">
                <i class="fas fa-paper-plane"></i>
                {{ contactLoading ? 'Sending…' : 'Send Message' }}
              </button>
            </form>
          </div>
        </section>

        <!-- ── Refund Policy ── -->
        <section *ngIf="activeTab === 'refund-policy'" class="tab-panel fade-in" role="tabpanel">
          <div class="section-header">
            <h2><i class="fas fa-undo-alt"></i> Refund Policy</h2>
            <p>Last updated: April 1, 2026</p>
          </div>

          <div class="policy-doc">
            <div class="policy-toc">
              <h4>Table of Contents</h4>
              <ol>
                <li><a href="#refund-overview">Overview</a></li>
                <li><a href="#refund-eligibility">Eligibility</a></li>
                <li><a href="#refund-process">How to Request</a></li>
                <li><a href="#refund-timeline">Processing Time</a></li>
                <li><a href="#refund-exceptions">Exceptions</a></li>
              </ol>
            </div>

            <div class="policy-body">
              <div class="policy-section" id="refund-overview">
                <h3>1. Overview</h3>
                <p>
                  At GameStore, your satisfaction is our priority. We want you to enjoy every purchase.
                  If you are not happy with your order, we offer refunds under the conditions described
                  in this policy. By purchasing from us you agree to the terms below.
                </p>
              </div>

              <div class="policy-section" id="refund-eligibility">
                <h3>2. Eligibility</h3>
                <p>You may be eligible for a refund if:</p>
                <ul>
                  <li>The item has not been downloaded or activated (for digital keys).</li>
                  <li>You request a refund within <strong>7 days</strong> of purchase.</li>
                  <li>The product is technically defective and we are unable to resolve the issue.</li>
                  <li>You were charged incorrectly or more than once for the same item.</li>
                </ul>
              </div>

              <div class="policy-section" id="refund-process">
                <h3>3. How to Request a Refund</h3>
                <ol>
                  <li>Navigate to <strong>My Orders</strong> in your account.</li>
                  <li>Select the affected order and click <strong>Request Refund</strong>.</li>
                  <li>Fill in the reason and submit your request.</li>
                  <li>Our team will review and respond within 2 business days.</li>
                </ol>
                <p>Alternatively, you can contact us via the <button class="link-btn" (click)="setTab('contact-support')">Contact Support</button> tab.</p>
              </div>

              <div class="policy-section" id="refund-timeline">
                <h3>4. Processing Time</h3>
                <p>
                  Once approved, refunds are processed within <strong>3–5 business days</strong>.
                  The time it takes for the amount to reflect in your account depends on your payment provider.
                </p>
                <div class="info-box">
                  <i class="fas fa-info-circle"></i>
                  <span>Credit/debit card refunds may take up to 10 business days depending on your bank.</span>
                </div>
              </div>

              <div class="policy-section" id="refund-exceptions">
                <h3>5. Exceptions</h3>
                <p>Refunds are <strong>not available</strong> for:</p>
                <ul>
                  <li>Digital keys that have already been redeemed or activated.</li>
                  <li>Purchases older than 7 days.</li>
                  <li>Items purchased during a promotional or bundle sale (unless defective).</li>
                  <li>Accounts that show signs of abuse of the refund system.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Terms of Service ── -->
        <section *ngIf="activeTab === 'terms-of-service'" class="tab-panel fade-in" role="tabpanel">
          <div class="section-header">
            <h2><i class="fas fa-file-contract"></i> Terms of Service</h2>
            <p>Last updated: April 1, 2026</p>
          </div>

          <div class="policy-doc">
            <div class="policy-toc">
              <h4>Table of Contents</h4>
              <ol>
                <li><a href="#tos-acceptance">Acceptance of Terms</a></li>
                <li><a href="#tos-account">Account Responsibilities</a></li>
                <li><a href="#tos-products">Products & Purchases</a></li>
                <li><a href="#tos-ip">Intellectual Property</a></li>
                <li><a href="#tos-prohibited">Prohibited Conduct</a></li>
                <li><a href="#tos-liability">Limitation of Liability</a></li>
                <li><a href="#tos-changes">Changes to Terms</a></li>
              </ol>
            </div>

            <div class="policy-body">
              <div class="policy-section" id="tos-acceptance">
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By accessing or using GameStore, you agree to be bound by these Terms of Service
                  and our Privacy Policy. If you do not agree, please do not use our services.
                  These terms apply to all visitors, users, and others who access the service.
                </p>
              </div>

              <div class="policy-section" id="tos-account">
                <h3>2. Account Responsibilities</h3>
                <p>You are responsible for:</p>
                <ul>
                  <li>Maintaining the confidentiality of your login credentials.</li>
                  <li>All activity that occurs under your account.</li>
                  <li>Notifying us immediately of any unauthorized access.</li>
                  <li>Providing accurate and current information when registering.</li>
                </ul>
                <p>You must be at least 13 years old to create an account.</p>
              </div>

              <div class="policy-section" id="tos-products">
                <h3>3. Products & Purchases</h3>
                <p>
                  All products listed on GameStore are subject to availability. Prices are displayed
                  in USD and may change without prior notice. Once an order is placed and confirmed,
                  it is subject to our <button class="link-btn" (click)="setTab('refund-policy')">Refund Policy</button>.
                </p>
                <div class="info-box">
                  <i class="fas fa-shield-alt"></i>
                  <span>All purchases are secured with industry-standard encryption.</span>
                </div>
              </div>

              <div class="policy-section" id="tos-ip">
                <h3>4. Intellectual Property</h3>
                <p>
                  All content on GameStore — including logos, graphics, text, and software — is the
                  property of GameStore or its licensors and is protected by copyright laws.
                  You may not reproduce, distribute, or create derivative works without explicit permission.
                </p>
              </div>

              <div class="policy-section" id="tos-prohibited">
                <h3>5. Prohibited Conduct</h3>
                <p>You agree not to:</p>
                <ul>
                  <li>Use the platform for any unlawful purpose.</li>
                  <li>Attempt to gain unauthorized access to any part of the service.</li>
                  <li>Reverse-engineer, scrape, or copy any part of the platform.</li>
                  <li>Submit false, misleading, or fraudulent information.</li>
                  <li>Harass, abuse, or harm other users.</li>
                </ul>
              </div>

              <div class="policy-section" id="tos-liability">
                <h3>6. Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law, GameStore shall not be liable for any
                  indirect, incidental, special, or consequential damages arising from your use of
                  the service. Our total liability for any claim shall not exceed the amount paid
                  by you for the relevant purchase.
                </p>
              </div>

              <div class="policy-section" id="tos-changes">
                <h3>7. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these Terms at any time. Changes take effect
                  immediately upon posting. Continued use of GameStore after changes constitutes
                  your acceptance of the revised Terms. We encourage you to review this page periodically.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    /* ─── Page Shell ─────────────────────────────────── */
    .support-page {
      min-height: 100vh;
      padding-bottom: 80px;
    }

    /* ─── Hero ───────────────────────────────────────── */
    .support-hero {
      position: relative;
      text-align: center;
      padding: 72px 24px 60px;
      overflow: hidden;
    }
    .hero-blur {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 80% 60% at 50% -10%,
        rgba(79, 110, 247, 0.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 72px; height: 72px;
      border-radius: 20px;
      background: rgba(79, 110, 247, 0.15);
      border: 1px solid rgba(79, 110, 247, 0.35);
      font-size: 2rem;
      color: var(--accent);
      margin-bottom: 20px;
    }
    .support-hero h1 {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      color: var(--text-white);
      margin-bottom: 12px;
    }
    .support-hero p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      max-width: 500px;
      margin: 0 auto;
    }

    /* ─── Tab Nav ────────────────────────────────────── */
    .support-tabs-wrap {
      display: flex;
      justify-content: center;
      padding: 0 24px;
      margin-bottom: 48px;
    }
    .support-tabs {
      display: flex;
      gap: 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 6px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-btn:hover { color: var(--text-white); background: rgba(255,255,255,0.05); }
    .tab-btn.active {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 4px 16px rgba(79, 110, 247, 0.35);
    }

    /* ─── Content Area ───────────────────────────────── */
    .support-content {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .fade-in {
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .section-header {
      margin-bottom: 36px;
    }
    .section-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-white);
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .section-header h2 i { color: var(--accent); }
    .section-header p { color: var(--text-secondary); font-size: 0.95rem; }

    /* ─── Help Center / FAQ ──────────────────────────── */
    .search-bar {
      position: relative;
      margin-bottom: 28px;
    }
    .search-bar i {
      position: absolute;
      left: 16px; top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
    }
    .search-bar input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-white);
      font-family: inherit;
      font-size: 0.95rem;
      padding: 12px 16px 12px 44px;
      transition: border-color 0.2s;
      outline: none;
    }
    .search-bar input:focus { border-color: var(--accent); }
    .search-bar input::placeholder { color: var(--text-secondary); }

    .faq-list { display: flex; flex-direction: column; gap: 10px; }
    .faq-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .faq-item.open { border-color: var(--border-active); }
    .faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: none;
      border: none;
      color: var(--text-white);
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      gap: 12px;
    }
    .faq-question i { color: var(--accent); flex-shrink: 0; }
    .faq-answer {
      padding: 0 20px 18px;
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.7;
    }
    .no-results {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    /* ─── Contact Support ────────────────────────────── */
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    @media (max-width: 720px) { .contact-grid { grid-template-columns: 1fr; } }

    .contact-cards { display: flex; flex-direction: column; gap: 16px; }
    .contact-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 22px;
      transition: border-color 0.2s, transform 0.2s;
    }
    .contact-card:hover { border-color: var(--border-active); transform: translateY(-2px); }
    .card-icon {
      width: 42px; height: 42px;
      border-radius: 10px;
      background: rgba(79, 110, 247, 0.12);
      display: flex; align-items: center; justify-content: center;
      color: var(--accent);
      font-size: 1.2rem;
      margin-bottom: 12px;
    }
    .contact-card h3 { color: var(--text-white); font-size: 1rem; margin-bottom: 6px; }
    .contact-card p { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 14px; line-height: 1.5; }

    /* ─── Buttons ────────────────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-accent {
      background: var(--accent);
      color: #fff;
    }
    .btn-accent:hover { background: var(--accent-dark); }
    .btn-accent:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline {
      background: transparent;
      color: var(--accent);
      border: 1px solid rgba(79, 110, 247, 0.4);
    }
    .btn-outline:hover { background: rgba(79, 110, 247, 0.1); }
    .btn-full { width: 100%; justify-content: center; padding: 13px; }

    /* ─── Contact Form ───────────────────────────────── */
    .contact-form {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
    }
    .contact-form h3 {
      color: var(--text-white);
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 520px) { .form-row { grid-template-columns: 1fr; } }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .form-group label {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-white);
      font-family: inherit;
      font-size: 0.9rem;
      padding: 10px 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus { border-color: var(--accent); }
    .form-group input::placeholder,
    .form-group textarea::placeholder { color: #5a5e80; }
    .form-group select option { background: var(--bg-card); }
    .form-group textarea { resize: vertical; }

    /* ─── Custom Subject Select ──────────────────────── */
    .custom-select {
      position: relative;
      user-select: none;
    }
    .select-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-white);
      font-family: inherit;
      font-size: 0.9rem;
      padding: 10px 14px;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s;
    }
    .select-trigger:focus,
    .custom-select.open .select-trigger { border-color: var(--accent); }
    .select-placeholder { color: #5a5e80; flex: 1; }
    .select-trigger span:not(.select-placeholder) { flex: 1; }
    .select-arrow {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-left: auto;
      transition: transform 0.2s;
    }
    .custom-select.open .select-arrow { transform: rotate(180deg); }
    .select-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0; right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-active);
      border-radius: var(--radius-sm);
      padding: 6px;
      z-index: 200;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .select-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 0.875rem;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      width: 100%;
    }
    .select-option:hover { background: rgba(255,255,255,0.06); color: var(--text-white); }
    .select-option.selected { background: rgba(79,110,247,0.12); color: var(--text-white); }
    .opt-icon { width: 20px; text-align: center; font-size: 0.95rem; flex-shrink: 0; }
    .opt-label { flex: 1; }
    .opt-check { font-size: 0.75rem; color: var(--accent); margin-left: auto; }

    /* ─── Policy Doc ─────────────────────────────────── */
    .policy-doc {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 36px;
      align-items: start;
    }
    @media (max-width: 720px) { .policy-doc { grid-template-columns: 1fr; } }

    .policy-toc {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 20px;
      position: sticky;
      top: 84px;
    }
    .policy-toc h4 {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .policy-toc ol {
      list-style: decimal;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .policy-toc a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    .policy-toc a:hover { color: var(--accent); }

    .policy-section {
      margin-bottom: 36px;
    }
    .policy-section h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-white);
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .policy-section p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.8;
      margin-bottom: 10px;
    }
    .policy-section ul, .policy-section ol {
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
    }
    .policy-section li {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.7;
    }
    .policy-section strong { color: var(--text-white); }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(79, 110, 247, 0.1);
      border: 1px solid rgba(79, 110, 247, 0.25);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      margin-top: 14px;
    }
    .info-box i { color: var(--accent); margin-top: 2px; flex-shrink: 0; }
    .info-box span { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6; }

    .link-btn {
      background: none;
      border: none;
      color: var(--accent);
      font-family: inherit;
      font-size: inherit;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }
    .link-btn:hover { color: var(--accent-dark); }
  `]
})
export class SupportComponent implements OnInit {
  activeTab: SupportTab = 'help-center';
  faqSearch = '';
  contactLoading = false;
  showSubjectMenu = false;

  contactForm = { name: '', email: '', subject: '', message: '' };

  subjectOptions: { value: string; label: string; icon: string; color: string }[] = [
    { value: 'order', label: 'Order Issue', icon: 'fas fa-box', color: '#f59e0b' },
    { value: 'payment', label: 'Payment Problem', icon: 'fas fa-credit-card', color: '#10b981' },
    { value: 'account', label: 'Account Access', icon: 'fas fa-lock', color: '#6366f1' },
    { value: 'refund', label: 'Refund Request', icon: 'fas fa-undo-alt', color: '#ec4899' },
    { value: 'technical', label: 'Technical Problem', icon: 'fas fa-wrench', color: '#ef4444' },
    { value: 'suggestion', label: 'Suggestion / Feedback', icon: 'fas fa-lightbulb', color: '#eab308' },
    { value: 'other', label: 'Other', icon: 'fas fa-question-circle', color: '#94a3b8' },
  ];

  getSubjectOpt(value: string) {
    return this.subjectOptions.find(o => o.value === value);
  }

  selectSubject(value: string): void {
    this.contactForm.subject = value;
    this.showSubjectMenu = false;
  }

  closeSubjectMenuDelayed(): void {
    setTimeout(() => { this.showSubjectMenu = false; }, 150);
  }

  tabs: { id: SupportTab; label: string; icon: string }[] = [
    { id: 'help-center', label: 'Help Center', icon: 'fas fa-question-circle' },
    { id: 'contact-support', label: 'Contact Support', icon: 'fas fa-headset' },
    { id: 'refund-policy', label: 'Refund Policy', icon: 'fas fa-undo-alt' },
    { id: 'terms-of-service', label: 'Terms of Service', icon: 'fas fa-file-contract' },
  ];

  faqs: FaqItem[] = [
    {
      question: 'How do I download my purchased game?',
      answer: 'After completing your purchase, go to My Orders, find your order, and click the download link next to the product. Your activation key or download link will be available there.',
      open: false,
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, Mastercard, PayPal, Apple Pay, and cryptocurrency (Bitcoin). All transactions are secured with encryption.',
      open: false,
    },
    {
      question: 'Can I cancel my order after placing it?',
      answer: 'You can cancel your order within 1 hour of placing it, provided the digital key has not been delivered yet. Go to My Orders and click "Cancel Order". Once a key is delivered, cancellation is no longer possible.',
      open: false,
    },
    {
      question: 'My activation key doesn\'t work — what should I do?',
      answer: 'First, double-check you are entering the key on the correct platform (Steam, Epic, etc.). If it still fails, contact us via the Contact Support tab with your order number and we\'ll issue a replacement within 24 hours.',
      open: false,
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page and enter your registered email. You will receive a password reset link shortly. Check your spam folder if it doesn\'t arrive within a few minutes.',
      open: false,
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes. We use industry-standard encryption, and we never store your payment card details on our servers. Please refer to our Privacy Policy for full details.',
      open: false,
    },
    {
      question: 'How long does it take to receive my order?',
      answer: 'Digital items are delivered instantly after payment confirmation. Physical merchandise (if applicable) ships within 3–5 business days.',
      open: false,
    },
    {
      question: 'Can I use my account on multiple devices?',
      answer: 'Yes, you can log in to GameStore from multiple devices. However, for security reasons, logging in from a new device may require email verification.',
      open: false,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notification: NotificationService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as SupportTab;
      if (tab && this.tabs.some(t => t.id === tab)) {
        this.activeTab = tab;
      }
    });
  }

  setTab(tab: SupportTab): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  get filteredFaqs(): FaqItem[] {
    if (!this.faqSearch.trim()) return this.faqs;
    const q = this.faqSearch.toLowerCase();
    return this.faqs.filter(
      f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }

  onContactSubmit(event: Event): void {
    event.preventDefault();
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.notification.error('Please fill in all required fields.');
      return;
    }
    this.contactLoading = true;
    this.http.post<{ success: boolean; message: string }>(
      `${environment.apiUrl}/api/support/contact`,
      this.contactForm
    ).subscribe({
      next: (res) => {
        this.contactLoading = false;
        this.notification.success(res.message || 'Message sent! We\'ll get back to you within 24 hours.');
        this.contactForm = { name: '', email: '', subject: '', message: '' };
      },
      error: (err) => {
        this.contactLoading = false;
        const msg = err?.error?.message || 'Failed to send message. Please try again.';
        this.notification.error(msg);
      },
    });
  }
}
