import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars">
      <span
        *ngFor="let star of stars"
        class="star"
        [class.filled]="star <= rating"
        [class.half]="isHalf(star)"
      >
        <i class="fas fa-star"></i>
      </span>
    </div>
  `,
  styles: [
    `
      .stars {
        display: flex;
        gap: 2px;
      }
      .star {
        font-size: 0.85rem;
        color: #6b7280;
        transition: color 0.2s;
      }
      .star.filled {
        color: #f59e0b;
      }
      .star.half {
        color: #f59e0b;
        opacity: 0.5;
      }

      :host-context(body.light-mode) .star {
        color: #000000;
      }
      :host-context(body.light-mode) .star.filled {
        color: #f59e0b;
      }
      :host-context(body.light-mode) .star.half {
        color: #f59e0b;
        opacity: 0.5;
      }
    `,
  ],
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  stars = [1, 2, 3, 4, 5];

  isHalf(star: number): boolean {
    return this.rating > star - 1 && this.rating < star;
  }
}
