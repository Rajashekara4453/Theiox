import {
  Component,
  OnInit,
  ElementRef,
  ViewChildren,
  QueryList,
  ViewChild
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppService } from '../../../../services/app.service';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { UtilityFunctions } from '../../../../../app/utilities/utility-func';
import { globals } from '../../../../utilities/globals';
import { AuthGuard } from '../../../auth/auth.guard';
import { PasswordStrength } from '../../../login/password-strength';
import { AppTokenService } from '../../../../services/app-token.service';

@Component({
  selector: 'kl-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  constructor(
    private _appService: AppService,
    private _formBuilder: FormBuilder,
    private _toastLoad: ToastrService,
    private _utility: UtilityFunctions,
    private _globals: globals,
    private _auth: AuthGuard,
    private _passwordSrength: PasswordStrength,
    private _appTokenService: AppTokenService
  ) {}

  // @Output() updateUserDataOnHeader = new EventEmitter();
  @ViewChildren('themeId') myTheme: QueryList<ElementRef>;
  userProfileForm: FormGroup;
  user_id: string = '';
  fullName: string = '';
  userName: string = '';
  eMail: string = '';
  phone: number;
  newPassword: string = '';
  confirmPassword: string = '';
  theme: string = 'theme-default';
  userImagePath: any;
  workGroup: any = [];
  userRole: any = [];
  passwordExpiredInDays: any;
  public accountExpiresIn: Date;
  isValid: boolean;

  // Variables for Theme
  themeLightSelected: boolean = true;
  themeDarkSelected: boolean = false;
  themeLightNotSelected: boolean = false;
  themeDarkNotSelected: boolean = true;

  previousThemeElement: any;

  // Variables for Language Dropdown
  languagesDropdownSettings: any = [];

  userProfileData: any = {};
  userData: any = {};
  workGroupList: any = [];
  userRoleList: any = [];
  language: any;
  languagesDropDown: any = [];
  workGroupJSON: any = {};
  workGroupArray: any = [];
  userImage: string = '';
  selectedLanguage: any = [];
  isAccountExpiryEnabled: boolean = false;
  isPasswordExpiryEnabled: boolean = false;

  /**
   *
   * @param view pass view parameter
   */
  pageView: boolean = false;

  oldPassword: string = '';
  loginId: string = '';

  form = {
    loginId: '',
    oldPassword: '',
    newPassword: ''
  };
  files: any;

  filestring: string = '';
  disableUpdate: boolean = false;

  // Variable for Multi-tenant model
  site_id: any;
  deploymentMode: string = 'EL';
  endPointExt: any;

  dataToSend: any = {};
  changePasswordForm: FormGroup;
  passwordErrorMsg = '';
  passwordStrength = '';
  strengthContent: String;
  strengthColor: String;
  checkUpperCaseLetter: any;
  checkLowerCaseLetter: any;
  checkNumberCharecter: any;
  checkSpecialCharecter: any;
  themeList: any = {
    themeNames: []
  };
  @ViewChild('changePasswordWindoClose') changePasswordWindoClose: ElementRef;
  @ViewChild('userImageInput') userImageInput;

  imageTitle: string = '';
  isElmChecked: boolean = true;
  isElmChecked2: boolean = false;
  userDataLoaded = false;
  isDefaultImage = true;
  shortUserName: string = '';

  ngOnInit() {
    this._globals.onLoadDataLogin();
    this.user_id = this._globals.userId;
    // Multi-tenant model
    this.site_id = this._globals.getCurrentUserSiteId();
    this.allowAccess();
    this.checkDeploymentMode();
    this.getThemeList();

    // Form to Add User
    this.userProfileForm = this._formBuilder.group({
      user_id: [''],
      fullName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      eMail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(12)]],
      theme: [''],
      language: ['', [Validators.required]],
      Imagefile: [null, Validators.required],
      accountExpiresIn: ['']
    });

    this.languagesDropdownSettings = this.allDropDownSettings(
      true,
      'Language_Id',
      'Language',
      'Search Language',
      'No Languages Available'
    );

    this.changePasswordForm = this._formBuilder.group({
      current_password: ['', Validators.required],
      new_password: [
        '',
        [
          Validators.required,
          this._passwordSrength.passwordValidator,
          Validators.minLength(8)
        ]
      ],
      confirm_password: ['', Validators.required]
    });
  }

  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
    this.endPointExt = this._globals.deploymentModeAPI;
    switch (this.deploymentMode) {
      case 'EL':
        this.dataToSend['filter'] = [{ site_id: this.site_id }];
        break;

      case 'KL':
        this.dataToSend = {};
        break;

      default:
        console.log('Deployment Mode not Found!..');
        break;
    }
  }

  allowAccess() {
    // calling allowPermissions()
    const value = this._auth.allowAccessComponent('userManagement', '');
    return value;
  }

  allDropDownSettings(
    singleSelection: boolean,
    idField: string,
    textField: string,
    searchPlaceholderText: string,
    noDataAvailablePlaceholderText: string
  ) {
    return {
      singleSelection: singleSelection,
      idField: idField,
      textField: textField,
      searchPlaceholderText: searchPlaceholderText,
      noDataAvailablePlaceholderText: noDataAvailablePlaceholderText,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      maxHeight: 200
    };
  }

  getUserProfileData() {
    this.dataToSend['user_id'] = this.user_id;

    this._appService
      .getUserProfileData(
        this.endPointExt.USERLIST_GET_DROPDOWN,
        this.dataToSend
      )
      .subscribe((userProfileData: any) => {
        this.userData = userProfileData.data.user;
        this.workGroupList = userProfileData.data.workgroups;
        this.userRoleList = userProfileData.data.userroles;
        this.languagesDropDown = userProfileData.data.language;

        this.userData.userRole = [
          this.findObjectInArrayWithKey(
            this.userRoleList,
            'userRole_Id',
            this.userData.userRole
          )
        ];

        if (this.userData.workGroup != null) {
          this.userData.workGroup = this.mapWorkGroupIdToWorkGroupName(
            this.userData.workGroup
          );
        }

        this.userData.language = [
          this.findObjectInArrayWithKey(
            this.languagesDropDown,
            'Language_Id',
            this.userData.language
          )
        ];

        this.populateUserProfileData(this.userData);
      });
  }

  // Finds User-Role / Work-Group name based on Id.
  findObjectInArrayWithKey(array: any, key: any, value: any) {
    let item: any;
    for (let index = 0; index < array.length; index += 1) {
      item = array[index];
      if (item[key] === value) {
        return item;
      }
    }
  }
  // Loop through array of workGroup Id's assigned to a user.
  mapWorkGroupIdToWorkGroupName(eachUserWorkGroup: any) {
    this.workGroupArray = [];
    for (let i = 0; i < eachUserWorkGroup.length; i++) {
      if (eachUserWorkGroup[i].workGroupName) {
        delete eachUserWorkGroup[i].workGroupName;
      }
      this.workGroupJSON = this.findObjectInArrayWithKey(
        this.workGroupList,
        'work_group_id',
        eachUserWorkGroup[i].work_group_id
      );
      this.workGroupArray.push(this.workGroupJSON);
    }
    return this.workGroupArray;
  }

  populateUserProfileData(userData: any) {
    this.user_id = userData.user_id;
    //this.userImage = userData.userImage;
    this.site_id = userData.site_id;
    this.fullName = userData.fullName;
    this.userName = userData.eMail;
    this.eMail = userData.eMail;
    this.phone = userData.phone;
    this.selectedLanguage = userData.language;
    this.theme = userData.theme.selectedTheme;
    this.updateSelectedTheme(this.theme);
    // this.setSelectedTheme(this.theme);
    if (userData.workGroup.length > 0) {
      this.workGroup = userData.workGroup[0].workGroupName;
    }
    if (userData.userRole[0] !== undefined) {
      this.userRole = userData.userRole[0].userRole;
    } else {
      if (userData.isSuperUser) {
        this.userRole = 'Super User';
      }
    }
    if (userData.theme.userImage === '') {
      // this.userImage = 'assets/images/defaultUserImage.png';
      this.shortUserName = userData.fullName.substring(0, 1);
      this.setImageTitle(false);
    }
    if (
      userData.theme.userImage !== '' &&
      userData.theme.userImage !== undefined
    ) {
      this.isDefaultImage = false;
      this.userImage = 'data:image/png;base64,' + userData.theme.userImage;
      this.setImageTitle(true);
    }

    if (userData.passwordExpiresIn.isChecked !== true) {
      this.isPasswordExpiryEnabled = false;
    } else {
      this.isPasswordExpiryEnabled = true;
      this.passwordExpiredInDays = userData.passwordExpiresIn.days;
    }
    this.oldPassword = userData.password;

    if (userData.accountExpiresIn.isChecked !== true) {
      this.isAccountExpiryEnabled = false;
    } else {
      this.isAccountExpiryEnabled = true;
      this.accountExpiresIn = userData.accountExpiresIn.date;
    }
    this.oldPassword = userData.password;
    this.userDataLoaded = true;
  }
  validateUserProfileForm(profileFormData: any) {
    if (this.userProfileForm.controls.fullName.invalid) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Full Name  Field Is Mandatory',
        true
      );
      return false;
    }
    if (this.userProfileForm.controls.eMail.invalid) {
      const email = profileFormData.value.eMail;
      if (email == '') {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Value For Email Field Is Mandatory',
          true
        );
        return false;
      }
      if (!email.includes('@') || !email.includes('.')) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Invalid Email Format',
          true
        );
        return false;
      }
    }
    if (this.userProfileForm.controls.phone.invalid) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Phone Field Is Mandatory',
        true
      );
      return false;
    }
    this.isValid = this.validateInputs(profileFormData);
    if (this.isValid == true) {
      return true;
    }
  }

  validateInputs(profileFormData: any) {
    this.fullName = this.trim(profileFormData.fullName);
    if (this.fullName === '') {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Full Name Field cannot contain space as first character',
        true
      );
      return false;
    }
    return true;
  }

  trim(input) {
    input = input
      .replace(/(^\s*)|(\s*$)/gi, '') // removes leading and trailing spaces
      .replace(/[ ]{2,}/gi, ' ') // replaces multiple spaces with one space
      .replace(/\n +/, '\n'); // Removes spaces after newlines
    return input;
  }

  updateUserProfileData(formData: any) {
    const profileFormData = formData.value;
    this.disableUpdate = true;
    this.isValid = this.validateUserProfileForm(profileFormData);
    if (this.isValid) {
      this.user_id = this.user_id;
      this.userData.fullName = profileFormData.fullName;
      this.userData.userName = profileFormData.eMail;
      this.userData.eMail = profileFormData.eMail;
      this.userData.phone = profileFormData.phone;
      if (profileFormData.language[0] !== undefined) {
        this.userData.language = profileFormData.language[0].Language_Id;
      }
      if (this.userData.userRole[0] !== undefined) {
        this.userData.userRole = this.userData.userRole[0].userRole_Id;
      } else if (this.userData.userRole[0] === undefined) {
        this.userData.userRole = [];
      }
      if (this.userData.workGroup.length > 0) {
        this.userData.workGroup.forEach((workGroup) => {
          delete workGroup.workGroupName;
        });
      }
      if (this.userData.theme.selectedTheme !== undefined) {
        this.userData.theme.selectedTheme = this.theme;
      }

      if (profileFormData.newPassword != null) {
        if (profileFormData.newPassword == profileFormData.confirmPassword) {
          this.userData.newPassword = profileFormData.newPassword;
          this.confirmPassword = profileFormData.confirmPassword;
        } else {
          this._toastLoad.toast(
            'warning',
            'Warning',
            'Passwords Dont match',
            true
          );
        }
      } else if (profileFormData.newPassword == null) {
        this.userData.newPassword = this.newPassword;
      }
      this.saveUserProfileData(this.user_id);
    }
    this.disableUpdate = false;
  }

  saveUserProfileData(userId: any) {
    const dataToSend = {
      user_id: userId,
      site_id: this.userData.site_id,
      client_id: this.userData.client_id,
      fullName: this.userData.fullName,
      userName: this.userData.eMail,
      eMail: this.userData.eMail,
      phone: this.userData.phone,
      language: this.userData.language,
      theme: {
        userImage: this.userData.theme.userImage,
        selectedTheme: this.theme
      },
      password: this.userData.password,
      // userImage: this.userData.userImage,
      workGroup: this.userData.workGroup,
      userRole: this.userData.userRole,
      passwordExpiresIn: {
        days: this.userData.passwordExpiresIn.days,
        isChecked: this.userData.passwordExpiresIn.isChecked
      },
      accountExpiresIn: {
        date: this.userData.accountExpiresIn.date,
        isChecked: this.userData.accountExpiresIn.isChecked
      },
      //  this.userData.sessionExpiresIn.minutes
      //  this.userData.sessionExpiresIn.isChecked
      sessionExpiresIn: {
        minutes: '',
        isChecked: false
      },
      status: this.userData.status,
      lastActivity: this.userData.lastActivity,
      lastLogin: this.userData.lastLogin,
      AccessLevel: {
        sites: this.userData.AccessLevel.sites,
        Permisssions: this.userData.AccessLevel.permissions
      }
    };
    this._appService.saveUserProfileData(dataToSend).subscribe((response) => {
      if (response.status === 'success') {
        this._toastLoad.toast(
          'success',
          'Success',
          'User Profile Data Updated Successfully',
          true
        );
        this.disableUpdate = false;
        // this.getUserProfileData();
        this.getThemeList();
        // this.updateUserDataOnHeader.emit({ fullName: this.userData.fullName });
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error User Data Updating',
          true
        );
        this.disableUpdate = false;
      }
      this.setImageTitle(false);
    });
  }

  // Method to fetch theme from configurations.json file.
  getThemeList() {
    this._appService.getThemes().subscribe((data) => {
      this.themeList['themeNames'] = data['appThemes'];
      this.getUserProfileData();
    });
  }

  onTypingSetDefaultImage(fullName) {
    if (this.userImage === '') {
      this.isDefaultImage = true;
      // this.userProfileImage = '';
      this.userData.theme.userImage = '';
      fullName = this.trim(fullName);
      fullName === ''
        ? (this.shortUserName = '+')
        : (this.shortUserName = fullName.substring(0, 1));
    }
  }

  // Angular way
  updateSelectedTheme(themeName: string) {
    const bodyElement = document.getElementsByTagName('body')[0];
    bodyElement.className = bodyElement.className.replace(
      /(^|\s)theme-\S+/g,
      ''
    );
    bodyElement.classList.add(themeName);
    this.setSelectedTheme(themeName);
  }

  setSelectedTheme(themeName) {
    this.myTheme.forEach((x: ElementRef) => {
      if (x.nativeElement.id === themeName) {
        x.nativeElement.className = 'elm-checked-2';
        this.theme = themeName;
      } else if (x.nativeElement.id !== themeName) {
        x.nativeElement.className = 'elm-unchecked-radio-button';
      }
    });
  }

  changeView() {
    this.pageView = !this.pageView;
  }

  ChangePassword(formData: any) {
    if (this.changePasswordForm.valid) {
      if (
        this.changePasswordForm.value.current_password ===
        this.changePasswordForm.value.new_password
      ) {
        this.passwordErrorMsg =
          'Current Password and New Password Should not be same';
        return;
      } else if (
        this.changePasswordForm.value.new_password ===
        this.changePasswordForm.value.confirm_password
      ) {
        this.passwordErrorMsg = '';
        const enycOldPassword = this._utility.encryptByHash(
          this.changePasswordForm.value.current_password,
          'thisissecret'
        );
        const enycNewPassword = this._utility.encryptByHash(
          this.changePasswordForm.value.new_password,
          'thisissecret'
        );
        if (this.oldPassword === enycOldPassword) {
          const input = {};
          input['userName'] = this.userData.userName;
          input['old_password'] = enycOldPassword;
          input['new_password'] = enycNewPassword;
          this._appService.changePassword(input).subscribe((response) => {
            if (response.status === 'success') {
              this.changePasswordWindoClose.nativeElement.click();
              this._appTokenService.logout();
              this._toastLoad.toast(
                'success',
                'Success',
                response['message'],
                true
              );
            } else {
              this._toastLoad.toast(
                'error',
                'Error',
                response['message'],
                true
              );
            }
          });
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Enter Correct Old Password',
            true
          );
        }
      } else {
        this.passwordErrorMsg =
          'New Password and Confirm password are not matching';
        return;
      }
    }
  }

  getFiles(event) {
    if (event.target.files[0].size > 256000) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Image size is too big! Try another.',
        true
      );
    } else {
      this.files = event.target.files;
      const reader = new FileReader();
      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(this.files[0]);
    }
  }

  handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString); // Converting binary string data.
    this.isDefaultImage = false;
    this.userImage = 'data:image/png;base64,' + this.filestring;
    this.userData.theme.userImage = this.filestring;
    this.setImageTitle(true);
  }

  resetImage() {
    // this.userImage = 'assets/images/defaultUserImage.png';
    this.isDefaultImage = true;
    this.shortUserName = this.userData.fullName.substring(0, 1);
    // this.userImage = this.userData.fullName.substring(0, 1);
    this.userData['theme']['userImage'] = '';
    this.userImage = '';
    this.userImageInput.nativeElement.value = '';
    this.setImageTitle(false);
  }

  setImageTitle(showTitle: boolean) {
    if (showTitle) {
      this.imageTitle = 'Click to reset your display picture.';
    } else {
      this.imageTitle = '';
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
    const val = event.target.value;
    const upperCaseCharacters = /[A-Z]+/g;
    const lowerCaseCharacters = /[a-z]+/g;
    const numberCharacters = /[0-9]+/g;
    const specialCharacters = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/;
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
  }
  onKeyPress(event) {
    const k = event ? event.which : event.keyCode;
    if (k == 32) {
      return false;
    } else {
      return true;
    }
  }

  resetUserProfile() {
    this.getThemeList();
  }
  
  resetCurrentPassword(){
    this.changePasswordForm.patchValue({
      current_password : ''
    })
  }

  resetConfirmPassword(){
    this.changePasswordForm.patchValue({
      confirm_password : ''
    })
  }

  resetNewPassword(){
    this.changePasswordForm.patchValue({
      new_password : ''
    })
  }
}
