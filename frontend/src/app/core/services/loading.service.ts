import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();
  private _loadingCount = 0;

  show() {
    this._loadingCount++;
    this._loading.next(true);
  }

  hide() {
    if (this._loadingCount > 0) {
      this._loadingCount--;
    }
    if (this._loadingCount === 0) {
      this._loading.next(false);
    }
  }

  reset() {
    this._loadingCount = 0;
    this._loading.next(false);
  }
}
