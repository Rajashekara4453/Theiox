import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { Router } from '@angular/router';
import { globals } from '../../../../utilities/globals';
import { AuthGuard } from '../../../../../app/pages/auth/auth.guard';
import { ToastrService } from '../../../../../app/components/toastr/toastr.service';

@Component({
  selector: 'kl-shift-management',
  templateUrl: './shift-management.component.html',
  styleUrls: ['./shift-management.component.scss']
})
export class ShiftManagementComponent implements OnInit {
  shiftLists: Array<any> = new Array();
  shiftHeaderCol = [
    'TimeSlotName',
    'StartDate',
    'EndDate',
    'StartTime',
    'EndTime'
  ];
  currentSiteID: any;
  isCollapsed = false;
  accessLevel: any = {};
  isAddEditPage: boolean = false;
  editID: any;
  constructor(
    private appService: AppService,
    private router: Router,
    private _globals: globals,
    private _auth: AuthGuard,
    private changeDetector: ChangeDetectorRef,
    private _toastLoad: ToastrService
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.getShiftDetailsList();
    this.accessLevel = this._auth.getMenuAccessLevel;
  }

  getShiftDetailsList() {
    //for site id
    const dataToSend = {
      // filter: [{
      //   site_id: this.currentSiteID,
      // }],
    };
    this.appService.getShiftDetails(dataToSend).subscribe((data) => {
      this.shiftLists = data;
    });
  }
  editTimeSlot(id: string) {
    if (this.accessLevel['edit']) {
      this.editID = id;
      this.isAddEditPage = true;
    } else {
      this._toastLoad.toast('warning', 'Warning', 'Edit access denied.', true);
    }
  }

  AddTimeSlot() {
    // this.changeDetector.detectChanges();
    if (this.accessLevel['create']) {
      this.editID = '';
      this.isAddEditPage = true;
    } else {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Create access denied.',
        true
      );
    }
  }

  changeView(event: any) {
    if (event === 'parentComponent') {
      this.isAddEditPage = false;
      this.changeDetector.markForCheck();
      this.ngOnInit();
    }
  }
}
