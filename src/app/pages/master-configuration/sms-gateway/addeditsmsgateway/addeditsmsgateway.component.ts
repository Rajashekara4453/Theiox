import {
  Component,
  OnInit,
  ViewChild,
  Output,
  Input,
  EventEmitter
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../../services/app.service';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { NgForm } from '@angular/forms';
import { isNumber } from 'util';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';
@Component({
  selector: 'kl-addeditsmsgateway',
  templateUrl: './addeditsmsgateway.component.html',
  styleUrls: ['./addeditsmsgateway.component.scss']
})
export class AddeditsmsgatewayComponent implements OnInit {
  @ViewChild(NgForm) gateway_form: NgForm;
  @ViewChild('gateway_form') public sms_gatewayForm: NgForm;
  @Output() changeViewEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input() courseId: any;
  @Input() accessLevel: any = {};
  submitting_smsgateway: Boolean = true;
  sending_sms: Boolean = true;
  pageLoaded: Boolean = true;

  gatewayform: any = {
    sms_gateway_id: '',
    add_parameter: [],
    profile_name: '',
    url: '',
    phone_param: '',
    message_param: ''
  };
  smsform = {};
  // courseId: any;
  test_result: string;
  table_data = [];
  profile_name = 'valid';
  formvalid = true;
  public title = '';
  // accessLevel: any;
  disableBtn = false;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  isPermission: any;
  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private appservice: AppService,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();

    // this.route.params.subscribe(
    //   // tslint:disable-next-line:ter-arrow-parens
    //   params => {
    //     this.courseId = params['id'];
    //   },
    // );
    // this.courseId = this.editID;
    if (this.courseId) {
      this.getdata();
    } else {
      this.title = 'Create SMS Gateway';
      if (this.accessLevel.create) {
        this.isPermission = true;
      } else {
        this.isPermission = false;
      }
    }
  }

  getdata() {
    // if (this.accessLevel.edit) {
    //   this.accessLevel.create = true;
    // } else {
    //   this.accessLevel.create = false;
    // }
    if (this.accessLevel.edit) {
      this.isPermission = true;
    } else {
      this.isPermission = false;
    }
    this.pageLoaded = false;
    const json = {
      filter: [
        {
          site_id: this.currentSiteID
        }
      ]
    };
    this.appservice
      .getsmsgatewaytable(
        this._globals.deploymentModeAPI.SMS_GATEWAY_TABLE,
        this._globals.deploymentMode == 'EL' ? json : {}
      )
      .subscribe((data) => {
        this.table_data = data.data;
        if (data.status === 'success' && this.courseId) {
          this.pageLoaded = true;

          for (let index = 0; index < data.data.bodyContent.length; index++) {
            const element = data.data.bodyContent[index];
            if (element.sms_gateway_id === this.courseId) {
              this.gatewayform = element;
              this.title = 'Edit ' + element['profile_name'];
            }
          }
        }
      });
  }
  save_gateway() {
    this.validate_form();
    this.disableBtn = true;
    if (this.formvalid === true && this.sms_gatewayForm.valid === true) {
      this.submitting_smsgateway = false;
      //for site id
      const json = {
        site_id: this.currentSiteID,
        client_id: this.client_id,
        default: this.default
      };
      this.gatewayform = Object.assign(this.gatewayform, json);

      this.appservice.saveSmsgateway(this.gatewayform).subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'SMS ' + data.message.split('_').pop(),
            true
          );
          this.submitting_smsgateway = true;
          // this._router.navigate(['configurations/masterConfig/smsgateway']);
          this.changeViewEmitter.emit('parentComponent');
          this.disableBtn = false;
        }
        this.disableBtn = false;
      });
    } else {
      this._toastLoad.toast(
        'error',
        'Failed',
        'SMS Gateway cannot be saved ',
        true
      );
    }
  }
  cancel_gateway() {
    this.gatewayform = {};
    this.changeViewEmitter.emit('parentComponent');
  }
  addparameter() {
    this.gatewayform.add_parameter.push({
      param_name: '',
      param_value: ''
    });
  }
  sendsms() {
    this.validate_form();
    if (this.sms_gatewayForm.valid === true) {
      this.sending_sms = false;
      for (let index = 0; index < this.table_data.length; index++) {
        const element = this.table_data[index];
        if (this.gatewayform['profile_name'] === element['profile_name']) {
          this.profile_name = 'invalid';
          this._toastLoad.toast(
            'info',
            'Profile name already exists',
            'enter another name',
            true
          );
        } else {
          this.profile_name = 'valid';
        }
      }
      if (this.profile_name === 'valid') {
        const dataToSend = {
          gatewayform: this.gatewayform,
          smsform: this.smsform
        };
        this.appservice.sendTestsms(dataToSend).subscribe((data) => {
          if (data.status === 'success') {
            this.sending_sms = true;
            this.test_result = data.status;
            this._toastLoad.toast('success', 'Success', 'SMS Sent', true);
          } else {
            this._toastLoad.toast('error', 'Error', data.message, true);
            this.sending_sms = true;
          }
        });
      }
    } else {
      this._toastLoad.toast('error', 'Invalid', 'enter valid form data', true);
    }
  }
  delete_parameter(ind) {
    this.gatewayform.add_parameter.splice(ind, 1);
  }
  validate_form() {
    const object = Object.keys(this.gatewayform);
    for (let index = 0; index < object.length; index++) {
      const element = object[index];
      let temp = this.gatewayform[element];
      if (
        element !== 'add_parameter' &&
        element !== 'system_defaults' &&
        element !== 'sms_gateway_id' &&
        element !== 'configuration_status' &&
        element !== 'default'
      ) {
        if (temp) {
          if (isNumber(temp)) {
            temp = temp;
          } else {
            temp = temp.trim();
          }

          if (temp.length === 0) {
            this.formvalid = false;
            this._toastLoad.toast(
              'error',
              'Invalid',
              'enter valid form data',
              true
            );
            break;
          }
          this.formvalid = true;
        }
      }
    }
  }
}
