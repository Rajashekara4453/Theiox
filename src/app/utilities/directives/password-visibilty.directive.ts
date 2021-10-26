import { Directive, ElementRef, HostListener, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: 'input[type=password]'
})
export class PasswordVisibiltyDirective implements OnInit, OnChanges {

  @Input() inputPassword:string = '';
  @Input() pageview:string;

  private showPassword:boolean = false;
  private buttonShow:boolean=false;
  btn:HTMLElement;
  eye:HTMLElement;
  onLoad:boolean = true;

  constructor(private _el:ElementRef, private _renderer:Renderer2) { }
  
  ngOnInit(): void {
    this.createEye();
    this.eyeToggler(this.inputPassword);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.eyeToggler(this.inputPassword);
  }

  eyeToggler(value){
    if(this.buttonShow === false && value != '' && value != null && value != undefined){
      this.showEye();
    } else if(this.buttonShow === true && (value == '' || value == null || value == undefined)){
      this.hideEye();
    }
  }

  createEye(){
    const parent = this._el.nativeElement.parentNode;
    const span = this._renderer.createElement('span');
    this.btn = this._renderer.createElement('button');
    this.eye = this._renderer.createElement('i');

    this.eye.className= 'fa fa-eye';
    this._renderer.setAttribute(this.eye, 'title', 'Show');
    span.className= 'password-visibility';
    
    this._renderer.appendChild(this.btn, this.eye);
    this._renderer.appendChild(span, this.btn );
    this._renderer.appendChild(parent, span);
    
    this.eye.addEventListener('click', ($event) => {
      this.togglePasswordType(this.eye);
    });

    this.buttonShow = true;
  }

  showEye(){
    this.buttonShow = true;
    const children = this._el.nativeElement.parentNode.childNodes;
    for (let i = 0; i< children.length; i++){
      if (children[i].className === 'password-visibility'){
        this._renderer.setStyle(this._el.nativeElement.parentNode.childNodes[i], 'display', 'block');
      }
    }   
  }

  hideEye(){
    this.buttonShow = false;
    const children = this._el.nativeElement.parentNode.childNodes;
    for (let i = 0; i< children.length; i++){
      if (children[i].className === 'password-visibility'){
        this.showPassword = true;
        this.togglePasswordType(this.eye);
        this._renderer.setStyle(this._el.nativeElement.parentNode.childNodes[i], 'display', 'none');
      }
    }
  }

  togglePasswordType(eye: HTMLElement) {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this._renderer.setAttribute(eye, 'title', 'Hide');
      this._renderer.setAttribute(this._el.nativeElement, 'type', 'text');
      eye.className = 'fa fa-eye-slash';
    } else {
      this._renderer.setAttribute(eye, 'title', 'Show');
      this._renderer.setAttribute(this._el.nativeElement, 'type', 'password');
      eye.className = 'fa fa-eye';
    }
  }

}
