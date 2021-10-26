import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ToastrState } from './toastr-state';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  private loaderSubject = new Subject<ToastrState>();
  public loaderState = this.loaderSubject.asObservable();

  constructor() {}
  toast(Type: string, Title: string, Body: string, Close: boolean) {
    this.loaderSubject.next(<ToastrState>{
      type: Type,
      title: Title,
      body: Body,
      close: Close
    });
  }
}
