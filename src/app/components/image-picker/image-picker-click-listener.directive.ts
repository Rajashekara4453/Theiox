import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[klImagePickerClickListener]'
})
export class ImagePickerClickListenerDirective {
  @Output() isModalTriggered: EventEmitter<boolean> = new EventEmitter(false);

  constructor() {}

  @HostListener('click', ['$event.target'])
  onClick() {
    this.isModalTriggered.emit(true);
  }
}
