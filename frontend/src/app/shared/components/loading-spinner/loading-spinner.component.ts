import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styles: [
    `
      .spinner-overlay {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 60px;
      }
      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--border, #e5e7eb);
        border-top-color: var(--accent, #4f6ef7);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent { }
