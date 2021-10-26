import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';
@Component({
  selector: 'kl-lookup-tables',
  templateUrl: './lookup-tables.component.html',
  styleUrls: ['./lookup-tables.component.scss'],
  preserveWhitespaces: true
})
export class LookupTablesComponent implements OnInit {
  @Output() changeViewEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input() lookup_Id: any;
  @Input() accessLevel: any = {};
  submitting_table: Boolean = true;
  pageLoaded: Boolean = true;
  disableupBtn = false;
  settings = {
    bigBanner: false,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: false
  };

  title: String = '';
  table_data: any = {};
  public mindate = new Date();
  public sideMenus: any = {};
  public form = {
    startdate: new Date().toISOString().split('.')[0]
  };
  lookup: any = {};
  buttonlabel: string;
  state: string;
  tablename: string;
  // lookup_Id: string;
  bodyContent = [];
  formvalid = true;
  public content = {};
  selectedlookup: string;
  bodyContent_length = 0;
  disableBtn = false;
  // accessLevel: any;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  endPointUrl: any;
  depMode: any;
  isPermission: any;
  constructor(
    private _advanceRoutes: ActivatedRoute,
    private router: Router,
    private appservice: AppService,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    this.endPointUrl = this._globals.deploymentModeAPI;
    this.state = 'new';
    this.buttonlabel = 'Create';
    this.lookup_Menus(this.lookup_Id);
  }

  lookup_Menus(lookup_Id) {
    // const dataToSend = {
    //   lookup_id: this.lookup_Id,
    //   filter: [{
    //     site_id: this.currentSiteID,
    //   }],
    // };
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        lookup_id: this.lookup_Id,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        lookup_id: this.lookup_Id
      };
    }
    this.appservice
      .lookupsList(this.endPointUrl.LOOKUPS_LIST, dataToSend)
      .subscribe((data) => {
        if (data.status === 'success') {
          this.sideMenus['menuheading'] = 'Lookup Tables';
          this.sideMenus['placeholder'] = 'Search lookup';
          this.sideMenus['buttonlabel'] = 'Create  New lookup';
          this.sideMenus['data'] = data.data;
          this.addNewtable();
        } else {
        }
      });
  }
  getlookup(id) {
    if (id['lookup_table_id'] !== '') {
      if (this.accessLevel.edit) {
        this.isPermission = true;
      } else {
        this.isPermission = false;
      }
    } else {
      if (this.accessLevel.create) {
        this.isPermission = true;
      } else {
        this.isPermission = false;
      }
    }
    this.pageLoaded = false;
    this.selectedlookup = id;
    const dataToSend = {
      lookup_table_id: this.selectedlookup['lookup_table_id'],
      lookup_id: this.lookup_Id
    };
    this.appservice.getlookuptabledata(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.pageLoaded = true;
        this.table_data = data.data;
        this.bodyContent = this.table_data.bodyContent;
        this.bodyContent_length = this.bodyContent.length;
        if (this.table_data.content) {
          this.form['name'] = this.table_data.content.name;
          this.form['description'] = this.table_data.content.description;
          this.title = 'Edit ' + this.form['name'];
        }
        if (this.state === 'new') {
          this.bodyContent = [];
        }
      } else {
      }
    });
  }

  validate_form() {
    const object = Object.keys(this.form);
    for (let index = 0; index < object.length; index++) {
      const element = object[index];
      const temp = this.form[element];
      if (
        element === 'name' ||
        element === 'description' ||
        element === 'value'
      ) {
        // temp = temp.trim();
        if (temp.length === 0) {
          this.formvalid = false;
          this._toastLoad.toast(
            'info',
            'Information',
            'Please fill all required fields',
            true
          );
          break;
        }
        this.formvalid = true;
      }
    }
  }
  update(form) {
    this.validate_form();
    this.disableupBtn = true;
    if (this.formvalid === true) {
      if (this.state === 'new') {
        this.state = 'create';
      }
      // tslint:disable-next-line:prefer-template
      // const start_date = form.startdate.getDate() + '/' + (form.startdate.getMonth() + 1) + '/' + form.startdate.getFullYear();
      let start_date = this.form['startdate'];
      const dt = start_date.slice(0, 10).split('-');
      // tslint:disable-next-line: prefer-template
      start_date = dt[2] + '-' + dt[1] + '-' + dt[0];

      const s_domini = form.starttime.getHours() >= 12 ? 'PM' : 'AM';
      const _shour =
        form.starttime.getHours() > 12
          ? form.starttime.getHours() - 12
          : form.starttime.getHours();
      const starthour = _shour === 0 ? 12 : _shour;

      // tslint:disable-next-line:prefer-template
      const s_minute =
        form.starttime.getMinutes() < 10
          ? '0' + form.starttime.getMinutes()
          : form.starttime.getMinutes();
      // const s_seconds = form.starttime.getSeconds();
      const s_seconds = '00';

      // tslint:disable-next-line:prefer-template
      const start_time =
        starthour + ':' + s_minute + ':' + s_seconds + ' ' + s_domini;

      const e_domini = form.endtime.getHours() >= 12 ? 'PM' : 'AM';
      const _ehour =
        form.endtime.getHours() > 12
          ? form.endtime.getHours() - 12
          : form.endtime.getHours();
      const endhour = _ehour === 0 ? 12 : _ehour;

      // tslint:disable-next-line:prefer-template
      const e_minute =
        form.endtime.getMinutes() < 10
          ? '0' + form.endtime.getMinutes()
          : form.endtime.getMinutes();
      // tslint:disable-next-line:prefer-template
      // const e_seconds = form.endtime.getSeconds() < 10 ? ('0' + form.endtime.getSeconds()) : (form.endtime.getSeconds());
      const e_seconds = '00';

      // tslint:disable-next-line:prefer-template
      const end_time =
        endhour + ':' + e_minute + ':' + e_seconds + ' ' + e_domini;

      const item = {
        startdate: start_date,
        enddate: 'Till Now',
        starttime: start_time,
        endtime: end_time,
        value: form.value
      };

      this.bodyContent.push(item);
      this.bodyContent_length = this.bodyContent.length;
      if (this.bodyContent.length >= 2) {
        this.bodyContent[
          this.bodyContent.length - 2
        ].enddate = this.bodyContent[this.bodyContent.length - 1].startdate;
      }

      this.form['startdate'] = null;
      this.form['starttime'] = '';
      this.form['endtime'] = '';
      this.form['value'] = '';
      this.disableupBtn = false;
    }
  }

  gettableKey(item) {
    (this.form['startdate'] = new Date().toISOString().split('.')[0]),
      (this.state = 'existing');
    this.buttonlabel = 'Update';
    // this.cancel();
    this.getlookup(item);
  }

  addNewtable() {
    (this.form['startdate'] = new Date().toISOString().split('.')[0]),
      (this.title = 'Create New Table');
    this.state = 'new';
    this.buttonlabel = 'create';
    this.form['description'] = '';
    this.form['name'] = '';
    this.form['endtime'] = '';
    this.form['starttime'] = '';
    this.form['value'] = '';
    // this.allowAccessComponent('');
    this.getlookup({ lookup_table_id: '', lookup_id: this.lookup_Id });
  }

  cancel() {
    this.form['startdate'] = null;
    this.form['endtime'] = '';
    this.form['starttime'] = '';
    this.form['value'] = '';
    if (this.state === 'new' || this.state === 'create') {
      this.form['description'] = '';
      this.form['name'] = '';
      this.bodyContent = [];
    }
    if (this.state === 'create') {
      this.state = 'new';
    }
    if (this.state === 'existing') {
      this.addNewtable();
      // this.getlookup(this.selectedlookup);
    }
  }

  submittable() {
    if (this.form['name'] === '' || this.form['description'] === '') {
      this._toastLoad.toast(
        'info',
        'Information',
        'Please Enter Name and Description',
        true
      );
      this.disableBtn = false;
    } else if (this.formvalid === true) {
      this.disableBtn = true;
      this.submitting_table = false;
      this.content['name'] = this.form['name'];
      this.content['description'] = this.form['description'];
      // const DataToSend = {
      //   lookup_id: this.lookup_Id,
      //   lookup_table_id: this.selectedlookup['lookup_table_id'],
      //   bodyContent: this.bodyContent,
      //   content: this.content,
      //   site_id: this.currentSiteID,
      //   client_id: this.client_id,
      //   default: this.default,
      // };
      let DataToSend;
      if (this.depMode === 'EL') {
        DataToSend = {
          lookup_id: this.lookup_Id,
          lookup_table_id: this.selectedlookup['lookup_table_id'],
          bodyContent: this.bodyContent,
          content: this.content,
          site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      } else {
        DataToSend = {
          lookup_id: this.lookup_Id,
          lookup_table_id: this.selectedlookup['lookup_table_id'],
          bodyContent: this.bodyContent,
          content: this.content,
          // site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      }
      if (DataToSend['lookup_table_id'] !== '') {
        this.appservice.submitlookup(DataToSend).subscribe((data) => {
          if (data.status === 'success') {
            this.submitting_table = true;
            this.addNewtable();
            this.lookup_Menus(this.lookup_Id);
            this._toastLoad.toast(
              'success',
              'Success',
              'Lookup table updated Successfully',
              true
            );
            this.disableBtn = false;
            // this.addNewtable();
          } else {
            this.disableBtn = false;
          }
        });
      } else {
        this.appservice.submitlookup(DataToSend).subscribe((data) => {
          if (data.status === 'success') {
            this._toastLoad.toast(
              'success',
              'Success',
              'Lookup table created Successfully',
              true
            );
            this.lookup_Menus(this.lookup_Id);
            this.submitting_table = true;
            this.addNewtable();
            this.disableBtn = false;
          } else {
            this.disableBtn = false;
          }
        });
      }
    } else {
      this._toastLoad.toast(
        'info',
        'Information',
        'Please fill all required fields',
        true
      );
      this.disableBtn = false;
    }
  }
  onDateSelect(event) {
    const dateString = event.toISOString().split('.')[0];
    this.form['startdate'] = dateString;
  }
}
