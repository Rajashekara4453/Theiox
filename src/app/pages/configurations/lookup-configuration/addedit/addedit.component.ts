import {
  Component,
  OnInit,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { NgForm } from '@angular/forms';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-addedit',
  templateUrl: './addedit.component.html',
  styleUrls: ['./addedit.component.scss']
})
export class AddeditComponent implements OnInit {
  @ViewChild('lookup_form') public lookupform: NgForm;
  @Output() changeViewEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input() courseId: any;
  @Input() accessLevel: any = {};
  public submitting_lookup: Boolean = true;
  public title: String = '';
  public pageLoaded: Boolean = true;
  lookupformdata: any = {
    lookup_id: ''
  };
  sideMenus: any;
  formvalid = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appservice: AppService,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals
  ) {}
  // public courseId: number;
  data: any = {};
  disableBtn = false;
  // accessLevel: any;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  endPointUrl: any;
  depMode: any;
  isPermission: any;
  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    this.endPointUrl = this._globals.deploymentModeAPI;
    // this.allowAccessComponent('');
    // this.route.params.subscribe(
    //   // tslint:disable-next-line:ter-arrow-parens
    //   params => {
    //     this.courseId = params['id'];
    //   },
    // );
    if (this.courseId) {
      this.getdata();
    } else {
      this.title = 'Create  New Lookup';
      if (this.accessLevel.create) {
        this.isPermission = true;
      } else {
        this.isPermission = false;
      }
    }
  }
  // allowAccessComponent(acess: String) {

  //   const val = this._auth.allowAccessComponent('masterConfiguration', '');
  //   this.accessLevel = val;
  //   if (!this.accessLevel.view) {
  //     this.router.navigate(['/un-authorized']);
  //     return false;
  //   }
  //   // return val;
  // }
  getdata() {
    if (this.accessLevel.edit) {
      this.isPermission = true;
    } else {
      this.isPermission = false;
    }
    this.pageLoaded = false;
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
        if (this.courseId) {
          for (let index = 0; index < data.bodyContent.length; index++) {
            const element = data.bodyContent[index];
            if (element.lookup_id === this.courseId) {
              // tslint:disable-next-line:prefer-template
              this.title = 'Edit ' + element['name'];
              this.lookupformdata = element;
            }
          }
        }
      });
  }

  savelookup() {
    this.validate_form();
    this.disableBtn = true;
    if (this.lookupform.valid === true && this.formvalid === true) {
      this.submitting_lookup = false;
      //for site id
      // const json = {
      //   site_id: this.currentSiteID,
      //   client_id: this.client_id,
      //   default: this.default,
      // };
      let json;
      if (this.depMode === 'EL') {
        json = {
          site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      } else {
        json = {
          // site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      }
      this.lookupformdata = Object.assign(this.lookupformdata, json);
      this.appservice.savelookup(this.lookupformdata).subscribe((data) => {
        if (data.status === 'success') {
          this.submitting_lookup = true;
          this.disableBtn = false;
          // this.router.navigate(['configurations/lookupconfiguration']);
          this.changeViewEmitter.emit('parentComponent');
          if (this.lookupformdata.lookup_id) {
            this._toastLoad.toast(
              'success',
              'Success',
              'Lookup Updated Successfully',
              true
            );
          } else {
            this._toastLoad.toast(
              'success',
              'Success',
              'Lookup created Successfully',
              true
            );
          }
        }
        this.disableBtn = false;
      });
    } else {
      this._toastLoad.toast(
        'info',
        'Information ',
        'Enter valid form data',
        true
      );
      this.disableBtn = false;
    }
  }
  cancellookup() {
    this.changeViewEmitter.emit('parentComponent');
  }

  validate_form() {
    const object = Object.keys(this.lookupformdata);
    for (let index = 0; index < object.length; index++) {
      const element = object[index];
      let temp = this.lookupformdata[element];
      if (element === 'name' || element === 'description') {
        temp = temp.trim();
        if (temp.length === 0) {
          this.formvalid = false;
          break;
        }
        this.formvalid = true;
      }
    }
  }
}
