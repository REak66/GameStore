import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface MessageItem {
  id: number;
  type: MessageType;
  text: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private _counter = 0;
  private _messages = new BehaviorSubject<MessageItem[]>([]);
  messages$ = this._messages.asObservable();

  private show(type: MessageType, text: string, duration = 4000) {
    const id = ++this._counter;
    const item: MessageItem = { id, type, text, duration };
    this._messages.next([...this._messages.value, item]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(text: string, duration = 3000) {
    return this.show('success', text, duration);
  }
  error(text: string, duration = 4000) {
    return this.show('error', text, duration);
  }
  warning(text: string, duration = 3500) {
    return this.show('warning', text, duration);
  }
  info(text: string, duration = 3000) {
    return this.show('info', text, duration);
  }
  loading(text: string, duration = 2000) {
    return this.show('loading', text, duration);
  }

  dismiss(id: number) {
    this._messages.next(this._messages.value.filter((m) => m.id !== id));
  }
}
