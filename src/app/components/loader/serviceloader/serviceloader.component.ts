import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ServiceloaderService } from './serviceloader.service';
import { LoaderState } from './loader-state';

@Component({
  selector: 'kl-serviceloader',
  templateUrl: './serviceloader.component.html',
  styleUrls: ['./serviceloader.component.scss']
})
export class ServiceloaderComponent implements OnInit {
  show = false;
  private subscription: Subscription;

  constructor(private loaderService: ServiceloaderService) {
    this.subscription = this.loaderService.loaderState.subscribe(
      (state: LoaderState) => {
        this.show = state.show;
      }
    );
  }

  ngOnInit() {
    /** Taken to constructor, so that it subcribes to the service on an early stage 
      // this.subscription = this.loaderService.loaderState.subscribe(
      //   (state: LoaderState) => {
        //     this.show = state.show;
        //     console.log("INSIDE kl-serviceloader subscription", state)
        //   }
        // );
    */
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
