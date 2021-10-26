import { Directive, ElementRef, OnInit, Renderer2  } from '@angular/core';

@Directive({
  selector: '[KLWdgConfigPannel]',
})
export class ConfigDirective implements OnInit {

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit () {
    this.renderer.addClass(this.elementRef.nativeElement, 'widgetConfigPannel');
    this.renderer.addClass(this.elementRef.nativeElement, 'shadow');

  }
}
