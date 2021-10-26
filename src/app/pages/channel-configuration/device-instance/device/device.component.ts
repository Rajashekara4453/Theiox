import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DeviceSearchComponent } from '../device-search/device-search.component';
import { globals } from '../../../../utilities/globals';
import { Observable } from 'rxjs';
import { AuthGuard } from '../../../../pages/auth/auth.guard';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { ServiceloaderService } from '../../../../components/loader/serviceloader/serviceloader.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'kl-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit {
  // Variable Declarations
  isSensorMoving = true;
  devices: any = [];
  @Input() devicesInGateway: any;
  @Input() search: any;
  @Input() filter: any;
  @Output() deviceInformation = new EventEmitter();
  @Output() deviceStatusInfo = new EventEmitter();
  gatewayLists: Array<any> = [];
  @Input() gatewayInfo: any = {};
  public queryString: String = '';
  currentSiteID: any;
  IntervalId: any;
  deviceStatus: any;
  statusMode = true;
  clearTime: any;
  depMode: any;
  // endPointUrl: any;
  deviceForward: any;
  deviceBackword: any;
  showDevices: any;
  totalDevies: any;
  allTotalDevies = [];
  accessLevelDevice: any;
  holdFilter: String;
  options: any;
  matchedGateways: any = [];
  deviceId: any;
  deviceName: any;
  selectedGatewayInfo: any;
  movingDeviceInfo: any;
  public gatewayChange: String;
  client_id: any;
  @ViewChild('deviceclose') deviceclose: ElementRef;
  filtervalueFromGatewaySensorBlock: any;
  deleteSensorId: string;
  deleteSensorValue: string;
  sensorNameToDelete: string;
  isSearched: any;
  constructor(
    private _appService: AppService,
    private _globals: globals,
    public _auth: AuthGuard,
    public _toastLoad: ToastrService,
    private loader: ServiceloaderService,
    private _router: Router
  ) {}
  ngOnInit() {
    this.loader.show();
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    // this.endPointUrl = this._globals.deploymentModeAPI;
    this.allowAccess('');
    this.getDevices();
    this.getTimer();
    this.getAllGateways();
    this.deviceForward = 0;
    this.deviceBackword = 100;
  }
  allowAccess(acess: string) {
    const val = this._auth.allowAccessComponent('devices', '');
    this.accessLevelDevice = val;
  }
  stopLoader(value) {
    if (value) {
      this.loader.hide();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    // if(changes.search){
    //   this.queryString = changes.search.currentValue;
    // } else {
    //   this.allDevices(changes.filter.currentValue);
    // }
    if (changes.devicesInGateway && changes.filter) {
      this.filtervalueFromGatewaySensorBlock = changes.filter.currentValue;
    } else {
      if (changes.search) {
        this.queryString = changes.search.currentValue;
        if (this.queryString === '') {
          this.isSearched = false;
          this.filterSensorFromGarteway();
        } else {
          this.isSearched = true;
          this.showDevices = false;
        }
      } else {
        this.allDevices(changes.filter.currentValue);
      }
    }
  }
  getTimer() {
    //  we have to pass site id :this.currentSiteID
    // GatewayStatus : it is the key used in the data_Content;
    const timer$: Observable<any> = this._globals.getTimerSettings(
      this.currentSiteID,
      'GatewayStatus'
    );
    timer$.subscribe((data) => {
      if (data === null) {
        this.IntervalId = setInterval(() => {
          this.getDeviceSataus();
        }, 10000);
      } else {
        this.IntervalId = setInterval(() => {
          this.getDeviceSataus();
        }, data * 1000);
      }
    });
  }
  // Method to list the devices
  getDevices() {
    if (this.devicesInGateway != 'gateway_instance_all') {
      this._appService.getDevices(this.devicesInGateway).subscribe((data) => {
        if (data.status === 'success') {
          this.deviceStatus = data.nodes;
          this.listTheDevices(data.nodes);
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
    } else {
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
      this._appService.getCardSettings(dataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this.deviceStatus = data['nodes'];
          this.listTheDevices(data['nodes']);
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
    }
  }
  listTheDevices(list) {
    const dataToSend = {};
    list['deviceCount'] = 0;
    list['activeDeviceCount'] = 0;
    list['inactiveDeviceCount'] = 0;
    let deleteCount = 0;
    let disableCount = 0;
    let activeDeviceCount = 0;
    let inactiveDeviceCount = 0;
    this._appService.getGatewayStatus(dataToSend).subscribe((sdata) => {
      for (let i = 0; i < sdata.gatewayLists.length; i++) {
        for (let j = 0; j < list.length; j++) {
          if (sdata.gatewayLists[i].gatewayID === list[j].gateway_instance_id) {
            for (let k = 0; k < list[j].devices.length; k++) {
              for (let l = 0; l < sdata.gatewayLists[i].devices.length; l++) {
                if (
                  sdata.gatewayLists[i].devices[l].deviceID ===
                  list[j].devices[k].device_instance_id
                ) {
                  list[j].devices[k]['status'] =
                    sdata.gatewayLists[i].devices[l].status;
                  if (list[j].devices[k].status === 'active') {
                    activeDeviceCount++;
                    list['activeDeviceCount'] = activeDeviceCount;
                  } else {
                    inactiveDeviceCount++;
                    list['inactiveDeviceCount'] = inactiveDeviceCount;
                  }
                  list['deviceCount'] = activeDeviceCount + inactiveDeviceCount;
                  if (list[j].devices[k].isdeleted === 'true') {
                    deleteCount++;
                    list['deleteCount'] = deleteCount;
                    list[j].devices[k].status = 'delete';
                    list[j].devices[k]['deleted'] = 'Restore';
                  } else {
                    list['deleteCount'] = deleteCount;
                    list[j].devices[k]['deleted'] = 'Delete';
                  }
                  if (list[j].devices[k].isdisabled === 'true') {
                    if (list[j].devices[k].deleted === 'Restore') {
                      //deleted /disabled
                      list['disableCount'] = disableCount;
                    } else {
                      disableCount++;
                      list[j].devices[k].status = 'disable';
                      list['disableCount'] = disableCount;
                    }
                    list[j].devices[k]['disabled'] = 'Enable';
                  } else {
                    if (list[j].devices[k].deleted === 'Restore') {
                      list['disableCount'] = disableCount;
                    } else {
                      list['disableCount'] = disableCount;
                    }
                    list[j].devices[k]['disabled'] = 'Disable';
                  }
                  list[j].devices[k]['show'] = true;
                }
              }
              continue;
            }
          }
        }
      }
      this.allTotalDevies = [];
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list[i].devices.length; j++) {
          if (list[i].devices[j].deleted === 'Delete') {
            list[i].devices[j]['show'] = true;
            this.allTotalDevies.push(list[i].devices[j]);
          } else {
            list[i].devices[j]['show'] = false;
            this.allTotalDevies.push(list[i].devices[j]);
          }
        }
      }
      if (list['disableCount'] > 0 || list['deleteCount'] > 0) {
        list['inactiveDeviceCount'] =
          list['inactiveDeviceCount'] -
          (list['disableCount'] + list['deleteCount']);
        list['deviceCount'] = list['deviceCount'] - list['deleteCount'];
      }
      this.allTotalDevies['disableCount'] = list.disableCount;
      this.allTotalDevies['deleteCount'] = list.deleteCount;
      this.allTotalDevies['inactiveDeviceCount'] = list.inactiveDeviceCount;
      this.allTotalDevies['activeDeviceCount'] = list.activeDeviceCount;
      this.allTotalDevies['deviceCount'] = list.deviceCount;
      this.devices = this.allTotalDevies;
      // if (this.filtervalueFromGatewaySensorBlock != undefined) {
      //   this.allDevices(this.filtervalueFromGatewaySensorBlock)
      // }
      if (this.devices.length < 1) {
        this.loader.hide();
      }
      this.deviceStatusInfo.emit(this.devices);
      this.LoadDevice(this.devices);
      if (this.filtervalueFromGatewaySensorBlock != undefined) {
        this.allDevices(this.filtervalueFromGatewaySensorBlock);
      }
      // this.loader.hide();
    });
  }
  onDeviceClick(value) {
    this._router.navigate([
      'configurations/gatewayDevices/gatewaylist/gateway_instance_all'
    ]);
    this.deviceInformation.emit(value);
  }
  // Method to delete/restore device
  onDeviceDelete(id, value) {
    if (value === 'false') {
      value = 'Delete';
    } else {
      value = 'Restore';
    }
    this._appService.deleteDevice(id, value).subscribe((data) => {
      if (data.status === 'success') {
        // this._toastLoad.toast('success', 'Success', data.message, true);
        if (data.isdeleted === 'false') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Sensor Restored Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'success',
            'Success',
            'Sensor Deleted Successfully',
            true
          );
        }
        this.getDevices();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to disable/enable device
  onDeviceEnableDisable(id, value) {
    if (value === 'false') {
      value = 'Disable';
    } else {
      value = 'Enable';
    }
    this._appService.disableDevice(id, value).subscribe((data) => {
      if (data.status === 'success') {
        // this._toastLoad.toast('success', 'Success', data.message, true);
        if (data.isdisabled === 'false') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Sensor Enabled Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'success',
            'Success',
            'Sensor Disabled Successfully',
            true
          );
        }
        this.getDevices();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to show all devices
  allDevices(value) {
    this.holdFilter = value;
    this.deviceForward = 0;
    this.deviceBackword = this.devices.length;
    if (value === 'All') {
      for (let i = 0; i < this.devices.length; i++) {
        if (this.devices[i].deleted === 'Delete') {
          this.devices[i]['show'] = true;
        } else {
          this.devices[i]['show'] = false;
        }
      }
    } else {
      for (let i = 0; i < this.devices.length; i++) {
        if (this.devices[i].status === value) {
          this.devices[i]['show'] = true;
        } else {
          this.devices[i]['show'] = false;
        }
      }
    }
    // this.showDevices = false;
    this.filterSensorFromGarteway();
    return this.devices;
  }
  ngOnDestroy() {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
  }
  getDeviceSataus() {
    const dataToSend = {};
    this.deviceStatus['deviceCount'] = 0;
    this.deviceStatus['activeDeviceCount'] = 0;
    this.deviceStatus['inactiveDeviceCount'] = 0;
    let deleteCount = 0;
    let disableCount = 0;
    let activeDeviceCount = 0;
    let inactiveDeviceCount = 0;
    if (this.statusMode) {
      this.statusMode = false;
      this._appService.getGatewayStatus(dataToSend).subscribe(
        (sdata) => {
          this.statusMode = true;
          clearTimeout(this.clearTime);
          for (let i = 0; i < sdata.gatewayLists.length; i++) {
            for (let j = 0; j < this.deviceStatus.length; j++) {
              if (
                sdata.gatewayLists[i].gatewayID ===
                this.deviceStatus[j].gateway_instance_id
              ) {
                for (let k = 0; k < this.deviceStatus[j].devices.length; k++) {
                  for (
                    let l = 0;
                    l < sdata.gatewayLists[i].devices.length;
                    l++
                  ) {
                    if (
                      sdata.gatewayLists[i].devices[l].deviceID ===
                      this.deviceStatus[j].devices[k].device_instance_id
                    ) {
                      this.deviceStatus[j].devices[k]['status'] =
                        sdata.gatewayLists[i].devices[l].status;
                      if (this.deviceStatus[j].devices[k].status === 'active') {
                        activeDeviceCount++;
                        this.deviceStatus[
                          'activeDeviceCount'
                        ] = activeDeviceCount;
                      } else {
                        inactiveDeviceCount++;
                        this.deviceStatus[
                          'inactiveDeviceCount'
                        ] = inactiveDeviceCount;
                      }
                      this.deviceStatus['deviceCount'] =
                        activeDeviceCount + inactiveDeviceCount;
                      if (
                        this.deviceStatus[j].devices[k].isdeleted === 'true'
                      ) {
                        deleteCount++;
                        this.deviceStatus['deleteCount'] = deleteCount;
                        this.deviceStatus[j].devices[k].status = 'delete';
                        this.deviceStatus[j].devices[k]['deleted'] = 'Restore';
                      } else {
                        this.deviceStatus['deleteCount'] = deleteCount;
                        this.deviceStatus[j].devices[k]['deleted'] = 'Delete';
                      }
                      if (
                        this.deviceStatus[j].devices[k].isdisabled === 'true'
                      ) {
                        if (
                          this.deviceStatus[j].devices[k].deleted === 'Restore'
                        ) {
                          //deleted /disabled
                          this.deviceStatus['disableCount'] = disableCount;
                        } else {
                          disableCount++;
                          this.deviceStatus[j].devices[k].status = 'disable';
                          this.deviceStatus['disableCount'] = disableCount;
                        }
                        this.deviceStatus[j].devices[k]['disabled'] = 'Enable';
                      } else {
                        if (
                          this.deviceStatus[j].devices[k].deleted === 'Restore'
                        ) {
                          this.deviceStatus['disableCount'] = disableCount;
                        } else {
                          this.deviceStatus['disableCount'] = disableCount;
                        }
                        this.deviceStatus[j].devices[k]['disabled'] = 'Disable';
                      }
                      this.deviceStatus[j].devices[k]['show'] = true;
                    }
                  }
                  continue;
                }
              }
            }
          }
          if (
            this.deviceStatus['disableCount'] > 0 ||
            this.deviceStatus['deleteCount'] > 0
          ) {
            this.deviceStatus['inactiveDeviceCount'] =
              this.deviceStatus['inactiveDeviceCount'] -
              (this.deviceStatus['disableCount'] +
                this.deviceStatus['deleteCount']);
            this.deviceStatus['deviceCount'] =
              this.deviceStatus['deviceCount'] -
              this.deviceStatus['deleteCount'];
          }
          this.allTotalDevies = [];
          for (let i = 0; i < this.deviceStatus.length; i++) {
            for (let j = 0; j < this.deviceStatus[i].devices.length; j++) {
              if (this.deviceStatus[i].devices[j].deleted === 'Delete') {
                this.deviceStatus[i].devices[j]['show'] = true;
                this.allTotalDevies.push(this.deviceStatus[i].devices[j]);
              } else {
                this.deviceStatus[i].devices[j]['show'] = false;
                this.allTotalDevies.push(this.deviceStatus[i].devices[j]);
              }
            }
          }
          this.allTotalDevies['disableCount'] = this.deviceStatus.disableCount;
          this.allTotalDevies['deleteCount'] = this.deviceStatus.deleteCount;
          this.allTotalDevies[
            'inactiveDeviceCount'
          ] = this.deviceStatus.inactiveDeviceCount;
          this.allTotalDevies[
            'activeDeviceCount'
          ] = this.deviceStatus.activeDeviceCount;
          this.allTotalDevies['deviceCount'] = this.deviceStatus.deviceCount;
          this.devices = this.allTotalDevies;
          if (this.holdFilter === 'active') {
            this.allDevices('active');
          }
          if (this.holdFilter === 'inactive') {
            this.allDevices('inactive');
          }
          if (this.holdFilter === 'disable') {
            this.allDevices('disable');
          }
          if (this.holdFilter === 'delete') {
            this.allDevices('delete');
          }
          this.deviceStatusInfo.emit(this.devices);
        },
        (err) => {
          this.statusMode = true;
          clearTimeout(this.clearTime);
        }
      );
      if (this.statusMode) {
      } else {
        this.startTimer();
      }
    }
  }
  startTimer() {
    this.clearTime = setTimeout(() => {
      this.statusMode = true;
    }, 60000);
  }
  LoadDevice(devices) {
    if (devices.length <= 100) {
      this.showDevices = false;
    } else {
      this.showDevices = true;
    }
  }
  loadMoreSensors() {
    this.deviceBackword = this.deviceBackword + 100;
    if (this.deviceBackword >= this.devices.length) {
      this.showDevices = false;
    }
  }
  getAllGateways() {
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
    this._appService.getCardSettings(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        const gateway = [];
        const isDeleted = 'true';
        for (let i = 0; i < data['nodes'].length; i++) {
          if (data['nodes'][i].isdeleted !== isDeleted) {
            gateway.push(data['nodes'][i]);
          }
        }
        this.options = gateway;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  getSelectedDeviceInfo(value, device, id) {
    const MatchedGatewayProtocols = [];
    for (let i = 0; i < this.options.length; i++) {
      for (let j = 0; j < this.options[i].protocolcategory.length; j++) {
        if (id === this.options[i].gateway_instance_id) {
        } else {
          if (value === this.options[i].protocolcategory[j]) {
            MatchedGatewayProtocols.push(this.options[i]);
          }
        }
      }
    }
    this.matchedGateways = MatchedGatewayProtocols;
    this.deviceId = device.device_com_id;
    this.deviceName = device.device_name;
    this.movingDeviceInfo = device;
    this.isSensorMoving = true;
  }
  selectOption(value) {
    for (let i = 0; i < this.options.length; i++) {
      if (value === this.options[i].gateway_instance_id) {
        this.selectedGatewayInfo = this.options[i];
      }
    }
  }
  MoveToGateway() {
    this.loader.show();
    if (this.gatewayChange === undefined) {
      this._toastLoad.toast(
        'warning',
        'Info',
        'Select Gateway to Move the Sensor',
        true
      );
      this.loader.hide();
      return;
    }
    if (this.gatewayChange === null) {
      this._toastLoad.toast(
        'warning',
        'Info',
        'Select Gateway to Move the Sensor',
        true
      );
      this.loader.hide();
      return;
    }
    if (this.deviceId === '') {
      this._toastLoad.toast('warning', 'Info', 'Select Sensor ID', true);
      this.loader.hide();
      return;
    }
    if (this.deviceName === '') {
      this._toastLoad.toast('warning', 'Info', 'Select Sensor Name', true);
      this.loader.hide();
      return;
    }
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        device_instance_id: this.movingDeviceInfo.device_instance_id,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        device_instance_id: this.movingDeviceInfo.device_instance_id
      };
    }
    this.isSensorMoving = false;
    this._appService
      .getDFMDeviceModelBodyContentByID(dataToSend)
      .subscribe((databody) => {
        if (databody.status === 'success') {
          databody.data.general_info.bodyContent[
            'gateway_instance_id'
          ] = this.selectedGatewayInfo.gateway_instance_id;
          databody.data.general_info.bodyContent[
            'device_com_id'
          ] = this.deviceId;
          databody.data.general_info.bodyContent[
            'device_name'
          ] = this.deviceName;
          // below code is done for deviceselection is not updated in all devices bcz of murugan end point is pending
          if (
            databody.data.general_info.bodyContent.hasOwnProperty(
              'deviceselection'
            )
          ) {
            if (
              databody.data.general_info.bodyContent.deviceselection ===
              'single'
            ) {
              const data = {
                client_id: this.client_id,
                virtual_device: {
                  device_instance_id:
                    databody.data.deviceConfig[0].tagsData[0]
                      .device_instance_id,
                  general_info: {
                    device_model_ref_id: '',
                    device_model_name: '',
                    device_name: this.deviceName,
                    devicetype: [],
                    protocolcategory: [],
                    make: '',
                    modelnumber: '',
                    assign_ref:
                      databody.data.general_info.bodyContent.assign_ref,
                    belongs_ref:
                      databody.data.general_info.bodyContent.belongs_ref,
                    device_com_id: '',
                    timeout: '',
                    deviceselection: [],
                    isdisabled: 'false',
                    isdeleted: 'false'
                  }
                },
                sensor_device: {
                  device_instance_id: this.movingDeviceInfo.device_instance_id,
                  general_info: databody.data.general_info.bodyContent,
                  deviceConfig: databody.data.deviceConfig,
                  device_model_id: ''
                }
              };
              this._appService
                .saveDeviceModelConfigurationDataSensorCreate(data)
                .subscribe((data) => {
                  if (data.status === 'success') {
                    this.getDevices();
                    this.deviceclose.nativeElement.click();
                    this._toastLoad.toast(
                      'success',
                      'Success',
                      'Sensor Moved Successfully',
                      true
                    );
                    this.isSensorMoving = true;
                    this.loader.hide();
                  } else {
                    this._toastLoad.toast('error', 'Error', data.message, true);
                    this.loader.hide();
                  }
                });
            } else {
              const saveData = {
                device_instance_id: this.movingDeviceInfo.device_instance_id,
                general_info: databody.data.general_info.bodyContent,
                deviceConfig: databody.data.deviceConfig,
                device_model_id: ''
              };
              this._appService
                .saveDeviceModelConfigurationData(saveData)
                .subscribe((data) => {
                  if (data.status === 'success') {
                    this.getDevices();
                    this.deviceclose.nativeElement.click();
                    this._toastLoad.toast(
                      'success',
                      'Success',
                      'Sensor Moved Successfully',
                      true
                    );
                    this.isSensorMoving = true;
                    this.loader.hide();
                  } else {
                    this._toastLoad.toast('error', 'Error', data.message, true);
                    this.loader.hide();
                  }
                });
            }
          } else {
            // this else condition removed if end point is updated
            databody.data.general_info.bodyContent['deviceselection'] =
              'multiple';
            const saveData = {
              device_instance_id: this.movingDeviceInfo.device_instance_id,
              general_info: databody.data.general_info.bodyContent,
              deviceConfig: databody.data.deviceConfig,
              device_model_id: ''
            };
            this._appService
              .saveDeviceModelConfigurationData(saveData)
              .subscribe((data) => {
                if (data.status === 'success') {
                  this.getDevices();
                  this.deviceclose.nativeElement.click();
                  this._toastLoad.toast(
                    'success',
                    'Success',
                    'Sensor Moved Successfully',
                    true
                  );
                  this.loader.hide();
                  this.isSensorMoving = true;
                } else {
                  this._toastLoad.toast('error', 'Error', data.message, true);
                  this.loader.hide();
                }
              });
          }
        } else {
          this._toastLoad.toast('error', 'Error', databody.message, true);
        }
      });
  }
  filterSensorFromGarteway() {
    if (this.holdFilter === 'All' || this.holdFilter === undefined) {
      if (this.devices.length <= 100) {
        this.showDevices = false;
      } else {
        this.deviceForward = 0;
        this.deviceBackword = 100;
        this.showDevices = true;
      }
    } else {
      let activeDeviceCount = 0;
      for (let i = 0; i < this.devices.length; i++) {
        if (this.devices[i].status === this.holdFilter) {
          activeDeviceCount++;
        }
      }
      if (activeDeviceCount <= 100) {
        this.showDevices = false;
      } else {
        this.deviceForward = 0;
        this.deviceBackword = 100;
        this.showDevices = true;
      }
    }
  }
  getSensorValues(id, value, name) {
    this.deleteSensorId = id;
    this.deleteSensorValue = value;
    this.sensorNameToDelete = name;
  }
}
