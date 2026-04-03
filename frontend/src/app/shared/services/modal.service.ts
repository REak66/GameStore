import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  title?: string;
  width?: string;
  closable?: boolean;
  footer?: TemplateRef<any> | null;
}

export interface ModalState {
  open: boolean;
  title: string;
  width: string;
  closable: boolean;
  content: TemplateRef<any> | null;
  footer: TemplateRef<any> | null | undefined;
  context: any;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _state = new BehaviorSubject<ModalState>({
    open: false,
    title: '',
    width: '520px',
    closable: true,
    content: null,
    footer: undefined,
    context: null,
  });

  state$ = this._state.asObservable();

  open(content: TemplateRef<any>, config: ModalConfig = {}, context: any = {}) {
    this._state.next({
      open: true,
      title: config.title ?? '',
      width: config.width ?? '520px',
      closable: config.closable !== false,
      content,
      footer: config.footer,
      context,
    });
  }

  close() {
    this._state.next({ ...this._state.value, open: false });
  }
}
