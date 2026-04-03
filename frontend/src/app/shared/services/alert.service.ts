import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
  open: boolean;
  type: AlertType;
  title: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private _state = new BehaviorSubject<AlertState>({
    open: false,
    type: 'success',
    title: '',
  });
  state$ = this._state.asObservable();

  private show(type: AlertType, title: string, description?: string) {
    this._state.next({ open: true, type, title, description });
  }

  success(title: string, description?: string) {
    this.show('success', title, description);
  }
  error(title: string, description?: string) {
    this.show('error', title, description);
  }
  warning(title: string, description?: string) {
    this.show('warning', title, description);
  }
  info(title: string, description?: string) {
    this.show('info', title, description);
  }

  close() {
    this._state.next({ ...this._state.value, open: false });
  }
}
