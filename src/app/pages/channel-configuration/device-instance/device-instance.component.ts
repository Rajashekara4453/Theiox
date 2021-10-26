import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AppService } from '../../../services/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ChannelConfigurationService } from '../../../services/channelconfiguration.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { globals } from '../../../utilities/globals';
import { AuthService } from '../../auth/auth.service';
import { Config } from '../../../config/config';
import { AuthGuard } from '../../auth/auth.guard';
import { ISubscription } from 'rxjs/Subscription';
import { ServiceloaderService } from '../../../components/loader/serviceloader/serviceloader.service';
@Component({
  selector: 'kl-device-instance',
  templateUrl: './device-instance.component.html',
  styleUrls: ['./device-instance.component.scss']
})
export class DeviceInstanceComponent implements OnInit {
  // Variable Declarations
  public sideMenus: any;
  public staticMenus: any;
  togglesearchbutton: boolean = false;
  name = '';
  protocolName = '';
  inudustryID = '';
  devices = false;
  dmf = false;
  deviceModel = true;
  key: String;
  gatewayInformation: any;
  deviceModelInfo: any;
  createDevice: any;
  deviceEditInfo: any;
  device_instance_id: any;
  device_model_text: any;
  gatewayLists: any;
  gatewayInfo: any;
  @Output() siloView = new EventEmitter();
  options: any = [];
  public gatewayChange: any;
  deviceModelIdFromDeviceModel: any;
  deviceModelIdFromPopUpModel: any;
  sideBar = true;
  disableFiled = false;
  currentSiteID: any;
  gatewayIdByUrl: any;
  onGatewaySelectionChange = false;
  deviceTagList: any;
  @ViewChild('close') close: ElementRef;
  fileUploadlabel: String = 'Import Device Models';
  // endPointUrl: any;
  depMode: any;
  hidefileUploadFiled: any;
  sensor_Id = false;
  showorHideGateway = true;
  popUp = false;
  client_id: any;
  default: Boolean;
  accessLevel: any;
  dmfData = false;
  protocolValue: any;
  protocolsJson: any;
  genericData: any;
  protocolData: any;
  private subscription: ISubscription;
  public DFMinput: any;
  disableBtn = false;
  searchVal: any;
  deviecsStatusCount: any;
  filterVal: any;
  showSearchFiled = false;
  totalDevicesInList: any = [];
  public sensorChange: any;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('gatewaycreationval') gatewaycreationval: ElementRef;
  public queryString: String = '';
  editMode = false;
  allGatewayCount = 0;
  activeGatewayCount = 0;
  inactiveGatewayCount = 0;
  deletedGatewayCount = 0;
  disabledGatewayCount = 0;
  hideHeaderSettings = false;
  totalGatewaysInList: any = [];
  public onCreateGatewayChange: any;
  searchGatewayModel: any;
  searchSensorModel: any;
  tagsDisplay: any = [];
  gatewayTagList: any = [];
  staticModels: any;
  gatewayModels: any;
  channelProtocolModels: any;
  allModules: any;
  public gatewaySelectionid: any;
  createsSensorGatewayList: any = [];
  @ViewChild('gatewayclose') gatewayclose: ElementRef;
  @ViewChild('gatewaySelctionclose') gatewaySelctionclose: ElementRef;
  isModelGatewaySelectionChange = false;
  viewDropDownItems: any = [];
  viewDropDownItemChange: any;
  EditGateway = false;
  dropDownLable: any;
  gatewayTitle: String;
  constructor(
    private appservice: AppService,
    private _router: Router,
    private _advanceRoutes: ActivatedRoute,
    public dataService: ChannelConfigurationService,
    public _toastLoad: ToastrService,
    private _globals: globals,
    private _authservice: AuthService,
    public _auth: AuthGuard,
    private loader: ServiceloaderService
  ) {}
  ngOnInit() {
    // this.loader.show();
    this.loadViewLists();
    this.dataService.showModelPopUpFromsensorPage = false;
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.depMode = this._globals.deploymentMode;
    // this.endPointUrl = this._globals.deploymentModeAPI;
    this.client_id = this._globals.getCurrentUserClientId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.allowAccess('');
    if (this.onGatewaySelectionChange) {
      this.gatewayIdByUrl = this.gatewayIdByUrl;
    } else {
      this._advanceRoutes.params.subscribe((params) => {
        this.gatewayIdByUrl = params['id'];
        if (params['id1']) {
          this.sensor_Id = true;
          this.onDeviceClick(params['id1']);
        }
      });
    }

    if (this.depMode === 'EL') {
      this.hidefileUploadFiled = false;
    } else {
      this.hidefileUploadFiled = true;
    }
    this.getGateways();
    this.gatewayChange = this.dataService.dataFromService = this.gatewayIdByUrl;
    if (this.gatewayChange === 'gateway_instance_all') {
      this.EditGateway = false;
      this.gatewaySelectionid = null;
    } else {
      this.EditGateway = true;
      this.gatewaySelectionid = this.gatewayChange;
    }
    if (this.dataService.devieEditFromSilo !== undefined) {
      this.dataService.dataFromService = this.dataService.GateawayInstanceFromSilo;
      this.onDeviceClick(this.dataService.devieEditFromSilo);
    }
    if (
      this.dataService.dataFromService === undefined &&
      this.dataService.devieEditFromSilo === undefined
    ) {
      this.siloView.emit('silo');
      this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
    }
    if (this.dataService.dataFromService !== undefined) {
      if (this.dataService.dataFromService.key) {
        this.dataService.dataFromService = this.dataService.dataFromService.key;
      } else {
        this.dataService.dataFromService;
      }
    }
    if (this.dataService.dataFromService !== undefined) {
      let dataToSend;
      if (this.depMode === 'EL') {
        dataToSend = {
          key: this.dataService.dataFromService,
          filter: [
            {
              site_id: this.currentSiteID
            }
          ]
        };
      } else {
        dataToSend = {
          key: this.dataService.dataFromService
        };
      }
      this.appservice
        .getChannelRowGatewaysDataByModel(dataToSend)
        .subscribe((data) => {
          if (data.status === 'success') {
            this.gatewayInformation = data;
            this.name = this.gatewayInformation.bodyContent.gatewayname;
            this.inudustryID = this.gatewayInformation.bodyContent.assigned_industry;
            this.deviceModelInfo = this.gatewayInformation.bodyContent;
            if (!this.sensor_Id) {
              this.createdDevice(this.deviceModelInfo);
            }
          } else {
            this._toastLoad.toast('error', 'Error', data.message, true);
          }
        });
    }
    this.createDevice = this.dataService.dataFromService;
    if (this.dataService.disableSelectField === false) {
      this.disableFiled = false;
    } else {
      this.disableFiled = true;
    }
    // debugger
    // if (this.dataService.holdFilterValueForSensor != undefined) {
    //   this.allDevices(this.dataService.holdFilterValueForSensor);
    // }

    this._advanceRoutes.queryParams.subscribe((params) => {
      if (Object.keys(params).length === 0) {
      } else {
        this.allDevices(params['sensor']);
      }
    });
    // this.viewDropDownItemChange = 'sensors';
    const id = 'sensors';
    const name = 'Sensors';
    const icon = 'elm-online';
    this.dropDownLable = { name, icon };
  }
  loadViewLists() {
    this.appservice.getChannelConfigurationPageHeadings().subscribe((data) => {
      this.viewDropDownItems = data.data;
    });
  }
  onKey(event: any) {
    // without type info
    this.searchVal = event.target.value;
    //this.dataService.searchSensorsFromParentComponent = true;
  }
  allowAccess(acess: string) {
    const val = this._auth.allowAccessComponent('gateways', '');
    this.accessLevel = val;
    return val;
  }
  // Method to get the gateways list
  getGateways() {
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
    this.appservice.getCardSettings(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        const val = [];
        val.push({
          gatewayname: 'All Sensors',
          gateway_instance_id: 'gateway_instance_all'
        });
        for (let i = 0; i < data['nodes'].length; i++) {
          val.push(data['nodes'][i]);
        }
        this.options = val;
        this.gatewayLists = data.nodes;
        this.ListAllTheGastewayCounts();
        // this.loader.hide();
        this.getDevices();
        this.createsSensorGatewayList = data.nodes;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  ListAllTheGastewayCounts() {
    const dataToSend = {};
    this.appservice.getGatewayStatus(dataToSend).subscribe((data) => {
      this.allGatewayCount = 0;
      this.activeGatewayCount = 0;
      this.inactiveGatewayCount = 0;
      this.deletedGatewayCount = 0;
      this.disabledGatewayCount = 0;
      this.gatewayLists['activeGatewayCount'] = 0;
      this.gatewayLists['inactiveGatewayCount'] = 0;
      this.gatewayLists['allGatewayCount'] = 0;
      this.gatewayLists['deletedGatewayCount'] = 0;
      this.gatewayLists['disabledGatewayCount'] = 0;
      for (let i = 0; i < data.gatewayLists.length; i++) {
        for (let j = 0; j < this.gatewayLists.length; j++) {
          if (
            data.gatewayLists[i].gatewayID ===
            this.gatewayLists[j].gateway_instance_id
          ) {
            this.gatewayLists[j]['comStatus'] = data.gatewayLists[i].comStatus;
            // gateway status
            if (this.gatewayLists[j].comStatus === 'active') {
              this.activeGatewayCount++;
              this.gatewayLists['activeGatewayCount'] = this.activeGatewayCount;
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
    });
  }
  onChangeGateway(gateway) {
    this.loader.show();
    this.queryString = '';
    this.searchVal = '';
    if (!this.showSearchFiled) {
      this.editMode = false;
      if (gateway === 'gateway_instance_all') {
        // this.showorHideGateway = false;
        this.EditGateway = false;
        this.gatewaySelectionid = null;
      } else {
        // this.showorHideGateway = true;
        this.EditGateway = true;
        this.gatewaySelectionid = gateway;
      }
      if (gateway != null) {
        this.onGatewaySelectionChange = true;
        this.dataService.dataFromService = undefined;
        this.gatewayIdByUrl = gateway;
        this._router.navigate([
          'configurations/gatewayDevices/gatewaylist/' + gateway
        ]);
        this.devices = false;
        this.ngOnInit();
      }
    } else {
      //this._router.navigate(['configurations/gatewayDevices/gatewaylist/' + gateway]);
      this.showSearchFiled = true;
      this.editMode = true;
      if (gateway != 'gateway_instance_all') {
        const value = {
          gateway_instance_id: gateway
        };
        this.deviceModelInfo = value;
        this.showorHideGateway = true;
      } else {
        this.showorHideGateway = false;
      }
      this.dataService.devieEditFromSilo = undefined;
      this.getDevices();
    }
  }
  getDeviceData(key) {
    // if (Object.keys(this.deviceModelInfo).length === 0) {
    //   this._toastLoad.toast('info', 'Info', 'Choose Gateway', true);
    // } else {

    this.hideHeaderSettings = true;
    this.LoadGateways();
    this.close.nativeElement.click();
    this.dmf = false;
    this.dataService.editDeviceStatus = 'Create Sensor';
    this.device_model_text = 'Create Sensor';
    this.deviceModelIdFromDeviceModel = key.device_model_id;
    this.deviceModelIdFromPopUpModel = key;
    this.dmf = true;
    this.deviceModel = false;
    this.devices = false;
    // }
  }
  LoadGateways() {
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
    this.appservice.getCardSettings(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        const val = [];
        for (let i = 0; i < data['nodes'].length; i++) {
          val.push(data['nodes'][i]);
        }
        this.totalGatewaysInList = val;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
    this.onCreateGatewayChange = this.gatewayChange;
  }
  onCustomClick() {
    // if (Object.keys(this.deviceModelInfo).length === 0) {
    //   this._toastLoad.toast('info', 'Info', 'Choose Gateway', true);
    // } else {

    this.hideHeaderSettings = true;
    this.LoadGateways();
    this.close.nativeElement.click();
    this.dataService.editDeviceStatus = 'Create Sensor';
    this.device_model_text = 'Create Sensor';
    this.dataService.addCustom = 1;
    this.dmf = true;
    this.deviceModel = false;
    this.devices = false;
    // }
  }
  deviceToSiloView($event) {
    this.siloView.emit('silo');
    this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
  }
  // onSave() {
  //   this.dataService.showPopUP = false;
  //   this.siloView.emit('silo');
  //   this.dataService.showModelPopUpFromsensorPage = true;
  //   this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
  // }
  goToGatewayPage() {
    this.dataService.showPopUP = false;
    this.siloView.emit('silo');
    // this.dataService.showModelPopUpFromsensorPage = false;
    this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
  }
  createdDevice(value) {
    this.showSearchFiled = false;
    this.hideHeaderSettings = false;
    this.sideBar = true;
    this.deviceModel = false;
    this.dmf = false;
    this.disableFiled = false;
    if (this.dataService.ondeviceEditFromSilo === 1 && value === '') {
      this.siloView.emit('silo');
      this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
      this.dataService.ondeviceEditFromSilo = 0;
      this.popUp = true;
    } else {
      this.dataService.dataFromService = undefined;
      if (this.onCreateGatewayChange != null) {
        this.gatewayIdByUrl = this.onCreateGatewayChange;
        this.createDevice = this.gatewayIdByUrl;
        this.gatewayChange = this.gatewayIdByUrl;
        this.onCreateGatewayChange = null;
      }
      if (value === '') {
        this._router.navigate([
          'configurations/gatewayDevices/gatewaylist/' + this.gatewayIdByUrl
        ]);
        this.popUp = true;
        this.dataService.showPopUP = true;
      }
      this.devices = true;
      this.onCancel();
    }
    this.showorHidePopUpLogic();
  }
  showorHidePopUpLogic() {
    if (this.popUp) {
    } else {
      if (
        !this.onGatewaySelectionChange &&
        this.gatewayChange != 'gateway_instance_all'
      ) {
        if (this.dataService.showPopUP) {
          this.dataService.showPopUP = false;
        } else {
          if (this.dataService.onRefreshGatewayInstanceID === 1) {
            if (this.fileInput === undefined) {
            } else {
              this.dataService.onRefreshGatewayInstanceID = 2;
              this.fileInput.nativeElement.click();
              this.showorHideGateway = true;
              this.openModel();
            }
          }
        }
      }
    }
  }
  onCancel() {
    this.devices = true;
    this.deviceModel = false;
    this.getGateways();
  }
  onDeviceSettingClick() {
    this.gatewayTitle = 'Edit Gateway';
    const data = this.deviceModelInfo;
    // this.dataService.gatewayDevice = data.gateway_instance_id;
    this.onEditSilo(data.gateway_instance_id);
    // this.siloView.emit('silo');
    // this._router.navigate(['configurations/gatewayDevices/gatewaylist'])
  }
  onDeviceClick(id) {
    this.sensorChange = id;
    this.showSearchFiled = true;
    this.loader.show();
    this.popUp = true;
    this.dataService.showPopUP = false;
    this.dataService.disableSelectField = true;
    this.disableFiled = true;
    this.dataService.editDeviceStatus = 'Edit Sensor';
    this.device_model_text = 'Edit Sensor';
    this.device_instance_id = id;
    this.deviceModel = false;
    this.devices = false;
    this.dmf = false;
    this.deviceModelIdFromDeviceModel = undefined;
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        device_instance_id: id,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        device_instance_id: id
      };
    }
    this.appservice
      .getDFMDeviceModelBodyContentByID(dataToSend)
      .subscribe((databody) => {
        if (databody.status === 'success') {
          this.deviceEditInfo = databody;
          if (this.sensor_Id) {
          } else {
            if (
              this._router.url ===
              '/configurations/gatewayDevices/gatewaylist/gateway_instance_all'
            ) {
              this._router.navigate([
                '/configurations/gatewayDevices/gatewaylist/' +
                  this.deviceEditInfo.data.general_info.bodyContent
                    .gateway_instance_id +
                  '/' +
                  this.device_instance_id
              ]);
            } else if (
              this._router.url === '/configurations/gatewayDevices/gatewaylist'
            ) {
              this._router.navigate([
                '/configurations/gatewayDevices/gatewaylist/' +
                  this.deviceEditInfo.data.general_info.bodyContent
                    .gateway_instance_id +
                  '/' +
                  this.device_instance_id
              ]);
            } else {
              this._router.navigate([
                this._router.url + '/' + this.device_instance_id
              ]);
            }
          }
          if (this.dataService.devieEditFromSilo !== undefined) {
            this.dataService.gtewayInstanceId =
              databody.data.general_info.bodyContent.gateway_instance_id;
            let dataToSend;
            if (this.depMode === 'EL') {
              dataToSend = {
                key: this.dataService.gtewayInstanceId,
                filter: [
                  {
                    site_id: this.currentSiteID
                  }
                ]
              };
            } else {
              dataToSend = {
                key: this.dataService.gtewayInstanceId
              };
            }
            this.appservice
              .getChannelRowGatewaysDataByModel(dataToSend)
              .subscribe((data) => {
                if (data.status === 'success') {
                  this.gatewayInformation = data;
                  this.name = this.gatewayInformation.bodyContent.gatewayname;
                  this.gatewayChange = this.dataService.gtewayInstanceId;
                } else {
                  this._toastLoad.toast('error', 'Error', data.message, true);
                }
              });
          }
          if (this.dataService.devieEditFromSilo === undefined) {
            if (this.showSearchFiled) {
              const value = {
                gateway_instance_id: this.deviceEditInfo.data.general_info
                  .bodyContent.gateway_instance_id
              };
              this.deviceModelInfo = value;
            }
          }
          this.devices = false;
          this.dmf = true;
          this.loader.hide();
        } else {
          this._toastLoad.toast('error', 'Error', databody.message, true);
        }
      });
  }
  openModel() {
    // if (this.gatewayChange === 'gateway_instance_all') {
    //   this._toastLoad.toast('info', 'Info', 'Please Choose a Gateway', true);
    //   this.showorHideGateway = false;
    // } else
    // {
    // this.showorHideGateway = true;
    this.getStaticDeviceTags();
    this.getStaticDeviceModels();
    this.getDeviceModels();
    // }
  }
  getStaticDeviceTags() {
    const excludeArray = [
      //   {
      //   id: '',
      //   name: 'All',
      //   description: 'All',
      // }, {
      //   id: '',
      //   name: 'ELMLibrary',
      //   description: 'ELMLibrary',
      // },
      {
        id: '',
        name: 'Library',
        description: 'Library'
      }
    ];
    this.deviceTagList = excludeArray;
  }
  getStaticDeviceModels() {
    if (this.depMode === 'EL') {
      if (this.currentSiteID === '') {
        this._toastLoad.toast('error', 'Error', 'Site ID is Not Exist', true);
        return;
      } else {
        this.appservice
          .getStaticDeviceModels(this.currentSiteID)
          .subscribe((data) => {
            const dvtags = ['All', 'ElmLibrary'];
            if (data.length > 0) {
              if (data[0].status === 'success') {
                for (let i = 0; i < data[0].data.length; i++) {
                  data[0].data[i]['dvtags'] = dvtags;
                }
                this.staticMenus = data[0].data;
                this.getAllModules();
              } else {
                this._toastLoad.toast('error', 'Error', data.message, true);
              }
            }
          });
      }
    }
  }
  getDeviceModels() {
    this.appservice.getDeviceModelData().subscribe((data) => {
      const dvtags = ['All', 'Library'];
      if (data.status === 'success') {
        for (let i = 0; i < data.data.length; i++) {
          data.data[i]['dvtags'] = dvtags;
        }
        this.sideMenus = data.data;
        this.getAllModules();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  getAllModules() {
    if (this.sideMenus !== undefined && this.staticMenus !== undefined) {
      this.sideMenus = this.sideMenus.concat(this.staticMenus);
    }
  }
  existsInArray(stringarrayToSearch: any, tagToSearch: String) {
    if (stringarrayToSearch) {
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
    return false;
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
        this.appservice
          .StaticDynamicModuleDeviceContent(this.currentSiteID, value)
          .subscribe((data) => {
            if (data[0].status === 'success') {
              this._toastLoad.toast(
                'success',
                'Success',
                'File Uploaded Successfully',
                true
              );
              this.getStaticDeviceModels();
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

  // Method to edit gateway
  onEditSilo(value) {
    this.loader.show();
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
    this.appservice
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
          this.loader.hide();
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
    this.subscription = this.appservice
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
            this.getGateways();
            // this.Load();
          } else {
            this._toastLoad.toast(
              'success',
              'Success',
              'Gateway Updated Successfully',
              true
            );
            this.onDFMCancel();
            this.getGateways();
            // this.Load();
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
  }
  updateStatus(values) {
    this.deviecsStatusCount = values;
  }
  allDevices(value) {
    // this.dataService.searchSensorsFromParentComponent = false;
    this.filterVal = value;
    this._router.navigate(
      ['configurations/gatewayDevices/gatewaylist/gateway_instance_all'],
      { queryParams: { sensor: this.filterVal } }
    );
  }

  getDevices() {
    if (this.editMode) {
      this.sensorChange = null;
    }
    if (this.showSearchFiled) {
      this.totalDevicesInList = [];
      // if (this.gatewayChange != 'gateway_instance_all') {
      //   this.appservice.getDevices(this.gatewayChange).subscribe((data) => {
      //     let devicesArrray = [];
      //     for (let i = 0; i < data.nodes.length; i++) {
      //       for (let j = 0; j < data.nodes[i].devices.length; j++) {
      //         devicesArrray.push(data.nodes[i].devices[j]);
      //       }
      //     }
      //     this.totalDevicesInList = devicesArrray;
      //     if (this.editMode) {
      //       this.onDeviceClick(this.totalDevicesInList[0].device_instance_id);
      //       this.editMode = false;
      //     }
      //     // this.listTheDevices(data.nodes);
      //   });
      // }
      //  else {
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
      this.appservice.getCardSettings(dataToSend).subscribe((data) => {
        if (data.status === 'success') {
          const devicesArrray = [];
          for (let i = 0; i < data.nodes.length; i++) {
            for (let j = 0; j < data.nodes[i].devices.length; j++) {
              const device = data.nodes[i].devices[j];
              device['gatewayname'] = data.nodes[i].gatewayname;
              device['name'] = device.device_name;
              device.device_name =
                device['gatewayname'] + '/' + device.device_name;
              devicesArrray.push(device);
            }
          }
          this.totalDevicesInList = devicesArrray;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
        // if (this.editMode) {
        //   this.onDeviceClick(this.totalDevicesInList[0].device_instance_id);
        //   this.editMode = false;
        // }
      });
      // }
    }
  }
  onChangeSensor(sensorChange) {
    if (sensorChange != null) {
      this.dataService.devieEditFromSilo = undefined;
      this.onDeviceClick(sensorChange);
    }
  }
  onCreateChangeGateway(gatewayChangeValue) {
    const value = {
      gateway_instance_id: gatewayChangeValue
    };
    this.deviceModelInfo = value;
    this.gatewaySelectionid = gatewayChangeValue;
  }
  clearGatewaySelection() {
    this.EditGateway = false;
  }

  openGatewayModel() {
    this.getStaticGatewayTags();
    // this.getStaticGatewayModels();
    this.getGatewayModels();
    this.getChannelProtocols();
    this.searchGatewayModel = '';
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
    //   this.appservice.getStaticGatewayTags(this.currentSiteID).subscribe((data) => {
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
        this.appservice
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
                this.getAllGatewayModules();
              } else {
                this._toastLoad.toast('error', 'Error', data.message, true);
              }
            }
          });
      }
    }
  }
  getGatewayModels() {
    this.appservice.getChannelgatewaysModels().subscribe((data) => {
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
        this.getAllGatewayModules();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  getChannelProtocols() {
    this.appservice.getChannelRowProtocols().subscribe((data) => {
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
        this.getAllGatewayModules();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  getAllGatewayModules() {
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
  existsInGatewayArray(stringarrayToSearch: any, tagToSearch: String) {
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
  onCreateGateway(data, protocol) {
    this.gatewayclose.nativeElement.click();
    //this.close.nativeElement.click();
    //this.createGatewayFromModel.emit({ data, protocol });
    this.onCreateGatewayFromModel({ data, protocol });
  }
  onCreateGatewayFromModel(evnt) {
    this.gatewayTitle = 'Create Gateway';
    if (evnt.protocol[1].toLowerCase() === 'library') {
      this.getGatewayData(evnt.data);
    } else if (evnt.protocol[1].toLowerCase() === 'elmlibrary') {
      // this.getGatewayModelDataContent(evnt.data);
    } else {
      this.getGatewayProtocalSelection(evnt.data);
    }
  }
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
    this.appservice.getGatewaysDataBYID(dataToSend).subscribe((data) => {
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
  //   this.appservice.getGatewaysDataBYID(dataToSend).subscribe((data) => {
  //     this.protocolsJson = data['data'];
  //     this.appservice.getStaticGatewayModels(this.currentSiteID).subscribe((dataContent) => {
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
    this.appservice
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
          this.dmfData = true;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
  }
  onAddDevice() {
    if (
      this.gatewaySelectionid != null ||
      this.gatewaySelectionid != undefined
    ) {
      const gateway_instance_id = this.gatewaySelectionid;
      if (this.isModelGatewaySelectionChange) {
        this.onChangeGateway(gateway_instance_id);
      } else {
        this.gatewayChange = gateway_instance_id;
      }
      this.gatewaySelctionclose.nativeElement.click();
      this.fileInput.nativeElement.click();
      this.showorHideGateway = true;
      this.openModel();
      this.isModelGatewaySelectionChange = false;
    } else {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Please select a gateway to continue',
        true
      );
    }
  }
  onChangeGatewaySelectionId(value) {
    this.isModelGatewaySelectionChange = true;
    this.gatewayChange = value;
    if (this.gatewayChange === null) {
      this.clearGatewaySelection();
    } else {
      const value = {
        gateway_instance_id: this.gatewayChange
      };
      this.deviceModelInfo = value;
      this.EditGateway = true;
    }
  }
  togglesearch() {
    this.togglesearchbutton = !this.togglesearchbutton;
  }
  viewDropDownChange(value) {
    if (value === 'gateways_sensors') {
      localStorage.setItem('view', 'siloview');
      this.goToGatewayPage();
    } else if (value === 'gateways') {
      localStorage.setItem('view', 'listview');
      this.goToGatewayPage();
    } else {
      // this.expandEdit.emit('gateway_instance_all');
    }
  }
  applyFilter(value) {
    this.dataService.showPopUP = false;
    this.siloView.emit('silo');
    this.dataService.showModelPopUpFromsensorPage = false;
    this.dataService.holdFilterValueForGateway = value;
    // this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
    this._router.navigate(['configurations/gatewayDevices/gatewaylist'], {
      queryParams: { gateway: value }
    });
  }
  onSelectValue(id, name, icon) {
    this.dropDownLable = { name, icon };
    this.viewDropDownChange(id);
  }
  ngOnDestroy() {
    this.dataService.holdFilterValueForSensor = undefined;
    this.dataService.devieEditFromSilo = undefined;
  }
  refreshSensors() {
    this.getDevices();
  }
  clearSearchText() {
    this.searchSensorModel = '';
  }
}
