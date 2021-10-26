import { Directive, ElementRef, HostListener } from '@angular/core';
import { ToastrService } from '../../../app/components/toastr/toastr.service';
@Directive({
  selector: '[klNumbersOnly]'
})
export class NumbersOnlyDirective {
  constructor(private _el: ElementRef, private _toastLoad: ToastrService) {}

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    if (this._el.nativeElement.value === '') {
      this._toastLoad.toast('warning', 'Warning', 'Required Field', true);
    }
    if (
      !(this._el.nativeElement.value === '') &&
      initalValue !== this._el.nativeElement.value
    ) {
      event.stopPropagation();
      this._toastLoad.toast('warning', 'Warning', 'Enter Number Only', true);
    }
  }
}
