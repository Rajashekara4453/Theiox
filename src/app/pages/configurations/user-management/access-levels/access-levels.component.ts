import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { NgForm } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { ISubscription } from 'rxjs/Subscription';
import { AuthGuard } from '../../../../pages/auth/auth.guard';
import { globals } from '../../../../utilities/globals';
import { AuthService } from '../../../auth/auth.service';
import { Config } from '../../../../config/config';
import { AccessLevelsService } from './access-levels.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kl-access-levels',
  templateUrl: './access-levels.component.html',
  styleUrls: ['./access-levels.component.scss']
})
export class AccessLevelsComponent implements OnInit, OnDestroy {
  constructor(
    private _appService: AppService,
    private _toastLoad: ToastrService,
    private _auth: AuthGuard,
    private _globals: globals,
    private _authService: AuthService,
    private _accessLevelsService: AccessLevelsService
  ) {}
  private subscription: ISubscription;
  @Output() userRoleAddedFromUserList = new EventEmitter();
  @Input() isUserRoleFromUserList = false;
  @ViewChild(NgForm) accessLevelDataForm: NgForm;
  accessLevelData: any = {};
  // accessLevelDataList: any = [];
  sideMenus: any = {};
  isUpdate: boolean = false;
  accessLevelsList: object = {};
  userRoleName: string = '';
  showDeleteBtn: boolean;
  allowDeleteAccessLevel: boolean;
  disableDelete: boolean;
  disableSave: boolean;
  accessPermission: any;
  addOrEditAccessLevel: boolean = false;
  copyAccessLevelData: any = {};
  accessToEdit: any = {};

  // Variable for Multi-tenant model
  site_id: any;
  client_id: string = '';
  default: boolean = false;
  deploymentMode = 'EL';
  endPointExt: any;
  title: string;
  dataToSend: any = {};

  isEdit: boolean = false;
  isLicenseEnabled: boolean = true;
  pageAccess: any = {};
  menuList: any = [];
  accessLevelDB: any = {};
  userAccess: any = {};
  user_role_id: string = '';
  isSideMenusFetched: boolean = false;

  ngOnInit() {
    // Multi-tenant model
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.site_id = this._globals.getCurrentUserSiteId();
    this.isLicenseEnabled = this._authService.Download;
    this.checkDeploymentMode();
    this.allowAccess();
    this.getAccessLevelDataList();
    this.getMenuJSON();
  }

  // Method to unsubscribe from all the observables onDestroy
  ngOnDestroy() {
    this.subscription.unsubscribe();
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
    // calling allowAccessComponent()
    // - to check user access permission
    // - to handle access permission for access level from userList also.
    if (this.isUserRoleFromUserList) {
      this.pageAccess = this._auth.getComponentAccess(85.4, 'accessLevel', '');
    } else {
      this.pageAccess = this._auth.getMenuAccessLevel;
    }
    this.getLabels();
    this.checkAccessPermission('create');
  }

  checkAccessPermission(accessTo: string) {
    switch (accessTo) {
      case 'create':
        this.title =
          accessTo.charAt(0).toUpperCase() +
          accessTo.substr(1, accessTo.length - 1) +
          ' ' +
          this.title;
        if (this.pageAccess.create) {
          this.disableSave = false;
          this.showDeleteBtn = false;
          this.addOrEditAccessLevel = true;
          break;
        } else {
          this.disableSave = true;
          this.addOrEditAccessLevel = false;
          break;
        }
      case 'edit':
        this.title =
          accessTo.charAt(0).toUpperCase() +
          accessTo.substr(1, accessTo.length - 1) +
          ' ' +
          this.title;
        if (this.pageAccess.edit) {
          this.disableSave = false;
          this.addOrEditAccessLevel = true;
          this.checkAccessPermission('delete');
          break;
        } else {
          this.disableSave = true;
          this.addOrEditAccessLevel = false;
          this.checkAccessPermission('delete');
          break;
        }
      case 'delete':
        if (this.pageAccess.delete) {
          this.showDeleteBtn = true;
          this.disableDelete = false;
          this.allowDeleteAccessLevel = true;
          break;
        } else {
          this.showDeleteBtn = true;
          this.disableDelete = true;
          this.allowDeleteAccessLevel = false;
          break;
        }
    }
  }

  // Method to display labels
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = data;
    });
  }

  // Method to get static JSON - menu.json
  getMenuJSON() {
    const dataToSend = { isApplyAccessLevel: false };
    this._appService.getMenuJSON(dataToSend).subscribe((data: any) => {
      for (let i = 0; i < data['menu'].length; i++) {
        const menuObject = data['menu'][i];
        if (
          menuObject.hasOwnProperty('isShowAccessLevel') &&
          !menuObject['isShowAccessLevel']
        ) {
          data['menu'].splice(i, 1);
        }
      }
      this.menuList = data['menu'];
    });
  }

  // Method to select delect radio button values
  handleRadioClick(menu: any, subKey: string, value: boolean) {
    menu['accessLevel'][subKey] = value;
    this.userAccess['isAllowAllPermissions'] = false;
  }

  async addAccessLevel(userRoleId) {
    this.menuList = await this._accessLevelsService.reduceMenuList(
      this.menuList
    );
    this.disableSave = true;
    this.userAccess['client_id'] = this.client_id;
    // this.client_id;
    this.userAccess['default'] = this.default;
    this.userAccess['site_id'] = this.site_id;
    if (userRoleId === undefined) {
      this.userAccess['user_role_id'] = '';
    } else {
      this.userAccess['user_role_id'] = userRoleId;
    }
    this.userAccess['version'] = '1';
    this.userAccess['timeStamp'] = this._accessLevelsService.getDateTime();
    this.userAccess['userRoleName'] = this.trim(this.userAccess.userRoleName);
    this.userAccess['userRoleDescription'] =
      this.userAccess.userRoleDescription === undefined
        ? ''
        : this.userAccess.userRoleDescription;
    this.userAccess['userRolePermissions'] = this.menuList;
    this.saveAccessLevel(this.userAccess);
  }

  saveAccessLevel(userAccess: any) {
    this.subscription = this._appService
      .saveAccessLevelData(userAccess)
      .subscribe((data) => {
        if (data.status === 'success') {
          this.userAccess['user_role_id'] = '';
          this._toastLoad.toast(
            'success',
            'Success',
            userAccess.hasOwnProperty('user_role_id') &&
              userAccess['user_role_id'] !== ''
              ? 'Updated Successfully'
              : 'Created Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            userAccess.hasOwnProperty('user_role_id') &&
              userAccess['user_role_id'] !== ''
              ? 'Updation Failed'
              : 'Creation Failed',
            true
          );
        }
        this.userRoleAddedFromUserList.emit();
        this.resetAccessLevelDataForm(this.accessLevelDataForm);
      });
  }

  resetAccessLevelDataForm(accessLevelDataForm: NgForm) {
    this.isSideMenusFetched = false;
    accessLevelDataForm.reset();
    this.userAccess = {};
    this.getMenuJSON();
    this.getAccessLevelDataList();
    this.getLabels();
    this.checkAccessPermission('create');
    this.disableSave = false;
    this.isUpdate = false;
  }

  getAccessLevelDataList() {
    const dataToSend = {
      filter: [{ site_id: this.site_id }]
    };
    this.checkDeploymentMode();
    this.subscription = this._appService
      .getAccessLevelDataList(dataToSend)
      .subscribe((accessLevelDataList) => {
        const menuBarData = accessLevelDataList.data;
        this.getAccessLevelDatasMenuBar(menuBarData);
      });
  }

  getAccessLevelDatasMenuBar(menuBarData) {
    this.sideMenus['menuheading'] = 'Access Levels';
    this.sideMenus['placeholder'] = 'Search Access Level';
    this.sideMenus['buttonlabel'] = 'Create  New Access Level';
    this.sideMenus['data'] = menuBarData;
    this.isSideMenusFetched = true;
  }

  onEditCheckNewMenus(event) {
    const requestPayload = {
      user_role_id: event['user_role_id']
    };
    this._appService.getAccessLevel(requestPayload).subscribe((data) => {
      this.userAccess = data['data'][0];
      const userRoleDB = this.userAccess['userRolePermissions'];
      this.menuList.forEach((menu) => {
        for (let i = 0; i < userRoleDB.length; i++) {
          const accessElement = userRoleDB[i];
          if (menu['id'] === accessElement['id']) {
            Object.assign(menu['accessLevel'], accessElement['accessLevel']);
            break;
          }
        }
      });
      this.userAccess['userRolePermissions'] = this.menuList;
      this.isUpdate = true;
      this.isEdit = true;
      this.title = this.userAccess['userRoleName'];
      // tslint:disable-next-line: prefer-template
      this.checkAccessPermission('edit');
    });
  }

  // unique id corresponding to the item
  trackByFn(index) {
    return index;
  }

  trim(input) {
    return input
      .replace(/(^\s*)|(\s*$)/gi, '') // removes leading and trailing spaces
      .replace(/[ ]{2,}/gi, ' ') // replaces multiple spaces with one space
      .replace(/\n +/, '\n'); // Removes spaces after newlines
  }

  deleteAccessLevelData() {
    const dataToSend = {
      // filter: [{ site_id: this.site_id }],
      user_role_id: this.userAccess['user_role_id']
    };
    this.subscription = this._appService
      .deleteAccessLevelData(dataToSend)
      .subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Access Level Deleted Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error While Deleting Access Level',
            true
          );
        }
        this.resetAccessLevelDataForm(this.accessLevelDataForm);
      });
  }

  onClickCollapse(item: any) {
    if (item.isCollapsed === undefined) {
      item['isCollapsed'] = true;
    } else {
      item['isCollapsed'] = !item.isCollapsed;
    }
  }

  // Method to select or de-select all the permissions
  allowAllPermissions(event: string) {
    this.accessLevelData['isAllowAllPermissions'] = event;
    this.menuList.forEach((menu) => {
      if (menu.hasOwnProperty('accessLevel')) {
        const accessKeys = menu['accessLevel'];
        Object.keys(accessKeys).forEach((v) => (accessKeys[v] = event));
      }
    });
  }

  permissionListOrder = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): KeyValue<string, any> => {
    if (a.key === 'view') {
      return a;
    } else if (a.key === 'create') {
      return a;
    } else if (a.key === 'edit') {
      return a;
    } else if (a.key === 'delete') {
      return a;
    } else if (a.key === 'resize') {
      return a;
    } else if (a.key === 'acknowledge') {
      return a;
    } else if (a.key === 'schedule') {
      return a;
    } else if (a.key === 'print') {
      return a;
    } else if (a.key === 'share') {
      return a;
    } else if (a.key === 'commonfilter') {
      return a;
    }
  };

  moduleListOrder = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): KeyValue<string, any> => {
    return a;
  };
}
