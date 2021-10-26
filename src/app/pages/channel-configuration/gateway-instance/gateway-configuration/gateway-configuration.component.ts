import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild
} from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ChannelConfigurationService } from '../../../../services/channelconfiguration.service';
import { Router, PreloadAllModules, ActivatedRoute } from '@angular/router';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { GatewaysearchComponent } from '../gateway-configuration/gatewaysearch/gatewaysearch.component';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';
import { Item } from '../../../../components/gridstack/components/models/item';
import { AuthService } from '../../../auth/auth.service';
import { Config } from '../../../../config/config';
import { ISubscription } from 'rxjs/Subscription';
import { ServiceloaderService } from '../../../../components/loader/serviceloader/serviceloader.service';
@Component({
  selector: 'kl-gateway-configuration',
  templateUrl: './gateway-configuration.component.html',
  styleUrls: ['./gateway-configuration.component.scss']
})
export class GatewayConfigurationComponent implements OnInit {
  // Variable Declarations
  gatewayLists: Array<any> = [];
  public DFMinput: any;
  isSensorMoving: boolean;
  @Input() gatewayInfo: any = [];
  @Input() key: any;
  @Output() dmf = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() siloEdit = new EventEmitter();
  @Output() expandEdit = new EventEmitter();
  @Output() deviceEditFromSilo = new EventEmitter();
  @Output() createGatewayFromModel = new EventEmitter<object>();
  public queryString: String = '';
  searchModelText: any;
  togglesearchbutton: boolean = false;
  allGatewayCount = 0;
  activeGatewayCount = 0;
  inactiveGatewayCount = 0;
  deletedGatewayCount = 0;
  disabledGatewayCount = 0;
  accessLevel: any;
  currentSiteID: any;
  staticModels: any;
  gatewayTagList: any = [];
  tagsDisplay: any = [];
  gatewayModels: any;
  channelProtocolModels: any;
  allModules: any;
  addToLibrayGatewyaData: any;
  libraryName: any = [];
  gatewaySelectionid: any;
  public gatewayModelName: String;
  @ViewChild('close') close: ElementRef;
  @ViewChild('tagclose') tagclose: ElementRef;
  @ViewChild('deviceclose') deviceclose: ElementRef;
  @ViewChild('gatewaySelctionclose') gatewaySelctionclose: ElementRef;
  @ViewChild('gatewaycreationval') gatewaycreationval: ElementRef;
  tagsDropdownSettings: any = [];
  gatewayDropdownSettings: any = [];
  matchedGateways: any = [];
  deviceId: any;
  deviceName: any;
  selectedGatewayInfo: any;
  movingDeviceInfo: any;
  public gatewayChange: String;
  options: any;
  fileUploadlabel: String = 'Import Gateway Models';
  DragDropGatewayLists: any;
  client_id: any;
  SileViewEnable = false;
  // endPointUrl: any;
  depMode: any;
  hideSiloButton: any;
  listForward: any;
  listBackword: any;
  siloForward: any;
  siloBackword: any;
  showListView: any;
  showSiloView: any;
  protocolsJson: any;
  genericData: any;
  protocolData: any;
  // gatewaydata = false;
  protocolValue: any;
  dmfData = false;
  private subscription: ISubscription;
  default: Boolean;
  disableBtn = false;
  accessLevelDevice: any;
  showModel = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  viewDropDownItems: any = [];
  viewDropDownItemChange: any;
  @Output() selectedSensorFilter = new EventEmitter();
  dropDownLable: any;
  filterFromSensor = false;
  filterFromGateway = false;
  holdFilter: String;
  isGatewayRendering: boolean = false;
  gatewayTitle: String;
  deleteGatewayId: string;
  deleteValue: string;
  gatewayNameToDelete: string;
  deleteSensorId: string;
  deleteSensorValue: string;
  sensorNameToDelete: string;
  constructor(
    private appService: AppService,
    private _router: Router,
    public dataService: ChannelConfigurationService,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals,
    private _authservice: AuthService,
    private loader: ServiceloaderService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    // if (this.dataService.holdFilterValueForGateway !== "") {
    //   this.allGateways(this.dataService.holdFilterValueForGateway);
    // }
    this.loader.show();
    this.loadViewLists();
    const localsotoreage = localStorage.getItem('view');
    if (localsotoreage === null) {
      this.SileViewEnable = false;
      const id = 'gateways';
      const name = 'Gateways';
      const icon = 'elm-computers-connecting';
      this.dropDownLable = { name, icon };
      this.viewDropDownChange(id);
    } else {
      if (localsotoreage === 'siloview') {
        this.SileViewEnable = true;
        const id = 'gateways_sensors';
        const name = 'Gateways and Sensors';
        const icon = 'elm-squared-menu';
        this.dropDownLable = { name, icon };
        this.viewDropDownChange(id);
      } else {
        this.SileViewEnable = false;
        const id = 'gateways';
        const name = 'Gateways';
        const icon = 'elm-computers-connecting';
        this.dropDownLable = { name, icon };
        this.viewDropDownChange(id);
      }
    }
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.client_id = this._globals.getCurrentUserClientId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.depMode = this._globals.deploymentMode;
    // this.endPointUrl = this._globals.deploymentModeAPI;
    this.allowAccess('');
    if (this.depMode === 'EL') {
      this.hideSiloButton = false;
    } else {
      this.SileViewEnable = true;
      this.hideSiloButton = true;
    }
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
    this.appService.getCardSettings(dataToSend).subscribe((data) => {
      const gateway = [];
      const isDeleted = 'true';
      if (data.status === 'success') {
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
    if (this.dataService.holdFilterValueForGateway === '') {
      this.filterDeletedGatewaysAndSensors('All');
    }
    this.tagsDropdownSettings = {
      singleSelection: false,
      text: 'Select Tag Value',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered Tags',
      filterUnSelectAllText: 'Un-select the Filtered Tags',
      addNewItemOnFilter: true,
      labelKey: 'name',
      primaryKey: 'description'
    };
    this.gatewayDropdownSettings = {
      singleSelection: true,
      text: 'Select Gateway',
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered Gateway',
      filterUnSelectAllText: 'Un-select the Filtered Gateway',
      labelKey: 'gatewayname',
      primaryKey: 'gateway_instance_id',
      searchBy: ['gatewayname']
    };
    this.listForward = 0;
    this.listBackword = 100;
    this.siloForward = 0;
    this.siloBackword = 10;

    if (this.gatewayInfo.length < 1) {
      this.loader.hide();
    }
    if (this.gatewayInfo.length <= 100) {
      this.showListView = false;
    } else {
      this.showListView = true;
    }
    if (this.gatewayInfo.length <= 10) {
      this.showSiloView = false;
    } else {
      this.showSiloView = true;
    }
    // if (this.dataService.holdFilterValueForGateway !== "") {
    //   this.filterFromSensor = true;
    //   this.allGateways(this.dataService.holdFilterValueForGateway);
    // }

    this.route.queryParams.subscribe((params) => {
      if (Object.keys(params).length === 0) {
        if (this.dataService.holdFilterValueForGateway !== '') {
          this.filterFromSensor = true;
          this.allGateways(this.dataService.holdFilterValueForGateway);
        } else {
          // this.allGateways('All');
        }
      } else {
        if (params['gateway'] !== 'All') {
          this.allGateways(params['gateway']);
        }
      }
    });
  }
  loadViewLists() {
    this.appService.getChannelConfigurationPageHeadings().subscribe((data) => {
      this.viewDropDownItems = data.data;
    });
  }
  stopLoader(value) {
    if (value) {
      this.loader.hide();
      this.isGatewayRendering = false;
    }
  }
  allowAccess(acess: string) {
    const val = this._auth.allowAccessComponent('gateways', '');
    this.accessLevel = val;
    this.callDeviceAccessLevels();
  }
  callDeviceAccessLevels() {
    const val = this._auth.allowAccessComponent('devices', '');
    this.accessLevelDevice = val;
  }
  onGatewayEdit(value) {
    this.gatewayTitle = 'Edit Gateway';
    // this.siloEdit.emit(value);
    this.onEditSilo(value);
  }
  onExapndEdit(value, boolean) {
    this.expandEdit.emit(value);
    if (boolean) {
      this.dataService.onRefreshGatewayInstanceID = 1;
    } else {
      this.dataService.onRefreshGatewayInstanceID = 2;
    }
  }
  onCancel() {
    this.cancel.emit();
  }
  onDeviceEdit(id, gatewayid) {
    this.dataService.devieEditFromSilo = id;
    this.dataService.GateawayInstanceFromSilo = gatewayid;
    this.dataService.ondeviceEditFromSilo = 1;
    this.deviceEditFromSilo.emit(gatewayid);
  }
  // Method to delete/restore a gateway
  onGatewayDelete(id, value) {
    if (value === 'false') {
      value = 'Delete';
    } else {
      value = 'Restore';
    }
    this.appService.deleteGateway(id, value).subscribe((data) => {
      if (data.status === 'success') {
        if (data.isdeleted === 'false') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Gateway Restored Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'success',
            'Success',
            'Gateway Deleted Successfully',
            true
          );
        }
        // this._toastLoad.toast('success', 'Success', data.message, true);
        this.Load();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to disable/enable a gateway
  onGatewayDisableEnable(id, value) {
    if (value === 'false') {
      value = 'Disable';
    } else {
      value = 'Enable';
    }
    this.appService.disableGateway(id, value).subscribe((data) => {
      if (data.status === 'success') {
        if (data.isdisabled === 'false') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Gateway Enabled Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'success',
            'Success',
            'Gateway Disabled Successfully',
            true
          );
        }
        // this._toastLoad.toast('success', 'Success', data.message, true);
        this.Load();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to delete/restore a device
  onDeviceDelete(id, value) {
    if (value === 'false') {
      value = 'Delete';
    } else {
      value = 'Restore';
    }
    this.appService.deleteDevice(id, value).subscribe((data) => {
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
        this.Load();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to disable/enable a device
  onDeviceEnableDisable(id, value) {
    if (value === 'false') {
      value = 'Disable';
    } else {
      value = 'Enable';
    }
    this.appService.disableDevice(id, value).subscribe((data) => {
      if (data.status === 'success') {
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
        // this._toastLoad.toast('success', 'Success', data.message, true);
        this.Load();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to refresh the gateway list
  Load() {
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
    this.appService.getCardSettings(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.gatewayLists = data['nodes'];
        this.gatewayLists['activeGatewayCount'] = 0;
        this.gatewayLists['inactiveGatewayCount'] = 0;
        this.gatewayLists['allGatewayCount'] = 0;
        this.activeGatewayCount = 0;
        this.inactiveGatewayCount = 0;
        this.deletedGatewayCount = 0;
        this.disabledGatewayCount = 0;
        this.gatewayLists['deletedGatewayCount'] = 0;
        this.gatewayLists['disabledGatewayCount'] = 0;
        const dataToSend = {};
        this.appService.getGatewayStatus(dataToSend).subscribe((data) => {
          for (let i = 0; i < data.gatewayLists.length; i++) {
            for (let j = 0; j < this.gatewayLists.length; j++) {
              if (
                data.gatewayLists[i].gatewayID ===
                this.gatewayLists[j].gateway_instance_id
              ) {
                this.gatewayLists[j]['comStatus'] =
                  data.gatewayLists[i].comStatus;
                // gateway status
                if (this.gatewayLists[j].comStatus === 'active') {
                  this.activeGatewayCount++;
                  this.gatewayLists[
                    'activeGatewayCount'
                  ] = this.activeGatewayCount;
                } else {
                  this.inactiveGatewayCount++;
                  this.gatewayLists[
                    'inactiveGatewayCount'
                  ] = this.inactiveGatewayCount;
                }
                this.gatewayLists['allGatewayCount'] =
                  this.activeGatewayCount + this.inactiveGatewayCount;
                if (this.gatewayLists[j].isdeleted === 'true') {
                  this.deletedGatewayCount++;
                  this.gatewayLists[
                    'deletedGatewayCount'
                  ] = this.deletedGatewayCount;
                  this.gatewayLists[j].comStatus = 'delete';
                  this.gatewayLists[j]['deleted'] = 'Restore';
                } else {
                  this.gatewayLists[
                    'deletedGatewayCount'
                  ] = this.deletedGatewayCount;
                  this.gatewayLists[j]['deleted'] = 'Delete';
                }
                if (this.gatewayLists[j].isdisabled === 'true') {
                  if (this.gatewayLists[j].deleted === 'Restore') {
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                  } else {
                    this.disabledGatewayCount++;
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                    this.gatewayLists[j].comStatus = 'disable';
                  }
                  this.gatewayLists[j]['disabled'] = 'Enable';
                } else {
                  if (this.gatewayLists[j].deleted === 'Restore') {
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                  } else {
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                  }
                  this.gatewayLists[j]['disabled'] = 'Disable';
                }
                if (this.gatewayLists[j].deleted === 'Delete') {
                  this.gatewayLists[j]['show'] = true;
                } else {
                  this.gatewayLists[j]['show'] = false;
                }
                let deleteCount = 0;
                let disableCount = 0;
                let activeDeviceCount = 0;
                let inactiveDeviceCount = 0;
                this.gatewayLists[j]['deviceCount'] = 0;
                this.gatewayLists[j]['activeDeviceCount'] = 0;
                this.gatewayLists[j]['inactiveDeviceCount'] = 0;
                for (let k = 0; k < data.gatewayLists[i].devices.length; k++) {
                  for (
                    let l = 0;
                    l < this.gatewayLists[j].devices.length;
                    l++
                  ) {
                    if (
                      data.gatewayLists[i].devices[k].deviceID ===
                      this.gatewayLists[j].devices[l].device_instance_id
                    ) {
                      this.gatewayLists[j].devices[l]['status'] =
                        data.gatewayLists[i].devices[k].status;
                      if (this.gatewayLists[j].devices[l].status === 'active') {
                        activeDeviceCount++;
                        this.gatewayLists[j][
                          'activeDeviceCount'
                        ] = activeDeviceCount;
                      } else {
                        inactiveDeviceCount++;
                        this.gatewayLists[j][
                          'inactiveDeviceCount'
                        ] = inactiveDeviceCount;
                      }
                      this.gatewayLists[j]['deviceCount'] =
                        activeDeviceCount + inactiveDeviceCount;
                      if (
                        this.gatewayLists[j].devices[l].isdeleted === 'true'
                      ) {
                        deleteCount++;
                        this.gatewayLists[j]['deleteCount'] = deleteCount;
                        this.gatewayLists[j].devices[l].status = 'delete';
                        this.gatewayLists[j].devices[l]['deleted'] = 'Restore';
                      } else {
                        this.gatewayLists[j]['deleteCount'] = deleteCount;
                        this.gatewayLists[j].devices[l]['deleted'] = 'Delete';
                      }
                      if (
                        this.gatewayLists[j].devices[l].isdisabled === 'true'
                      ) {
                        if (
                          this.gatewayLists[j].devices[l].deleted === 'Restore'
                        ) {
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        } else {
                          disableCount++;
                          this.gatewayLists[j].devices[l].status = 'disable';
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        }
                        this.gatewayLists[j].devices[l]['disabled'] = 'Enable';
                      } else {
                        if (
                          this.gatewayLists[j].devices[l].deleted === 'Restore'
                        ) {
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        } else {
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        }
                        this.gatewayLists[j].devices[l]['disabled'] = 'Disable';
                      }
                      if (
                        this.gatewayLists[j].devices[l].deleted === 'Delete'
                      ) {
                        this.gatewayLists[j].devices[l]['show'] = true;
                      } else {
                        this.gatewayLists[j].devices[l]['show'] = false;
                      }
                    }
                  }
                  continue;
                }
                if (
                  this.gatewayLists[j]['disableCount'] > 0 ||
                  this.gatewayLists[j]['deleteCount'] > 0
                ) {
                  this.gatewayLists[j]['inactiveDeviceCount'] =
                    this.gatewayLists[j]['inactiveDeviceCount'] -
                    (this.gatewayLists[j]['disableCount'] +
                      this.gatewayLists[j]['deleteCount']);
                  this.gatewayLists[j]['deviceCount'] =
                    this.gatewayLists[j]['deviceCount'] -
                    this.gatewayLists[j]['deleteCount'];
                }
              }
            }
          }
          if (
            this.gatewayLists['disabledGatewayCount'] > 0 ||
            this.gatewayLists['deletedGatewayCount'] > 0
          ) {
            this.gatewayLists['inactiveGatewayCount'] =
              this.gatewayLists['inactiveGatewayCount'] -
              (this.gatewayLists['disabledGatewayCount'] +
                this.gatewayLists['deletedGatewayCount']);
            this.gatewayLists['allGatewayCount'] =
              this.gatewayLists['allGatewayCount'] -
              this.gatewayLists['deletedGatewayCount'];
          }
          this.gatewayInfo = this.gatewayLists;
          for (let i = 0; i < this.gatewayInfo.length; i++) {
            if (this.gatewayInfo[i].deleted === 'Delete') {
              this.gatewayInfo[i]['show'] = true;
            } else {
              this.gatewayInfo[i]['show'] = false;
            }
            for (let j = 0; j < this.gatewayInfo[i].devices.length; j++) {
              if (this.gatewayInfo[i].devices[j].deleted === 'Delete') {
                this.gatewayInfo[i].devices[j]['show'] = true;
              } else {
                this.gatewayInfo[i].devices[j]['show'] = false;
              }
            }
          }
          let allDevicesCount = 0;
          let deletedDevicesCount = 0;
          let disabledDevicesCount = 0;
          let activeDevicesCount = 0;
          let inactiveDevicesCount = 0;
          this.gatewayLists['totalDeviceCount'] = 0;
          this.gatewayLists['totalDeviceActiveCount'] = 0;
          this.gatewayLists['totalDeviceInActiveCount'] = 0;
          this.gatewayLists['totalDeviceDeleteCount'] = 0;
          this.gatewayLists['totalDeviceDisableCount'] = 0;
          for (let m = 0; m < this.gatewayInfo.length; m++) {
            if (this.gatewayInfo[m].deviceCount > 0) {
              allDevicesCount =
                allDevicesCount + this.gatewayInfo[m].deviceCount;
              this.gatewayInfo['totalDeviceCount'] = allDevicesCount;
            } else {
              this.gatewayInfo['totalDeviceCount'] = allDevicesCount;
            }
            if (this.gatewayInfo[m].activeDeviceCount > 0) {
              activeDevicesCount =
                activeDevicesCount + this.gatewayInfo[m].activeDeviceCount;
              this.gatewayInfo['totalDeviceActiveCount'] = activeDevicesCount;
            } else {
              this.gatewayInfo['totalDeviceActiveCount'] = activeDevicesCount;
            }
            if (this.gatewayInfo[m].inactiveDeviceCount > 0) {
              inactiveDevicesCount =
                inactiveDevicesCount + this.gatewayInfo[m].inactiveDeviceCount;
              this.gatewayInfo[
                'totalDeviceInActiveCount'
              ] = inactiveDevicesCount;
            } else {
              this.gatewayInfo[
                'totalDeviceInActiveCount'
              ] = inactiveDevicesCount;
            }
            if (this.gatewayInfo[m].deleteCount > 0) {
              deletedDevicesCount =
                deletedDevicesCount + this.gatewayInfo[m].deleteCount;
              this.gatewayInfo['totalDeviceDeleteCount'] = deletedDevicesCount;
            } else {
              this.gatewayInfo['totalDeviceDeleteCount'] = deletedDevicesCount;
            }
            if (this.gatewayInfo[m].disableCount > 0) {
              disabledDevicesCount =
                disabledDevicesCount + this.gatewayInfo[m].disableCount;
              this.gatewayInfo[
                'totalDeviceDisableCount'
              ] = disabledDevicesCount;
            } else {
              this.gatewayInfo[
                'totalDeviceDisableCount'
              ] = disabledDevicesCount;
            }
          }
          if (
            this.gatewayInfo['totalDeviceDeleteCount'] > 0 ||
            this.gatewayInfo['totalDeviceDisableCount'] > 0
          ) {
            this.gatewayInfo['totalDeviceInActiveCount'] =
              this.gatewayInfo['totalDeviceInActiveCount'] -
              this.gatewayInfo['totalDeviceDeleteCount'];
            this.gatewayInfo['totalDeviceCount'] =
              this.gatewayInfo['totalDeviceCount'] -
              this.gatewayInfo['totalDeviceDeleteCount'];
          }
          return this.gatewayInfo;
        });
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  allDevices(id, value) {
    if (value === 'All') {
      for (let i = 0; i < this.gatewayInfo.length; i++) {
        if (this.gatewayInfo[i].gateway_instance_id === id) {
          for (let j = 0; j < this.gatewayInfo[i].devices.length; j++) {
            if (this.gatewayInfo[i].devices[j].deleted === 'Delete') {
              this.gatewayInfo[i].devices[j]['show'] = true;
            } else {
              this.gatewayInfo[i].devices[j]['show'] = false;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this.gatewayInfo.length; i++) {
        if (this.gatewayInfo[i].gateway_instance_id === id) {
          for (let j = 0; j < this.gatewayInfo[i].devices.length; j++) {
            if (value === 'delete') {
              if (this.gatewayInfo[i].devices[j].isdeleted === 'true') {
                this.gatewayInfo[i].devices[j]['show'] = true;
              } else {
                this.gatewayInfo[i].devices[j]['show'] = false;
              }
            } else if (value === 'disable') {
              if (this.gatewayInfo[i].devices[j].isdisabled === 'true') {
                this.gatewayInfo[i].devices[j]['show'] = true;
              } else {
                this.gatewayInfo[i].devices[j]['show'] = false;
              }
            } else {
              if (this.gatewayInfo[i].devices[j].status === value) {
                this.gatewayInfo[i].devices[j]['show'] = true;
              } else {
                this.gatewayInfo[i].devices[j]['show'] = false;
              }
            }
          }
        }
      }
    }
    return this.gatewayInfo;
  }
  allGateways(value) {
    this.holdFilter = value;
    this.filterFromGateway = true;
    if (value === 'All') {
      for (let i = 0; i < this.gatewayInfo.length; i++) {
        if (this.gatewayInfo[i].deleted === 'Delete') {
          this.gatewayInfo[i]['show'] = true;
        } else {
          this.gatewayInfo[i]['show'] = false;
        }
      }
    } else {
      for (let i = 0; i < this.gatewayInfo.length; i++) {
        if (this.gatewayInfo[i].comStatus === value) {
          this.gatewayInfo[i]['show'] = true;
        } else {
          this.gatewayInfo[i]['show'] = false;
        }
      }
    }
    this.listForward = 0;
    this.listBackword = this.gatewayInfo.length;
    this.siloForward = 0;
    this.siloBackword = this.gatewayInfo.length;
    this.showListView = false;
    this.showSiloView = false;
    this._router.navigate(['configurations/gatewayDevices/gatewaylist'], {
      queryParams: { gateway: this.holdFilter }
    });
    return this.gatewayInfo;
  }
  filterDeletedGatewaysAndSensors(value) {
    if (value === 'All') {
      for (let i = 0; i < this.gatewayInfo.length; i++) {
        if (this.gatewayInfo[i].deleted === 'Delete') {
          this.gatewayInfo[i]['show'] = true;
        } else {
          this.gatewayInfo[i]['show'] = false;
        }
        for (let j = 0; j < this.gatewayInfo[i].devices.length; j++) {
          if (this.gatewayInfo[i].devices[j].deleted === 'Delete') {
            this.gatewayInfo[i].devices[j]['show'] = true;
          } else {
            this.gatewayInfo[i].devices[j]['show'] = false;
          }
        }
      }
    }
  }
  allDevicesInGateway(value) {
    const holdView = localStorage.getItem('view');
    if (holdView === 'listview') {
      this.selectedSensorFilter.emit(value);
    }
    if (value === 'All') {
      for (let i = 0; i < this.gatewayInfo.length; i++) {
        if (this.gatewayInfo[i].deleted === 'Delete') {
          this.gatewayInfo[i]['show'] = true;
        } else {
          this.gatewayInfo[i]['show'] = false;
        }
        for (let j = 0; j < this.gatewayInfo[i].devices.length; j++) {
          if (this.gatewayInfo[i].devices[j].deleted === 'Delete') {
            this.gatewayInfo[i].devices[j]['show'] = true;
          } else {
            this.gatewayInfo[i].devices[j]['show'] = false;
          }
        }
      }
    } else {
      const activeGatewayCount = this.gatewayInfo.activeGatewayCount;
      const allGatewayCount = this.gatewayInfo.allGatewayCount;
      const deletedGatewayCount = this.gatewayInfo.deletedGatewayCount;
      const disabledGatewayCount = this.gatewayInfo.disabledGatewayCount;
      const inactiveGatewayCount = this.gatewayInfo.inactiveGatewayCount;
      const totalDeviceActiveCount = this.gatewayInfo.totalDeviceActiveCount;
      const totalDeviceCount = this.gatewayInfo.totalDeviceCount;
      const totalDeviceDeleteCount = this.gatewayInfo.totalDeviceDeleteCount;
      const totalDeviceDisableCount = this.gatewayInfo.totalDeviceDisableCount;
      const totalDeviceInActiveCount = this.gatewayInfo
        .totalDeviceInActiveCount;
      const array = this.gatewayInfo;
      this.gatewayInfo = array.filter((e) => {
        const selectedServices = e.devices.filter((service) => {
          if (service.status === value) {
            service['show'] = true;
            return true;
          } else {
            service['show'] = false;
            return false;
          }
        });
        if (selectedServices.length) {
          e['show'] = true;
          return true;
        } else {
          e['show'] = false;
          return true;
        }
      });
      this.gatewayInfo['activeGatewayCount'] = activeGatewayCount;
      this.gatewayInfo['allGatewayCount'] = allGatewayCount;
      this.gatewayInfo['deletedGatewayCount'] = deletedGatewayCount;
      this.gatewayInfo['disabledGatewayCount'] = disabledGatewayCount;
      this.gatewayInfo['inactiveGatewayCount'] = inactiveGatewayCount;
      this.gatewayInfo['totalDeviceActiveCount'] = totalDeviceActiveCount;
      this.gatewayInfo['totalDeviceCount'] = totalDeviceCount;
      this.gatewayInfo['totalDeviceDeleteCount'] = totalDeviceDeleteCount;
      this.gatewayInfo['totalDeviceDisableCount'] = totalDeviceDisableCount;
      this.gatewayInfo['totalDeviceInActiveCount'] = totalDeviceInActiveCount;
    }
    this.listForward = 0;
    this.listBackword = this.gatewayInfo.length;
    this.siloForward = 0;
    this.siloBackword = this.gatewayInfo.length;
    this.showListView = false;
    this.showSiloView = false;
    return this.gatewayInfo;
  }
  openModel() {
    this.close.nativeElement.click();
    this.getStaticGatewayTags();
    // this.getStaticGatewayModels();
    this.getGatewayModels();
    this.getChannelProtocols();
    this.searchModelText = '';
  }
  openSensorCreationModel() {
    this.loadAllGateways();
  }
  loadAllGateways() {
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
    this.appService.getCardSettings(dataToSend).subscribe((data) => {
      const gateway = [];
      const isDeleted = 'true';
      if (data.status === 'success') {
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
  getStaticGatewayTags() {
    const excludeArray = [
      {
        id: '',
        name: 'All',
        description: 'All'
      },
      {
        id: '',
        name: 'Protocol',
        description: 'Protocol'
      },
      {
        id: '',
        name: 'Library',
        description: 'Library'
      }
    ];
    this.tagsDisplay = excludeArray;
    return;
    // if (this.currentSiteID === '') {
    //   this._toastLoad.toast('error', 'Error', 'Site ID is Not Exist', true);
    //   const excludeArray = [{
    //     id: '',
    //     name: 'All',
    //     description: 'All',
    //   }, {
    //     id: '',
    //     name: 'Protocol',
    //     description: 'Protocol',
    //   },
    //   {
    //     id: '',
    //     name: 'Library',
    //     description: 'Library',
    //   }];
    //   this.tagsDisplay = excludeArray;
    //   return;
    // } else {
    //   // let dataToSend = '/app/static/gateway_tags_' + this.currentSiteID + '/get';
    //   this.appService.getStaticGatewayTags(this.currentSiteID).subscribe((data) => {
    //     if (data.status === 'success') {
    //       if (data.data.length > 0) {
    //         const tags = [
    //           {
    //             id: '',
    //             name: 'All',
    //             description: 'All',
    //           }, {
    //             id: '',
    //             name: 'Library',
    //             description: 'Library',
    //           }, {
    //             id: '',
    //             name: 'Protocol',
    //             description: 'Protocol',
    //           }
    //           // ,
    //           //  {
    //           //   id: '',
    //           //   name: 'ELMLibrary',
    //           //   description: 'ELMLibrary',
    //           // }
    //         ];

    //         this.tagsDisplay = tags.concat(data.data);
    //         let data1 = data.data;
    //         this.gatewayTagList = [];
    //         let excludeArray = ['all', 'protocol', 'library', 'elmlibrary'];
    //         for (let i = 0; i < data1.length; i++) {
    //           if (!excludeArray.includes(data1[i].name.toString().toLowerCase())) {
    //             this.gatewayTagList.push(data1[i]);
    //           }
    //         }
    //       } else {
    //         const excludeArray = [{
    //           id: '',
    //           name: 'All',
    //           description: 'All',
    //         }, {
    //           id: '',
    //           name: 'Protocol',
    //           description: 'Protocol',
    //         },
    //         {
    //           id: '',
    //           name: 'Library',
    //           description: 'Library',
    //         }];
    //         this.tagsDisplay = excludeArray;
    //       }
    //     }
    //   });
    // }
  }
  getStaticGatewayModels() {
    if (this.depMode === 'EL') {
      if (this.currentSiteID === '') {
        this._toastLoad.toast('error', 'Error', 'Site ID is Not Exist', true);
        return;
      } else {
        this.appService
          .getStaticGatewayModels(this.currentSiteID)
          .subscribe((data) => {
            const gwtags = ['All', 'ElmLibrary'];
            if (data.length > 0) {
              if (data[0].status === 'success') {
                for (let i = 0; i < data[0].data.length; i++) {
                  if (!data[0].data[i].hasOwnProperty('gwtags')) {
                    data[0].data[i]['gwtags'] = [];
                  }
                  for (let j = 0; j < gwtags.length; j++) {
                    if (data[0].data[i].hasOwnProperty('gwtags')) {
                      data[0].data[i]['gwtags'].push(gwtags[j]);
                    }
                  }
                }
                this.staticModels = data[0].data;
                this.getAllModules();
              }
            }
          });
      }
    }
  }
  getGatewayModels() {
    this.appService.getChannelgatewaysModels().subscribe((data) => {
      const gwtags = ['All', 'Library'];
      if (data.status === 'success') {
        for (let i = 0; i < data.nodes.length; i++) {
          if (!data.nodes[i].hasOwnProperty('gwtags')) {
            data.nodes[i]['gwtags'] = [];
          }
          for (let j = 0; j < gwtags.length; j++) {
            if (data.nodes[i].hasOwnProperty('gwtags')) {
              data.nodes[i]['gwtags'].push(gwtags[j]);
            }
          }
        }
        this.gatewayModels = data.nodes;
        this.getAllModules();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  getChannelProtocols() {
    this.appService.getChannelRowProtocols().subscribe((data) => {
      const gwtags = ['All', 'Protocol'];
      if (data.status === 'success') {
        for (let i = 0; i < data.data.length; i++) {
          if (!data.data[i].hasOwnProperty('gwtags')) {
            data.data[i]['gwtags'] = [];
          }
          for (let j = 0; j < gwtags.length; j++) {
            if (data.data[i].hasOwnProperty('gwtags')) {
              data.data[i]['gwtags'].push(gwtags[j]);
            }
          }
        }
        this.channelProtocolModels = data.data;
        this.getAllModules();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  getAllModules() {
    if (
      this.gatewayModels !== undefined &&
      this.channelProtocolModels !== undefined &&
      this.staticModels !== undefined
    ) {
      this.gatewayModels = this.gatewayModels.concat(
        this.channelProtocolModels
      );
      this.allModules = this.gatewayModels.concat(this.staticModels);
    } else {
      if (
        this.gatewayModels !== undefined &&
        this.channelProtocolModels !== undefined
      ) {
        this.allModules = this.gatewayModels.concat(this.channelProtocolModels);
      }
    }
  }
  existsInArray(stringarrayToSearch: any, tagToSearch: String) {
    for (let i = 0; i < stringarrayToSearch.length; i++) {
      if (
        stringarrayToSearch[i].toString().toLowerCase() ===
        tagToSearch.toString().toLowerCase()
      ) {
        return true;
      }
    }
    return false;
  }
  getSelectedGatgewayInfo(gateway) {
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        key: gateway,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        key: gateway
      };
    }
    this.appService
      .getChannelRowGatewaysDataByModel(dataToSend)
      .subscribe((data) => {
        if (data.status === 'success') {
          this.addToLibrayGatewyaData = data.bodyContent;
          this.gatewayModelName = this.addToLibrayGatewyaData.gatewayname;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
    this.getStaticGatewayTags();
  }
  // onAddToLibrary() {
  //   let value;
  //   const gatewayJson = this.addToLibrayGatewyaData;
  //   delete gatewayJson['gateway_instance_id'];
  //   delete gatewayJson['gateway_instance_id'];
  //   delete gatewayJson['assigned_industry'];
  //   delete gatewayJson['baudRate'];
  //   delete gatewayJson['dataBit'];
  //   delete gatewayJson['filter'];
  //   delete gatewayJson['isConfigured'];
  //   delete gatewayJson['parity'];
  //   delete gatewayJson['port'];
  //   delete gatewayJson['site_id'];
  //   delete gatewayJson['stopBit'];
  //   delete gatewayJson['gwtags'];
  //   delete gatewayJson['gateway_id'];
  //   gatewayJson['gatewayname'] = '';
  //   gatewayJson['gateway_model_ref_id'] = '';
  //   gatewayJson['uniqueid'] = '';
  //   if (gatewayJson.hasOwnProperty('host')) {
  //     gatewayJson['host'] = '';
  //   }
  //   if (gatewayJson.hasOwnProperty('timeout')) {
  //     gatewayJson['timeout'] = '';
  //   } if (gatewayJson.hasOwnProperty('port')) {
  //     gatewayJson['port'] = '';
  //   }
  //   if (gatewayJson.hasOwnProperty('assign_ref')) {
  //     gatewayJson['assign_ref'] = [];
  //   }
  //   if (this.gatewayModelName === '') {
  //     this._toastLoad.toast('warning', 'Info', 'Model Name Rerquired', true);
  //     return;
  //   }
  //   if (this.libraryName.length < 1) {
  //     this._toastLoad.toast('warning', 'Info', 'Tag Name Rerquired', true);
  //     return;
  //   }
  //   gatewayJson['gatewaymodelname'] = this.gatewayModelName;
  //   const gwtags = ['All', 'Library'];
  //   const existingTags = this.gatewayTagList;
  //   let newTags = this.libraryName;
  //   const tempArr = newTags.filter(function (item) {
  //     return !existingTags.includes(item);
  //   });
  //   newTags = tempArr;
  //   if (newTags.length > 0) {
  //     for (let t = 0; t < newTags.length; t++) {
  //       if (this.currentSiteID === '') {
  //         this._toastLoad.toast('error', 'Error', 'Site ID is Not Exist', true);
  //         return;
  //       } else {
  //         setTimeout(() => {
  //           // const dataToSend = '/app/static/gateway_tags_' + this.currentSiteID + '/create';
  //           this.appService.createStaticGatewayTags(this.currentSiteID, newTags[t]).subscribe((data) => {
  //             if (data.status === 'success') {
  //               if (t === newTags.length - 1) {
  //                 for (let k = 0; k < this.libraryName.length; k++) {
  //                   // below if condition should be removed once testing is done
  //                   if (this.libraryName[k].name.toLowerCase() === 'all' || this.libraryName[k].name.toLowerCase() === 'library' ||
  //                     this.libraryName[k].name.toLowerCase() === 'protocol' || this.libraryName[k].name.toLowerCase() === 'elmlibrary') {
  //                   } else {
  //                     gwtags.push(this.libraryName[k].name);
  //                   }
  //                 }
  //                 gatewayJson['gwtags'] = gwtags;
  //                 this.appService.createGatewayModel(gatewayJson).subscribe((data) => {
  //                   if (data.status === 'success') {
  //                     this.tagclose.nativeElement.click();
  //                     this._toastLoad.toast('success', 'Success', 'Library Created Successfully', true);
  //                   }
  //                 });
  //               }
  //             }
  //           });
  //         }, 2000);
  //       }
  //     }
  //   } else {
  //     for (let k = 0; k < this.libraryName.length; k++) {
  //       // below if condition should be removed once testing is done
  //       if (this.libraryName[k].name.toLowerCase() === 'all' || this.libraryName[k].name.toLowerCase() === 'library' ||
  //         this.libraryName[k].name.toLowerCase() === 'protocol' || this.libraryName[k].name.toLowerCase() === 'elmlibrary') {
  //       } else {
  //         gwtags.push(this.libraryName[k].name);
  //       }
  //     }
  //     gatewayJson['gwtags'] = gwtags;
  //     this.appService.createGatewayModel(gatewayJson).subscribe((data) => {
  //       if (data.status === 'success') {
  //         this.tagclose.nativeElement.click();
  //         this._toastLoad.toast('success', 'Success', 'Library Created Successfully', true);
  //       }
  //     });
  //   }
  // }
  onCreateGateway(data, protocol) {
    this.gatewayTitle = 'Create Gateway';
    //this.close.nativeElement.click();
    //this.createGatewayFromModel.emit({ data, protocol });
    this.onCreateGatewayFromModel({ data, protocol });
  }
  onCloseModel() {
    this.close.nativeElement.click();
  }
  public onChange(fileList: FileList): void {
    const file = fileList[0];
    this.fileUploadlabel = file.name;
    const fileReader: FileReader = new FileReader();
    let data;
    fileReader.onloadend = (e) => {
      data = fileReader.result;
      const value = JSON.parse(data);
      if (this.currentSiteID === '') {
        this._toastLoad.toast('error', 'Error', 'Site ID is Not Exist', true);
        return;
      } else {
        this.appService
          .StaticDynamicModuleContent(this.currentSiteID, value)
          .subscribe((data) => {
            if (data[0].status === 'success') {
              this._toastLoad.toast(
                'success',
                'Success',
                'File Uploaded Successfully',
                true
              );
              this.getStaticGatewayModels();
            } else {
              this._toastLoad.toast(
                'error',
                'Error',
                'Error in Uploading File....',
                true
              );
            }
          });
      }
    };
    fileReader.readAsText(file);
  }
  onAddItem(data: string) {
    this.libraryName.push({ id: '', name: data, description: data });
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
  }
  selectOption(value) {
    for (let i = 0; i < this.gatewayInfo.length; i++) {
      if (value === this.gatewayInfo[i].gateway_instance_id) {
        this.selectedGatewayInfo = this.gatewayInfo[i];
      }
    }
  }
  // tslint:disable-next-line: function-name
  MoveToGateway() {
    if (this.gatewayChange === undefined || this.gatewayChange === null) {
      this._toastLoad.toast(
        'warning',
        'Info',
        'Select Gateway to Move the Sensor',
        true
      );
      return;
    }
    if (this.deviceId === '') {
      this._toastLoad.toast('warning', 'Info', 'Select Sensor ID', true);
      return;
    }
    if (this.deviceName === '') {
      this._toastLoad.toast('warning', 'Info', 'Select Sensor Name', true);
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
    this.isSensorMoving = true;
    this.appService
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
              this.appService
                .saveDeviceModelConfigurationDataSensorCreate(data)
                .subscribe((data) => {
                  if (data.status === 'success') {
                    this.Load();
                    this.deviceclose.nativeElement.click();
                    this._toastLoad.toast(
                      'success',
                      'Success',
                      'Sensor Moved Successfully',
                      true
                    );
                    this.isSensorMoving = false;
                    this.isGatewayRendering = true;
                  } else {
                    this._toastLoad.toast('error', 'Error', data.message, true);
                  }
                });
            } else {
              const saveData = {
                device_instance_id: this.movingDeviceInfo.device_instance_id,
                general_info: databody.data.general_info.bodyContent,
                deviceConfig: databody.data.deviceConfig,
                device_model_id: ''
              };
              this.appService
                .saveDeviceModelConfigurationData(saveData)
                .subscribe((data) => {
                  if (data.status === 'success') {
                    this.Load();
                    this.deviceclose.nativeElement.click();
                    this._toastLoad.toast(
                      'success',
                      'Success',
                      'Sensor Moved Successfully',
                      true
                    );
                    this.isSensorMoving = false;
                    this.isGatewayRendering = true;
                  } else {
                    this._toastLoad.toast('error', 'Error', data.message, true);
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
            this.appService
              .saveDeviceModelConfigurationData(saveData)
              .subscribe((data) => {
                if (data.status === 'success') {
                  this.Load();
                  this.deviceclose.nativeElement.click();
                  this._toastLoad.toast(
                    'success',
                    'Success',
                    'Sensor Moved Successfully',
                    true
                  );
                  this.isSensorMoving = false;
                  this.isGatewayRendering = true;
                } else {
                  this._toastLoad.toast('error', 'Error', data.message, true);
                }
              });
          }
        } else {
          this._toastLoad.toast('error', 'Error', databody.message, true);
        }
      });
  }
  onAddDevice() {
    // if (this.gatewaySelectionid) {
    //   const gateway_instance_id = this.gatewaySelectionid[0].gateway_instance_id;
    //   this.onExapndEdit(gateway_instance_id, true);
    //   this.gatewaySelctionclose.nativeElement.click();
    // }
    if (this.gatewaySelectionid != null) {
      const gateway_instance_id = this.gatewaySelectionid;
      this.onExapndEdit(gateway_instance_id, true);
      this.gatewaySelctionclose.nativeElement.click();
    } else {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Please select a gateway to continue',
        true
      );
    }
  }
  enableSiloView() {
    const localsotoreage = localStorage.setItem('view', 'siloview');
    if (this.holdFilter === undefined) {
      this.queryString = '';
    }
    this.SileViewEnable = true;
    this.listBackword = 100;
    // if (this.filterFromSensor) {
    //   this.showSiloView = false;
    // } else
    if (this.filterFromGateway) {
      this.listForward = 0;
      this.listBackword = this.gatewayInfo.length;
      this.siloForward = 0;
      this.siloBackword = this.gatewayInfo.length;
      this.showListView = false;
      this.showSiloView = false;
      return this.gatewayInfo;
    } else {
      if (this.gatewayInfo.length <= 10) {
        this.showSiloView = false;
      } else {
        this.showSiloView = true;
      }
    }
    // this.viewDropDownItemChange = 'gateways_sensors';
    const name = 'Gateways and Sensors';
    const icon = 'elm-squared-menu';
    this.dropDownLable = { name, icon };
  }
  enableListView() {
    localStorage.setItem('view', 'listview');
    if (this.holdFilter === undefined) {
      this.queryString = '';
    }
    this.SileViewEnable = false;
    this.siloBackword = 10;
    // if (this.filterFromSensor) {
    //   this.showListView = false;
    // }
    // else
    if (this.filterFromGateway) {
      this.listForward = 0;
      this.listBackword = this.gatewayInfo.length;
      this.siloForward = 0;
      this.siloBackword = this.gatewayInfo.length;
      this.showListView = false;
      this.showSiloView = false;
      return this.gatewayInfo;
    } else {
      if (this.gatewayInfo.length <= 100) {
        this.showListView = false;
      } else {
        this.showListView = true;
      }
    }
    // this.viewDropDownItemChange = 'gateways';
    const name = 'Gateways';
    const icon = 'elm-computers-connecting';
    this.dropDownLable = { name, icon };
  }
  loadMoreSilos() {
    this.siloBackword = this.siloBackword + 10;
    if (this.siloBackword >= this.gatewayInfo.length) {
      // this._toastLoad.toast('info', 'Info', 'All Gateways Are Loaded', true);
      this.showSiloView = false;
    }
  }
  loadMoreLists() {
    this.listBackword = this.listBackword + 100;
    if (this.listBackword >= this.gatewayInfo.length) {
      // this._toastLoad.toast('info', 'Info', 'All Gateways Are Loaded', true);
      this.showListView = false;
    }
  }
  onCreateGatewayFromModel(evnt) {
    if (evnt.protocol[1].toLowerCase() === 'library') {
      this.getGatewayData(evnt.data);
    } else if (evnt.protocol[1].toLowerCase() === 'elmlibrary') {
      // this.getGatewayModelDataContent(evnt.data);
    } else {
      this.getGatewayProtocalSelection(evnt.data);
    }
  }
  // getGatewayModelDataContent(key) {
  //   this.dmfData = false;
  //   let dataToSend;
  //   if (this.depMode === 'EL') {
  //     dataToSend = {
  //       key: key,
  //       filter: [{
  //         site_id: this.currentSiteID,
  //       }],
  //     };
  //   } else {
  //     dataToSend = {
  //       key: key,
  //     };
  //   }
  //   this.appService.getGatewaysDataBYID(dataToSend).subscribe((data) => {
  //     this.protocolsJson = data['data'];
  //     this.appService.getStaticGatewayModels(this.currentSiteID).subscribe((dataContent) => {
  //       if (dataContent === null) {
  //         this._toastLoad.toast('error', 'Error', 'Error in Loading DFM', true);
  //         this.onDFMCancel();
  //       }
  //       if (dataContent[0].data.length > 0) {
  //         let matchedarray = [];
  //         for (let i = 0; i < dataContent[0].data.length; i++) {
  //           if (dataContent[0].data[i].gateway_id === key) {
  //             matchedarray.push(dataContent[0].data[i]);
  //           }
  //         }
  //         this.protocolData = this.protocolsJson['protocol']['dfm_data'][matchedarray[0].protocol]['headerContent'];
  //         this.genericData = this.protocolsJson['protocol']['dfm_data'];
  //         this.genericData.headerContent = this.genericData.headerContent.concat(this.protocolData);
  //         for (let i = 0; i < this.genericData.headerContent.length; i++) {
  //           if (data.bodyContent.hasOwnProperty(this.genericData.headerContent[i]['key'])) {
  //           } else {
  //             if (this.genericData.headerContent[i]['key'] === 'gateway_id') {
  //               continue;
  //             }
  //             if (this.genericData.headerContent[i]['type'] !== 'text') {
  //               data.bodyContent[this.genericData.headerContent[i]['key']] = [];
  //             } else {
  //               data.bodyContent[this.genericData.headerContent[i]['key']] = '';
  //             }
  //           }
  //           if (this.genericData.headerContent[i]['key'] === 'assign_ref') {
  //             this.genericData.headerContent[i]['required'] = true;
  //           }
  //           if (this.genericData.headerContent[i]['key'] === 'gatewayname') {
  //             this.genericData.headerContent[i]['required'] = true;
  //           }
  //         }
  //         // data.bodyContent['protocol'] = matchedarray[0].protocol;
  //         data.bodyContent = matchedarray[0];
  //         this.genericData.bodyContent = data.bodyContent;
  //         this.genericData.userActions = {
  //           save: {
  //             label: 'Create Gateway',
  //           },
  //           cancel: {
  //             label: 'Cancel',
  //           },
  //         };
  //         this.genericData.headerContent = [{
  //           data: this.genericData.headerContent,
  //           layoutType: 'section',
  //           sectionTitle: '',
  //           sectionWidth: '12',
  //         }];
  //         for (let j = 0; j < this.genericData.headerContent[0].data.length; j++) {
  //           this.genericData.headerContent[0].data[j]['hidden'] = true;
  //           if (this.genericData.headerContent[0].data[j].key === 'gatewayname' ||
  //             this.genericData.headerContent[0].data[j].key === 'host' ||
  //             this.genericData.headerContent[0].data[j].key === 'port' ||
  //             this.genericData.headerContent[0].data[j].key === 'assign_ref' ||
  //             this.genericData.headerContent[0].data[j].key === 'uniqueid' ||
  //             this.genericData.headerContent[0].data[j].key === 'status_timeout') {
  //             this.genericData.headerContent[0].data[j].hidden = false;
  //           }
  //         }
  //         this.DFMinput = this.genericData;
  //         this.dmfData = true;
  //       } else {
  //         this._toastLoad.toast('error', 'Error', 'Error in Loading DFM', true);
  //         this.onDFMCancel();
  //       }
  //     });
  //   });
  // }
  // Method to Load the dfm based on protocol selection(To Create gateway)
  getGatewayProtocalSelection(protocol1) {
    this.protocolValue = protocol1;
    this.dmfData = false;
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        filter: [
          {
            site_id: this.currentSiteID
          }
        ],
        protocol: protocol1
      };
    } else {
      dataToSend = {
        protocol: protocol1
      };
    }
    this.appService
      .getChannelRowProtocolsWithDFM(dataToSend)
      .subscribe((data) => {
        if (data.status === 'success') {
          this.protocolsJson = data['data'];
          this.genericData = this.protocolsJson['protocol']['dfm_data'];
          // this.protocolData = this.protocolsJson['protocol']['dfm_data'][
          //   protocol1
          // ]['headerContent'];
          this.genericData.headerContent = this.genericData.headerContent;
          this.genericData.bodyContent = data.bodyContent;
          this.genericData.userActions = {
            save: {
              label: 'Create Gateway'
            },
            cancel: {
              label: 'Cancel'
            }
          };
          this.genericData.headerContent = [
            {
              data: this.protocolsJson['protocol']['dfm_data'].headerContent,
              layoutType: 'section',
              // sectionTitle: 'General Info',
              sectionTitle: '',
              sectionWidth: '12'
            }
            // ,
            // {
            //   data: this.protocolData,
            //   layoutType: 'section',
            //   sectionTitle: 'Protocol Info',
            //   sectionWidth: '12'
            // }
          ];
          this.DFMinput = this.genericData;
          // this.gatewaydata = false;
          this.dmfData = true;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
  }

  // Method to get the Gateway dfm by Gateway_id(To create gateway)
  getGatewayData(key) {
    this.dmfData = false;
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        key: key,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        key: key
      };
    }
    this.appService.getGatewaysDataBYID(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.protocolsJson = data['data'];
        // this.protocolData = this.protocolsJson['protocol']['dfm_data'][
        //   data.bodyContent.protocol
        // ]['headerContent'];
        this.genericData = this.protocolsJson['protocol']['dfm_data'];
        // this.genericData.headerContent = this.genericData.headerContent.concat(
        //   this.protocolData
        // );
        this.genericData.bodyContent = data.bodyContent;
        this.genericData.userActions = {
          save: {
            label: 'Create Gateway'
          },
          cancel: {
            label: 'Cancel'
          }
        };
        this.genericData.headerContent = [
          {
            data: this.genericData.headerContent,
            layoutType: 'section',
            sectionTitle: '',
            sectionWidth: '12'
          }
        ];
        this.DFMinput = this.genericData;
        this.dmfData = true;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to edit gateway
  onEditSilo(value) {
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.dmfData = false;
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        key: value,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        key: value
      };
    }
    this.appService
      .getChannelRowGatewaysDataByModel(dataToSend)
      .subscribe((data) => {
        if (data.status === 'success') {
          this.protocolsJson = data['data'];
          // this.protocolData = this.protocolsJson['protocol']['dfm_data'][
          //   data.bodyContent.protocol
          // ]['headerContent'];
          this.genericData = this.protocolsJson['protocol']['dfm_data'];
          this.genericData.headerContent = this.genericData.headerContent;
          this.genericData.bodyContent = data.bodyContent;
          this.genericData.userActions = {
            save: {
              label: 'Update Gateway'
            },
            cancel: {
              label: 'Cancel'
            }
          };
          this.genericData.headerContent = [
            {
              data: this.protocolsJson['protocol']['dfm_data'].headerContent,
              layoutType: 'section',
              // sectionTitle: 'General Info',
              sectionTitle: '',
              sectionWidth: '12'
            }
            // ,
            // {
            //   data: this.protocolData,
            //   layoutType: 'section',
            //   sectionTitle: 'Protocol Info',
            //   sectionWidth: '12'
            // }
          ];
          this.DFMinput = this.genericData;
          this.dmfData = true;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
  }
  getselectedValues(json) {
    this.disableBtn = true;
    let json1;
    if (this.depMode === 'EL') {
      json1 = {
        isConfigured: true,
        site_id: this.currentSiteID,
        client_id: this.client_id,
        default: this.default
      };
    } else {
      json1 = {
        isConfigured: true,
        default: this.default
      };
    }
    json = Object.assign(json, json1);
    // if (this.protocolValue !== undefined) {
    //   json['protocol'] = this.protocolValue;
    // }
    json['isdeleted'] = 'false';
    json['isdisabled'] = 'false';
    this.subscription = this.appService
      .createGateway(json)
      .subscribe((data) => {
        this.dataService.dataFromService = data;
        if (data.status === 'success') {
          if (data.key) {
            this._toastLoad.toast(
              'success',
              'Success',
              'Gateway Created Successfully',
              true
            );
            this.onDFMCancel();
            this.Load();
          } else {
            this._toastLoad.toast(
              'success',
              'Success',
              'Gateway Updated Successfully',
              true
            );
            this.onDFMCancel();
            this.Load();
          }
          this.allowAccess('');
          this.disableBtn = false;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
          this.disableBtn = false;
        }
      });
  }
  onDFMCancel() {
    this.gatewaycreationval.nativeElement.click();
    this.onCloseModel();
  }
  openGateway(ip) {
    const url = 'http://' + ip;
    window.open(url, 'blank');
  }
  togglesearch() {
    this.togglesearchbutton = !this.togglesearchbutton;
  }
  viewDropDownChange(value) {
    if (value === 'gateways_sensors') {
      this.enableSiloView();
    } else if (value === 'gateways') {
      this.enableListView();
    } else {
      this.expandEdit.emit('gateway_instance_all');
    }
  }
  ngOnDestroy() {
    this.dataService.holdFilterValueForGateway = '';
  }
  onSelectValue(id, name, icon) {
    this.dropDownLable = { name, icon };
    this.viewDropDownChange(id);
  }
  copy(value: string) {
    const selection = document.createElement('textarea');
    selection.value = value;
    document.body.appendChild(selection);
    selection.select();
    document.execCommand('copy');
    document.body.removeChild(selection);
    this._toastLoad.toast('success', 'Copied to clipboard', value, true);
  }
  onKey(value) {
    if (this.filterFromSensor) {
      this.showListView = false;
      this.showSiloView = false;
    } else {
      if (this.queryString === '') {
        if (this.holdFilter === 'All' || this.holdFilter === undefined) {
          if (localStorage.getItem('view') === 'listview') {
            if (this.gatewayInfo.length <= 100) {
              this.showListView = false;
            } else {
              this.listForward = 0;
              this.listBackword = 100;
              this.showListView = true;
            }
          } else {
            if (this.gatewayInfo.length <= 10) {
              this.showSiloView = false;
            } else {
              this.siloForward = 0;
              this.siloBackword = 10;
              this.showSiloView = true;
            }
          }
        } else {
          let activeDeviceCount = 0;
          for (let i = 0; i < this.gatewayInfo.length; i++) {
            if (this.gatewayInfo[i].status === this.holdFilter) {
              activeDeviceCount++;
            }
          }
          if (localStorage.getItem('view') === 'listview') {
            if (activeDeviceCount <= 100) {
              this.showListView = false;
            } else {
              this.listForward = 0;
              this.listBackword = 100;
              this.showListView = true;
            }
          } else {
            if (activeDeviceCount <= 10) {
              this.showSiloView = false;
            } else {
              this.siloForward = 0;
              this.siloBackword = 10;
              this.showSiloView = true;
            }
          }
        }
      } else {
        this.showListView = false;
        this.showSiloView = false;
        this.siloForward = 0;
        this.siloBackword = this.gatewayInfo.length;
        this.listForward = 0;
        this.listBackword = this.gatewayInfo.length;
      }
    }
  }
  getGatewayDeletedValues(id, value, name) {
    this.deleteGatewayId = id;
    this.deleteValue = value;
    this.gatewayNameToDelete = name;
  }
  getSensorValues(id, value, name) {
    this.deleteSensorId = id;
    this.deleteSensorValue = value;
    this.sensorNameToDelete = name;
  }
}
