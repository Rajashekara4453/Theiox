import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ToastrService } from '../../components/toastr/toastr.service';
import { AuthGuard } from '../auth/auth.guard';
import { globals } from '../../utilities/globals';

@Component({
  selector: 'kl-license-management',
  templateUrl: './license-management.component.html',
  styleUrls: ['./license-management.component.scss']
})
export class LicenseManagementComponent implements OnInit {
  public licensedata = false;
  public status: String = '';
  accessLevel: any;
  disableBtn = false;
  isSystemAdmin: boolean = false;
  public license_data: any = {
    user_name: '',
    password: '',
    licence_key: '',
  };

  public table_data: any = [];
  licenseType: any = [{ id: 'KL',name: 'Server License' }];
  licenseTypeDropdownSettings: any = [];
  licenseTypeList: any = [
    {
      id: 'KL',
      name: 'Server License'
    },
    {
      id: 'EL',
      name: 'Cilent License'
    }
  ];

  constructor(private appservice: AppService, private _toastLoad: ToastrService,
    private global: globals, public _auth: AuthGuard) { }

  ngOnInit() {
    this.isSystemAdmin = this.global.isSystemAdminLoggedIn();
    // console.log('isSA = ' , this.isSystemAdmin)
    this.allowAccessComponent('');
    // if (this.isSystemAdmin) {
    //   this.getKLLicense();
    // } else {
    //   t()his.getlicensetable();
    // }
    this.loadLicense(this.licenseType[0]);
    this.licenseTypeDropdownSettings = {
      singleSelection: true,
      labelKey: 'name',
      primaryKey: 'id',
      text: 'Select License',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      noDataLabel: 'No License Types Available',
    };
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('masterConfiguration', '');
    this.accessLevel = val;

  }

  loadLicense(event) {
    // console.log(event);
    switch (event.id) {
      case 'KL':
        this.getKLLicense();
        break;

      case 'EL':
        this.getlicensetable();
        break;

      default:
        break;
    }
  }

  getlicensetable() {
    const input = {
      "filter": [{
        "site_id": this.global.getCurrentUserSiteId(),
      }]
    }
    this.appservice.getlicensetable(input).subscribe((data) => {
      if (data.status === 'success') {
        this.table_data = data;
        this.licensedata = true;
      } else {
        this._toastLoad.toast('error', 'Failed', 'Error while fetching data', true);
      }
    });
  }

  getKLLicense() {
    this.appservice.getKLLicense().subscribe((data) => {
      if (data.status === 'success') {
        this.table_data = data;
        this.licensedata = true;
      } else {
        this._toastLoad.toast('error', 'Failed', 'Error while fetching data', true);
      }
    });
  }

  updateLicense() {
    this.disableBtn = true;
    const input = {};
    input['user_name'] = this.license_data.user_name;
    input['password'] = this.license_data.password;
    input['licence_key'] = this.license_data.licence_key;
    if (input['user_name'] === '') {
      this._toastLoad.toast('warning', 'Information', 'Please Enter User ID', true);
      this.disableBtn = false;
      return;
    }
    if (input['password'] === '') {
      this._toastLoad.toast('warning', 'Information', 'Please Enter Password', true);
      this.disableBtn = false;
      return;
    }
    if (input['licence_key'] === '') {
      this._toastLoad.toast('warning', 'Information', 'Please Enter License key', true);
      this.disableBtn = false;
      return;
    }
    this.licensedata = false;
    this.appservice.updateLicenseKL(input).subscribe((data) => {
      if (data.status === 'success') {
        this.resetFrom();
        this.licensedata = true;
        this._toastLoad.toast('success', 'Success', data['message'], true);
        this.disableBtn = false;       
      } else {
        this.resetFrom();
        this._toastLoad.toast('error', 'Error', data['message'], true);
        this.disableBtn = false;
        this.licensedata = true;        
      }
    });

    // if (this.license_key === '') {
    //   this._toastLoad.toast('info', 'Information', 'Please enter valid license key', true);
    //   return;
    // }
    // this.licensedata = false;
    // const dataTopost = {
    //   licenceKey: this.license_key,
    // };
    // this.appservice.submit_license_key(dataTopost).subscribe((data) => {
    //   if (data.status === 'success') {
    //     this.licensedata = true;
    //     this.getlicensetable();
    //     this._toastLoad.toast('success', 'Success', 'Updated license key', true);
    //   } else {
    //     this._toastLoad.toast('error', 'Error', 'Error in submitting license key', true);
    //   }
    // });
  }

  resetFrom() {
    this.license_data = {
      user_name: '',
      password: '',
      licence_key: '',
    };
  }

  userwiseCount_data: any;
  isUserWiseCountModal: boolean = false;

  fetchUserWiseCount(controlAccess: string) {

    this.isUserWiseCountModal = true;

    const dataToSend = {
      moreInfo: controlAccess,
    };

    // const dataToSend = {
    //   filter: [{
    //     site_id: this.global.getCurrentUserSiteId(),
    //   }],
    //   data: [
    //     {
    //       db: 'dashboard',
    //       lab: controlAccess,
    //       filter: {
    //         site_id: this.global.getCurrentUserSiteId(),
    //         type: controlAccess,
    //       },
    //     },
    //   ],
    // };

    switch (controlAccess) {
      case 'Dashboards':
        // dataToSend['data'][0]['lab'] = 'Dashboards';
        dataToSend['data'][0]['filter']['type'] = 'Dashboard';
        break;

      case 'Reports':

        break;

      default:
        break;
    }
    console.log(dataToSend);
    this.appservice.getlicensetable(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.userwiseCount_data = data;
        this.licensedata = true;
        console.log(this.userwiseCount_data);
      } else {
        this._toastLoad.toast('error', 'Failed', 'Error while fetching data', true);
      }
    });
  }
}
