import {
  Directive,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  OnDestroy,
} from '@angular/core';
import { PopconfirmComponent } from './popconfirm.component';

/**
 * PopconfirmDirective — attach to any element to show an anchored
 * confirmation bubble on click.
 *
 * Usage:
 *   <button
 *     appPopconfirm="Delete this item?"
 *     popDescription="This action cannot be undone."
 *     popType="danger"
 *     popOkText="Delete"
 *     popPlacement="top"
 *     (popConfirm)="handleDelete()"
 *     (popCancel)="handleCancel()">
 *     Delete
 *   </button>
 */
@Directive({
  selector: '[appPopconfirm]',
  standalone: true,
})
export class PopconfirmDirective implements OnDestroy {
  /** Title text — also used via [appPopconfirm]="'My title'" shorthand */
  @Input('appPopconfirm') popTitle = 'Are you sure?';
  @Input() popDescription?: string;
  @Input() popOkText = 'Yes';
  @Input() popCancelText = 'No';
  @Input() popType: 'default' | 'danger' | 'warning' = 'default';
  @Input() popPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top';

  @Output() popConfirm = new EventEmitter<void>();
  @Output() popCancel = new EventEmitter<void>();

  private el = inject(ElementRef);
  private appRef = inject(ApplicationRef);
  private envInj = inject(EnvironmentInjector);

  private compRef: ReturnType<
    typeof createComponent<PopconfirmComponent>
  > | null = null;

  @HostListener('click', ['$event'])
  onClick(e: Event) {
    e.stopPropagation();
    // Second click on same trigger → close
    if (this.compRef) {
      this.destroy();
      return;
    }
    this.show();
  }

  private show() {
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    const ref = createComponent(PopconfirmComponent, {
      environmentInjector: this.envInj,
    });

    ref.instance.title = this.popTitle || 'Are you sure?';
    ref.instance.description = this.popDescription;
    ref.instance.okText = this.popOkText;
    ref.instance.cancelText = this.popCancelText;
    ref.instance.type = this.popType;
    ref.instance.placement = this.popPlacement;
    ref.instance.anchorRect = rect;

    ref.instance.confirmed.subscribe(() => {
      this.popConfirm.emit();
      this.destroy();
    });
    ref.instance.cancelled.subscribe(() => {
      this.popCancel.emit();
      this.destroy();
    });
    ref.instance.outsideClick.subscribe(() => this.destroy());

    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement);
    this.compRef = ref;
  }

  private destroy() {
    if (!this.compRef) return;
    this.appRef.detachView(this.compRef.hostView);
    this.compRef.destroy();
    this.compRef = null;
  }

  ngOnDestroy() {
    this.destroy();
  }
}
