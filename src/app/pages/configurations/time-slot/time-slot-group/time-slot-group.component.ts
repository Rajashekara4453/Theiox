import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { NgForm, NgModel } from '@angular/forms';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { Router } from '@angular/router';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-time-slot-group',
  templateUrl: './time-slot-group.component.html',
  styleUrls: ['./time-slot-group.component.scss']
})
export class TimeSlotGroupComponent implements OnInit {
  sideMenus: any;
  getUnitsObj: any;
  selectedUnit: any;
  isUpdate: boolean = false;
  units: Array<any> = [];
  showCancelButton = false;
  @ViewChild('tagForm') tagForm: NgForm;
  @ViewChild('name') name: NgModel;
  @ViewChild('description') description: NgModel;
  accessLevel: any;
  disableBtn = false;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  endPointUrl: any;
  depMode: any;
  list: any;
  title: String;
  onLoaded = false;
  deleteTimeSlot: any;
  constructor(
    private appService: AppService,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private router: Router,
    private _globals: globals
  ) {}

  ngOnInit() {
    // this.title = 'Create Time Slot Group';
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    this.endPointUrl = this._globals.deploymentModeAPI;
    this.getTimeSlotGroup();
    this.getTheTypes();
    this.isUpdate = false;
    this.selectedUnit = { id: '', name: '', description: '', type: null };
    this.allowAccessComponent('');
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    });
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('masterConfiguration', '');
    this.accessLevel = val;
    if (!this.accessLevel.view) {
      this.router.navigate(['/un-authorized']);
      return false;
    }
    // return val;
  }
  getTheTypes() {
    const json = [
      {
        time_slot_id: 'shift',
        time_slot_value: 'shift'
      },
      {
        time_slot_id: 'tod',
        time_slot_value: 'tod'
      }
    ];
    // data.push(json)
    this.list = json;
  }
  getTimeSlotGroup() {
    this.onLoaded = false;
    try {
      //for site id
      // const dataToSend = {
      //   filter: [{
      //     site_id: this.currentSiteID,
      //   }],
      // };

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
      this.appService
        .getTimeSlotGrp(this.endPointUrl.TIME_SLOT_GROUP_GET, dataToSend)
        .subscribe((data) => {
          this.sideMenus = data;
          this.sideMenus['menuheading'] = 'Time Slot Group';
          this.sideMenus['buttonlabel'] = 'Create  TimeSlot Group';
          this.sideMenus['placeholder'] = 'Search for TimeSlot Group';
          this.onLoaded = true;
        });
    } catch (error) {}
  }

  handleUnitClick(e: any) {
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.selectedUnit = JSON.parse(JSON.stringify(e));
    this.title = 'Edit ' + this.selectedUnit.name;
    this.deleteTimeSlot = this.selectedUnit.name;
    this.isUpdate = true;
    this.showCancelButton = true;
  }

  handleEventUpdate(ev: any) {
    this.getTimeSlotGroup();
    this.isUpdate = false;
    this.selectedUnit = { id: '', name: '', description: '', type: null };
  }

  addNewUnit() {
    // this.title = 'Create Time Slot Group';
    this.getLabels();
    this.isUpdate = false;
    this.showCancelButton = false;
    this.selectedUnit = { id: '', name: '', description: '', type: null };
    this.getTimeSlotGroup();
    this.allowAccessComponent('');
  }
  saveOrUpdateUnitLevel() {
    this.disableBtn = true;
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
        client_id: this.client_id,
        default: this.default
      };
    }
    this.selectedUnit = Object.assign(this.selectedUnit, json);
    this.appService
      .saveOrUpdateTimeSlotGroup(this.selectedUnit)
      .subscribe((data) => {
        this.getTimeSlotGroup();
        if (data.status === 'success') {
          this._toastLoad.toast('success', 'Success', data.message, true);
          this.addNewUnit();
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
        this.disableBtn = false;
      });
  }
  deleteUnitLevel() {
    this.appService.deleteTimeSlotGroup(this.selectedUnit).subscribe((data) => {
      this.selectedUnit = { id: '', name: '', description: '' };
      this.getTimeSlotGroup();
      if (data.status === 'success') {
        this._toastLoad.toast(
          'success',
          'Success',
          'Time Slot Group Deleted successfully',
          true
        );
        this.addNewUnit();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
}
