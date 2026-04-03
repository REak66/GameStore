import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmConfig {
  title?: string;
  description?: string;
  okText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'warning';
  icon?: string;
  /** Anchor element rect for bubble positioning */
  anchorRect?: DOMRect;
}

export interface ConfirmState {
  visible: boolean;
  config: ConfirmConfig;
  resolve: ((v: boolean) => void) | null;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private _state = new BehaviorSubject<ConfirmState>({
    visible: false,
    config: {},
    resolve: null,
  });
  state$ = this._state.asObservable();

  /**
   * Show a confirmation bubble. Returns a Promise<boolean> —
   * true when the user clicks OK, false when cancelled.
   */
  confirm(config: ConfirmConfig = {}): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._state.next({ visible: true, config, resolve });
    });
  }

  /** Called internally by the host component */
  _resolve(value: boolean) {
    const state = this._state.value;
    if (state.resolve) state.resolve(value);
    this._state.next({ visible: false, config: {}, resolve: null });
  }
}
