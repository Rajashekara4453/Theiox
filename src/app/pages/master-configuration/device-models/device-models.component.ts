import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { Router } from '@angular/router';
import { ServiceloaderService } from '../../../components/loader/serviceloader/serviceloader.service';

@Component({
  selector: 'kl-device-models',
  templateUrl: './device-models.component.html',
  styleUrls: ['./device-models.component.scss']
})
export class DeviceModelsComponent implements OnInit {
  // Variable Declarations
  public loadingDeviceModel: Boolean = false;
  public sideMenus: Object = {};
  public step_number: Number = 1;
  public pageLoaded: Boolean = false;
  public currentDeviceModel: Object = {};
  public deviceGroup_config: Object = {};
  public generalInfoData: any = {};
  public DFMinput: Object = {};
  public eachBlockData: any[] = [];
  public checkbox_config: any;
  accessLevel: any;
  disableBtn = false;
  title: String = 'Create  Sensor Model';
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
  public aggregationRules: Object[] = [
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
  ];
  public tagObj: any;
  public tableindex: any;
  protocolCategory = false;
  options: any = [];
  public protocolCategoryType: String;
  modbusProtocol = false;
  backnetProtocol = false;
  snmpProtocol = false;
  protocolSelectedValue: any;
  constructor(
    private appservice: AppService,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _router: Router,
    private loader: ServiceloaderService
  ) {}
  ngOnInit() {
    this.allowAccessComponent('');
    this.getDeviceMenus();
    this.getProtocolCategory();
    this.checkbox_config = {
      hasMultipleVirtuaDevice: false,
      device_instance_id: undefined,
      validation: false
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
      this._router.navigate(['/un-authorized']);
      return false;
    }
  }
  /**
   * Side Bar Data in Device models
   */
  getDeviceMenus() {
    this.pageLoaded = false;
    const DataToSend = {
      page_name: 'device_models'
    };
    this.appservice.getDeviceModelsList(DataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.sideMenus['menuheading'] = 'Device Model Configuration';
        this.sideMenus['placeholder'] = 'Search Device models';
        this.sideMenus['buttonlabel'] = 'Create  New Device model';
        this.sideMenus['data'] = data.data;
        this.pageLoaded = true;
        // this.getDeviceModelData({ device_model_id: '' });
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  /**
   * Load Device model
   */
  getDeviceModelData(deviceModelData) {
    this.loader.show();
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.protocolCategoryType = '';
    this.protocolCategory = false;
    this.step_number = 1;
    this.loadingDeviceModel = false;
    this.currentDeviceModel = deviceModelData;
    this.title = 'Edit ' + deviceModelData.name;
    this.appservice.getDeviceModelList(deviceModelData).subscribe((data) => {
      if (data.status === 'success') {
        this.DFMinput = data.data['general_info'];
        this.deviceGroup_config = data.data['deviceGroup_config'];
        this.registerDetails = data.data['registerDetails'];
        this.eachBlockData = this.getDeviceConfigFromDeviceModel(
          data.data['deviceConfig']
        );
        this.generalInfoData = this.DFMinput['bodyContent'];
        this.loadingDeviceModel = true;
        this.loader.hide();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.loader.hide();
      }
    });
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
  /**
   * Add Device Model will Load the Page
   */
  addDeviceModel(event) {
    this.getLabels();
    this.protocolCategoryType = null;
    this.protocolCategory = true;
    this.loadingDeviceModel = false;
    this.modbusProtocol = false;
    this.backnetProtocol = false;
    this.snmpProtocol = false;
    this.getDeviceMenus();
    this.resetFunction();
  }
  // Stepper Functions
  /**
   * Clicked on stepper Index
   * @param step Wizard Stepper
   */
  getstepnumber(step) {
    this.step_number = step.stepnumber;
  }
  stepprevious() {
    this.step_number = 1;
    this.DFMinput['bodyContent'] = this.generalInfoData;
  }
  getGeneralInfo(general_info) {
    this.generalInfoData = general_info;
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
  }
  // Add Tag

  /**
   * On Clicking of Add tag
   * @param blockIndex Block Index that tag needs to add
   */

  /**
   * add a Block to the Table
   */

  toggleTable(i) {
    if (i === this.tableindex) {
      this.tableindex = -1;
    } else {
      this.tableindex = i;
    }
  }
  resetFunction() {
    this.allowAccessComponent('');
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
    // this.onCancel();
    // this.getDeviceModelData({ device_model_id: '' });
  }
  renderPageAfterSavingPage() {
    this.allowAccessComponent('');
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
    // this.DFMinput = {};
    this.eachBlockData = [];
    this.getDeviceMenus();
    this.addDeviceModel(event);
  }
  // Method to create/edit device model
  saveDeviceConfig() {
    this.disableBtn = true;
    if (!this.validateAllField()) {
      const saveData = {
        general_info: this.generalInfoData,
        registerDetails: this.registerDetails,
        deviceConfig: this.getDeviceConfigToSave(),
        device_model_id: this.currentDeviceModel['device_model_id']
      };
      this.appservice.saveDeviceModelData(saveData).subscribe((data) => {
        if (data.status === 'success') {
          this.title = 'Create Sensor Model';
          this._toastLoad.toast(
            'success',
            'Success',
            this.currentDeviceModel['device_model_id'] === ''
              ? 'Created Successfully'
              : ' Device Model Updated Successfully',
            true
          );
          this.renderPageAfterSavingPage();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            this.currentDeviceModel['device_model_id'] === ''
              ? 'Creation Failed'
              : 'Updation Failed',
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
                if (tagKey === 'device_instance_id') {
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
  onCancel() {
    this.addDeviceModel(event);
  }
  getProtocolCategory() {
    this.protocolCategory = false;
    this.appservice.getProtocolCategory().subscribe((data) => {
      if (data.status === 'success') {
        this.options = data['data'];
        this.protocolCategory = true;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  OnChangeProtocolCategory(value) {
    this.loader.show();
    this.eachBlockData = [];
    this.protocolSelectedValue = value;
    this.protocolCategoryType = '';
    this.protocolCategory = false;
    this.currentDeviceModel = {
      device_model_id: ''
    };
    const device = {
      protocolcategory: value,
      device_model_id: ''
    };
    this.appservice.getDeviceModelList(device).subscribe((data) => {
      if (data.status === 'success') {
        this.DFMinput = data.data['general_info'];
        if (this.protocolSelectedValue === 'protocol_category_103') {
          this.eachBlockData.unshift({
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
          });
        } else if (this.protocolSelectedValue === 'protocol_category_105') {
          this.eachBlockData.unshift({
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
          });
        } else if (this.protocolSelectedValue === 'protocol_category_107') {
          this.eachBlockData.unshift({
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
          });
        } else {
        }
        this.deviceGroup_config = data.data['deviceGroup_config'];
        this.loadingDeviceModel = true;
        this.loader.hide();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.loader.hide();
      }
    });
  }
}
