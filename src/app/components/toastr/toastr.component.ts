import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from './toastr.service';
import { ToastrState } from './toastr-state';

import { Toast, ToasterService, ToasterConfig } from 'angular2-toaster';

@Component({
  selector: 'kl-toastr',
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss']
})
export class ToastrComponent implements OnInit {
  public config1: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right'
  });
  private subscription: Subscription;

  constructor(
    public toasterService: ToasterService,
    public toasterLoad: ToastrService
  ) {}

  ngOnInit() {
    this.subscription = this.toasterLoad.loaderState.subscribe(
      (toast: ToastrState) => {
        const trigger: Toast = {
          type: toast.type,
          title: toast.title,
          body: toast.body,
          showCloseButton: toast.close
        };
        this.toasterService.pop(trigger);
      }
    );
  }
}
