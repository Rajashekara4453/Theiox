import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { Router } from '@angular/router';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { globals } from '../../../utilities/globals';

@Component({
  selector: 'kl-lookup-configuration',
  templateUrl: './lookup-configuration.component.html',
  styleUrls: ['./lookup-configuration.component.scss']
})
export class LookupConfigurationComponent implements OnInit {
  public pageLoaded: Boolean = true;

  table_data: any = {};
  router: any;
  delete_name: any;
  lookup_id: any;
  accessLevel: any;
  currentSiteID: any;
  endPointUrl: any;
  depMode: any;
  isAddEditPage: boolean = false;
  isLookUpTablePage: boolean = false;
  constructor(
    private appservice: AppService,
    private _router: Router,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.depMode = this._globals.deploymentMode;
    this.endPointUrl = this._globals.deploymentModeAPI;
    this.accessLevel = this._auth.getMenuAccessLevel;
    // this.allowAccessComponent('');
    this.gettable();
  }
  // allowAccessComponent(acess: String) {
  //   const val = this._auth.allowAccessComponent('masterConfiguration', '');
  //   this.accessLevel = val;
  //   if (!this.accessLevel.view) {
  //     this._router.navigate(['/un-authorized']);
  //     return false;
  //   }
  //   // return val;
  // }

  gettable() {
    this.pageLoaded = false;
    //for site id
    // const dataToSend = {
    //   filter: [{
    //     site_id: this.currentSiteID,
    //   }],
    // };
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {};
    }
    this.appservice
      .lookupConfigurationtabledata(
        this.endPointUrl.LOOKUP_TABLEDATA,
        dataToSend
      )
      .subscribe((data) => {
        this.pageLoaded = true;
        this.table_data = data;
      });
  }

  add_lookup() {
    if (this.accessLevel['create']) {
      this.lookup_id = '';
      this.isAddEditPage = true;
      this.isLookUpTablePage = false;
    } else {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Create access denied.',
        true
      );
    }
  }

  edit(bodyContent) {
    if (this.accessLevel['edit']) {
      this.lookup_id = bodyContent.lookup_id;
      this.isAddEditPage = true;
      this.isLookUpTablePage = false;
    } else {
      this._toastLoad.toast('warning', 'Warning', 'Edit access denied.', true);
    }
  }
  delete(bodyContent) {
    this.delete_name = bodyContent.name;
    this.lookup_id = bodyContent.lookup_id;
  }
  lookUpTable(bodyContent) {
    if (this.accessLevel['view']) {
      this.lookup_id = bodyContent.lookup_id;
      // tslint:disable-next-line:prefer-template
      // this._router.navigate(['configurations/lookup_tables/' + lookUpId]);
      this.isAddEditPage = false;
      this.isLookUpTablePage = true;
    } else {
      this._router.navigate(['/un-authorized']);
    }
  }
  confirmdelete() {
    this.appservice.deletelookup(this.lookup_id).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast(
          'success',
          '',
          'lookup deleted successfully',
          true
        );
        this.gettable();
        // window.location.reload();
      }
    });
  }

  changeView(event: any) {
    if (event === 'parentComponent') {
      this.isAddEditPage = false;
      this.isLookUpTablePage = false;
      this.ngOnInit();
    }
  }
}
