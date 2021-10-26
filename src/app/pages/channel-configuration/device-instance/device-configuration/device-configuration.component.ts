import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ChannelConfigurationService } from '../../../../services/channelconfiguration.service';
import { Router } from '@angular/router';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';
import { ServiceloaderService } from '../../../../components/loader/serviceloader/serviceloader.service';

@Component({
  selector: 'kl-device-configuration',
  templateUrl: './device-configuration.component.html',
  styleUrls: ['./device-configuration.component.scss']
})
export class DeviceConfigurationComponent implements OnInit {
  // Variable Declarations
  isBlockExpanded = true;
  public loadingDeviceModel: Boolean = false;
  public step_number: Number = 1;
  public pageLoaded: Boolean = false;
  public currentDeviceModel: Object = {};
  public deviceGroup_config: Object = {};
  public generalInfoData: any = {};
  public DFMinput: Object = {};
  public DFMinput1: Object = {};
  public eachBlockData: any[] = [];
  @Output() createDevice = new EventEmitter();
  @Output() deviceConfigToSilo = new EventEmitter();
  @Input() deviceInfo: any;
  @Input() deviceEdit: any;
  @Input() deviceInstanceId: any;
  @Input() deviceModelIdFromDeviceModel: any;
  @Input() deviceModelIdFromPopUpModel: any;
  @Output() refershSensors = new EventEmitter();
  protocolsJson: any;
  genericData: any;
  protocolData: any;
  deviceConfig: any;
  dmfmodelLoading = false;
  modbusProtocol = false;
  onShow = true;
  public protocolValue: any;
  public checkbox_config: any;
  virtual_device_id: any;
  isExistVirtualID = false;
  checkBoxSelection = false;
  theCheckboxValue = false;
  disableBtn = false;
  disableVirtulBtn = false;
  currentSiteID: any;
  @ViewChild('close') close: ElementRef;
  showVirtualDeviceTopSelection = false;
  deviceName: any;
  client_id: any;
  deviceSelection: any;
  public options: any;
  isSensorEditMode = false;
  isSave = false;
  protocolSelectedValue: any;
  public eachBlockDataTemplete: Object = {};
  public wizardSettings: Object[] = [
    {
      stepnumber: 1,
      label: 'General Info',
      active: true
    },
    {
      stepnumber: 2,
      label: 'Configuration',
      active: false
    }
  ];
  public registerDetails: any = {
    isAutoRecognitionDetailsrequired: false,
    modebusFc: null,
    startingAddress: '',
    registers: '',
    registersAddress: '',
    datatype: null,
    mFactor: 'multiplication_factor_115',
    mFactorValue: '1',
    value: ''
  };
  public tagsData: any;
  // public eachBlockDataTemplete: Object = {
  //   blockNumber: '',
  //   modBusFc: null,
  //   startAddress: '',
  //   noOfRegister: '',
  //   device_instance_id: null,
  //   tagsData: [
  //     {
  //       data_Type: null,
  //       reg_Address: '',
  //       tag_id: null,
  //       mFactor: 'multiplication_factor_115',
  //       mFactorValue: '1',
  //       device_instance_id: null,
  //       aggregationRules: [
  //         {
  //           name: 'Raw',
  //           frequency: 'Real Time',
  //           isSelected: true
  //         },
  //         {
  //           name: 'Delta Sum',
  //           frequency: []
  //         },
  //         {
  //           name: 'Min',
  //           frequency: []
  //         },
  //         {
  //           name: 'Max',
  //           frequency: []
  //         },
  //         {
  //           name: 'Average',
  //           frequency: []
  //         },
  //         {
  //           name: 'Count',
  //           frequency: []
  //         }
  //       ]
  //     }
  //   ]
  // };
  public tagObj: any;
  public tableindex: any;
  accessLevel: any;
  isProtocolCategory = false;
  items: any = [];
  public protocolCategoryType: String;
  backnetProtocol = false;
  snmpProtocol = false;
  // endPointUrl: any;
  depMode: any;
  constructor(
    private appservice: AppService,
    public dataService: ChannelConfigurationService,
    private _router: Router,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals,
    private loader: ServiceloaderService
  ) {}
  ngOnInit() {
    this.loader.show();
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    // this.endPointUrl = this._globals.deploymentModeAPI;
    this.allowAccess('');
    this.checkbox_config = {
      hasMultipleVirtuaDevice: false,
      device_instance_id: this.protocolValue,
      validation: true
    };
    if (this.dataService.addCustom === 1) {
      this.deviceModelIdFromDeviceModel = undefined;
      this.dataService.editDeviceStatus = '';
    }
    const value = this.deviceModelIdFromDeviceModel;
    if (
      value !== undefined &&
      this.deviceModelIdFromPopUpModel.dvtags[1].toLowerCase() === 'library'
    ) {
      this.getDeviceModelById(value);
    } else if (
      value !== undefined &&
      this.deviceModelIdFromPopUpModel.dvtags[1].toLowerCase() === 'elmlibrary'
    ) {
      // this.getDeviceModelByELmLibraryId(value);
    } else {
      this.getDeviceMenus();
    }
    this.getVirualDevices();
  }
  allowAccess(acess: string) {
    const val = this._auth.allowAccessComponent('devices', '');
    this.accessLevel = val;
    return val;
  }
  // Method to get the device Model dfm by Id on selecting device model
  getDeviceModelById(id) {
    //for site id
    this.loader.show();
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        device_model_id: id,
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {
        device_model_id: id
      };
    }
    this.loadingDeviceModel = false;
    this.deviceInstanceId = undefined;
    this.appservice.getDFMDeviceModelBodyByID(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.deviceConfig = data.data.deviceConfig;
        this.deviceGroup_config = data.data.deviceGroup_config;
        this.protocolsJson = data.data.general_info;
        this.genericData = this.protocolsJson;
        data.data.general_info.userActions = {
          save: {
            label: 'Save & Proceed'
          },
          cancel: {
            label: 'Cancel'
          }
        };
        this.genericData['headerContent'] =
          data.data.general_info.headerContent;
        this.DFMinput = this.genericData;
        this.deviceGroup_config = data.data['deviceGroup_config'];
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
            this.options = this.deviceGroup_config['name'] = data['data'];
            this.loadingDeviceModel = true;
          } else {
            this._toastLoad.toast('error', 'Error', data.message, true);
          }
        });
        this.registerDetails = data.data['registerDetails'];
        this.eachBlockData = this.getDeviceConfigFromDeviceModel(
          data.data['deviceConfig']
        );
        this.generalInfoData = this.DFMinput['bodyContent'];
        this.deviceModelIdFromDeviceModel = undefined;
        // this.loader.hide();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  hideLoader() {
    this.loader.hide();
  }
  // getDeviceModelByELmLibraryId(id) {
  //   //for site id
  //   this.loader.show();
  //   let dataToSend;
  //   if (this.depMode === 'EL') {
  //     dataToSend = {
  //       device_model_id: '',
  //       filter: [{
  //         site_id: this.currentSiteID,
  //       }],
  //     };
  //   } else {
  //     dataToSend = {
  //       device_model_id: '',
  //     };
  //   }
  //   this.loadingDeviceModel = false;
  //   this.deviceInstanceId = undefined;
  //   this.appservice.getDFMDeviceModelBodyByID(dataToSend).subscribe((data) => {
  //     this.deviceConfig = data.data.deviceConfig;
  //     this.deviceGroup_config = data.data.deviceGroup_config;
  //     this.protocolsJson = data.data.general_info;
  //     this.genericData = this.protocolsJson;
  //     const send = '/app2/data_content/device_models_' + this.currentSiteID + '/read';
  //     this.appservice.getStaticDeviceModels(send).subscribe((dataContent) => {
  //       if (dataContent === null) {
  //         this._toastLoad.toast('error', 'Error', 'Error in Loading DFM', true);
  //         this.onCancel();
  //       }
  //       if (dataContent[0].data.length > 0) {
  //         let matchedarray = [];
  //         for (let i = 0; i < dataContent[0].data.length; i++) {
  //           if (dataContent[0].data[i].device_model_id === id) {
  //             matchedarray.push(dataContent[0].data[i]);
  //           }
  //         }
  //         for (let i = 0; i < data.data.general_info.headerContent[0].data.length; i++) {
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'device_name') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = true;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'assign_ref') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             this.protocolsJson.bodyContent[data.data.general_info.headerContent[0].data[i]['key']] = [];
  //             data.data.general_info.headerContent[0].data[i]['required'] = true;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'belongs_ref') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             this.protocolsJson.bodyContent[data.data.general_info.headerContent[0].data[i]['key']] = [];
  //             data.data.general_info.headerContent[0].data[i]['required'] = false;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'device_com_id') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = true;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'device_model_ref_id') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = true;
  //             data.data.general_info.headerContent[0].data[i]['required'] = false;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'device_model_name') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = false;
  //             data.data.general_info.headerContent[0].data[i]['disabled'] = true;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'devicetype') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = false;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'protocolcategory') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = true;
  //             data.data.general_info.headerContent[0].data[i]['required'] = false;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'make') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = false;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'modelnumber') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = false;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'timeout') {
  //             data.data.general_info.headerContent[0].data[i]['type'] = 'number';
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = true;
  //           }
  //           if (data.data.general_info.headerContent[0].data[i]['key'] === 'deviceselection') {
  //             data.data.general_info.headerContent[0].data[i]['hidden'] = false;
  //             data.data.general_info.headerContent[0].data[i]['required'] = true;
  //             if (this.depMode === 'KL') {
  //               data.data.general_info.headerContent[0].data[i]['options'] = [
  //                 {
  //                   label: 'Multiple',
  //                   value: 'multiple',
  //                 },
  //               ];
  //             }
  //           }

  //         }
  //         data.data.general_info.bodyContent = matchedarray[0];
  //         data.data.general_info.userActions = {
  //           save: {
  //             label: 'Save & Proceed',
  //           },
  //           cancel: {
  //             label: 'Cancel',
  //           },
  //         };
  //         this.genericData['headerContent'] = data.data.general_info.headerContent;
  //         this.DFMinput = this.genericData;
  //         this.deviceGroup_config = data.data['deviceGroup_config'];
  //         let dataToSend;
  //         if (this.depMode === 'EL') {
  //           dataToSend = {
  //             filter: [{
  //               site_id: this.currentSiteID,
  //             }],
  //           };
  //         } else {
  //           dataToSend = {

  //           };
  //         }
  //         this.appservice.getVirtualLists(dataToSend).subscribe((data) => {
  //           this.options =
  //             this.deviceGroup_config['name'] = data['data'];
  //           this.loadingDeviceModel = true;
  //         });
  //         this.generalInfoData = this.DFMinput['bodyContent'];
  //         this.deviceModelIdFromDeviceModel = undefined;
  //       } else {
  //         this._toastLoad.toast('error', 'Error', 'Error in Loading DFM', true);
  //         this.onCancel();
  //       }
  //       // this.loader.hide();
  //     });
  //   });
  // }
  setDisplayValue(value) {
    if (value === true) {
      this.onShow = false;
      this.checkBoxSelection = true;
      this.protocolValue = undefined;
    } else {
      this.onShow = true;
      this.checkBoxSelection = false;
      let deviceInstanceIdMatch;
      let breaktheLoop;
      for (let i = 0; i < this.eachBlockData.length; i++) {
        if (breaktheLoop === 'break') {
          break;
        }
        for (let j = 0; j < this.eachBlockData[i].tagsData.length; j++) {
          deviceInstanceIdMatch = this.eachBlockData[i].tagsData[0]
            .device_instance_id;
          if (deviceInstanceIdMatch === undefined) {
            deviceInstanceIdMatch = this.eachBlockData[i].tagsData[j]
              .device_instance_id;
          }
          if (
            this.eachBlockData[i].tagsData[j].device_instance_id ===
            deviceInstanceIdMatch
          ) {
            this.protocolValue = this.eachBlockData[i].tagsData[
              j
            ].device_instance_id;
          } else {
            this.protocolValue = undefined;
            breaktheLoop = 'break';
            break;
          }
        }
      }
    }
    this.checkbox_config = {
      hasMultipleVirtuaDevice: value,
      device_instance_id: this.protocolValue,
      validation: true
    };
  }
  // Method to list virtual devices
  getVirualDevices() {
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
        this.options = data['data'];
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to Load the virtual device Dfm
  openModel() {
    this.dmfmodelLoading = false;
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
        this.DFMinput1 = data.data.general_info;
        this.dmfmodelLoading = true;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  onChangeDevice(value) {
    this.checkBoxSelection = false;
    this.virtual_device_id = value;
  }
  // Method to edit virtual device dfm
  editVirtualDevice() {
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    if (this.protocolValue == null) {
      this._toastLoad.toast(
        'warning',
        'Validation',
        'Please Select Sensor to edit',
        true
      );
      this.dmfmodelLoading = false;
      this.close.nativeElement.click();
    } else {
      this.virtual_device_id = this.protocolValue;
      this.dmfmodelLoading = false;
      let dataToSend;
      if (this.depMode === 'EL') {
        dataToSend = {
          device_instance_id: this.protocolValue,
          filter: [
            {
              site_id: this.currentSiteID
            }
          ]
        };
      } else {
        dataToSend = {
          device_instance_id: this.protocolValue
        };
      }
      this.appservice
        .getVirtualDFMDeviceBodyContentByID(dataToSend)
        .subscribe((databody) => {
          this.isExistVirtualID = true;
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
            this.DFMinput1 = this.deviceEdit.data.general_info;
            this.dmfmodelLoading = true;
          } else {
            this._toastLoad.toast('error', 'Error', databody.message, true);
          }
        });
    }
  }
  // Method to create/update virtual device
  getselectedModelValues(json) {
    this.disableVirtulBtn = true;
    json['isdisabled'] = 'false';
    json['isdeleted'] = 'false';
    let saveData;
    if (this.isExistVirtualID) {
      saveData = {
        general_info: json,
        device_instance_id: this.virtual_device_id,
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
        if (this.isExistVirtualID) {
          this.isExistVirtualID = false;
          this._toastLoad.toast(
            'success',
            'Success',
            'Updated Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'success',
            'Success',
            'Created Successfully',
            true
          );
        }
        this.getVirualDevices();
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
          this.deviceGroup_config['name'] = data['data'];
        });
        this.openModel();
        this.onModelCancel();
        this.disableVirtulBtn = false;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.disableVirtulBtn = false;
      }
      this.disableVirtulBtn = false;
    });
  }
  onModelCancel() {
    this.isExistVirtualID = false;
    this.close.nativeElement.click();
  }
  getDeviceMenus() {
    this.deviceModelIdFromDeviceModel = undefined;
    this.pageLoaded = false;
    this.getDeviceModelData({ device_model_id: '' });
  }
  getDeviceModelData(deviceModelData) {
    this.loader.show();
    this.loadingDeviceModel = false;
    this.currentDeviceModel = deviceModelData;
    if (this.deviceEdit !== undefined) {
      if (this.accessLevel.edit) {
        this.accessLevel.create = true;
      } else {
        this.accessLevel.create = false;
      }
    } else {
      this.allowAccess('');
    }
    if (
      this.deviceEdit !== undefined &&
      this.dataService.addCustom === undefined
    ) {
      this.isProtocolCategory = false;
      this.deviceEdit.data.general_info.userActions = {
        save: {
          label: 'Save & Proceed'
        },
        cancel: {
          label: 'Cancel'
        }
      };
      this.DFMinput = this.deviceEdit.data.general_info;
      this.deviceGroup_config = this.deviceEdit.data['deviceGroup_config'];
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
          this.options = this.deviceGroup_config['name'] = data['data'];
          this.loadingDeviceModel = true;
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
      this.registerDetails = this.deviceEdit.data['registerDetails'];
      this.eachBlockData = this.getDeviceConfigFromDeviceModel(
        this.deviceEdit.data['deviceConfig']
      );
      this.generalInfoData = this.DFMinput['bodyContent'];
      // this.loader.hide();
    } else {
      this.loader.hide();
      this.getProtocolCategory();
      this.loadingDeviceModel = false;
    }
  }
  getDeviceConfigFromDeviceModel(data: Array<any>): Array<any> {
    let arrDeviceConfig: Array<any> = [];
    arrDeviceConfig = data;
    for (let i = 0; i < arrDeviceConfig.length; i++) {
      for (let j = 0; j < arrDeviceConfig[i].tagsData.length; j++) {
        for (
          let k = 0;
          k < arrDeviceConfig[i].tagsData[j].aggregationRules.length;
          k++
        ) {
          if (
            arrDeviceConfig[i].tagsData[j].aggregationRules[k].hasOwnProperty(
              'isSelected'
            ) &&
            arrDeviceConfig[i].tagsData[j].aggregationRules[k].isSelected &&
            arrDeviceConfig[i].tagsData[j].aggregationRules[k]['name'] !== 'Raw'
          ) {
            for (
              let l = 0;
              l <
              arrDeviceConfig[i].tagsData[j].aggregationRules[k].frequency
                .length;
              l++
            ) {
              const value =
                arrDeviceConfig[i].tagsData[j].aggregationRules[k].frequency[l];
              if (
                value === 'daily' ||
                value === 'monthly' ||
                value === 'yearly'
              ) {
                arrDeviceConfig[i].tagsData[j].aggregationRules[
                  k
                ].frequency.splice(l, 1);
                l = -1;
              }
            }
          }
        }
      }
    }
    return arrDeviceConfig;
  }
  addDeviceModel(event) {
    this.resetFunction();
  }
  getstepnumber(step) {
    this.step_number = step.stepnumber;
  }
  stepprevious() {
    this.step_number = 1;
    this.DFMinput['bodyContent'] = this.generalInfoData;
  }
  getGeneralInfo(generalInfo) {
    this.isSave = false;
    if (generalInfo.deviceselection === 'single') {
      this.deviceName = generalInfo.device_name;
      this.deviceSelection = generalInfo.deviceselection;
      this.showVirtualDeviceTopSelection = false;
      this.checkbox_config = {
        hasMultipleVirtuaDevice: false,
        device_instance_id: this.protocolValue,
        validation: true
      };
    } else {
      this.showVirtualDeviceTopSelection = true;
      this.deviceSelection = generalInfo.deviceselection;
      this.checkbox_config = {
        hasMultipleVirtuaDevice: true,
        device_instance_id: undefined,
        validation: true
      };
      this.protocolValue = undefined;
      this.theCheckboxValue = true;
    }
    this.generalInfoData = generalInfo;
    if (this.generalInfoData.protocolcategory === 'protocol_category_103') {
      this.modbusProtocol = true;
    } else if (
      this.generalInfoData.protocolcategory === 'protocol_category_105'
    ) {
      this.backnetProtocol = true;
    } else if (
      this.generalInfoData.protocolcategory === 'protocol_category_107'
    ) {
      this.snmpProtocol = true;
    } else {
    }
    this.step_number = 2;
    this.allowAccess('');
    if (this.dataService.editDeviceStatus === 'Edit Sensor') {
      this.isSensorEditMode = true;
    }
  }
  addTag(blockIndex) {
    const objFortag = {
      data_Type: null,
      reg_Address: '',
      tag_id: null,
      mFactor: 'multiplication_factor_115',
      mFactorValue: '1',
      aggregationRules: [
        {
          name: 'Raw',
          frequency: 'Real Time',
          isSelected: true
        },
        {
          name: 'Delta Sum',
          frequency: []
        },
        {
          name: 'Min',
          frequency: []
        },
        {
          name: 'Max',
          frequency: []
        },
        {
          name: 'Average',
          frequency: []
        },
        {
          name: 'Count',
          frequency: []
        }
      ]
    };
    this.eachBlockData[blockIndex].tagsData.unshift(objFortag);
  }
  deleteTag(blockIndex, tagIndex) {
    this.eachBlockData[blockIndex].tagsData.splice(tagIndex, 1);
    if (this.eachBlockData[blockIndex].tagsData.length === 0) {
      this.addTag(blockIndex);
    }
  }
  deleteBlock(blockIndex) {
    this.eachBlockData.splice(blockIndex, 1);
    if (this.eachBlockData.length === 0) {
      this.addBlocks();
    }
  }
  cloneTag(blockIndex, tagData: any) {
    tagData = JSON.parse(JSON.stringify(tagData));
    tagData['tag_id'] = null;
    tagData['reg_Address'] = '';
    this.eachBlockData[blockIndex].tagsData.splice(0, 0, tagData);
  }
  addBlocks() {
    this.eachBlockData.unshift(
      JSON.parse(JSON.stringify(this.eachBlockDataTemplete))
    );
  }
  toggleTable(i) {
    if (i === this.tableindex) {
      this.tableindex = -1;
    } else {
      this.tableindex = i;
    }
  }
  resetFunction() {
    this.step_number = 1;
    this.currentDeviceModel = {
      device_model_id: ''
    };
    this.registerDetails = {
      isAutoRecognitionDetailsrequired: false,
      modebusFc: null,
      startingAddress: '',
      registers: '',
      registersAddress: '',
      datatype: null,
      mFactor: 'multiplication_factor_115',
      mFactorValue: '1',
      value: ''
    };
    this.deviceGroup_config = {};
    this.generalInfoData = {};
    this.DFMinput = {};
    this.eachBlockData = [];
    this.getDeviceModelData({ device_model_id: '' });
    this.allowAccess('');
  }
  // Method to create/update devices
  saveDeviceConfig() {
    if (this.isSave) {
      this.createDevice.emit('');
    } else {
      if (this.deviceSelection === 'multiple') {
        this.disableBtn = true;
        if (!this.validateAllField()) {
          let device_com_id;
          if (this.deviceInfo !== undefined) {
            device_com_id = {
              gateway_instance_id: this.deviceInfo.gateway_instance_id
            };
          } else {
            device_com_id = {
              gateway_instance_id: this.dataService.gtewayInstanceId
            };
          }
          this.generalInfoData = Object.assign(
            this.generalInfoData,
            device_com_id
          );
          this.generalInfoData['isdeleted'] = 'false';
          this.generalInfoData['isdisabled'] = 'false';
          const saveData = {
            device_instance_id: this.deviceInstanceId,
            general_info: this.generalInfoData,
            deviceConfig: this.getDeviceConfigToSave(),
            device_model_id: this.currentDeviceModel['device_model_id'],
            site_id: this.generalInfoData.assign_ref[0].parent_id
          };
          this.appservice
            .saveDeviceModelConfigurationData(saveData)
            .subscribe((data) => {
              if (data.status === 'success') {
                this.deviceModelIdFromDeviceModel = undefined;
                if (this.dataService.editDeviceStatus === 'Edit Sensor') {
                  this._toastLoad.toast(
                    'success',
                    'Success',
                    'Sensor Updated Successfully',
                    true
                  );
                  this.deviceInstanceId = undefined;
                  this.dataService.editDeviceStatus = '';
                  this.dataService.gtewayInstanceId = undefined;
                } else {
                  this.deviceEdit = undefined;
                  this._toastLoad.toast(
                    'success',
                    'Success',
                    'Sensor Created Successfully',
                    true
                  );
                }
                if (this.deviceInfo === undefined) {
                  this.deviceConfigToSilo.emit('silo');
                } else {
                  this.resetFunction();
                }
                // this.createDevice.emit(data.status);
                this.createDevice.emit('');
              } else if (data.status === 'failed') {
                this._toastLoad.toast('error', 'Error', data.message, true);
              } else {
                this._toastLoad.toast(
                  'warning',
                  'Validation',
                  'Please Enter the required fields',
                  true
                );
              }
              this.disableBtn = false;
            });
        } else {
          this._toastLoad.toast(
            'warning',
            'Validation',
            'Please Enter the required fields',
            true
          );
          this.disableBtn = false;
        }
      } else {
        this.disableBtn = true;
        if (!this.validateAllField()) {
          let device_com_id;
          if (this.deviceInfo !== undefined) {
            device_com_id = {
              gateway_instance_id: this.deviceInfo.gateway_instance_id
            };
          } else {
            device_com_id = {
              gateway_instance_id: this.dataService.gtewayInstanceId
            };
          }
          this.generalInfoData = Object.assign(
            this.generalInfoData,
            device_com_id
          );
          this.generalInfoData['isdeleted'] = 'false';
          this.generalInfoData['isdisabled'] = 'false';
          const value = this.getDeviceConfigToSave();
          let device_instance_value;
          if (value[0].tagsData[0].hasOwnProperty('device_instance_id')) {
            for (let k = 0; k < value[0].tagsData.length; k++) {
              if (
                value[0].tagsData[k].hasOwnProperty('device_instance_id') &&
                value[0].tagsData[k].device_instance_id !== null
              ) {
                device_instance_value = value[0].tagsData[k].device_instance_id;
              } else {
                device_instance_value = '';
              }
            }
          } else {
            device_instance_value = '';
          }
          const data = {
            client_id: this.client_id,
            device_instance_id: device_instance_value,
            site_id: this.generalInfoData.assign_ref[0].parent_id,
            virtual_device: {
              device_instance_id: device_instance_value,
              general_info: {
                device_model_ref_id: '',
                device_model_name: '',
                device_name: this.deviceName,
                devicetype: [],
                protocolcategory: [],
                make: '',
                modelnumber: '',
                assign_ref: this.generalInfoData.assign_ref,
                belongs_ref: this.generalInfoData.belongs_ref,
                device_com_id: '',
                timeout: '',
                deviceselection: [],
                isdisabled: 'false',
                isdeleted: 'false'
              }
            },
            sensor_device: {
              device_instance_id: this.deviceInstanceId,
              general_info: this.generalInfoData,
              deviceConfig: this.getDeviceConfigToSave(),
              device_model_id: this.currentDeviceModel['device_model_id']
            }
          };
          this.appservice
            .saveDeviceModelConfigurationDataSensorCreate(data)
            .subscribe((data) => {
              if (data.status === 'success') {
                this.deviceModelIdFromDeviceModel = undefined;
                if (this.dataService.editDeviceStatus === 'Edit Sensor') {
                  this._toastLoad.toast(
                    'success',
                    'Success',
                    'Sensor Updated Successfully',
                    true
                  );
                  this.deviceInstanceId = undefined;
                  this.dataService.editDeviceStatus = '';
                  this.dataService.gtewayInstanceId = undefined;
                } else {
                  this.deviceEdit = undefined;
                  this._toastLoad.toast(
                    'success',
                    'Success',
                    'Sensor Created Successfully',
                    true
                  );
                }
                if (this.deviceInfo === undefined) {
                  this.deviceConfigToSilo.emit('silo');
                } else {
                  this.resetFunction();
                }
                // this.createDevice.emit(data.status);
                this.createDevice.emit('');
              } else if (data.status === 'failed') {
                this._toastLoad.toast('error', 'Error', data.message, true);
              } else {
                this._toastLoad.toast(
                  'warning',
                  'Validation',
                  'Please Enter the required fields',
                  true
                );
              }
              this.disableBtn = false;
            });
        } else {
          this._toastLoad.toast(
            'warning',
            'Validation',
            'Please Enter the required fields',
            true
          );
          this.disableBtn = false;
        }
      }
    }
  }
  validateAllField(): boolean {
    let isValid = false;
    this.eachBlockData.forEach((element) => {
      Object.keys(element).forEach((key) => {
        if (key !== 'tagsData') {
          if (key === 'device_instance_id') {
          } else {
            isValid =
              element[key] !== '' && element[key] !== null && !isValid
                ? false
                : true;
          }
        } else {
          element[key].forEach((tag) => {
            Object.keys(tag).forEach((tagKey) => {
              if (tagKey !== 'aggregationRules') {
                if (this.deviceSelection === 'single') {
                  if (tagKey === 'device_instance_id') {
                  } else {
                    isValid =
                      tag[tagKey] !== '' && tag[tagKey] !== null && !isValid
                        ? false
                        : true;
                  }
                } else {
                  isValid =
                    tag[tagKey] !== '' && tag[tagKey] !== null && !isValid
                      ? false
                      : true;
                }
              }
            });
          });
        }
      });
    });
    return isValid;
  }
  toggleExpandCollepseImg() {
    this.isBlockExpanded = !this.isBlockExpanded;
  }
  getDeviceConfigToSave(): Array<any> {
    let arrBlockData: Array<any> = [];
    arrBlockData = this.eachBlockData;
    for (let i = 0; i < arrBlockData.length; i++) {
      for (let j = 0; j < arrBlockData[i].tagsData.length; j++) {
        for (
          let k = 0;
          k < arrBlockData[i].tagsData[j].aggregationRules.length;
          k++
        ) {
          if (
            this.checkBoxSelection &&
            arrBlockData[i].hasOwnProperty('device_instance_id')
          ) {
            // arrBlockData[i].tagsData[j]['device_instance_id'] = arrBlockData[i].device_instance_id;
            if (arrBlockData[i].device_instance_id !== null) {
              arrBlockData[i].tagsData[j]['device_instance_id'] =
                arrBlockData[i].device_instance_id;
            }
          } else {
            if (this.protocolValue !== undefined) {
              arrBlockData[i].tagsData[j][
                'device_instance_id'
              ] = this.protocolValue;
            }
          }
          if (
            arrBlockData[i].tagsData[j].aggregationRules[k].hasOwnProperty(
              'isSelected'
            ) &&
            arrBlockData[i].tagsData[j].aggregationRules[k].isSelected &&
            arrBlockData[i].tagsData[j].aggregationRules[k]['name'] !== 'Raw'
          ) {
            arrBlockData[i].tagsData[j].aggregationRules[k].frequency.splice(
              0,
              0,
              'daily',
              'monthly',
              'yearly'
            );
          }
        }
      }
    }
    return arrBlockData;
  }
  getExponentialForm(val: any) {
    return Number(val).toExponential();
  }
  toggleTagExpandCollepseImg(BlockIndex: number) {
    this.eachBlockData[BlockIndex].isTagExpanded = !this.eachBlockData[
      BlockIndex
    ].isTagExpanded;
  }
  onCancel() {
    this.loader.show();
    this.dataService.addCustom = undefined;
    this.isProtocolCategory = false;
    this.modbusProtocol = false;
    this.backnetProtocol = false;
    this.snmpProtocol = false;
    this.createDevice.emit('');
  }
  saveEditDeviceConfig() {
    this.isSave = true;
    if (this.deviceSelection === 'multiple') {
      this.disableBtn = true;
      if (!this.validateAllField()) {
        let device_com_id;
        if (this.deviceInfo !== undefined) {
          device_com_id = {
            gateway_instance_id: this.deviceInfo.gateway_instance_id
          };
        } else {
          device_com_id = {
            gateway_instance_id: this.dataService.gtewayInstanceId
          };
        }
        this.generalInfoData = Object.assign(
          this.generalInfoData,
          device_com_id
        );
        this.generalInfoData['isdeleted'] = 'false';
        this.generalInfoData['isdisabled'] = 'false';
        const saveData = {
          device_instance_id: this.deviceInstanceId,
          general_info: this.generalInfoData,
          deviceConfig: this.getDeviceConfigToSave(),
          device_model_id: this.currentDeviceModel['device_model_id'],
          site_id: this.generalInfoData.assign_ref[0].parent_id
        };
        this.appservice
          .saveDeviceModelConfigurationData(saveData)
          .subscribe((data) => {
            if (data.status === 'success') {
              this.deviceModelIdFromDeviceModel = undefined;
              if (this.dataService.editDeviceStatus === 'Edit Sensor') {
                this._toastLoad.toast(
                  'success',
                  'Success',
                  'Sensor Updated Successfully',
                  true
                );
                // this.deviceInstanceId = undefined;
                this.dataService.editDeviceStatus = '';
                this.dataService.gtewayInstanceId = undefined;
              } else {
                this.deviceEdit = undefined;
                this._toastLoad.toast(
                  'success',
                  'Success',
                  'Sensor Created Successfully',
                  true
                );
              }
              this.refershSensors.emit('');
            } else if (data.status === 'failed') {
              this._toastLoad.toast('error', 'Error', data.message, true);
            } else {
              this._toastLoad.toast(
                'warning',
                'Validation',
                'Please Enter the required fields',
                true
              );
            }
            this.disableBtn = false;
          });
      } else {
        this._toastLoad.toast(
          'warning',
          'Validation',
          'Please Enter the required fields',
          true
        );
        this.disableBtn = false;
      }
    } else {
      this.disableBtn = true;
      if (!this.validateAllField()) {
        let device_com_id;
        if (this.deviceInfo !== undefined) {
          device_com_id = {
            gateway_instance_id: this.deviceInfo.gateway_instance_id
          };
        } else {
          device_com_id = {
            gateway_instance_id: this.dataService.gtewayInstanceId
          };
        }
        this.generalInfoData = Object.assign(
          this.generalInfoData,
          device_com_id
        );
        this.generalInfoData['isdeleted'] = 'false';
        this.generalInfoData['isdisabled'] = 'false';
        const value = this.getDeviceConfigToSave();
        let device_instance_value;
        if (value[0].tagsData[0].hasOwnProperty('device_instance_id')) {
          for (let k = 0; k < value[0].tagsData.length; k++) {
            if (
              value[0].tagsData[k].hasOwnProperty('device_instance_id') &&
              value[0].tagsData[k].device_instance_id !== null
            ) {
              device_instance_value = value[0].tagsData[k].device_instance_id;
            } else {
              device_instance_value = '';
            }
          }
        } else {
          device_instance_value = '';
        }
        const data = {
          client_id: this.client_id,
          device_instance_id: device_instance_value,
          site_id: this.generalInfoData.assign_ref[0].parent_id,
          virtual_device: {
            device_instance_id: device_instance_value,
            general_info: {
              device_model_ref_id: '',
              device_model_name: '',
              device_name: this.deviceName,
              devicetype: [],
              protocolcategory: [],
              make: '',
              modelnumber: '',
              assign_ref: this.generalInfoData.assign_ref,
              belongs_ref: this.generalInfoData.belongs_ref,
              device_com_id: '',
              timeout: '',
              deviceselection: [],
              isdisabled: 'false',
              isdeleted: 'false'
            }
          },
          sensor_device: {
            device_instance_id: this.deviceInstanceId,
            general_info: this.generalInfoData,
            deviceConfig: this.getDeviceConfigToSave(),
            device_model_id: this.currentDeviceModel['device_model_id']
          }
        };
        this.appservice
          .saveDeviceModelConfigurationDataSensorCreate(data)
          .subscribe((data) => {
            if (data.status === 'success') {
              this.deviceModelIdFromDeviceModel = undefined;
              if (this.dataService.editDeviceStatus === 'Edit Sensor') {
                this._toastLoad.toast(
                  'success',
                  'Success',
                  'Sensor Updated Successfully',
                  true
                );
                // this.deviceInstanceId = undefined;
                this.dataService.editDeviceStatus = '';
                this.dataService.gtewayInstanceId = undefined;
              } else {
                this.deviceEdit = undefined;
                this._toastLoad.toast(
                  'success',
                  'Success',
                  'Sensor Created Successfully',
                  true
                );
              }
              this.refershSensors.emit('');
            } else if (data.status === 'failed') {
              this._toastLoad.toast('error', 'Error', data.message, true);
            } else {
              this._toastLoad.toast(
                'warning',
                'Validation',
                'Please Enter the required fields',
                true
              );
            }
            this.disableBtn = false;
          });
      } else {
        this._toastLoad.toast(
          'warning',
          'Validation',
          'Please Enter the required fields',
          true
        );
        this.disableBtn = false;
      }
    }
  }
  getProtocolCategory() {
    this.isProtocolCategory = false;
    this.loader.show();
    this.appservice.getProtocolCategory().subscribe((data) => {
      if (data.status === 'success') {
        this.items = data['data'];
        this.isProtocolCategory = true;
        this.loader.hide();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.loader.hide();
      }
    });
  }
  OnChangeProtocolCategory(value) {
    this.loader.show();
    this.protocolSelectedValue = value;
    this.loadingDeviceModel = false;
    this.isProtocolCategory = false;
    this.step_number === 1;
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
    let deviceModelData = {
      protocolcategory: value,
      device_model_id: ''
    };
    deviceModelData = Object.assign(deviceModelData, dataToSend);
    this.appservice
      .getDeviceModelConfigurationList(deviceModelData)
      .subscribe((data) => {
        this.deviceInstanceId = undefined;
        this.protocolsJson = data.data.general_info;
        if (data.status === 'success') {
          data.data.general_info.userActions = {
            save: {
              label: 'Save & Proceed'
            },
            cancel: {
              label: 'Cancel'
            }
          };
          this.DFMinput = data.data.general_info;
          if (this.protocolSelectedValue === 'protocol_category_103') {
            this.eachBlockDataTemplete = {
              blockNumber: '',
              modBusFc: null,
              startAddress: '',
              noOfRegister: '',
              tagsData: [
                {
                  data_Type: null,
                  reg_Address: '',
                  tag_id: null,
                  mFactor: 'multiplication_factor_115',
                  mFactorValue: '1',
                  aggregationRules: [
                    {
                      name: 'Raw',
                      frequency: 'Real Time',
                      isSelected: true
                    },
                    {
                      name: 'Delta Sum',
                      frequency: []
                    },
                    {
                      name: 'Min',
                      frequency: []
                    },
                    {
                      name: 'Max',
                      frequency: []
                    },
                    {
                      name: 'Average',
                      frequency: []
                    },
                    {
                      name: 'Count',
                      frequency: []
                    }
                  ]
                }
              ]
            };
            this.eachBlockData.unshift(
              JSON.parse(JSON.stringify(this.eachBlockDataTemplete))
            );
          } else if (this.protocolSelectedValue === 'protocol_category_105') {
            this.eachBlockDataTemplete = {
              blockNumber: '',
              modBusFc: null,
              tagsData: [
                {
                  data_Type: null,
                  reg_Address: '',
                  tag_id: null,
                  mFactor: 'multiplication_factor_115',
                  mFactorValue: '1',
                  aggregationRules: [
                    {
                      name: 'Raw',
                      frequency: 'Real Time',
                      isSelected: true
                    },
                    {
                      name: 'Delta Sum',
                      frequency: []
                    },
                    {
                      name: 'Min',
                      frequency: []
                    },
                    {
                      name: 'Max',
                      frequency: []
                    },
                    {
                      name: 'Average',
                      frequency: []
                    },
                    {
                      name: 'Count',
                      frequency: []
                    }
                  ]
                }
              ]
            };
            this.eachBlockData.unshift(
              JSON.parse(JSON.stringify(this.eachBlockDataTemplete))
            );
          } else if (this.protocolSelectedValue === 'protocol_category_107') {
            this.eachBlockDataTemplete = {
              blockNumber: '',
              startAddress: '',
              tagsData: [
                {
                  data_Type: null,
                  reg_Address: '',
                  tag_id: null,
                  mFactor: 'multiplication_factor_115',
                  mFactorValue: '1',
                  aggregationRules: [
                    {
                      name: 'Raw',
                      frequency: 'Real Time',
                      isSelected: true
                    },
                    {
                      name: 'Delta Sum',
                      frequency: []
                    },
                    {
                      name: 'Min',
                      frequency: []
                    },
                    {
                      name: 'Max',
                      frequency: []
                    },
                    {
                      name: 'Average',
                      frequency: []
                    },
                    {
                      name: 'Count',
                      frequency: []
                    }
                  ]
                }
              ]
            };
            this.eachBlockData.unshift(
              JSON.parse(JSON.stringify(this.eachBlockDataTemplete))
            );
          } else {
          }
          this.deviceGroup_config = data.data['deviceGroup_config'];
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
              this.options = this.deviceGroup_config['name'] = data['data'];
              this.loadingDeviceModel = true;
            } else {
              this._toastLoad.toast('error', 'Error', data.message, true);
            }
          });
          this.dataService.addCustom = undefined;
          this.loader.hide();
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
          this.loader.show();
        }
      });
  }
}
