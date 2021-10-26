import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { globals } from '../../../utilities/globals';
@Component({
  selector: 'kl-sms-gateway',
  templateUrl: './sms-gateway.component.html',
  styleUrls: ['./sms-gateway.component.scss']
})
export class SmsGatewayComponent implements OnInit {
  table_data = [];
  marked: false;
  sms_gateway_id: string;
  delete_name: string;
  bodyContent_length = 0;
  pageLoaded: Boolean = false;
  public accessLevel: any;
  currentSiteID: any;
  isAddEditPage: boolean = false;
  editID: any;

  constructor(
    private _router: Router,
    private appService: AppService,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.gettable();
    this.accessLevel = this._auth.getMenuAccessLevel;
  }

  gettable() {
    this.pageLoaded = false;
    //for site id
    const json = {
      filter: [
        {
          site_id: this.currentSiteID
        }
      ]
    };
    this.appService
      .getsmsgatewaytable(
        this._globals.deploymentModeAPI.SMS_GATEWAY_TABLE,
        this._globals.deploymentMode == 'EL' ? json : {}
      )
      .subscribe((data) => {
        if (data.status === 'success') {
          this.pageLoaded = true;
          this.table_data = data.data;
          this.bodyContent_length = this.table_data['bodyContent'].length;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error while fetching Data',
            true
          );
        }
      });
  }
  edit(bodyContent) {
    if (this.accessLevel['edit']) {
      this.sms_gateway_id = bodyContent.sms_gateway_id;
      this.isAddEditPage = true;
    } else {
      this._toastLoad.toast('warning', 'Warning', 'Edit access denied.', true);
    }
  }

  delete(bodyContent) {
    this.delete_name = bodyContent.profile_name;
    this.sms_gateway_id = bodyContent.sms_gateway_id;
  }
  confirmdelete() {
    const dataToSend = {
      sms_gateway_id: this.sms_gateway_id
    };
    this.appService.deletesmsgateway(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.gettable();
        this._toastLoad.toast(
          'success',
          'Success',
          'SMS gateway Deleted Successfully',
          true
        );
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error while deleting sms gateway',
          true
        );
      }
    });
  }
  add_sms_gateway() {
    if (this.accessLevel['create']) {
      this.sms_gateway_id = '';
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
  toggleVisibility(e, bodyContent) {
    // this.marked = e.target.checked;
    const dataToSend = {
      sms_gateway_id: bodyContent['sms_gateway_id']
    };
    this.appService.smsDefaultGateway(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.gettable();
        this._toastLoad.toast(
          'success',
          'Success',
          'sms Default gateway Changed',
          true
        );
      }
    });
  }

  changeView(event: any) {
    if (event === 'parentComponent') {
      // this.accessLevel = this._auth.getMenuAccessLevel;
      this.isAddEditPage = false;
      this.ngOnInit();
    }
  }
}
