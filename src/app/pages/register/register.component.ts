import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ToastrService } from '../../components/toastr/toastr.service';
import { UtilityFunctions } from '../../utilities/utility-func';
import { globals } from '../../../app/utilities/globals';

@Component({
  selector: 'kl-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private _appService: AppService, public _toastLoad: ToastrService, private _utility: UtilityFunctions,
              private _globals: globals) { }
  public DFMinput: any;

  deploymentMode: string = 'EL';
  endPointExt: any;

  @Output() backToLoginBtn: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.loadRegisterDFM();
    this.checkDeploymentMode();
  }

  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
    this.endPointExt = this._globals.deploymentModeAPI;
    switch (this.deploymentMode) {
      case 'EL':
        break;

      case 'KL':
        break;

      default: console.log('Deployment Mode not Found!..');
        break;
    }
  }

  loadRegisterDFM() {
    this._appService.loadRegisterDFM().subscribe((data) => {
      this.DFMinput = data.data.general_info;
    });
  }

  registerEnquiry(event: any) {
    this._toastLoad.toast('success', 'Success', 'Registered Successfully', true);
    const dataToSend = {};
    this._appService.getdefaultMailSettings(dataToSend).subscribe(async (dataContentDB) => {
      let promise = this.sendMailAfterRegister(dataContentDB, event);
    });
  }

  //send mail
  async sendMailAfterRegister(dataContentDB, event: any) {

    if (dataContentDB[0].data.emails.enable === true) {
      const mailData = dataContentDB[0].data.emails.registration.onRegisterMailTo;

      // check if mail after registration is enabled
      if (mailData.enable === true) {
        let dataToSend: any = {};
        let mailBodyObject = await this.mapLabelsToKeyMail(event);
        let mailBodyString = await this.composeBodyOfMail(mailBodyObject);
        dataToSend = await this.validateEmail(mailData, mailBodyString, "New User Registeration");
        await this.sendMail(dataToSend);
      }
    }
  }

  async sendMail(dataToSend: any) {
    this._appService.register(this.endPointExt, dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast('info', 'Information', "We will Contact you shortly", true);
      } else {
        this._toastLoad.toast('error', 'Error', "Some Error Occured", true);
      }
    });
  }

  async validateEmail(mailObject: any, mailBodyString: string, subject: string) {

    let ccMailIds: string;
    let bccMailIds: string;
    let toMailIds: string;
    let mailSubject: string;

    // Subject is mandatory
    mailSubject = subject;

    for (const key in mailObject) {
      if (mailObject.hasOwnProperty(key)) {
        const element = mailObject[key];
        if (element.enable === true || key == 'toMailIds') {
          switch (key) {
            case 'cc': ccMailIds = element['mailIds'][0];
              break;

            case 'bcc': bccMailIds = element['mailIds'][0];
              break;

            case 'toMailIds': toMailIds = element[0];
              break;

            default: console.log("Case " + key + "not found!..")
              break;
          }
        }
      }
    }
    return this.composeMail(mailSubject, mailBodyString, toMailIds, ccMailIds, bccMailIds);
  }

  composeMail(mailSubject, bodyOfMail, to, cc, bcc) {
    return {
      'subject': mailSubject,
      'body': bodyOfMail,
      'eMail': to,
      'cc': cc,
      'bcc': bcc
    };
  }

  async mapLabelsToKeyMail(dataToMail) {

    const dfmFields = this.DFMinput['headerContent'][0]['data'];
    let KeyLabelMapped: any = {};
    for (const dataToMailKey in dataToMail) {
      if (dataToMail.hasOwnProperty(dataToMailKey)) {
        for (let i = 0; i < dfmFields.length; i++) {
          const dfmObject = dfmFields[i];
          if (dataToMailKey === dfmObject['key']) {
            KeyLabelMapped[dfmObject['label']] = dataToMail[dataToMailKey];
          }
        }
      }
    }
    return KeyLabelMapped;
  }

  async composeBodyOfMail(dataToMail: any) {
    let message: string = '';
    let bodyOfMail: string = '';
    for (const key in dataToMail) {
      if (dataToMail.hasOwnProperty(key)) {
        message = key + ":" + dataToMail[key] + '\n'
      }
      bodyOfMail = bodyOfMail + message;
    }
    return bodyOfMail;
  }

  backToLogin() {
    this.backToLoginBtn.emit();
  }
}
