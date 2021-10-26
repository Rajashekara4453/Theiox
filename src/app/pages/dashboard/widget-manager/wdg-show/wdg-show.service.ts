import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class WdgShowService {

  constructor() { }
  private doResize = new BehaviorSubject<boolean>(false);
  resizeStart = this.doResize.asObservable();

  private dateClik = new BehaviorSubject<boolean>(false);
  addClass = this.dateClik.asObservable();

  private iscreateOrEditwidget = new BehaviorSubject<boolean>(false);
  hideIcons = this.iscreateOrEditwidget.asObservable();

  setResize(bool){
    this.doResize.next(bool); 
  }

  dateClick(bool) {
    this.dateClik.next(bool)
  }

  createOrEditwidget(bool) {
    this.iscreateOrEditwidget.next(bool)
  }

}
