import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-scroll-to-bottom',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scroll-to-bottom.component.html',
  styleUrls: ['./scroll-to-bottom.component.scss'],
})
export class ScrollToBottomComponent {
  atBottom = false;

  @HostListener('window:scroll')
  @HostListener('window:resize')
  checkIfAtBottom() {
    const scrollY = window.scrollY || window.pageYOffset;
    const visible = window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    // Allow a small threshold for floating point errors
    this.atBottom = scrollY + visible >= pageHeight - 2;
  }

  ngOnInit() {
    this.checkIfAtBottom();
  }

  scroll() {
    if (this.atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }
}
