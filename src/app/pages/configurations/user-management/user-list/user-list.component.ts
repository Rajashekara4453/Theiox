import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  ChangeDetectorRef,
  AfterViewChecked,
  OnDestroy,
  Output
} from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { IActionMapping, TreeComponent } from 'angular-tree-component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { ISubscription } from 'rxjs/Subscription';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';
import { UtilityFunctions } from '../../../../utilities/utility-func';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'kl-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewChecked {
  constructor(
    private _appService: AppService,
    private _formBuilder: FormBuilder,
    private _toastLoad: ToastrService,
    private cdRef: ChangeDetectorRef,
    private _auth: AuthGuard,
    private _globals: globals,
    private _utility: UtilityFunctions,
    private _authService: AuthService
  ) {}

  private subscription: ISubscription;

  // Variable for Menubar
  public sideMenus: any = {};
  public displayProperty: any = {};
  userData: any = [];

  // Variable for search elmfilter pipe
  queryString: string = '';

  // Variables of UserList
  showAddUserForm: boolean = false;
  showAddUserInfo: boolean = false;
  addUserForm: FormGroup;
  dataToSend: any = {};

  user_id: string = '';
  fullName: string = '';
  userName: string = '';
  eMail: string = '';
  phone: number;
  workGroup: any = [];
  userRole: any = [];
  userImage: string = '';
  // assets/images/defaultUserImage.png
  userProfileImage: string = '';
  password: string;
  language: any;
  status: string;
  lastActivity: any;
  lastLogin: any;

  accessLevel: any = [];
  permissions: any = [];
  hierarchy: any = [];
  sitesHeirarchy: any = [];
  sitesHeirarchyTemp: any = [];
  originalTree: any = [];
  userAssignedTree: any = [];
  encapsulatedTreeJson: any = {};
  encapsulatedTreeArray = [];
  heirarchyArray: any = [];

  workGroupsDropDown: any = [];
  userRolesDropDown: any = [];
  languagesDropDown: any = [];
  usersDataArray: any = [];

  // Variables for Toggle Switch
  showPasswordExpiresIn: boolean = false;
  showAccountExpiresIn: boolean = false;
  showSessionExpiresIn: boolean = false;

  passwordExpiresIn: number = 45;
  public accountExpiresIn: Date;
  sessionExpiresIn: number = 5;
  isCheckedPasswordExpiresIn: any = 'false';
  isCheckedAccountExpiresIn: any = 'false';
  isCheckedSessionExpiresIn: any = 'false';

  // Variables for Mapping Id's with Names
  workGroupArray: any = [];
  workGroupJSON: any = {};
  userRoleArray: any = [];
  userRoleJSON: any = {};

  // Variables for buttons, Validations and action
  action: any;
  addOrUpdate: string = 'Save';
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
  saveAndExit: string = 'Save and Exit';
  enableSaveAndExit: boolean = false;
  isValidForm: boolean = true;
  disableDelete: boolean = true;
  disableSave: boolean = false;
  allowAddOrEditUser: boolean = false;
  allowDeleteUser: boolean = false;
  showDeleteBtn: boolean = true;
  buttonName: string = '';
  accessPermission: any;

  // Variables for Add Work Group and User Role
  showAddNewWorkGroup: boolean = false;
  showAddNewUserRole: boolean = false;

  //  Angular Date Time Picker - commented for library confirmation
  // SelectedDate: any = '01-01-2019';
  // settings = {
  //   bigBanner: true,
  //   timePicker: true,
  //   format: 'dd-MMM-yyyy hh:mm a',
  //   defaultOpen: false,
  //   closeOnSelect: false,
  //   date: false,
  // };

  // Variables for DropDown
  selectedWorkGroups: any = [];
  selectedLanguage: any = [];
  selectedUserRole: any = [];
  workGroupDropdownSettings: any = [];
  languagesDropdownSettings: any = [];
  userRoleDropdownSettings: any = [];
  dropDownSettings: any = [];

  // Variables for Tree and nodes extraction
  parentId: any;
  selectedNodes: any = [];
  selectedNodesTree: any = [];
  parent_id: any;

  // Variables for Hierarchy Tree
  actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node, e: Event) => this.check(node, !node.data.checked, e)
    }
  };

  // Variable for Multi-tenant model
  site_id: any;
  client_id: string;
  deploymentMode: string = 'EL';
  // endPointExt: any;
  isAdmin: boolean = false;
  isLicenseEnabled: boolean = true;

  options = {
    actionMapping: this.actionMapping,
    allowDrag: true,
    allowDrop: true
  };

  isSuperUser: boolean = false;

  workGroupAccessLevel: any = {};
  userRoleAccessLevel: any = {};
  userTheme: string = 'theme-default';
  isDefaultImage: boolean = false;
  shortUserName: string = '';

  // emailPattern = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

  ngAfterViewChecked() {
    // explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    // For passwordExpiresIn and accountExpiresIn dropdown fields
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    // Multi-tenant model
    this.client_id = this._globals.getCurrentUserClientId();
    this.site_id = this._globals.getCurrentUserSiteId();
    this.isLicenseEnabled = this._authService.Download;
    this.checkDeploymentMode();

    this.allowAccess();
    this.getUserMgmtDropdown('');

    // Form to Add User
    this.addUserForm = this._formBuilder.group({
      index: [{ value: null, disabled: true }],
      user_id: [''],
      fullName: ['', Validators.required],
      userName: ['', Validators.required],
      eMail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(this.emailPattern)
        ]
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('[0-9]*'),
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      ],
      workGroup: [''],
      userRole: [''],
      passwordExpiresIn: ['', Validators.required],
      accountExpiresIn: ['', Validators.required],
      sessionExpiresIn: ['', Validators.required],
      isCheckedPasswordExpiresIn: [''],
      isCheckedAccountExpiresIn: [''],
      isCheckedSessionExpiresIn: [''],
      isSuperUser: false
    });

    // Dropdown settings
    this.workGroupDropdownSettings = this.allDropDownSettings(
      false,
      'work_group_id',
      'workGroupName',
      'Assign Work Group',
      'No Work Groups Added',
      true,
      'Select All Filtered Work Groups'
    );

    this.languagesDropdownSettings = this.allDropDownSettings(
      true,
      'Language_Id',
      'Language',
      'Assign Language',
      'No Languages Available',
      false,
      ''
    );

    this.userRoleDropdownSettings = this.allDropDownSettings(
      true,
      'userRole_Id',
      'userRole',
      'Assign User Role',
      'No User Role Added',
      false,
      ''
    );

    // check permissions to show buttons - Add User Role and Add Work Group
    this.userRoleAccessLevel = this._auth.getComponentAccess(
      85.4,
      'accessLevel',
      'create'
    );
    this.workGroupAccessLevel = this._auth.getComponentAccess(
      85.3,
      'workGroup',
      'create'
    );
  }

  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    // this.deploymentMode = this._globals.deploymentMode;
    // this.endPointExt = this._globals.deploymentModeAPI;
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

  // Method to unsubscribe from all the observables onDestroy
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  allowAccess() {
    // Fetches the Access Permissions for the Logged-in User
    this.accessPermission = this._auth.allowAccess('');
    this.checkAccessPermission('delete');
  }

  checkAccessPermission(accessTo: string) {
    switch (accessTo) {
      case 'create':
        if (this.accessPermission.create) {
          this.disableSave = false;
          this.allowAddOrEditUser = true;
          this.showDeleteBtn = false;
          break;
        } else {
          this.disableSave = true;
          this.allowAddOrEditUser = false;
          this.showDeleteBtn = false;
          this.disableDelete = true;
          break;
        }

      case 'edit':
        if (this.accessPermission.edit) {
          this.disableSave = false;
          this.allowAddOrEditUser = true;
          this.showDeleteBtn = true;
          this.checkAccessPermission('delete');
          break;
        } else {
          // this.addUserForm.disable();
          this.disableSave = true;
          this.allowAddOrEditUser = false;
          this.showDeleteBtn = true;
          this.checkAccessPermission('delete');
          break;
        }

      case 'delete':
        if (this.accessPermission.delete) {
          this.showDeleteBtn = true;
          this.disableDelete = false;
          this.allowDeleteUser = true;
          break;
        } else {
          this.showDeleteBtn = true;
          this.disableDelete = true;
          this.allowDeleteUser = false;
          break;
        }
    }
  }

  allDropDownSettings(
    singleSelection: boolean,
    idField: string,
    textField: string,
    placeholderText: string,
    noDataLabel: string,
    enableFilterSelectAll: boolean,
    filterSelectAllText: string
  ) {
    return {
      singleSelection: singleSelection,
      labelKey: textField,
      primaryKey: idField,
      text: placeholderText,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableFilterSelectAll: enableFilterSelectAll,
      filterSelectAllText: filterSelectAllText,
      classes: 'myclass custom-class',
      noDataLabel: noDataLabel
    };
  }

  /** End point - user/get_body (does 2 job )*/
  /** When userId == '' ; Loads dropdown values and tree heirarchy */
  /** When userId == <user's user id> ; Loads user data based on user id with dropdown values and tree heirarchy*/

  getUserMgmtDropdown(userId: any) {
    if (userId === '') {
      // this.dataToSend = {
      //   filter: [{ site_id: this.site_id }],
      // };
      this.checkDeploymentMode();
    } else {
      // this.dataToSend = {
      //   filter: [{ site_id: this.site_id }],
      //   user_id: userId,
      // };
      this.checkDeploymentMode();
      this.dataToSend['user_id'] = userId;
    }

    this.subscription = this._appService
      .getUserMgmtDropdown(this.dataToSend)
      .subscribe((formValuesFromDB) => {
        try {
          this.workGroupsDropDown = formValuesFromDB.data.workgroups;
          this.userRolesDropDown = formValuesFromDB.data.userroles;
          this.languagesDropDown = formValuesFromDB.data.language;
          this.sitesHeirarchy = formValuesFromDB.data.site;

          if (userId === '') {
            this.sitesHeirarchy = formValuesFromDB.data.site;
            this.sitesHeirarchyTemp = JSON.parse(
              JSON.stringify(this.sitesHeirarchy)
            );
            this.getUserList();
          } else if (userId !== '') {
            formValuesFromDB.data.user.userRole = [
              this.findObjectInArrayWithKey(
                formValuesFromDB.data.userroles,
                'userRole_Id',
                formValuesFromDB.data.user.userRole
              )
            ];

            if (formValuesFromDB.data.user.workGroup != null) {
              formValuesFromDB.data.user.workGroup = this.mapWorkGroupIdToWorkGroupName(
                formValuesFromDB.data.user.workGroup
              );
            } else {
              formValuesFromDB.data.user.workGroup = [];
            }

            this.usersDataArray = formValuesFromDB.data.user;
            this.originalTree = this.sitesHeirarchy;

            this.populateUserData(this.usersDataArray, userId);
            this.showAddUserPage(this.user_id);
          }
        } catch (error) {
          console.error('Caught an EXCEPTION ..' + error);
          this._toastLoad.toast(
            'error',
            'Failed',
            'Failed Loading Form Values',
            true
          );
        }
      });
  }

  // Fetch all Users to display in table
  getUserList() {
    // const dataToPost = { filter: [{ site_id: this.site_id }] };
    this.checkDeploymentMode();
    this.dataToSend['filter'][0]['isdeleted'] = 'false';
    try {
      this.subscription = this._appService
        .getUserList(this.dataToSend)
        .subscribe((userDatafromDb) => {
          this.userData = this.mapIdToItsName(userDatafromDb.data);
        });
    } catch (error) {
      console.error(error);
      this._toastLoad.toast(
        'error',
        'Failed',
        'Failed to load User List',
        true
      );
    }
  }

  // unique id corresponding to the item
  trackByFn(index) {
    return index;
  }

  // Method to map user-role and work-group id's to respective name.
  mapIdToItsName(userData) {
    userData.forEach((eachUser) => {
      this.userRoleArray = [];
      this.userRoleJSON = this.findObjectInArrayWithKey(
        this.userRolesDropDown,
        'userRole_Id',
        eachUser.userRole
      );
      this.userRoleArray.push(this.userRoleJSON);
      eachUser.userRole = this.userRoleArray;
      if (eachUser.workGroup !== null) {
        eachUser.workGroup = this.mapWorkGroupIdToWorkGroupName(
          eachUser.workGroup
        );
      } else {
        eachUser.workGroup = [];
      }
      if (eachUser.theme.userImage === '') {
        // this.isDefaultImage = true;
        eachUser['shortUserName'] = eachUser['fullName'].substring(0, 1);
        this.userImage = '';
        // this.userImage = 'assets/images/defaultUserImage.png';
      }
    });
    return userData;
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
      this.workGroupJSON = this.findObjectInArrayWithKey(
        this.workGroupsDropDown,
        'work_group_id',
        eachUserWorkGroup[i].work_group_id
      );
      this.workGroupArray.push(this.workGroupJSON);
    }
    return this.workGroupArray;
  }

  // Edit User Data
  editUserDataInTable(user_id: any) {
    this.getUserMgmtDropdown(user_id);
    this.enableSaveAndExit = true;
    this.saveAndExit = 'Save and Exit';
  }

  loadUserImage(userObject: any) {
    this.userTheme = userObject.theme.selectedTheme;
    if (userObject.theme.userImage === '') {
      this.isDefaultImage = true;
      this.shortUserName = userObject.fullName.substring(0, 1);
      this.userProfileImage = '';
      // this.userImage = 'assets/images/defaultUserImage.png';
    } else {
      this.isDefaultImage = false;
      // Stores Image Saved from Profile and sends the same image back to save
      this.userProfileImage = userObject.theme.userImage;
      // appending 'string' to display base64 format to user profile image
      this.userImage = 'data:image/png;base64,' + this.userProfileImage;
    }
  }

  // Populate user data on edit user
  populateUserData(usersDataArray: any, userId: any) {
    this.user_id = userId;
    this.site_id = usersDataArray.site_id;
    this.isAdmin = usersDataArray.isAdmin;
    if (this.isAdmin) {
      this.showDeleteBtn = false;
    }
    const userObject = {
      theme: usersDataArray.theme,
      fullName: usersDataArray.fullName
    };
    this.loadUserImage(userObject);

    this.fullName = usersDataArray.fullName;
    this.userName = usersDataArray.eMail;
    this.eMail = usersDataArray.eMail;
    this.phone = usersDataArray.phone;
    this.password = usersDataArray.password;
    this.isSuperUser = usersDataArray.isSuperUser;

    if (!usersDataArray.isSuperUser) {
      this.isShowUserRoleDD = true;
      if (this.usersDataArray.userRole[0] === undefined) {
        this.selectedUserRole = [];
      } else {
        this.selectedUserRole = usersDataArray.userRole;
      }
    } else {
      this.isShowUserRoleDD = false;
    }

    if (this.usersDataArray.workGroup[0] === undefined) {
      this.selectedWorkGroups = [];
    } else {
      this.selectedWorkGroups = usersDataArray.workGroup;
    }

    this.selectedLanguage = usersDataArray.language;

    this.isCheckedPasswordExpiresIn =
      usersDataArray.passwordExpiresIn.isChecked === true ? 'true' : 'false';
    this.passwordExpiresIn = usersDataArray.passwordExpiresIn.days;
    this.showPasswordExpiresIn =
      this.isCheckedPasswordExpiresIn == true ? true : false;

    this.isCheckedAccountExpiresIn =
      usersDataArray.accountExpiresIn.isChecked === true ? 'true' : 'false';
    this.accountExpiresIn = usersDataArray.accountExpiresIn.date;
    this.showAccountExpiresIn =
      this.isCheckedAccountExpiresIn == true ? true : false;

    // Newly added field hence null check is done
    if (usersDataArray.sessionExpiresIn != null) {
      this.isCheckedSessionExpiresIn =
        usersDataArray.sessionExpiresIn.isChecked === true ? 'true' : 'false';
      this.sessionExpiresIn = usersDataArray.sessionExpiresIn.minutes;
      this.showSessionExpiresIn =
        this.isCheckedSessionExpiresIn == true ? true : false;
    }
    this.encapsulatedTreeJson = {};
    this.encapsulatedTreeArray = [];

    // Populate Sites Hierarchy Tree for selected user
    this.userAssignedTree = usersDataArray.AccessLevel.sites;
    this.selectedNodesTree = [];
    this.hierarchy = usersDataArray.AccessLevel.sites;
    this.sitesHeirarchy = this.buildUserTree(
      this.sitesHeirarchy,
      this.userAssignedTree
    );
  }

  /** On Edit User */

  // Fetch saved node_id's for user and send it to merge with original Tree to build a user's own tree
  buildUserTree(originalTree: any, userTree: any) {
    userTree.forEach((nodeObject) => {
      for (let i = 0; i < originalTree.length; i++) {
        const treeRootNode = originalTree[i];
        if (nodeObject.parent_id === treeRootNode.node_id) {
          const nodeFound = this.updateNodeInformation(
            nodeObject.node_id,
            treeRootNode,
            'node_id'
          );

          if (nodeFound === '') {
            this.sitesHeirarchy = this.originalTree;
          }
        }
      }
    });
    return this.sitesHeirarchy;
  }

  // Merging user's node_id's with original tree and return user's own tree
  updateNodeInformation(
    valueTobeSearched: any,
    currentNode: any,
    InkeyToFind: any
  ) {
    if (valueTobeSearched === currentNode[InkeyToFind]) {
      currentNode['checked'] = true;
    } else {
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.updateNodeInformation(valueTobeSearched, node, InkeyToFind);
      }
      return '';
    }
  }

  isShowUserRoleDD: boolean = true;

  updateIsSuperUser(event: any) {
    this.isSuperUser = !this.isSuperUser;
    if (this.isSuperUser) {
      this.isShowUserRoleDD = false;
      this.userRole = [];
      this.selectedUserRole = [];
    } else {
      this.isShowUserRoleDD = true;
    }
  }

  // Method to Add User Data
  addUserToList(addUserFormData: any) {
    let addOrEdit: any;
    if (
      addUserFormData.user_id === '' ||
      addUserFormData.user_id === null ||
      addUserFormData.user_id === undefined
    ) {
      addOrEdit = 'add';
    } else {
      addOrEdit = 'edit';
      // this.extractUserTreeNodes(this.selectedNodesTree);
    }
    this.isValidForm = this.validateAddUserForm(addUserFormData, addOrEdit);
    this.buttonName = document.activeElement.getAttribute('name');
    if (this.isValidForm === false) {
      return;
    }
    if (this.isValidForm === true) {
      this.disableSave = true;
      this.user_id = addUserFormData.user_id;
      this.isAdmin = this.isAdmin;
      this.userName = addUserFormData.eMail;
      this.eMail = addUserFormData.eMail;
      this.phone = addUserFormData.phone;

      this.workGroup = [];
      this.userRole = [];

      if (addUserFormData.workGroup != null) {
        const workGrouArraylen: number = addUserFormData.workGroup.length;
        if (workGrouArraylen > 0) {
          addUserFormData.workGroup.forEach((eachWorkGroup) => {
            this.workGroup.push({ work_group_id: eachWorkGroup.work_group_id });
          });
        } else {
          this.workGroup = [];
        }
      }

      if (!this.isSuperUser && addUserFormData.userRole != null) {
        const userRoleArraylen: number = addUserFormData.userRole.length;
        if (userRoleArraylen > 0) {
          if (addUserFormData.userRole[0] === undefined) {
            this.userRole = '';
          } else {
            this.userRole = addUserFormData.userRole[0].userRole_Id;
          }
        }
      } else {
        this.userRole = [];
        this.selectedUserRole = [];
      }

      this.accountExpiresIn = this.accountExpiresIn;
      this.passwordExpiresIn = this.passwordExpiresIn;
      this.sessionExpiresIn = this.sessionExpiresIn;

      if (addUserFormData.isCheckedPasswordExpiresIn === 'true') {
        this.isCheckedPasswordExpiresIn = true;
      } else if (addUserFormData.isCheckedPasswordExpiresIn === 'false') {
        this.isCheckedPasswordExpiresIn = false;
      }

      if (addUserFormData.isCheckedAccountExpiresIn === 'true') {
        this.isCheckedAccountExpiresIn = true;
      } else if (addUserFormData.isCheckedAccountExpiresIn === 'false') {
        this.isCheckedAccountExpiresIn = false;
      }

      if (addUserFormData.isCheckedSessionExpiresIn === 'true') {
        this.isCheckedSessionExpiresIn = true;
      } else if (addUserFormData.isCheckedSessionExpiresIn === 'false') {
        this.isCheckedSessionExpiresIn = false;
      }

      this.setSiteId(this.hierarchy);
      if (this.user_id === '' || this.user_id == null) {
        this.action = 'addUser';
        this.enableSaveAndExit = true;
        this.userImage = '';
        this.password = 'admin';
        this.password = this._utility.encryptByHash('admin', 'thisissecret');
        this.saveOrUpdateUserData(this.action, '');
      } else {
        this.action = 'editUser';
        this.userImage = this.userProfileImage;
        // this.password = this.userData.password;
        this.password = undefined;
        this.saveOrUpdateUserData(this.action, this.user_id);
        this.enableSaveAndExit = false;
      }
    }
  }

  // On de-selecting all the work groups selected previously
  onDeSelectAllWorkGroups() {
    this.selectedWorkGroups = [];
  }

  onDeSelectAllUserRole() {
    this.selectedUserRole = [];
  }

  setSiteId(tree) {
    const parentIdAtTop = tree[0]['parent_id'];
    tree.forEach((element) => {
      if (element['parent_id'] === parentIdAtTop) {
        this.site_id = parentIdAtTop;
      } else {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'An user can be assinged to multiple locations only with in a site. Not accross many sites. ',
          true
        );
      }
    });
  }

  trim(input) {
    input = input
      .replace(/(^\s*)|(\s*$)/gi, '') // removes leading and trailing spaces
      .replace(/[ ]{2,}/gi, ' ') // replaces multiple spaces with one space
      .replace(/\n +/, '\n'); // Removes spaces after newlines
    return input;
  }

  // Method to Validate input fields
  validateAddUserForm(addUserFormData: any, addOrEdit: string) {
    if (this.addUserForm.controls.fullName.invalid) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Full Name Field Is Mandatory',
        true
      );
      return false;
    }
    if (this.addUserForm.controls.eMail.invalid) {
      const email = addUserFormData.eMail;
      if (this.addUserForm.value.eMail === '') {
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
    if (this.addUserForm.controls.phone.invalid) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Phone Field Is Mandatory',
        true
      );
      return false;
    }
    if (!this.isSuperUser && addUserFormData.userRole.length === 0) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For User Role Is Mandatory',
        true
      );
      return false;
    }
    if (addOrEdit === 'add' && this.hierarchy.length === 0) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Assign Site To User Is Mandatory',
        true
      );
      return false;
    }
    if (addOrEdit === 'edit' && this.hierarchy.length === 0) {
      // this.hierarchy.length
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Assign Site To User Is Mandatory',
        true
      );
      return false;
    }
    // if (this)
    this.isValidForm = this.validateInputs(addUserFormData);
    if (this.isValidForm == true) {
      return true;
    }
  }

  validateInputs(addUserFormData: any) {
    this.fullName = this.trim(addUserFormData.fullName);
    if (this.fullName === '') {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Full Name Field cannot contain only white spaces or white space as a first character',
        true
      );
      return false;
    }
    return true;
  }

  // trimOnPaste(userName: string) {
  //   return userName ? userName.replace(/\s/g, '') : '';
  // }

  /** On Add/Update User */

  // Methods to fetch selected node's parent_id and node_id
  extractUserTreeNodes(allTreeNodes) {
    let selectedHierarchy: any;
    this.selectedNodes = [];
    this.hierarchy = [];
    allTreeNodes.forEach((eachTreeNode) => {
      this.parent_id = eachTreeNode.node_id;
      selectedHierarchy = this.getSelectedNodes(eachTreeNode, 'checked');
    });
  }

  getSelectedNodes(currentNode, InkeyToFind: any) {
    if (currentNode[InkeyToFind] === true) {
      this.selectedNodes.push({
        node_id: currentNode.node_id,
        parent_id: this.parent_id
      });
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.getSelectedNodes(node, InkeyToFind);
      }
    } else {
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.getSelectedNodes(node, InkeyToFind);
      }
    }
    this.hierarchy = this.selectedNodes;
    // this.setSiteId(this.hierarchy);
    // console.log(this.hierarchy);
  }

  // Methods to reset Tree nodes on cancel/add
  resetTreeNodes() {
    this.selectedNodesTree.forEach((eachNode) => {
      this.makeNodeCheckedFalse(eachNode);
    });
  }

  makeNodeCheckedFalse(currentNode: any) {
    if (currentNode.checked) {
      currentNode.checked = false;
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.makeNodeCheckedFalse(node);
      }
    } else {
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.makeNodeCheckedFalse(node);
      }
      return '';
    }
  }

  // On change event methods for single select dropdowns
  enablePasswordExpiresIn(event) {
    if (event === 'true') {
      this.passwordExpiresIn = this.passwordExpiresIn;
      this.isCheckedPasswordExpiresIn = 'true';
      this.showPasswordExpiresIn = true;
    } else {
      this.isCheckedPasswordExpiresIn = 'false';
      this.showPasswordExpiresIn = false;
    }
  }

  enableAccountExpiresIn(event) {
    if (event === 'true') {
      this.accountExpiresIn = this.accountExpiresIn;
      this.isCheckedAccountExpiresIn = 'true';
      this.showAccountExpiresIn = true;
    } else {
      this.isCheckedAccountExpiresIn = 'false';
      this.showAccountExpiresIn = false;
    }
  }

  enableSessionExpiresIn(event) {
    if (event === 'true') {
      this.sessionExpiresIn = this.sessionExpiresIn;
      this.isCheckedSessionExpiresIn = 'true';
      this.showSessionExpiresIn = true;
    } else {
      this.isCheckedSessionExpiresIn = 'false';
      this.showSessionExpiresIn = false;
    }
  }

  // Angular Date picker
  onDateSelect(accountExpiryDateTime: any) {
    this.accountExpiresIn = accountExpiryDateTime;
  }

  onTypingSetDefaultImage(fullName) {
    if (this.userImage === '') {
      this.isDefaultImage = true;
      this.userProfileImage = '';
      fullName = this.trim(fullName);
      fullName === ''
        ? (this.shortUserName = '+')
        : (this.shortUserName = fullName.substring(0, 1));
    }
  }

  // Method to save user data
  saveOrUpdateUserData(action: any, userId: any) {
    // JSON structure to send and receive the data to server - Do not modify
    const dataToSend = {
      user_id: userId,
      site_id: this.site_id,
      client_id: this.client_id,
      isAdmin: this.isAdmin,
      isSuperUser: this.isSuperUser,
      fullName: this.fullName,
      userName: this.eMail,
      eMail: this.eMail,
      phone: this.phone,
      workGroup: this.workGroup,
      userRole: this.userRole,
      language: '',
      theme: {
        userImage: this.userImage,
        selectedTheme: this.userTheme
      },
      // userImage: this.userImage,
      password: this.password,
      passwordExpiresIn: {
        days: this.passwordExpiresIn,
        isChecked: this.isCheckedPasswordExpiresIn
      },
      accountExpiresIn: {
        date: this.accountExpiresIn,
        isChecked: this.isCheckedAccountExpiresIn
      },
      sessionExpiresIn: {
        minutes: this.sessionExpiresIn,
        isChecked: this.isCheckedSessionExpiresIn
      },
      status: this.status,
      lastActivity: '',
      lastLogin: '',
      AccessLevel: {
        sites: this.hierarchy,
        Permisssions: this.permissions
      },
      isdeleted: 'false'
    };

    this.subscription = this._appService
      .saveUserData(action, dataToSend)
      .subscribe((data) => {
        if (data.status === 'success') {
          this.addUserForm.reset();
          this.heirarchyArray = [];
          this.encapsulatedTreeArray = [];
          this.encapsulatedTreeJson = {};
          this.user_id = '';
          this.userImage = '';
          this.accountExpiresIn = null;
          this.passwordExpiresIn = 45;
          this.sessionExpiresIn = 5;
          this.isCheckedPasswordExpiresIn = 'false';
          this.showPasswordExpiresIn = false;
          this.isCheckedAccountExpiresIn = 'false';
          this.showAccountExpiresIn = false;
          this.showSessionExpiresIn = false;
          this.isCheckedSessionExpiresIn = 'false';
          this.showSessionExpiresIn = false;
          this.isAdmin = false;
          this.userTheme = 'theme-default';
          this.resetTreeNodes();
          if (this.buttonName === 'addButton' && this.action === 'addUser') {
            this.showAddUserPage('');
          } else {
            this.loadUserListTab();
          }
          this._toastLoad.toast('success', 'Success', data.message, true);
          this.disableSave = false;
          this.isSuperUser = false;
          this.isShowUserRoleDD = true;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
          this.userImage = '';
          const userObject = {
            theme: dataToSend.theme,
            fullName: dataToSend.fullName
          };
          this.loadUserImage(userObject);
          this.disableSave = false;
          this.isSuperUser = false;
          this.isShowUserRoleDD = true;
        }
      });
  }

  // Methods to Delete User Record
  sendUserIdToDelete(userId, fullName, isAdmin) {
    this.user_id = userId;
    this.fullName = fullName;
    this.isAdmin = isAdmin;
  }

  deleteUserData(doAction: any) {
    const dataToSend = {
      // filter: [{ site_id: this.site_id }],
      user_id: this.user_id,
      action: doAction
    };
    this.subscription = this._appService
      .deleteUserData(dataToSend)
      .subscribe((data) => {
        if ((data.status = 'success')) {
          this._toastLoad.toast(
            'success',
            'Success',
            'User Deleted Successfully',
            true
          );
          this.loadUserListTab();
          // this.getUserList();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error While Deleting User Data',
            true
          );
        }
      });
  }

  /** Methods to Load-Unload Views */

  unloadViews() {
    this.showAddUserForm = false;
    this.showAddUserInfo = false;
    this.addUserForm.reset();
  }

  loadUserListTab() {
    this.user_id = '';
    this.originalTree = [];
    this.userAssignedTree = [];
    this.sitesHeirarchy = [];
    this.encapsulatedTreeJson = {};
    this.encapsulatedTreeArray = [];
    this.unloadViews();
    this.getUserList();
    this.heirarchyArray = [];
    this.resetTreeNodes();
  }

  showAddUserPage(userId: any) {
    // if (this.site_id === '' || this.site_id == undefined) {
    //   // when the user trying to Add user has no site id associated with his record.
    //   this._toastLoad.toast('error', 'Failed', 'Site Id un-available. Cannot Add user!', true);
    // }
    // else {
    this.unloadViews();
    this.showAddUserForm = true;
    this.showAddUserInfo = true;

    // Set value for [value] attribute in button - add/update user data
    if (userId === '') {
      this.addOrUpdate = 'Save';
      this.enableSaveAndExit = true;
      this.saveAndExit = 'Save and Exit';
      this.sitesHeirarchy = this.sitesHeirarchyTemp;
      this.heirarchyArray = [];
      this.hierarchy = [];
      this.fullName = '';
      // assets/images/defaultUserImage.png
      this.userImage = '';
      this.password = '';
      this.isDefaultImage = true;
      this.shortUserName = '+';
      // Access to add user
      this.checkAccessPermission('create');
    } else {
      this.addOrUpdate = 'Save';
      this.enableSaveAndExit = false;
      this.heirarchyArray = [];
      // Access to edit user
      this.checkAccessPermission('edit');
    }
    // }
  }

  // ** *************Tree******************* */
  // Method to keep Tree Expand by default
  onInitialized(tree: any) {
    setTimeout(() => {
      tree.treeModel.expandAll();
    });
  }

  // Methods invoked on tree nodes selection
  public check(node, checked, e) {
    e.stopPropagation();
    // e.preventDefault();
    this.updateChildNodeCheckbox(node, checked);
    this.updateParentNodeCheckbox(node.realParent);
    this.selectedNodesTree = node.treeModel.nodes;
    this.extractUserTreeNodes(this.selectedNodesTree);
  }

  public updateChildNodeCheckbox(node, checked) {
    node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) => {
        return this.updateChildNodeCheckbox(child, checked);
      });
    }
  }

  public updateParentNodeCheckbox(node) {
    if (!node) {
      return;
    }
    if (node.data.node_id != undefined) {
      this.parentId = node.data.node_id;
    }
    let allChildrenChecked = true;
    let noChildChecked = true;
    for (const child of node.children) {
      if (!child.data.checked || child.data.indeterminate) {
        allChildrenChecked = false;
      }
      if (child.data.checked) {
        noChildChecked = false;
      }
    }
    if (allChildrenChecked) {
      node.data.checked = false;
      node.data.indeterminate = false;
    } else if (noChildChecked) {
      node.data.checked = false;
      node.data.indeterminate = false;
    } else {
      node.data.checked = false;
      node.data.indeterminate = false;
    }
    this.updateParentNodeCheckbox(node.parent);
  }

  showWorkGroupModal() {
    this.showAddNewWorkGroup = true;
  }

  showuserRoleModal() {
    this.showAddNewUserRole = true;
  }

  work_group_id: string;
  workGroupDescription_ul: string = '';
  workGroupName_ul: string = '';
  workGroup_ul: any = {};

  addWorkGroup(work_group_id) {
    this.disableSave = true;
    if (
      work_group_id !== '' &&
      work_group_id !== undefined &&
      work_group_id !== null
    ) {
      this.work_group_id = work_group_id;
    } else {
      this.work_group_id = typeof (work_group_id === undefined || null)
        ? ''
        : work_group_id;
    }
    this.workGroupName_ul = this.trim(this.workGroup.workGroupName);
    this.workGroupDescription_ul = this.workGroup.workGroupDescription;
    if (this.workGroupDescription_ul === null) {
      this.workGroupDescription_ul = '';
    }
    // this.saveWorkGroup();
  }
}

/* Select All check box logic***/

// selectAllOptionForTree(siteNodes):any{
//   this.encapsulatedTreeJson = {};
//   this.encapsulatedTreeArray=[];
//   this.encapsulatedTreeJson = {
//     "node_id": 'select_all_1',
//     "checked":false,
//     "children": siteNodes
//   };
//   this.encapsulatedTreeArray.push(this.encapsulatedTreeJson);
//   return this.encapsulatedTreeArray;
// }

/* Select All Button logic***/

// selectUnselectAllNodes(sitesHeirarchy:any,){
//   let isSelectAll:boolean = false;
//   sitesHeirarchy.forEach(eachRootNode => {
//    this.selectUnselectEachRootNode(eachRootNode,!isSelectAll);
//   });
// }
// selectUnselectEachRootNode(eachNode:any,isSelectAll:boolean){
//   eachNode['checked'] = true;
//    eachNode = eachNode.children;
//    this.selectUnselectAllNodes(eachNode);
// }
