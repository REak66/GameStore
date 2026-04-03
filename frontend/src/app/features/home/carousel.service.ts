import { Injectable } from '@angular/core';
import { Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private heroIndex = 0;
  private heroProgress = 0;
  private heroTimer: any;
  private progressTimer: any;
  private readonly SLIDE_DURATION = 5000;

  get index() {
    return this.heroIndex;
  }
  get progress() {
    return this.heroProgress;
  }

  startCarousel(productCount: number, onIndexChange: (index: number) => void, onProgress: (progress: number) => void) {
    this.heroProgress = 0;
    this.stopCarousel();
    const step = 100 / (this.SLIDE_DURATION / 100);
    this.progressTimer = setInterval(() => {
      this.heroProgress += step;
      onProgress(this.heroProgress);
      if (this.heroProgress >= 100) {
        this.heroProgress = 0;
        this.heroIndex = (this.heroIndex + 1) % productCount;
        onIndexChange(this.heroIndex);
      }
    }, 100);
  }

  stopCarousel() {
    clearInterval(this.heroTimer);
    clearInterval(this.progressTimer);
  }

  prevHero(productCount: number, onIndexChange: (index: number) => void) {
    this.heroIndex = (this.heroIndex - 1 + productCount) % productCount;
    this.heroProgress = 0;
    onIndexChange(this.heroIndex);
  }

  nextHero(productCount: number, onIndexChange: (index: number) => void) {
    this.heroIndex = (this.heroIndex + 1) % productCount;
    this.heroProgress = 0;
    onIndexChange(this.heroIndex);
  }

  goToSlide(i: number, onIndexChange: (index: number) => void) {
    this.heroIndex = i;
    this.heroProgress = 0;
    onIndexChange(this.heroIndex);
  }
}
