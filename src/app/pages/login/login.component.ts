import {
  Component,
  OnInit,
  Injectable,
  ViewChild,
  ElementRef,
  Renderer2
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from '../../components/toastr/toastr.service';
import { AppService } from '../../services/app.service';
import { AuthService } from '../auth/auth.service';
import { globals } from '../../utilities/globals';
import { DataSharingService } from '../../services/data-sharing.service';
import { UtilityFunctions } from '../../utilities/utility-func';
import { Observable, Subject, ReplaySubject, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PasswordStrength } from './password-strength';
import { AccessMenuService } from '../../../app/services/access-menu.service';
import { AppTokenService } from '../../services/app-token.service';
import { DataStoreService } from '../../services/data-store.service';
import { AppComponent } from '../../../app/app.component';
import { Title } from '@angular/platform-browser';
import { read } from 'fs';
import { RequestOptions } from '@angular/http';
import { faLandmark } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'kl-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(
    public _route: Router,
    public _toastLoad: ToastrService,
    private _appService: AppService,
    private _auth: AuthService,
    private _utility: UtilityFunctions,
    private _dataSharing: DataSharingService,
    private _globals: globals,
    private _formBuilder: FormBuilder,
    private _passwordSrength: PasswordStrength,
    private _dataStore: DataStoreService,
    private _appTokenService: AppTokenService
  ) {
    /*Event Listener - Local Storage*/
    // tslint:disable-next-line: no-this-assignment
    const self = this;
    // tslint:disable-next-line: ter-prefer-arrow-callback
    window.addEventListener(
      'storage',
      function (e) {
        const refArr = Object.keys(e.storageArea);
        // Remove multi-profile sync in all open tabs.
        if (refArr.includes('ACCOUNTS')) {
          self.getStoredProfiles();
        }
      },
      false
    );

    // this.licenseForm = this._licenseFormBuilder.group({
    //   secret_key: [''],
    //   file: []
    // });
  }
  @ViewChild('changePasswordWindowClose') changePasswordWindowClose: ElementRef;
  @ViewChild('uploadedLicenseFile') uploadedLicenseFile: ElementRef;
  @ViewChild('licenseModalClose') licenseModalClose: ElementRef;

 /** options: any = []; */
  /**applicationList = false;*/
  allApplictionJson: any;
  form = {
    username: '',
    password: '',
    oldPassword: '',
    newPassword: '',
    forgotKey: '',
    client: '',
    confirmPassword: '',
    domainIP: ''
  };

  registrationForm = {
    regName: '',
    regOrgName: '',
    regPhoneNumber: '',
    regEmail: ''
  };

  // licenseForm: FormGroup;

  public showSAlogin = false;
  public showForgotFields = false;
  public pageView = '';
  // showRegisterPage: boolean = false;
  isSAMailId: boolean = false;
  userTheme: string;

  // Send Mails
  bodyOfMail: string = '';
  input: any = {};

  // System Admin - Client
  clientListDropDown: any = [];
  clientDropdownSettings: any = {};
  // tslint:disable-next-line:max-line-length

  // Variables for deployment mode
  deploymentMode: string = 'EL';
  endPointExt: any;
  showLogin: boolean = false;

  // change password variables
  changePasswordForm: FormGroup;
  isValid: boolean;
  emailRegExp=/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
  passwordErrorMsg = '';
  passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,}/;
  passwordStrength = '';
  strengthContent: String;
  strengthColor: String;
  logedInUser: String;
  logedInPassword: any;
  checkUpperCaseLetter: any;
  checkLowerCaseLetter: any;
  checkNumberCharecter: any;
  checkSpecialCharecter: any;
  minLegthChecker: any;

  status: string = 'failed';

  licenseData: any;
  disableBtn: boolean = false;
  /**disableInput: boolean = false;*/
  /**landingPageRoute: string = 'dashboard/'; */
  initSubscription: Subscription;
  isMobile: boolean = false;
  /**innerWidth;*/
  /**isValidFields: boolean = false;*/
  public serverAddress: string;
  selectedProtocol: string = 'http';
  appMode: string;

  /**profiles: any = [];*/
  currentProfile: object = {};
  storedProfiles: any = [];
  isMultiProfile = false;

  isAnyProfileSaved = false;

  userProfileImage: string = '';

  isloginUsingProfile = false;
  isMultiProfileClicked = false; //'true' when a profile is clicked on 'multi profile' view
  clickedProfileIndex: any; //to store index of clicked profile
  isRememberProfile = true;
  encDecKey = 'thisissecret';
  isServerMode = false;
  profileNewPassword: string = '';
  indexTitle: string;
  whiteLabel: string;
  isShowSwitchAccount: boolean = false;
  /**isEditProfileInvalid: boolean = true;*/

  /**fileList: File[] = [];*/
  // licenseFileName: string = '';
  // licenseKeyRegExp = /[A-Z0-9]{5}-[A-Z0-9]{5}/;
  /**enteredLicenseKey = '';
  enteredLicenseFile = '';*/
  /**licenseFile = '';
  licenseContent = [];*/
  holdUploadedLicenseFile: any;
  // license_Key = '';
  isShowLogin: boolean = false;
  disableFooter:boolean = false;
  disableLicenseUpdateBtn:boolean = false;
  resendMail:boolean = false;
  /**showPassword: boolean = false;
  showNewPassword:boolean=false;
  showConfirmPassword:boolean=false;
  showSApassword:boolean=false;*/
  fromMultiProfile:boolean=false;
  fromForgotPassword:boolean=false;
  passwordChanged:boolean=false;
  userImage:any;

  /**License update module */
  license_Key:string='';
  license_File : File = null;
  licenseFileName: string = '';
  licenseKeyRegExp = /[A-Z0-9]{5}-[A-Z0-9]{5}/;

  ngOnInit() {
    this.indexTitle = this._globals._appConfigurations['title'];
    this.whiteLabel = this._globals._appConfigurations['footer'];
    this._globals.setTitle(this.indexTitle);
    this.appMode = this._utility.appMode;
    if (this.appMode === 'server') {
      this.isServerMode = true;
    }
    this.isMultiProfile = this._globals._appConfigurations['multiProfile'];
    this.getStoredProfiles();
    if (localStorage.getItem('userDetails')) {
      this._route.navigate(['dashboard/']);
    } else {
      this.loadApplicationsJsons();
      this.deploymentMode = this._globals.deploymentMode;
    }

    /* detecting device */
    this.isMobile = this._globals._appConfigurations['isMobileUser'];
    this.changePasswordForm = this._formBuilder.group({
      current_password: ['', Validators.required],
      new_password: ['',[Validators.required,this._passwordSrength.passwordValidator,Validators.minLength(8)]],
      confirm_password: ['', Validators.required]
    });
  }

  // checkLicense() {
  //   try {
  //     const input = {};
  //     input['user_name'] = 'demo';
  //     input['password'] = 'password';
  //     this._appService.loginService(input).subscribe((response) => {
  //       if (response.status === 'success') {
  //         this.changeView('');
  //       } else {
  //         // this.changeView('organisation');
  //         this.changeView('');
  //       }
  //     });
  //   } catch (error) {

  //   }
  // }

  loadApplicationsJsons() {
    this._appService.getLoginApplicationList().subscribe((data) => {
      this.allApplictionJson = data;
    });
  }

  changeTransferProtocol(event) {
    this.selectedProtocol = event.target.value;
  }

  loginValidation(username, password, domainIP) {
    const isValidUserId = this.validateInputs(username, 'Username');
    const isValidPwd = this.validateInputs(password,'Password');
    let isValidIP;
    if (this.appMode === 'server') {
      isValidIP = this.validateInputs(domainIP,'DomainIP');
    }
    if (this.appMode === 'server' && isValidIP && isValidUserId && isValidPwd) {
      return true;
    } else if (!(this.appMode === 'server') && isValidUserId && isValidPwd) {
      return true;
    } else {
      return false;
    }
  }

  passProfile(value) {
    this.currentProfile = value;
    this.profileNewPassword = '';
  }

  getStoredProfiles() {
    if (localStorage.getItem('ACCOUNTS') == null) {
      localStorage.setItem('ACCOUNTS', '');
    }
    const decryptSavedProfiles = this._utility.decryptCryptoAES(
      localStorage.getItem('ACCOUNTS'),
      this.encDecKey
    );
    if (decryptSavedProfiles !== '') {
      this.storedProfiles = JSON.parse(decryptSavedProfiles);
    }
    if (
      this.storedProfiles.length === 0 ||
      this.storedProfiles == undefined ||
      this.storedProfiles === ''
    ) {
      this.storedProfiles = [];
      this.isAnyProfileSaved = false;
      this.isloginUsingProfile = false;
    } else {
      this.isAnyProfileSaved = true;
      this.isloginUsingProfile = true;
      this.pageView = "multiProfile";
    }
  }

  async storeProfiles(user, rawPassword, serverIP) {
    let isProfileSaved = false;
    let i;
    if (this.isloginUsingProfile) {
      isProfileSaved = true;
    }
    const decryptSavedProfiles = this._utility.decryptCryptoAES(
      localStorage.getItem('ACCOUNTS'),
      this.encDecKey
    );
    if (decryptSavedProfiles == '' || decryptSavedProfiles == undefined) {
      this.storedProfiles = [];
    } else {
      this.storedProfiles = JSON.parse(decryptSavedProfiles);
    }
    if (this.storedProfiles.length > 0) {
      let profile;
      for (i = 0; i < this.storedProfiles.length; i++) {
        profile = this.storedProfiles[i];
        if (this.appMode === 'server' ) {
          if (profile.hasOwnProperty('domain') && profile['domain'] === serverIP && profile.hasOwnProperty('username') && profile['username'] === user['user_name']) {
              isProfileSaved = true;
              break;
          }
        } else {
          if (profile.hasOwnProperty('username') && profile['username'] === user['user_name']) {
            isProfileSaved = true;
            break;
          }
        }
      }
    }
    if (!isProfileSaved) {
      this.userProfileImage = user['user_name'].charAt(0);
      const profileObject = {};
      if ((this.appMode = 'server')) {
        profileObject['domain'] = serverIP;
      }
      profileObject['username'] = user['user_name'];
      profileObject['password'] = rawPassword;
      profileObject['profileImage'] = this.userProfileImage;
      if (!this.isloginUsingProfile) {
        this.storedProfiles.push(profileObject);
      }
    } else if (isProfileSaved || (isProfileSaved && this.isRememberProfile)) {
      this.storedProfiles[i]['password'] = rawPassword;
    }
    localStorage.setItem(
      'ACCOUNTS',
      this._utility.encryptCryptoAES(this.storedProfiles, this.encDecKey)
    );
  }

  /**
  async verifySavedProfile(profile, user) {
    if (
      profile.hasOwnProperty('username') &&
      profile['username'] === user['user_name']
    ) {
      return true;
    }
  }
  */

  loginUsingProfile(profile, index) {
    this.login(profile['username'], profile['password'], profile['domain']);
    this.isMultiProfileClicked = true;
    this.clickedProfileIndex = index;
    // this.disableBtn = true;
  }

  login(username, password, domainIP) {
      const isValidInputs = this.loginValidation(username, password, domainIP);
      if (isValidInputs) {
        this._utility.serverIP = domainIP;
        switch (this.appMode) {
          case 'server':
            if (this.isloginUsingProfile) {
              this._utility.serverAddress = domainIP;
            } else {
              this._utility.serverAddress =
                this.selectedProtocol + '://' + domainIP;
              this._utility.transferProtocol = this.selectedProtocol;
            }
            const serverData = {
              mode: this.appMode,
              protocol: this.selectedProtocol,
              ip: domainIP
            };
            localStorage.setItem(
              'SERVER_INFO',
              this._utility.encryptCryptoAES(serverData, 'thisissecret')
            );
            break;

          case 'cloud':
            let transferProtocol = 'http';
            if (this._globals._appConfigurations['MQTT']['useSSL']) {
              transferProtocol = 'https';
            } else {
              transferProtocol = 'http';
            }
            this._utility.transferProtocol = transferProtocol;
            this._utility.serverAddress =transferProtocol +'://' +this._globals._appConfigurations['MQTT']['ip'];
            break;
        }
        const currTime: any = Math.floor(Date.now() / 1000);
        const user = {};
        user['user_name'] = username;
        user['current_time'] = currTime;
        user['password'] = this._utility.encryptByHash(password,'thisissecret');
        this.disableBtn = true;
        this.disableFooter=true;
        this._appService.loginService(user).subscribe((response) => {
          if (response.status === 'success') {
            // this.disableBtn = false;
            this._utility.mqttSettings(this._globals._appConfigurations);
            if (
              this._globals._appConfigurations['multiProfile'] &&
              (this.isRememberProfile || this.isloginUsingProfile)
            ) {
              this.storeProfiles(user, password, this._utility.serverAddress);
            }
            this.logedInUser = username;
            this.logedInPassword = this._utility.encryptByHash(password,'thisissecret');
            // this.getUserTheme();
            if (this.deploymentMode === 'EL' && this._auth.Download) {
              const subject = new Subject<any>();
              let licenseData$ = this.alterLocalStorageOnLicense();
              licenseData$.subscribe((licenseData) => {
                if (licenseData) {
                  return subject.asObservable();
                } else {
                  return subject.next(licenseData);
                }
              });
            }
            // JWT
            const initReady$ = this._appTokenService.doTokenOnLoginRefresh(false,username,response);
            this.initSubscription = initReady$.subscribe((data) => {
              if (data === 'dataInitialized') {
                this.getUserTheme();
                this.initSubscription.unsubscribe();
                if (this.isloginUsingProfile || this.passwordRegExp.test(password)) {
                  const isJSONReady$ = this._appTokenService.processJSON();
                } else {
                  this.changeView('changePassword');
                }

              }
            });
            const dataToMail = {
              userName: this.form.username,
              loginTime: new Date()
            };
            this.sendMailOnUserLogin(dataToMail);
          } else {
            // if(this.fromMultiProfile){
            //   this.form.password='';
            // }
            this.changeView('showLogin');
            this.disableBtn = false;
            this.disableFooter=false;
            this._toastLoad.toast('error', 'Error', response['message'], true);
            this.form.username=username;
            // this.form.password=password;
          }
          // this.isloginUsingProfile = false;
        },(err) => {
          this.disableBtn = false;
          this.disableFooter=false;
          this.isMultiProfileClicked=false;
          this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
        });
      }
  }

  removeProfile() {
    const profile = this.currentProfile;
    for (let i = 0; i < this.storedProfiles.length; i++) {
      const element = this.storedProfiles[i];
      if (this.appMode === 'server') {
        if (
          profile.hasOwnProperty('domain') &&
          element.hasOwnProperty('domain') &&
          profile['domain'] === element['domain'] &&
          element.hasOwnProperty('username') &&
          profile['username'] === element['username']
        ) {
          this.storedProfiles.splice(i, 1);
        }
      } else {
        if (
          element.hasOwnProperty('username') &&
          profile['username'] === element['username']
        ) {
          this.storedProfiles.splice(i, 1);
        }
      }
      localStorage.setItem(
        'ACCOUNTS',
        this._utility.encryptCryptoAES(this.storedProfiles, this.encDecKey)
      );
      if (this.storedProfiles.length === 0) {
          this.isAnyProfileSaved = false;
          this.isloginUsingProfile = false;
          this.form.username='';
          this.form.password='';
        }
    }
  }

  rememberProfile(event) {
    this.isRememberProfile = event;
  }

  /** 
   onEditingPassword() {
     if (this.profileNewPassword == '' || this.profileNewPassword == undefined) {
       this.isEditProfileInvalid = true;
      } else {
        this.isEditProfileInvalid = false;
      }
    }
  */

  /** 
   * editProfile() {
    const profile = this.currentProfile;
    if (!this.isEditProfileInvalid) {
      for (let i = 0; i < this.storedProfiles.length; i++) {
        const element = this.storedProfiles[i];

        if (this.appMode === 'server') {
          if (
            profile.hasOwnProperty('domain') &&
            element.hasOwnProperty('username') &&
            profile['domain'] === element['domain'] &&
            profile['username'] === element['username']
          ) {
            element['password'] = this.profileNewPassword;
            break;
          }
        } else {
          if (
            profile.hasOwnProperty('username') &&
            profile['username'] === element['username']
          ) {
            element['password'] = this.profileNewPassword;
            break;
          }
        }
      }
      localStorage.setItem(
        'ACCOUNTS',
        this._utility.encryptCryptoAES(this.storedProfiles, this.encDecKey)
      );
      this.isEditProfileInvalid = true;
      this.changePasswordWindowClose.nativeElement.click();
      this._toastLoad.toast('success', 'Success', 'Password updated successfully', true);
    }
  }
  */

  /**
   * resetLoginView() {
    if (this.storedProfiles.length > 0) {
      this.isAnyProfileSaved = true;
    } else {
      this.isAnyProfileSaved = false;
    }
  }
  */

  validateInputs(inputData: any, inputType:string) {
    if (inputData === '' || inputData === null) {
      this._toastLoad.toast('warning','Information',`${inputType} required`,true);
      return false;
    } else {
      switch (inputType) {
        case 'Username':
          if(this.emailRegExp.test(inputData)){
            return true
          }else{
            this._toastLoad.toast('warning','Information',`Invalid email id`,true);
            return false
          }
          break;
        case 'New password':
          if(this.passwordRegExp.test(inputData)){
            return true
          }else{
            this._toastLoad.toast('warning','Information',`New password must pass all the validations`,true);
            return false
          }
          break; 
      }
      return true
    }
  }

  //send mail
  sendMailOnUserLogin(event: any) {
    const dataToSend = {};
    this._appService.getdefaultMailSettings(dataToSend).subscribe((dataContentDB) => {
        if (dataContentDB[0].data.emails.enable === true) {
          const mailData = dataContentDB[0].data.emails.login.onLoginMailTo;

          // check if mail after user login is enabled
          if (mailData.enable === true) {
            let dataToSend = {};
            let isMailBodyString: boolean = false;
            isMailBodyString = this.composeBodyOfUserLoginMail(event);
            if (isMailBodyString) {
              dataToSend = this.validateEmail(mailData,this.bodyOfMail,'An User Logged In!..');
              this._appService.getPassSA(dataToSend).subscribe((data) => {
                if (data.status === 'success') {
                  this._toastLoad.toast('info','Information','Logged in successfully',true);
                } else {
                  this._toastLoad.toast('error', 'Error', 'Oops!..', true);
                }
              },(err) => {
                this.disableBtn = false;
                this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
              });
            }
          }
        }
      },(err) => {
        this.disableBtn = false;
        this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
      });
  }

  validateEmail(mailObject: any, dataToMail: any, subject: string) {
    let ccMailIds: string;
    let bccMailIds: string;
    let toMailIds: string;
    let mailSubject: string;
    this.input = {};

    // Subject is mandatory
    mailSubject = subject;

    for (const key in mailObject) {
      if (mailObject.hasOwnProperty(key)) {
        const element = mailObject[key];
        if (element.enable === true || key == 'toMailIds') {
          switch (key) {
            case 'cc':
              ccMailIds = element['mailIds'][0];
              break;

            case 'bcc':
              bccMailIds = element['mailIds'][0];
              break;

            case 'toMailIds':
              toMailIds = element[0];
              break;

            default:
              console.log('Case ' + key + 'not found!..');
              break;
          }
        }
      }
    }
    return this.composeMail(
      mailSubject,
      dataToMail,
      toMailIds,
      ccMailIds,
      bccMailIds
    );
  }

  composeMail(mailSubject, bodyOfMail, to, cc, bcc) {
    return {
      subject: mailSubject,
      body: bodyOfMail,
      eMail: to,
      cc: cc,
      bcc: bcc
    };
  }

  composeBodyOfUserLoginMail(dataToMail: any) {
    let message: string = '';
    // bodyOfMail['loginTime'] = ;
    // tslint:disable-next-line: forin
    for (const key in dataToMail) {
      if (dataToMail.hasOwnProperty(key)) {
        switch (key) {
          case 'userName':
            message = 'An user with user name ' + dataToMail[key] + ' ';
            break;

          case 'loginTime':
            message = 'logged-in on ' + dataToMail[key] + '\n';
            break;

          default:
            message = key + ':' + dataToMail[key] + '\n';
            break;
        }
      }
      this.bodyOfMail = this.bodyOfMail + message;
    }
    return true;
  }

  getUserTheme() {
    try {
      // let userDetails = this._auth.decryptUserDetails();
      let userDetails = this._dataStore.userInfo;
      this.userTheme = userDetails.theme.selectedTheme;
      if (this.userTheme == '' || this.userTheme == undefined) {
        this.userTheme = 'theme-default';
      }
      this._dataSharing.userThemeDataSharing(this.userTheme);
    } catch {
      console.log('Some error after login..');
    }
  }

  // getSessionId() {
  //   this._appService.getSessionkeyService().subscribe((response) => {
  //     console.log('image', response);
  //     return response;
  //   });
  // }
  /**
   *
   * @param view pass view parameter
   */
  changeView(view) {
    // this.form = {
    //   username: '',
    //   password: '',
    //   oldPassword: '',
    //   newPassword: '',
    //   forgotKey: '',
    //   client: '',
    //   confirmPassword: '',
    //   domainIP: '',
    // };
    /**
     * this.showPassword = false;
    this.showConfirmPassword=false;
    this.showNewPassword=false;
    this.showSApassword=false;
    */
    this.disableBtn = false;
    this.showLogin = false;
    this.showSAlogin = false;
    // this.showRegisterPage = false;
    // this.showForgotFields = false;
    // this.isloginUsingProfile = false;
    this.isShowSwitchAccount = true;
    this.isValid=false; 
    /**
    if (view === 'SA login') {
      this.pageView = view;
      this.showSAlogin = true;
      this.form['client'] = '';
      this.getClientList();
    }
    */
    /**
    if (view == 'Register') {
      this.pageView = view;
      this.checkDeploymentMode();
      this.showRegisterPage = true;
    }
    */
    if (view == 'licenseUpdate') {
      /**this.licenseForm.reset();*/
      this.licenseFileName='';
      this.license_Key='';
      this.license_File=null;
      this.disableLicenseUpdateBtn=false;
      this.uploadedLicenseFile.nativeElement.value = null;
      if (this.isShowLogin == false) {
        // this.licenseFileName = '';
        // this.showLogin = false;
        /**this.licenseForm.reset();*/
        this.isShowSwitchAccount = false;
      } else if (this.isShowLogin == true) {
        // this.licenseFileName = '';
        /**this.licenseForm.reset();*/
        this.showLogin = false;
        // this.isMultiProfile = true;
        this.isShowSwitchAccount = true;
      }
    }
    if (view == 'licenseModalDismiss') {
      if (this.pageView === 'multiProfile') {
        this.isShowSwitchAccount = false;
      }
      if (this.pageView === 'showLogin') {
        this.showLogin = true;
      }
      // if (this.isShowLogin == false) {
      //   this.isShowSwitchAccount = false;
      //   this.showLogin = false;
      // } else if (this.isShowLogin == true) {
      //   this.isShowSwitchAccount = true;
      //   this.showLogin = true;
      // }
    }
    if (view === 'multiProfile' && this.isMultiProfile) {
      this.pageView = view;
      this.isAnyProfileSaved = true;
      this.isloginUsingProfile = true;
      this.isShowSwitchAccount = false;
      // this.isLoginPage = false;
      this.isShowLogin = false;
      this.isMultiProfileClicked = false;
      this.clickedProfileIndex = '';
      this.fromMultiProfile=true;
    }
    if (view === 'showLogin') {
      this.pageView = view;
      this.isAnyProfileSaved = false;
      this.isloginUsingProfile = false;
      this.isShowLogin = true;
      this.isMultiProfileClicked = false;
      if(this.fromMultiProfile){
        // this.form.username='';
        this.form.password='';
      }
      this.fromMultiProfile=false;
      this.fromForgotPassword=false;
      // this.isMultiProfile = false;
    }
    
    if (view === 'changePassword') {
      this.pageView = view;
      this.showLogin = false;
      // this.isShowLogin = true;
      // this.showForgotFields = false;
      // this.fromForgotPassword=true;
      this.form.password='';
      this.form.confirmPassword='';
      this.form.forgotKey='';
      this.form.newPassword='';
    }
    
    if (view === 'Forgot Password') {
      this.pageView = view;
      this.showLogin = false;
      this.isShowLogin = true;
      this.showForgotFields = false;
      this.fromForgotPassword=true;
      this.form.password='';
      this.form.confirmPassword='';
      this.form.forgotKey='';
      this.form.newPassword='';
    }
    // if (view === 'alreadyHaveForgotKey') {
    //   this.pageView = view;
    //   this.showForgotFields = true;
    //   this.showLogin = false;
    // }
    this.passwordErrorMsg = '';
    this.strengthContent = '';
    this.strengthColor = '';
  }

  // Get ClientList to Display for SA login
  // Method to fetch all the clients
  getClientList() {
    const dataToSend = {};

    this._appService.getClientList(dataToSend).subscribe((data) => {
      if (data.status === 'failed' || data.data.length === 0) {
        this.createClient();
      }
      this.clientListDropDown = data.data;
      this.clientDropdownSettings = {
        singleSelection: true,
        labelKey: 'label',
        primaryKey: 'value',
        text: 'Select Client',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: true,
        classes: 'myclass custom-class'
      };
    },(err) => {
      this.disableBtn = false;
      this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
    });
  }

  createClient() {
    const dataToSend = {
      client_id: null,
      client_name: 'Client_1',
      client_description: 'Auto created client',
      client_address: '',
      client_logo_path: null,
      client_specific_info: [],
      user_id: 'elnet7@elmeasure.in'
    };
    this._appService.saveClientData(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast('success', 'Success', data.message, true);
        this.getClientList();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    },(err) => {
      this.disableBtn = false;
      this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
    });
  }

  /** Method for forgot password */
  forgotPassword() {
    this.resendMail = true;
    this.disableFooter=true;
      let input = {};
      /**
      if (this.form.username === '' || this.form.username === null) {
        this._toastLoad.toast('warning','Information','User ID required',true);
        this.resendMail=false;
        this.disableFooter=false;
        return;
      }
      if (this.emailRegExp.test(this.form.username)) {
      }else{
        this._toastLoad.toast('warning','Information','Invalid user ID',true);
        this.resendMail=false;
        this.disableFooter=false;
        return;
      }
      */
      this.isValid = this.validateInputs(this.form.username, 'Username');
      if(this.isValid){
      input['userName'] = this.form.username;
      if(!this.showForgotFields){
        this.disableBtn = true;
      }
      this._appService.forgotPassword(input).subscribe((response) => {
        if (response.status === 'success') {
          this.showForgotFields = true;
          this.disableBtn = false;
          this.disableFooter=false;
          this._toastLoad.toast('success','Success',response['message'],true);
          this.form.forgotKey = '';
          this.resendMail=false;
        } else {
          this._toastLoad.toast('error', 'Error', response['message'], true);
          this.disableBtn = false;
          this.disableFooter=false;
          this.resendMail=false;
        }
      },(err) => {
        this.disableBtn = false;
        this.resendMail=false;
        this.disableFooter=false;
        this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
      });
    } else {
        this.disableBtn = false;
        this.resendMail=false;
        this.disableFooter=false;
    }
  }

  /** Method to reset password */
  resetPassword() {
      let input = {};
      // if (this.form.username === '' || this.form.username === null) {
        /**this.passwordErrorMsg = 'User ID Required';*/
      //   this._toastLoad.toast('warning','Information','User ID required',true);
      //   return;
      // }
      // if (this.emailRegExp.test(this.form.username)) {
      // }else{
      //   this._toastLoad.toast('warning','Information','Invalid user ID',true);
      //   return;
      // }
      // if (this.form.forgotKey === '' || this.form.forgotKey === null) {
        /**this.passwordErrorMsg = 'Reset Key Required';*/
      //   this._toastLoad.toast('warning','Information','Reset key required',true);
      //   return;
      // }
      // if (this.form.newPassword === '' || this.form.newPassword === null) {
        /**this.passwordErrorMsg = 'New Password Required';*/
      //   this._toastLoad.toast('warning','Information','New password required',true);
      //   return;
      // }
      // if (this.passwordRegExp.test(this.form.newPassword)) {
      // } else {
        /**this.passwordErrorMsg =
          'New Password must be valid,Must Pass all the above validations';*/
      //   this._toastLoad.toast('warning','Information','New password must pass all the validations',true);
      //   return;
      // }
      // if (
      //   this.form.confirmPassword === '' ||
      //   this.form.confirmPassword === null
      // ) {
        /**this.passwordErrorMsg = 'Confirm Password Required';*/
        // this._toastLoad.toast('warning','Information','Confirm password required',true);
        // return;
      // }
      
      let isUsernameValid : boolean = this.validateInputs(this.form.username, 'Username');
      let isForgotKeyValid : boolean = this.validateInputs(this.form.forgotKey, 'Reset key');
      let isNewPasswordValid : boolean = this.validateInputs(this.form.newPassword, 'New password');
      let isConfirmPasswordValid : boolean = this.validateInputs(this.form.confirmPassword, 'Confirm password');
      // this.validateInputs(this.form.username, 'Username');
      if(isUsernameValid && isForgotKeyValid && isNewPasswordValid && isConfirmPasswordValid){
      if (this.form.newPassword === this.form.confirmPassword) {
        input['userName'] = this.form.username;
        input['key'] = this.form.forgotKey;
        input['new_password'] = this._utility.encryptByHash(
          this.form.newPassword,
          'thisissecret'
        );
        this.disableBtn = true;
        this.disableFooter=true;
        this._appService.resetPassword(input).subscribe((data) => {
          if (data.status === 'success') {
            this.changeView('showLogin');
            // this._globals.logout();
            this._appTokenService.logout();
            this._toastLoad.toast('success', 'Success', data['message'], true);
            this.disableBtn = false;
            this.disableFooter=false;
            this.form.username=input['userName'];
            this.form.password='';
          } else {
            this._toastLoad.toast('error', 'Error', data['message'], true);
            this.disableBtn = false;
            this.disableFooter=false;
          }
        },(err) => {
          this.disableBtn = false;
          this.disableFooter=false;
          this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
        });
      } else {
        /**this.passwordErrorMsg =
          'New Password and Confirm password are not matching';*/
        this._toastLoad.toast('warning','Information','New password and Confirm password are not matching',true);
        return;
      }
    } else {
      this.disableBtn = false;
      this.disableFooter=false;
      return
    }
  }

  alreadyHaveForgotKey() {
    this.showForgotFields = true;
    // this.pageView = this.pageView;
  }

  /**
  backToLogin() {
    this.disableBtn = false;
    this.changeView('showLogin');
  }
  */

  /** method to update license */
  updateLicense() {
    var formData: any = new FormData();
    /**if(this.licenseKeyRegExp.test(this.licenseForm.get('secret_key').value)){
      formData.append('secret_key', this.licenseForm.get('secret_key').value);
      formData.append('file', this.licenseForm.get('file').value);
    }else{
      this._toastLoad.toast('warning', 'Information', 'Enter valid license key', true);
      return
    }*/
    formData.append('secret_key', this.license_Key);
    formData.append('file', this.license_File);
    this.disableLicenseUpdateBtn=true
    this._appService.updateLicenseFD(formData).subscribe(
      (responseData) => {
        if (responseData.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            responseData['message'],
            true
          );
          this.licenseModalClose.nativeElement.click();
          // this.licenseForm.reset(); //  to reset the uploaded file it will be holding
          // this.license_Key = ''; //  to clear the license key field
          // this.licenseFileName = ''; //  to clear the license file name in the pop-up
          // this.disableBtn = true;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            responseData['message'],
            true
          );
          setTimeout(()=>{
            this.disableLicenseUpdateBtn = false;
          }, 5000);
        }
      },
      (err) => {
        this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
        setTimeout(() => {
            this.disableLicenseUpdateBtn = false;
      }, 5000);
      }
    );
  }

  /** To read contents of license file and send the contents only **/
  /**uploadLicense(event) {
    if (this.uploadedLicenseFile.nativeElement.value.length) {
      const uploadedFile = (event.target as HTMLInputElement).files[0]; //  to take out the file from the event
      this.holdUploadedLicenseFile = uploadedFile; //  to assign the file to a global value to hold the file for later reference
      this.licenseFileName = uploadedFile.name; //  show the filename in the form
      if (uploadedFile.size < 1600000) {
        //  check the file size
        this.licenseForm.patchValue({
          file: uploadedFile // make the licenseform.file value empty and assign the uploaded file
        });
        this.licenseForm.get('file').updateValueAndValidity();  //  update the form and let angular know file has been added to the input field
        // this.disableBtn = true;    //commented to prevent buttons in background from re-activating
      } else {
        this.licenseFileName = '';
        this._toastLoad.toast('warning','Information','Max file size allowed is 1.5 MB.',true);
        /**this.disableBtn = false;/////////
      }
    } else {
      // catch the cancel event
      const uploadedFile = this.holdUploadedLicenseFile; //  assign the previously stored file
      this.licenseForm.patchValue({
        file: uploadedFile //  make the licenseform.file value empty and assign the stored file
      });
      this.licenseForm.get('file').updateValueAndValidity(); // update the form and let angular know file has been added to the input field
      this.disableBtn = true;
    }
  }
  */

  uploadLicense(event) {
    if(event.target.files.length>0){
      this.license_File= event.target.files[0];
      this.licenseFileName= event.target.files[0].name;
    }else{
      this.licenseFileName= '';
      // this._renderer.setValue(this.uploadedLicenseFile.nativeElement.files, this.license_File);
      // this.uploadedLicenseFile.nativeElement.files[0]=this.license_File;
      // this.uploadedLicenseFile.nativeElement.value = this.license_File;
    }
  }

  // Mail Id's from data-content
  /**
  verifySAEmails() {
      if (this.form.username === '' || this.form.username === null) {
        this._toastLoad.toast('warning','Information','User ID required',true);
        return;
      } else {
        this.disableBtn = true;
        switch (this.deploymentMode) {
          case 'KL':
            this.getSApassword();
            break;

          case 'EL':
            const dataToSend = {};
            this._appService.getdefaultMailSettings(dataToSend).subscribe((dataContentDB) => {
                if (dataContentDB[0]['data']['emails']['enable'] === true) {
                  const objectSA =dataContentDB[0]['data']['emails']['systemAdmin'];
                  if (objectSA['enable'] === true) {
                    let allowedSAmailId: any = [];
                    // SAmailId = dataContentDB['emails']['systemAdminEmails'];
                    allowedSAmailId = objectSA['allowedMailIdSystemAdmin'];
                    for (let i = 0; i < allowedSAmailId.length; i++) {
                      if (this.form.username === allowedSAmailId[i]) {
                        this.isSAMailId = true;
                        this.getSApassword();
                        break;
                      } else {
                        this.isSAMailId = false;
                      }
                    }
                    if (!this.isSAMailId) {
                      this._toastLoad.toast('error','Error','Enter valid system admin mail id',true);
                    }
                  }
                }
              }),(err) => {
                this.disableBtn = false;
                this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
              };
            break;
        }
      }
  }
   */

  /**
  getSApassword() {
    // this.loadApplicationsJsons();
    let input = {};
    input = {
      subject: this.allApplictionJson['sa-login'].subject,
      cc: this.allApplictionJson['sa-login'].cc,
      bcc: this.allApplictionJson['sa-login'].bcc,
      eMail: this.form.username
    };
    input['eMail'] = this.form.username;
    this._appService.getPassSA(input).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast('success', 'Success', data['message'], true);
        this.showSAlogin = true;
        this.disableBtn = false;
      } else {
        this._toastLoad.toast('error', 'Error', data['message'], true);
        this.disableBtn = false;
      }
    },(err) => {
      this.disableBtn = false;
      this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
    });
  }
  */

  /**
  saPasswordShow() {
    this.showSAlogin = false;
  }
  */
  /**
  saLogin() {
      try {
        let input = {};
        if (this.form.username === '' || this.form.username === null) {
          this._toastLoad.toast('warning','Information','User ID required',true);
          return;
        }
        if (this.form.password === '' || this.form.password === null) {
          this._toastLoad.toast('warning','Information','Password required',true);
          return;
        }
        if (this.form.client === '' || this.form.client === null) {
          this._toastLoad.toast('warning','Information','Client required',true);
          return;
        }
        input['client_id'] = this.form.client[0]['value'];
        input['user_name'] = this.form.username;
        input['password'] = this.form.password;
        this.disableBtn = true;
        this._appService.saloginService(input).subscribe((response) => {
          if (response.status == 'success') {
            this.disableBtn = false;
            response = {
              data: {
                user_id: 'user_0',
                fullName: 'System Admin',
                userName: 'SA',
                isSystemAdmin: true,
                eMail: 'suresh.babu@elmeasure.com',
                phone: 867564,
                workGroup: [
                  {
                    work_group_id: 'work_group_1'
                  }
                ],
                userRole: 'user_role_3',
                language: '',
                password: 'password',
                theme: '',
                passwordExpiresIn: {
                  days: null,
                  isChecked: false
                },
                accountExpiresIn: {
                  date: null,
                  isChecked: false
                },
                AccessLevel: {
                  sites: [
                    {
                      node_id: 'industry_9',
                      parent_id: 'industry_9'
                    },
                    {
                      node_id: 'node_204',
                      parent_id: 'industry_9'
                    },
                    {
                      node_id: 'industry_25',
                      parent_id: 'industry_25'
                    },
                    {
                      node_id: 'node_205',
                      parent_id: 'industry_25'
                    }
                  ],
                  Permisssions: []
                },
                userRoleName: 'All Access',
                userRolePermissions: {
                  accessLevel: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 5,
                    name: 'Access Level',
                    url: 'configurations/userManagement/accessLevel',
                    view: true
                  },
                  alarmConfigurations: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 12,
                    name: 'Alarm Configurations',
                    url: 'configurations/alarm/alarms',
                    view: true
                  },
                  alarmEvents: {
                    acknowledge: true,
                    create: true,
                    delete: true,
                    edit: true,
                    id: 57,
                    name: 'Alarms / Events',
                    url: 'alarm-events',
                    view: true
                  },
                  alarmPriorityTypes: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 13,
                    name: 'Alarm Priority Types',
                    url: 'configurations/alarm/alarmPriorityTypes',
                    view: true
                  },
                  assets: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 59,
                    name: 'Assets',
                    url: 'assets',
                    view: true
                  },
                  dashboard: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 53,
                    name: 'Dashboard',
                    resize: true,
                    url: 'dashboard',
                    view: true
                  },
                  devices: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 7.1,
                    name: 'Device Configuration',
                    url: 'configurations/gatewayDevices/gatewaylist',
                    view: true
                  },
                  gateways: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 7,
                    name: 'Channel Configuration',
                    url: 'configurations/gatewayDevices/gatewaylist',
                    view: true
                  },
                  manualEntry: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 17,
                    name: 'Manual Entry',
                    url: 'configurations/manual-entry',
                    view: true
                  },
                  maps: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 58,
                    name: 'Maps',
                    url: 'maps',
                    view: true
                  },
                  masterConfiguration: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 24,
                    name: 'Master Configuration',
                    url: 'configurations/masterConfig',
                    view: true
                  },
                  reports: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 54,
                    name: 'Reports',
                    url: 'reports',
                    view: true
                  },
                  ruleEngine: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 10,
                    name: 'Rule Engine',
                    url: 'configurations/rule-engine',
                    view: true
                  },
                  scada: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 56,
                    name: 'Scada',
                    url: 'scada',
                    view: true
                  },
                  sites: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 1,
                    name: 'Site Configuration',
                    url: 'configurations/sites',
                    view: true
                  },
                  tags: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 24.1,
                    name: 'Tag Configuration',
                    url: 'configurations/masterConfig/parameters',
                    view: true
                  },
                  thresholds: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 14,
                    name: 'Thresholds',
                    url: 'configurations/alarm/thresholds',
                    view: true
                  },
                  trends: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 55,
                    name: 'Trends',
                    url: 'trends',
                    view: true
                  },
                  userList: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 3,
                    name: 'User List',
                    url: 'configurations/userManagement/userList',
                    view: true
                  },
                  widgets: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 52,
                    name: 'Widgets',
                    url: 'dashboard',
                    view: true
                  },
                  workGroup: {
                    create: true,
                    delete: true,
                    edit: true,
                    id: 4,
                    name: 'Work Group',
                    url: 'configurations/userManagement/workGroup',
                    view: true
                  }
                }
              }
            };
            this._auth.storeUserDetails(response.data);
            this.alterLocalStorageOnLicense();
            this.getUserTheme();
            this._appTokenService.processJSON();
          } else {
            this._toastLoad.toast('error', 'Error', response['message'], true);
            this.disableBtn = false;
          }
        },
          (err) => {
            this.disableBtn = false;
            this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
          });
      } catch (error) { }
    }
  }
  */

  alterLocalStorageOnLicense(): Observable<any> {
    const subjectOut = new ReplaySubject();
    // License limitation check through endpoint
    if (localStorage.getItem('userDetails')) {
      try {
        const userDetails = this._auth.decryptUserDetails();
        if (userDetails.hasOwnProperty('userRolePermissions')) {
          const input = {
            filter: [{ site_id: this._globals.getCurrentUserSiteId() }]
          };
          this._appService.loginLicense(input).subscribe((data) => {
            //let response =data;
            let response = JSON.parse(JSON.stringify(data));
            if (response.status == 'success' && response.data) {
              if (response.data.hasOwnProperty('is_license_expried') && response.data.is_license_expried) {
                this._toastLoad.toast(
                  'info','','Your license has expired, please update the license.',true);
                // this._globals.logout();
                this._appTokenService.logout();
                return subjectOut.next(false);
              }
              userDetails.userRolePermissions = userDetails.userRolePermissions ? this.setLocalstorage(userDetails.userRolePermissions,response.data)
                : userDetails.userRolePermissions;
              localStorage.removeItem('userDetails');
              this._auth.storeUserDetails(userDetails);
              return subjectOut.next(true);
              // const userDetails1 = this._auth.decryptUserDetails();
            } else {
              this._toastLoad.toast('error','Error',response['message'],true);
              this._auth.storeUserDetails(userDetails);
              return subjectOut.next(false);
            }
          },(err) => {
            this.disableBtn = false;
            this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
          });
        }
        return subjectOut.asObservable();
      } catch (error) { }
    }
  }

  setLocalstorage(destObj, sourceObj) {
    for (var [key, value] of Object.entries(sourceObj)) {
      //value = false;
      if (destObj.hasOwnProperty(key) && !value) {
        delete destObj[key];
      }
    }
    return destObj;
  }

  /* Method to change password */
  changePassword(formData: any) {
    if (this.changePasswordForm.valid) {
      if (
        this.changePasswordForm.value.current_password ===this.changePasswordForm.value.new_password) {
        this.passwordErrorMsg =
          'Current Password and New Password Should not be same';
        return;
      } else if (this.changePasswordForm.value.new_password ===this.changePasswordForm.value.confirm_password) {
        this.passwordErrorMsg = '';
        let enycOldPassword = this._utility.encryptByHash(
          this.changePasswordForm.value.current_password,
          'thisissecret'
        );
        let enycNewPassword = this._utility.encryptByHash(
          this.changePasswordForm.value.new_password,
          'thisissecret'
        );
        if (this.logedInPassword === enycOldPassword) {
          const input = {};
          input['userName'] = this.logedInUser;
          input['old_password'] = enycOldPassword;
          input['new_password'] = enycNewPassword;
          this.disableBtn = true;
          this._appService.changePassword(input).subscribe((response) => {
            if (response.status === 'success') {
              this.pageView = 'showLogin';
              // this._globals.logout();
              this._appTokenService.logout();
              this._toastLoad.toast('success','Success',response['message'],true);
              this.ngOnInit();
              this.disableBtn = false;
            } else {
              this._toastLoad.toast('error','Error',response['message'],true);
              this.disableBtn = false;
            }
          },(err) => {
            this.disableBtn = false;
            this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
          });
        } else {
          this._toastLoad.toast('error','Error','Enter Correct Old Password',true);
        }
      } else {
        this.passwordErrorMsg ='New Password and Confirm password are not matching';
        return;
      }
    }
  }
  
  onInput() {
    this.passwordErrorMsg = '';
  }
  onStrengthChange(passed) {
    if (passed === null) {
      this.strengthColor = 'white';
    } else {
      const strength = this._passwordSrength.passordStrengthChecker(passed);
      this.strengthContent = strength.content;
      this.strengthColor = strength.color;
    }
  }
  onKey(event: any) {
    let val = event.target.value;
    let upperCaseCharacters = /[A-Z]+/g;
    let lowerCaseCharacters = /[a-z]+/g;
    let numberCharacters = /[0-9]+/g;
    let specialCharacters = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/;
    if (upperCaseCharacters.test(val) === false) {
      this.checkUpperCaseLetter = false;
    } else {
      this.checkUpperCaseLetter = true;
    }
    if (lowerCaseCharacters.test(val) === false) {
      this.checkLowerCaseLetter = false;
    } else {
      this.checkLowerCaseLetter = true;
    }
    if (numberCharacters.test(val) === false) {
      this.checkNumberCharecter = false;
    } else {
      this.checkNumberCharecter = true;
    }
    if (specialCharacters.test(val) === false) {
      this.checkSpecialCharecter = false;
    } else {
      this.checkSpecialCharecter = true;
    }

    if (this.form.newPassword.length >= 8) {
      this.minLegthChecker = true;
    } else {
      this.minLegthChecker = false;
    }
  }
  onKeyPress(event) {
    var k = event ? event.which : event.keyCode;
    if (k == 32) {
      return false;
    } else {
      return true;
    }
  }

  /**
   *  Registeration Form
   */
  /**
  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
    this.endPointExt = this._globals.deploymentModeAPI;
  }
  */
 /**
  registerEnquiry() {
      this.disableBtn = true;
      this._toastLoad.toast('success','Success','Registered successfully',true);
      const dataToSend = {};
      this._appService.getdefaultMailSettings(dataToSend).subscribe(async (dataContentDB) => {
          let promise = this.sendMailAfterRegister(
            dataContentDB,
            this.registrationForm
          );
      },(err) => {
          this.disableBtn = false;
          this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
      });
  }
   */
  //send mail
  /**
  async sendMailAfterRegister(dataContentDB, event: any) {
    if (dataContentDB[0].data.emails.enable === true) {
      const mailData =
        dataContentDB[0].data.emails.registration.onRegisterMailTo;

      // check if mail after registration is enabled
      if (mailData.enable === true) {
        let dataToSend: any = {};
        let mailBodyObject = await this.mapLabelsToKeyMail(event);
        let mailBodyString = await this.composeBodyOfRegistrationMail(
          mailBodyObject
        );
        dataToSend = await this.validateEmail(
          mailData,
          mailBodyString,
          'New User Registeration'
        );
        await this.sendMail(dataToSend);
      }
    }
  }
   */
  /**
  async sendMail(dataToSend: any) {
    this._appService.register(this.endPointExt, dataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast('info','Information','We will Contact you shortly',true);
          this.disableBtn = false;
        } else {
          this._toastLoad.toast('error', 'Error', 'Some error occured', true);
          this.disableBtn = false;
        }
      },(err) => {
        this.disableBtn = false;
        this._toastLoad.toast('error', 'Error', 'Failed to reach server', true);
      });
  }
   */
  /**
  async mapLabelsToKeyMail(dataToMail) {
    // const dfmFields = this.DFMinput['headerContent'][0]['data'];
    let mapKeysToNames: any = [
      { key: 'regName', label: 'Name' },
      { key: 'regOrgName', label: 'Organisation Name' },
      { key: 'regPhoneNumber', label: 'Phone Number' },
      { key: 'regEmail', label: 'Mail Id' }
    ];

    let KeyLabelMapped: any = {};
    for (const dataToMailKey in dataToMail) {
      if (dataToMail.hasOwnProperty(dataToMailKey)) {
        for (let i = 0; i < mapKeysToNames.length; i++) {
          const keyNameObject = mapKeysToNames[i];
          if (dataToMailKey === keyNameObject['key']) {
            KeyLabelMapped[keyNameObject['label']] = dataToMail[dataToMailKey];
          }
        }
      }
    }
    return KeyLabelMapped;
  }
   */
  /**
  async composeBodyOfRegistrationMail(dataToMail: any) {
    let message: string = '';
    let bodyOfMail: string = '';
    for (const key in dataToMail) {
      if (dataToMail.hasOwnProperty(key)) {
        message = key + ':' + dataToMail[key] + '\n';
      }
      bodyOfMail = bodyOfMail + message;
    }
    return bodyOfMail;
  }
   */

  trackByFn(index) {
    return index;
  }

  /**
  togglePassword(){
    this.showPassword=!this.showPassword;
  }

  toggleNewPassword(){
    this.showNewPassword=!this.showNewPassword;
  }

  toggleConfirmPassword(){
    this.showConfirmPassword=!this.showConfirmPassword;
  }

  toggleSApassword(){
    this.showSApassword=!this.showSApassword;
  }
  */
}
