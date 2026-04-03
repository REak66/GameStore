import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  description?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _counter = 0;
  private _items = new BehaviorSubject<NotificationItem[]>([]);
  items$ = this._items.asObservable();

  private show(
    type: NotificationType,
    title: string,
    description?: string,
    duration = 4500,
  ) {
    const id = ++this._counter;
    this._items.next([
      ...this._items.value,
      { id, type, title, description, duration },
    ]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(title: string, description?: string, duration = 4500) {
    return this.show('success', title, description, duration);
  }
  error(title: string, description?: string, duration = 6000) {
    return this.show('error', title, description, duration);
  }
  warning(title: string, description?: string, duration = 5000) {
    return this.show('warning', title, description, duration);
  }
  info(title: string, description?: string, duration = 4500) {
    return this.show('info', title, description, duration);
  }

  dismiss(id: number) {
    this._items.next(this._items.value.filter((n) => n.id !== id));
  }
}
