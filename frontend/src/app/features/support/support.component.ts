import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService, STORAGE_KEY_AI_CHAT_PREFIX } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { AiFormatPipe } from './ai-format.pipe';

type SupportTab = 'help-center' | 'contact-support' | 'refund-policy' | 'terms-of-service';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AiFormatPipe],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatWindow') private chatWindow!: ElementRef;

  activeTab: SupportTab = 'help-center';
  faqSearch = '';
  contactLoading = false;
  showSubjectMenu = false;

  // AI chat state
  aiMessages: ChatMessage[] = [];
  aiInput = '';
  aiLoading = false;
  private aiHistory: { role: 'user' | 'model'; text: string }[] = [];
  private chatStorageKey: string | null = null;
  private authSub?: Subscription;
  aiChips = [
    'How do I get my game key?',
    'What is the refund policy?',
    'My key doesn\'t work',
    'How to reset password?',
  ];

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
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as SupportTab;
      if (tab && this.tabs.some(t => t.id === tab)) {
        this.activeTab = tab;
      }
    });

    // Restore chat from localStorage when user is known
    this.authSub = this.auth.currentUser$.subscribe(user => {
      if (user?.id) {
        this.chatStorageKey = `${STORAGE_KEY_AI_CHAT_PREFIX}${user.id}`;
        this.loadChatFromStorage();
      } else {
        // Guest — use a session-scoped key (cleared on tab close via sessionStorage)
        this.chatStorageKey = null;
        this.aiMessages = [];
        this.aiHistory = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  private loadChatFromStorage(): void {
    if (!this.chatStorageKey) return;
    try {
      const raw = localStorage.getItem(this.chatStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { messages: { role: string; text: string; time: string }[]; history: { role: string; text: string }[] };
      this.aiMessages = (saved.messages || []).map(m => ({ ...m, time: new Date(m.time) })) as ChatMessage[];
      this.aiHistory = (saved.history || []) as { role: 'user' | 'model'; text: string }[];
      this.shouldScrollChat = true;
    } catch { /* corrupt data — ignore */ }
  }

  private saveChatToStorage(): void {
    if (!this.chatStorageKey) return;
    try {
      // Keep last 50 messages to avoid storage bloat
      const toSave = {
        messages: this.aiMessages.slice(-50),
        history: this.aiHistory.slice(-20),
      };
      localStorage.setItem(this.chatStorageKey, JSON.stringify(toSave));
    } catch { /* storage full — ignore */ }
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

  private shouldScrollChat = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) {
      this.scrollChatToBottom();
      this.shouldScrollChat = false;
    }
  }

  private scrollChatToBottom(): void {
    try {
      const el: HTMLElement = this.chatWindow.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }

  sendChip(chip: string): void {
    this.aiInput = chip;
    this.sendAiMessage();
  }

  sendAiMessage(): void {
    const question = this.aiInput.trim();
    if (!question || this.aiLoading) return;
    this.aiInput = '';

    this.aiMessages.push({ role: 'user', text: question, time: new Date() });
    this.aiHistory.push({ role: 'user', text: question });
    this.shouldScrollChat = true;
    this.aiLoading = true;

    this.http.post<{ success: boolean; answer: string; message?: string }>(
      `${environment.apiUrl}/api/support/ai-ask`,
      { question, history: this.aiHistory.slice(-10) }
    ).subscribe({
      next: (res) => {
        this.aiLoading = false;
        const answer = res.answer || 'Sorry, I couldn\'t generate a response. Please try again.';
        this.aiMessages.push({ role: 'bot', text: answer, time: new Date() });
        this.aiHistory.push({ role: 'model', text: answer });
        this.shouldScrollChat = true;
        this.saveChatToStorage();
      },
      error: (err) => {
        this.aiLoading = false;
        const msg = err?.error?.message || 'AI service is temporarily unavailable. Please try again later.';
        this.aiMessages.push({ role: 'bot', text: msg, time: new Date() });
        this.shouldScrollChat = true;
        this.saveChatToStorage();
      },
    });
  }
}
