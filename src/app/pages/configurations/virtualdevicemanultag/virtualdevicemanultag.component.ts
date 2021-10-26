import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { Router } from '@angular/router';
import { globals } from '../../../utilities/globals';

@Component({
  selector: 'kl-virtualdevicemanultag',
  templateUrl: './virtualdevicemanultag.component.html',
  styleUrls: ['./virtualdevicemanultag.component.scss']
})
export class VirtualdevicemanultagComponent implements OnInit {
  // Variable Declarations
  onLoaded = false;
  public sideMenus: Object = {};
  deviceDropdownSettings: any = [];
  manualTagDropdownSettings: any = [];
  virtualDeviceDropDown: any = [];
  manualTagDeviceDropDown: any = [];
  onLoadPage = false;
  onEditpageLoad = false;
  virtualCollection: any = [];
  manualTagCollection: any = [];
  getDeviceInstanceId: any;
  manualTags: any = [];
  virtualDevice: any = [];
  virtualCheckActive = false;
  manualCheckActive = false;
  draggedEventKey: any = {};
  selectedItemsVirtualDevice = [];
  selectedItemsManulDevice = [];
  disableBtn = false;
  disableEditBtn = false;
  accessLevel: any;
  currentSiteID: any;
  // endPointUrl: any;
  depMode: any;
  title: String;
  constructor(
    private appservice: AppService,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private router: Router,
    private _globals: globals
  ) {}
  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.depMode = this._globals.deploymentMode;
    // this.endPointUrl = this._globals.deploymentModeAPI;
    this.allowAccessComponent('');
    this.addNewManulTag();
    this.getSidebarMenus();
    this.getTagDeviceDropDown();
    // Settings of multiselct
    this.deviceDropdownSettings = {
      singleSelection: false,
      text: 'Select Virtual Devices',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      labelKey: 'device_instance_name',
      primaryKey: 'device_instance_id',
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered  Virtual Devices',
      filterUnSelectAllText: 'Un-select the Filtered  Virtual Devices',
      lazyLoading: true
    };
    this.manualTagDropdownSettings = {
      singleSelection: false,
      text: 'Select Tags',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      labelKey: 'tag_name',
      primaryKey: 'tag_id',
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered  Tags',
      filterUnSelectAllText: 'Un-select the Filtered  Tags',
      lazyLoading: true
    };
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
  allowDrop(ev) {
    ev.preventDefault();
  }
  drag(ev) {}
  drop(ev) {
    this.getVirualData(this.draggedEventKey);
  }
  draggedEventFromMenubar(data: any) {
    this.draggedEventKey = data.data;
  }
  // Method to list the virtual devices
  getSidebarMenus() {
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
    this.appservice.getVirtualLists(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.sideMenus['menuheading'] = 'Assets';
        this.sideMenus['placeholder'] = 'Search Assets';
        this.sideMenus['buttonlabel'] = 'Create Asset';
        this.sideMenus['data'] = data.data;
        this.onLoaded = true;
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error in Loading the List',
          true
        );
      }
    });
  }
  // Method to list the devices and tags
  getTagDeviceDropDown() {
    this.appservice.getManualTagLists().subscribe((data) => {
      if (data.status === 'success') {
        this.virtualDeviceDropDown = data['devices'];
        this.manualTagDeviceDropDown = data['tags'];
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error in Loading the List',
          true
        );
      }
    });
  }
  // Method to select devices
  onVirtualDeviceSelection(item: any) {
    this.virtualCheckActive = true;
    this.disableBtn = false;
    this.virtualCollection = item;
  }
  onDeviceSelectAll(item: any) {
    this.disableBtn = false;
    this.virtualCheckActive = true;
    this.virtualCollection = item;
  }
  onItemDeSelectDevice(item: any) {
    this.disableBtn = false;
    this.virtualCheckActive = false;
    this.virtualCollection = item;
  }
  onItemDeSelectDeviceAll(item: any) {
    this.disableBtn = false;
    this.virtualCheckActive = false;
    this.virtualCollection = item;
  }
  // Method to select tags
  onManualDeviceSelection(item: any) {
    this.manualCheckActive = true;
    this.manualTagCollection = item;
  }
  onManualSelectAll(item: any) {
    this.manualCheckActive = true;
    this.manualTagCollection = item;
  }
  onItemDeSelectManual(item: any) {
    this.manualCheckActive = false;
    this.manualTagCollection = item;
  }
  onItemDeSelectManualAll(item: any) {
    this.manualCheckActive = false;
    this.manualTagCollection = item;
  }
  addNewManulTag() {
    this.getLabels();
    this.onLoadPage = true;
    this.onEditpageLoad = false;
    this.disableBtn = false;
    this.selectedItemsVirtualDevice = [];
    this.selectedItemsManulDevice = [];
    this.allowAccessComponent('');
  }
  // Method to create virtual tag
  onSave() {
    this.disableBtn = true;
    if (
      this.selectedItemsVirtualDevice.length > 0 &&
      this.selectedItemsManulDevice.length > 0
    ) {
      const tagsDataArray = [];
      for (let i = 0; i < this.selectedItemsVirtualDevice.length; i++) {
        const tagArray = [];
        for (let j = 0; j < this.selectedItemsManulDevice.length; j++) {
          tagArray.push({ tag_id: this.selectedItemsManulDevice[j].tag_id });
        }
        tagsDataArray.push({
          tagsData: tagArray,
          device_instance_id: this.selectedItemsVirtualDevice[i]
            .device_instance_id
        });
      }
      const values = {
        manualTags: tagsDataArray
      };
      this.appservice.saveVirtualManualTagData(values).subscribe((data) => {
        if (data.status === 'success') {
          this.onLoadPage = false;
          this.selectedItemsVirtualDevice = [];
          this.selectedItemsManulDevice = [];
          this._toastLoad.toast(
            'success',
            'Success',
            'Asset Manual Tag Created Successfully',
            true
          );

          this.addNewManulTag();
        } else {
          this._toastLoad.toast('error', 'Error', data.status, true);
        }
        this.disableBtn = false;
      });
    } else {
      this._toastLoad.toast(
        'warning',
        'Validation',
        'Please select the required fields',
        true
      );
    }
  }
  onCancel() {
    this.onLoadPage = false;
    this.disableBtn = false;
    this.addNewManulTag();
  }
  // Method to get the created virtual tag(bodyContent)
  getVirualData(value) {
    this.title = 'Edit ' + value.name;
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.disableBtn = false;
    this.onLoadPage = false;
    this.getDeviceInstanceId = value.device_instance_id;
    this.onEditpageLoad = false;
    this.appservice
      .getVirtualManualTagData(value.device_instance_id)
      .subscribe((data) => {
        if (data.status === 'success') {
          const virtualDeviceArray = [];
          for (let k = 0; k < data.devices.length; k++) {
            if (
              this.getDeviceInstanceId === data.devices[k].device_instance_id
            ) {
              virtualDeviceArray.push(data.devices[k]);
            }
          }
          this.selectedItemsVirtualDevice = virtualDeviceArray;
          this.deviceDropdownSettings['fullObject'] = true;
          const manualTagArray = [];
          for (let i = 0; i < data.tagsData.length; i++) {
            for (let j = 0; j < data.tags.length; j++) {
              if (data.tagsData[i].tag_id === data.tags[j].tag_id) {
                manualTagArray.push(data.tags[j]);
              }
            }
          }
          this.selectedItemsManulDevice = manualTagArray;
          this.manualTagDeviceDropDown = data['tags'];
          this.onEditpageLoad = true;
        } else {
          this._toastLoad.toast('error', 'Error', data.status, true);
        }
      });
  }
  // Method to update the created virtual tag
  onEditSave() {
    this.disableEditBtn = true;
    const tagsDataArray = [];
    if (this.virtualCheckActive && this.manualCheckActive) {
      for (let i = 0; i < this.selectedItemsVirtualDevice.length; i++) {
        const tagArray = [];
        for (let j = 0; j < this.selectedItemsManulDevice.length; j++) {
          tagArray.push({ tag_id: this.selectedItemsManulDevice[j].tag_id });
        }
        tagsDataArray.push({
          tagsData: tagArray,
          device_instance_id: this.selectedItemsVirtualDevice[i]
            .device_instance_id
        });
      }
    } else if (this.virtualCheckActive && !this.manualCheckActive) {
      for (let i = 0; i < this.selectedItemsVirtualDevice.length; i++) {
        const tagArray = [];
        for (let j = 0; j < this.selectedItemsManulDevice.length; j++) {
          tagArray.push({ tag_id: this.selectedItemsManulDevice[j].tag_id });
        }
        tagsDataArray.push({
          tagsData: tagArray,
          device_instance_id: this.selectedItemsVirtualDevice[i]
            .device_instance_id
        });
      }
    } else if (!this.virtualCheckActive && this.manualCheckActive) {
      for (let i = 0; i < this.selectedItemsVirtualDevice.length; i++) {
        const tagArray = [];
        for (let j = 0; j < this.selectedItemsManulDevice.length; j++) {
          tagArray.push({ tag_id: this.selectedItemsManulDevice[j].tag_id });
        }
        tagsDataArray.push({
          tagsData: tagArray,
          device_instance_id: this.selectedItemsVirtualDevice[i]
            .device_instance_id
        });
      }
    } else {
      if (
        this.selectedItemsVirtualDevice.length > 0 &&
        this.selectedItemsManulDevice.length > 0
      ) {
        for (let i = 0; i < this.selectedItemsVirtualDevice.length; i++) {
          const tagArray = [];
          for (let j = 0; j < this.selectedItemsManulDevice.length; j++) {
            tagArray.push({ tag_id: this.selectedItemsManulDevice[j].tag_id });
          }
          tagsDataArray.push({
            tagsData: tagArray,
            device_instance_id: this.selectedItemsVirtualDevice[i]
              .device_instance_id
          });
        }
      }
    }
    const values = {
      manualTags: tagsDataArray
    };
    if (tagsDataArray.length > 0) {
      this.appservice.saveVirtualManualTagData(values).subscribe((data) => {
        if (data.status === 'success') {
          this.onEditpageLoad = false;
          if (!this.virtualCheckActive && !this.manualCheckActive) {
            this._toastLoad.toast(
              'success',
              'Success',
              'Asset Manual Tag Updated Successfully',
              true
            );
          } else {
            this._toastLoad.toast(
              'success',
              'Success',
              'Asset Manual Tag Created Successfully',
              true
            );
          }
          this.virtualCheckActive = false;
          this.manualCheckActive = false;
          this.selectedItemsVirtualDevice = [];
          this.selectedItemsManulDevice = [];
          this.disableEditBtn = false;
          this.addNewManulTag();
        } else {
          this._toastLoad.toast('error', 'Error', data.status, true);
        }
        this.virtualCheckActive = false;
        this.manualCheckActive = false;
        this.disableEditBtn = false;
      });
    } else {
      this._toastLoad.toast(
        'warning',
        'Validation',
        'Please select the required fields',
        true
      );
    }
  }
  onEditCancel() {
    // this.selectedItemsVirtualDevice = [];
    // this.selectedItemsManulDevice = [];
    this.onEditpageLoad = false;
    this.disableEditBtn = false;
    this.addNewManulTag();
  }
}
