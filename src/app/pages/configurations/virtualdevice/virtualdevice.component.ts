import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { Router } from '@angular/router';
import { globals } from '../../../utilities/globals';

@Component({
  selector: 'kl-virtualdevice',
  templateUrl: './virtualdevice.component.html',
  styleUrls: ['./virtualdevice.component.scss']
})
export class VirtualdeviceComponent implements OnInit {
  // Variable Declarations
  public sideMenus: Object = {};
  public pageLoaded: Boolean = false;
  public DFMinput: Object = {};
  dmfLoading = false;
  deviceModelData: any;
  onLoaded = false;
  draggedEventKey: any = {};
  protocolsJson: any;
  deviceEdit: any;
  deviceInstanceId: any;
  accessLevel: any;
  disableBtn = false;
  currentSiteID: any;
  // endPointUrl: any;
  depMode: any;
  tagData_length: any;
  tagData: any;
  tableLoad: boolean;
  title: String;
  public loadingAsset: Boolean = false;
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
    // this.title = "Create Asset"
    this.allowAccessComponent('');
    this.addNewVirtualDevice();
    this.getSidebarMenus();
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    });
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('virtualdevice', '');
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
    this.onLoaded = false;
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
        this.sideMenus['menuheading'] = 'Asset';
        this.sideMenus['placeholder'] = 'Search Asset';
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
  // Method to call a dfm of virtual device
  addNewVirtualDevice() {
    // this.title = "Create Asset"
    this.loadingAsset = false;
    this.deviceInstanceId = undefined;
    this.getLabels();
    this.allowAccessComponent('');
    this.dmfLoading = false;
    this.tableLoad = false;
    // const dataToSend = {
    //   device_model_id: '',
    //   filter: [{
    //     site_id: this.currentSiteID,
    //   }],
    // };
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        device_model_id: '',
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        device_model_id: ''
      };
    }
    // this.appservice.getVirualDeviceList({ device_model_id: '' }).subscribe((data) => {
    this.appservice.getVirualDeviceList(dataToSend).subscribe((data) => {
      this.protocolsJson = data.data.general_info;
      if (data.status === 'success') {
        data.data.general_info.userActions = {
          save: {
            label: 'Save'
          },
          cancel: {
            label: 'Cancel'
          }
        };
        this.DFMinput = data.data.general_info;
        this.dmfLoading = true;
        this.loadingAsset = true;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.loadingAsset = true;
      }
    });
  }
  // Method to create virtual device
  getselectedValues(json) {
    this.disableBtn = true;
    json['isdisabled'] = 'false';
    json['isdeleted'] = 'false';
    let saveData;
    if (this.deviceInstanceId !== undefined) {
      saveData = {
        general_info: json,
        device_instance_id: this.deviceInstanceId,
        site_id: json.assign_ref[0].parent_id
      };
    } else {
      saveData = {
        general_info: json,
        device_instance_id: '',
        site_id: json.assign_ref[0].parent_id
      };
    }
    this.appservice.saveVirtualDeviceData(saveData).subscribe((data) => {
      if (data.status === 'success') {
        if (this.deviceInstanceId !== undefined) {
          this._toastLoad.toast(
            'success',
            'Success',
            'Updated Successfully',
            true
          );
          this.deviceInstanceId = undefined;
          this.getSidebarMenus();
          this.onCancel();
          //this.addNewVirtualDevice();
        } else {
          this._toastLoad.toast(
            'success',
            'Success',
            'Created Successfully',
            true
          );
          this.getSidebarMenus();
          this.onCancel();
          //this.addNewVirtualDevice();
        }
        this.disableBtn = false;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.disableBtn = false;
      }
    });
  }
  onCancel() {
    this.dmfLoading = false;
    this.addNewVirtualDevice(); // this.dmfLoading = true;
  }
  // Method to get the created virtual device by ID(bodyContent)
  getVirualData(value) {
    this.loadingAsset = false;
    this.title = 'Edit ' + value.name;
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.tableLoad = true;
    this.deviceInstanceId = value.device_instance_id;
    this.dmfLoading = false;
    // const dataToSend = {
    //   device_instance_id: value.device_instance_id,
    //   filter: [{
    //     site_id: this.currentSiteID,
    //   }],
    // };
    // const datatoGet = {
    //   device_instance_id: value.device_instance_id
    // };
    // this.appservice.getVirtualDeviceTag(datatoGet).subscribe((data) => {
    //   if (data.status === 'success') {
    //     this.tagData = data.data.tagsData;
    //     this.tagData_length = this.tagData.length;
    //   } else {
    //     this._toastLoad.toast('error', 'Error', data.message, true);
    //   }
    // });
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        device_instance_id: value.device_instance_id,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        device_instance_id: value.device_instance_id
      };
    }
    this.appservice
      .getVirtualDFMDeviceBodyContentByID(dataToSend)
      .subscribe((databody) => {
        this.deviceEdit = databody;
        if (databody.status === 'success') {
          this.deviceEdit.data.general_info.userActions = {
            save: {
              label: 'Update'
            },
            cancel: {
              label: 'Cancel'
            }
          };
          this.DFMinput = this.deviceEdit.data.general_info;
          this.dmfLoading = true;
          this.loadingAsset = true;
          this.getTableData(this.deviceInstanceId);
        } else {
          this._toastLoad.toast('error', 'Error', databody.message, true);
          this.loadingAsset = true;
        }
      });
  }
  getTableData(value) {
    this.loadingAsset = false;
    const datatoGet = {
      device_instance_id: value
    };
    this.appservice.getVirtualDeviceTag(datatoGet).subscribe((data) => {
      if (data.status === 'success') {
        this.tagData = data.data.tagsData;
        this.tagData_length = this.tagData.length;
        this.loadingAsset = true;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.loadingAsset = true;
      }
    });
  }
}
