import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { globals } from '../../../utilities/globals';

@Component({
  selector: 'kl-email-gateway',
  templateUrl: './email-gateway.component.html',
  styleUrls: ['./email-gateway.component.scss']
})
export class EmailGatewayComponent implements OnInit {
  table_data = [];
  email_gateway_id: string;
  delete_name: string;
  marked: false;
  bodyContent_length = 0;
  public pageLoaded: Boolean = true;
  accessLevel: any;
  currentSiteID: any;
  isAddEditPage: boolean = false;
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
    // this.allowAccessComponent('');
    this.accessLevel = this._auth.getMenuAccessLevel;
  }
  // allowAccessComponent(acess: String) {
  //   const val = this._auth.allowAccessComponent('masterConfiguration', '');
  //   this.accessLevel = val;
  //   if (!this.accessLevel.view) {
  //     this._router.navigate(['/un-authorized']);
  //     return false;
  //   }
  //   // this.accessLevel.delete = false;
  //   // return val;
  // }
  add_email_gateway() {
    if (this.accessLevel['create']) {
      this.email_gateway_id = '';
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
      .getemailgatewaytable(
        this._globals.deploymentModeAPI.EMAIL_GATEWAY_TABLE,
        this._globals.deploymentMode === 'EL' ? json : {}
      )
      .subscribe((data) => {
        if (data.status === 'success') {
          this.pageLoaded = true;
          this.table_data = data.data;
          for (
            let index = 0;
            index < this.table_data['bodyContent'].length;
            index++
          ) {
            const element = this.table_data['bodyContent'][index];
            // tslint:disable-next-line:max-line-length
            this.table_data['bodyContent'][index]['smtp_configuration'] =
              element['mail_server'] +
              ' , ' +
              element['smtp_port'] +
              ' , ' +
              element['encryption'] +
              ' , ' +
              element['smtp_authorization'];
          }
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
      this.email_gateway_id = bodyContent.email_gateway_id;
      this.isAddEditPage = true;
    } else {
      this._toastLoad.toast('warning', 'Warning', 'Edit access denied.', true);
    }
  }

  delete(bodyContent) {
    this.delete_name = bodyContent.profile_name;
    this.email_gateway_id = bodyContent.email_gateway_id;
  }
  confirmdelete() {
    const dataToSend = {
      email_gateway_id: this.email_gateway_id
    };
    this.appService.deleteEmailgateway(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.gettable();
        this._toastLoad.toast(
          'success',
          'Success',
          'Email gateway Deleted Successfully',
          true
        );
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error while deleting email gateway',
          true
        );
      }
    });
  }
  toggleVisibility(e, bodyContent) {
    const dataToSend = {
      email_gateway_id: bodyContent['email_gateway_id']
    };
    this.appService.emailDefaultGateway(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.gettable();
        this._toastLoad.toast(
          'success',
          'Success',
          'Email Default gateway Changed',
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
