import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../../../../app/pages/auth/auth.guard';
import { DataSharingService } from '../../../services/data-sharing.service';

@Component({
  selector: 'kl-pin-filter',
  templateUrl: './pin-filter.component.html',
  styleUrls: ['./pin-filter.component.scss']
})
export class PinFilterComponent implements OnInit {
  elmfilter: boolean = true;
  elmClearFilter: boolean = false;
  hasClickAccess: any;
  pageType: any;

  constructor(
    private _dataSharing: DataSharingService,
    private authGuard: AuthGuard
  ) {
    this._dataSharing.getEventpinFilter.subscribe((className) => {
      if (className) {
        document.body.classList.remove('pinned-filter');
        document.body.classList.remove('pin-filter');
        this.elmClearFilter = false;
        this.elmfilter = true;
      }
    });
  }

  ngOnInit() {
    this.pageType = this.authGuard.getMenuObject['ticket'];
    this.hasClickAccess = this.authGuard.getMenuObject.accessLevel;
  }

  pinFilter(event) {
    if (document.body.classList.contains('pinned-filter')) {
      document.body.classList.remove('pinned-filter');
      document.body.classList.remove('pin-filter');
      document.body.classList.remove('overlay-filter');
      this.elmClearFilter = false;
      this.elmfilter = true;
    } else {
      document.body.classList.remove('overlay-filter');
      document.body.classList.add('pinned-filter');
      document.body.classList.add('pin-filter');
      this.elmfilter = false;
      this.elmClearFilter = true;
    }
  }

  ngOnDestroy() {
    document.body.classList.remove('pinned-filter');
    document.body.classList.remove('pin-filter');
  }
}
