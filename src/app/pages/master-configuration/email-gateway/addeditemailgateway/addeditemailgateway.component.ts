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
import { faTemperatureLow } from '@fortawesome/free-solid-svg-icons';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-addeditemailgateway',
  templateUrl: './addeditemailgateway.component.html',
  styleUrls: ['./addeditemailgateway.component.scss']
})
export class AddeditemailgatewayComponent implements OnInit {
  @ViewChild('gateway_form') public gatewayForm: NgForm;
  @Output() changeViewEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input() courseId: any;
  @Input() accessLevel: any = {};
  test_result = '';
  public title = '';

  // loader variables
  public pageLoaded: Boolean = true;
  public submitting_emailgateway: Boolean = true;
  public sending_mail: Boolean = true;

  // Encryptions dropdown options

  encryption_options = [
    {
      label: 'No Encryption',
      value: 'No Encryption'
    },
    {
      label: 'TLS',
      value: 'TLS'
    },
    {
      label: 'SSL',
      value: 'SSL'
    }
  ];
  gatewayform = {
    configuration_status: '',
    email_gateway_id: '',
    encryption: 'SSL',
    mail_server: 'smtp.gmail.com',
    password: 'asdfghj',
    profile_name: '',
    sender_email: 'user@gmail.com',
    sender_name: 'Test',
    smtp_authorization: true,
    smtp_port: '25',
    system_defaults: false,
    username: 'test user'
  };
  // courseId: string;
  emailform = {};
  formvalid = false;
  // accessLevel: any;
  disableBtn = false;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  isPermission: any;
  constructor(
    private _router: Router,
    private appService: AppService,
    private route: ActivatedRoute,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
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
      this.title = 'Create  Email Gateway';
      if (this.accessLevel.create) {
        this.isPermission = true;
      } else {
        this.isPermission = false;
      }
    }
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('masterConfiguration', '');
    this.accessLevel = val;
    if (!this.accessLevel.view) {
      this._router.navigate(['/un-authorized']);
      return false;
    }
    // return val;
  }
  getdata() {
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
    this.appService
      .getemailgatewaytable(
        this._globals.deploymentModeAPI.EMAIL_GATEWAY_TABLE,
        this._globals.deploymentMode == 'EL' ? json : {}
      )
      .subscribe((data) => {
        if (data.status === 'success') {
          this.pageLoaded = true;
          if (this.courseId) {
            for (let index = 0; index < data.data.bodyContent.length; index++) {
              const element = data.data.bodyContent[index];
              if (element.email_gateway_id === this.courseId) {
                this.gatewayform = data.data.bodyContent[index];
                this.title = 'Edit  ' + this.gatewayform['profile_name'];
              }
            }
          }
        }
      });
  }

  cancel_gateway() {
    // this._router.navigate(['configurations/masterConfig/emailGateway']);
    this.changeViewEmitter.emit('parentComponent');
  }
  save_gateway() {
    this.validate_form();
    this.disableBtn = true;

    if (this.gatewayForm.valid === true && this.formvalid === true) {
      this.submitting_emailgateway = false;
      //for site id
      const json = {
        site_id: this.currentSiteID,
        client_id: this.client_id,
        default: this.default
      };
      this.gatewayform = Object.assign(this.gatewayform, json);

      this.appService.saveEmailgateway(this.gatewayform).subscribe((data) => {
        if (data.status === 'success') {
          //  tslint:disable-next-line:max-line-length
          this._toastLoad.toast(
            'success',
            'Success',
            this.gatewayform.email_gateway_id !== ''
              ? 'Updated Successfully'
              : 'Created Successfully',
            true
          );
          this.submitting_emailgateway = true;
          this.changeViewEmitter.emit('parentComponent');
        } else {
          //  tslint:disable-next-line:max-line-length
          this._toastLoad.toast(
            'error',
            'Error',
            this.gatewayform.email_gateway_id !== ''
              ? 'Failed to Update'
              : 'Failed to Create',
            true
          );
        }
        this.disableBtn = true;
      });
    } else {
      this._toastLoad.toast(
        'info',
        'Information',
        'Please fill all require fields',
        true
      );
    }
  }

  sendmail() {
    // if (this.accessLevel.edit) {
    //   this.accessLevel.create = true;
    // } else {
    //   this.accessLevel.create = false;
    // }
    this.validate_form();
    if (this.gatewayForm.valid === true && this.formvalid === true) {
      // tslint:disable-next-line:max-line-length
      // const regexp = new RegExp('/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/');
      // const email_valid = regexp.test(this.emailform['emailid']);
      if (this.emailform['emailid']) {
        this.sending_mail = false;
        const datatoSend = {
          email_form: this.emailform,
          gateway_form: this.gatewayform
        };
        this.appService.sendTestmail(datatoSend).subscribe((data) => {
          if (data.status === 'success') {
            //  tslint:disable-next-line:max-line-length
            this._toastLoad.toast(
              'success',
              'Success',
              'Test mail sent successfully',
              true
            );
            this.test_result = data.status;
            this.sending_mail = true;
          } else {
            this._toastLoad.toast('error', 'Error', data.message, true);
            this.sending_mail = true;
          }
        });
      } else {
        this._toastLoad.toast(
          'info',
          'Information',
          'Enter valid email ID',
          true
        );
      }
    } else {
      this._toastLoad.toast(
        'info',
        'Information',
        'Please enter valid data',
        true
      );
    }
  }
  validate_form() {
    const object = Object.keys(this.gatewayform);
    for (let index = 0; index < object.length; index++) {
      const element = object[index];
      let temp = this.gatewayform[element];
      const element_type = typeof temp;
      if (
        element_type === 'string' &&
        element !== 'email_gateway_id' &&
        element !== 'configuration_status' &&
        element !== 'default' &&
        element !== 'site_id' &&
        element !== 'client_id'
      ) {
        temp = temp.trim();
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
}
