import { Directive, HostListener, ElementRef } from '@angular/core';
import { ToastrService } from '../../../app/components/toastr/toastr.service';

@Directive({
  selector: '[klEmailValidator]'
})
export class EmailValidatorDirective {
  constructor(private _el: ElementRef, private _toastLoad: ToastrService) {}

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/[^a-z0-9_@.]*/g, '');
    if (this._el.nativeElement.value === '') {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Only Alphabets (a-z), Numbers(0-9), symbol (@, _ and .) are allowed',
        true
      );
    }
    if (
      !(this._el.nativeElement.value === '') &&
      initalValue !== this._el.nativeElement.value
    ) {
      event.stopPropagation();
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Only Alphabets (a-z), Numbers(0-9), symbol (@, _ and .) are allowed',
        true
      );
    }
  }
}
