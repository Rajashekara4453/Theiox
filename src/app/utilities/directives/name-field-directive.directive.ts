import {
  Directive,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  Renderer2,
  Input
} from '@angular/core';
@Directive({
  selector: 'input[type=text]'
})
export class NameFieldDirectiveDirective {
  @Output('ngModelChange') updateModel = new EventEmitter();
  @Input() enterKeybool: any;
  constructor(private renderer: Renderer2, private elmref: ElementRef) {}
  @HostListener('change', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  transformString(event) {
    const stringToTransform = event.target.value;
    const transformValue = stringToTransform
      .trim() // removes leading and trailing spaces
      .replace(/\s\s+/g, ' '); // replaces multiple spaces with one space // Removes spaces after newlines
    if (this.enterKeybool == stringToTransform) {
      this.updateModel.emit(stringToTransform);
    } else {
      this.renderer.setProperty(
        this.elmref.nativeElement,
        'value',
        transformValue
      );
      this.updateModel.emit(transformValue);
    }
  }
}
