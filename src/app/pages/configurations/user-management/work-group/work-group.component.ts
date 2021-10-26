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
import { ISubscription } from 'rxjs/Subscription';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-work-group',
  templateUrl: './work-group.component.html',
  styleUrls: ['./work-group.component.scss']
})
export class WorkGroupComponent implements OnInit, OnDestroy {
  private subscription: ISubscription;
  @ViewChild(NgForm) workGroupForm: NgForm;
  @Output() workGroupAddedFromUserList = new EventEmitter();
  @Input() isWorkGroupFromUserList: false;
  workGroup: any = {};
  workGroupList = [];
  work_group_id: string = '';
  workGroupName: string = '';
  workGroupDescription: string = '';
  public sideMenus: any = {};
  public displayProperty: any = {};
  //disabled: boolean = false;
  accessPermission: any;
  addOrEditWorkGroup: boolean = false;
  allowDeleteWorkGroup: boolean = false;
  showDeleteBtn: boolean = false;
  disableDelete: boolean = false;
  disableSave: boolean;

  // Variable for Multi-tenant model
  site_id: any;
  client_id: string = '';
  default: boolean = false;
  deploymentMode = 'EL';
  // endPointExt: any;
  title: String;
  dataToSend: any = {};
  onLoaded = false;
  constructor(
    private _appService: AppService,
    private _toastLoad: ToastrService,
    private _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    // Multi-tenant model
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.site_id = this._globals.getCurrentUserSiteId();
    // this.title = "Create Work Group";

    this.checkDeploymentMode();

    this.getWorkGroupList();
    this.getWorkGroupsMenuBar();
    this.allowAccess();
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    });
  }
  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
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
    // calling allowAccessComponent()
    // - to check user access permission
    // - to handle access permission for work group from userList also.
    // this.accessPermission = this._auth.allowAccessComponent('workGroup', '');
    if (this.isWorkGroupFromUserList) {
      this.accessPermission = this._auth.getComponentAccess(
        85.3,
        'workGroup',
        ''
      );
    } else {
      this.accessPermission = this._auth.getMenuAccessLevel;
    }
    this.checkAccessPermission('create');
  }

  checkAccessPermission(accessTo: string) {
    switch (accessTo) {
      case 'create':
        if (this.accessPermission.create) {
          this.disableSave = false;
          this.showDeleteBtn = false;
          this.addOrEditWorkGroup = true;
          break;
        } else {
          this.disableSave = true;
          this.addOrEditWorkGroup = false;
          break;
        }
      case 'edit':
        if (this.accessPermission.edit) {
          this.disableSave = false;
          this.addOrEditWorkGroup = true;
          this.checkAccessPermission('delete');
          break;
        } else {
          this.disableSave = true;
          this.addOrEditWorkGroup = false;
          this.checkAccessPermission('delete');
          break;
        }
      case 'delete':
        if (this.accessPermission.delete) {
          this.showDeleteBtn = true;
          this.disableDelete = false;
          this.allowDeleteWorkGroup = true;
          break;
        } else {
          this.showDeleteBtn = true;
          this.disableDelete = true;
          this.allowDeleteWorkGroup = false;
          break;
        }
    }
  }

  // Method to get WorkGroup data from DB
  getWorkGroupList() {
    this.onLoaded = false;
    // const dataToSend = {
    //   filter: [{ site_id: this.site_id }],
    // };
    this.checkDeploymentMode();
    this.subscription = this._appService
      .getWorkGroupList(this.dataToSend)
      .subscribe((workGroupList) => {
        this.workGroupList = workGroupList.data;
        this.getWorkGroupsMenuBar();
      });
  }

  // Method to set Menubar data for WorkGroup
  getWorkGroupsMenuBar() {
    this.sideMenus['menuheading'] = 'Work Group';
    this.sideMenus['placeholder'] = 'Search Work Group';
    this.sideMenus['buttonlabel'] = 'Create  New Work Group';
    this.sideMenus['data'] = this.workGroupList;
    this.onLoaded = true;
  }

  // Method to reset the Form
  resetWorkGroupForm(workGroupForm: NgForm) {
    // this.title = "Create Work Group";
    this.getLabels();
    workGroupForm.reset();
    this.work_group_id = '';
    this.getWorkGroupList();
    this.checkAccessPermission('create');
  }

  // Method to Add Work Group
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
    this.workGroupName = this.trim(this.workGroup.workGroupName);
    this.workGroupDescription = this.workGroup.workGroupDescription;
    if (this.workGroupDescription === null) {
      this.workGroupDescription = '';
    }
    this.saveWorkGroup();
  }

  trim(input) {
    input = input
      .replace(/(^\s*)|(\s*$)/gi, '') // removes leading and trailing spaces
      .replace(/[ ]{2,}/gi, ' ') // replaces multiple spaces with one space
      .replace(/\n +/, '\n'); // Removes spaces after newlines
    return input;
  }

  //  Method to Edit Work Group
  editWorkGroup(event: any) {
    this.workGroup.work_group_id =
      typeof event.work_group_id === undefined || '' ? '' : event.work_group_id;
    // const dataToSend = {work_group_id: this.workGroup.work_group_id};

    //work group description not returned

    // this.subscription = this._appService.getWorkGroupList(dataToSend).subscribe((workGroupList) => {
    //   this.workGroupList = workGroupList.data;
    // });
    this.workGroup.workGroupName = event.workGroupName;
    this.title = 'Edit ' + this.workGroup.workGroupName;
    // this.workGroup.workGroupDescription = event.workGroupDescription;
    this.workGroup.workGroupDescription =
      typeof event.workGroupDescription === undefined || ''
        ? ''
        : event.workGroupDescription;
    this.checkAccessPermission('edit');
  }

  // Method to Save Work Group to DB
  saveWorkGroup() {
    const dataToSend = {
      client_id: this.client_id,
      default: this.default,
      site_id: this.site_id,
      work_group_id: this.work_group_id,
      workGroupName: this.workGroupName,
      workGroupDescription: this.workGroupDescription
    };
    this.subscription = this._appService
      .saveWorkGroup(dataToSend)
      .subscribe((data) => {
        try {
          if (this.work_group_id === '') {
            if (data.status === 'success') {
              this._toastLoad.toast(
                'success',
                'Success',
                'Work Group Created Successfully',
                true
              );
              this.disableSave = false;
              // this.getWorkGroupList();
              this.workGroupAddedFromUserList.emit();
              this.workGroupForm.reset();
              this.resetWorkGroupForm(this.workGroupForm);
            } else {
              this._toastLoad.toast(
                'error',
                'Error',
                'Error while Creating Work Group',
                true
              );
              this.disableSave = false;
            }
          } else {
            if (data.status === 'success') {
              this._toastLoad.toast(
                'success',
                'Success',
                'Work Group Updated Successfully',
                true
              );
              this.disableSave = false;
              this.workGroup.work_group_id = '';
              this.getWorkGroupList();
              this.workGroupAddedFromUserList.emit();
              this.workGroupForm.reset();
              this.checkAccessPermission('create');
              this.resetWorkGroupForm(this.workGroupForm);
            } else {
              this._toastLoad.toast(
                'error',
                'Error',
                'Error while Updating Work Group',
                true
              );
              this.disableSave = false;
            }
          }
        } catch (error) {
          console.error(error);
          this._toastLoad.toast(
            'error',
            'Error',
            'Error Loading Work Group',
            true
          );
        }
      });
  }

  // Delete button needs to be implemented
  deleteWorkGroup(work_group_id: string) {
    const dataToSend = {
      // filter: [{ site_id: this.site_id }],
      work_group_id: work_group_id
    };
    this.subscription = this._appService
      .deleteWorkGroup(dataToSend)
      .subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Work Group Deleted Successfully',
            true
          );
          this.workGroupAddedFromUserList.emit();
          this.getWorkGroupList();
          this.workGroupForm.reset();
          this.showDeleteBtn = false;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error While Deleting Work Group',
            true
          );
          this.workGroupAddedFromUserList.emit();
        }
      });
  }
}
