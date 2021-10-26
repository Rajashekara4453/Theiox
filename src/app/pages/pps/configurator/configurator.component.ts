import { Component, OnInit } from '@angular/core';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { PpsService } from '../pps.service';

@Component({
  selector: 'kl-configurator',
  templateUrl: './configurator.component.html',
  styleUrls: ['./configurator.component.scss']
})
export class ConfiguratorComponent implements OnInit {
  meterDropdownSettings = {};
  meters: Array<any> = [];
  selectedMeters: Array<any> = [];
  tabs: Array<any> = [];
  customerInfo: any;
  eachBlockMeterInfo: any;
  holdEachMeterBlock: any;
  isCustomerServiceBusy: boolean;
  isPageLoading: boolean;
  isMeterServiceBusy: boolean;
  disableCustomerSave: boolean;
  disableReadWrite: boolean;
  activeMeterBlock;
  currentActiveMeterID = "";
  holdCustomerDFM: any;
  ready: boolean;

  constructor(private ppsService: PpsService, private _toasterService: ToastrService) { }

  ngOnInit() {
    this.initCustomerDropdownSettings();
    this.getMeterList('onLand');
  }

  initCustomerDropdownSettings() {
    this.meterDropdownSettings = {
      primaryKey: 'sensor_id',
      labelKey: 'sensor_name',
      lazyLoading: true,
      text: "Select Assets",
      badgeShowLimit: 2,
      enableCheckAll: false,
      enableSearchFilter: true,
      enableFilterSelectAll: false,
      classes: "myclass custom-class"
    };
  }

  getMeterList(from?) {

    this.isPageLoading = true;

    this.ppsService.getMeterList({}).subscribe((res) => {
      if (res['status'] === 'success') {
        this.meters = res['sensor_list'];
        this.tabs = res['tab_list'];
        this.activeMeterBlock = this.tabs[1]['value'];
        // if (from && from !== 'delete')
        //   this.getCustomerInfoDFM("", this.tabs[0]['value']);
      }
      if (res['status'] === 'failed') {
        this._toasterService.toast('error', res.status, res.message, true);
      }
      this.isPageLoading = false;
    },
      (error) => {
        this.isPageLoading = false;
      });
  }

  getCustomerInfoDFM(id, blockType) {

    let reqPayload = {
      sensor_id: this.selectedMeters,
      block_type: blockType
    };
    this.isCustomerServiceBusy = true;

    // if (this.selectedMeters.length === 0) {
    //   reqPayload.sensor_id = "";
    // }
    // if (this.selectedMeters.length === 1) {
    //   reqPayload.sensor_id = this.selectedMeters;
    // }

    this.ppsService.getBlockContent(reqPayload).subscribe((res) => {

      if (res['status'] === 'success') {
        this.customerInfo = res['data'];
        this.holdCustomerDFM = res['data'];
        this.ready = true;
      }
      if (res['status'] === 'failed') {
        this._toasterService.toast('error', res.status, res.message, true);
      }
      this.isCustomerServiceBusy = false;
    },
      (error) => {
        this.isCustomerServiceBusy = false;
      });
  }

  saveCustomer(customerDetails) {

    this.disableCustomerSave = true;

    // if (this.selectedMeters.length === 1) {
    //   customerDetails['smart_meter_configuration_id'] = this.selectedMeters[0]['smart_meter_configuration_id'];
    // }
    // if (this.selectedMeters.length === 0) {
    //   customerDetails['smart_meter_configuration_id'] = "";
    // }

    const reqPayload = {
      // block_type: this.tabs[0]['value'],
      data: {
        bodyContent: {
          ...customerDetails
        }
      }
    }

    this.ppsService.saveCustomer(reqPayload).subscribe((res) => {
      if (res['status'] === 'success') {
        this._toasterService.toast('success', 'Success', res.message, true);
        this.getMeterList();
      }
      if (res['status'] === 'failed') {
        this._toasterService.toast('error', res.status, res.message, true);
      }
      this.disableCustomerSave = false;

    },
      (error) => {
        this.disableCustomerSave = false;
      })
  }

  readCustomer(customeAction) {
    this.disableCustomerSave = true;

    const reqPayload = {
      sensor_id: this.selectedMeters,
    }
    this.ready = false;
    this.ppsService.readCustomerInfo(reqPayload).subscribe((res) => {
      if (res['status'] === 'success') {
        this.holdCustomerDFM['bodyContent'] = { ...this.holdCustomerDFM['bodyContent'], ...res['data'] }
        this.customerInfo = this.holdCustomerDFM;
        this.ready = true;
        this._toasterService.toast('success', 'Success', res.message, true);
      }
      if (res['status'] === 'failed') {
        this.ready = true;
        this._toasterService.toast('error', res.status, res.message, true);
      }
      this.disableCustomerSave = false;

    },
      (error) => {
        this.disableCustomerSave = false;
      })
  }

  onMeterSelect() {

    this.disableCustomerSave = false;
    this.disableReadWrite = false;
    // when only single meter selected
    if (this.selectedMeters.length === 1) {
      this.activeMeterBlock = this.tabs[1]['value'];
      this.getCustomerInfoDFM("", this.tabs[0]['value']);
      this.getBlockContentDFM();
    }
    if (this.selectedMeters.length === 0) {
      this.clearAllSelectedMeters();
    }
    // if (this.eachBlockMeterInfo &&
    //   this.eachBlockMeterInfo['userActions']['customActions'].length !== 0 &&
    //   this.selectedMeters.length > 1) {
    //   this.updateDFM();
    // }
    if (this.selectedMeters.length > 1) {
      this.getBlockContentDFM();
    }
  }

  updateDFM(dfmData?) {
    if (dfmData) {
      dfmData['userActions']['customActions'] = []; //read not allowed;hide
      return dfmData;
    }
    return this.eachBlockMeterInfo['userActions']['customActions'] = [];
  }

  clearCustomerInfo() {
  }

  clearAllSelectedMeters() {
    this.selectedMeters = [];
    this.eachBlockMeterInfo = null;
    this.customerInfo = null;
    this.currentActiveMeterID = "";
    // this.getCustomerInfoDFM("", this.tabs[0]['value']);
  }

  getBlockContentDFM() {

    this.isMeterServiceBusy = true;

    const reqPayload = {
      sensor_id: this.selectedMeters,
      block_type: this.activeMeterBlock
    };

    this.ppsService.getBlockContent(reqPayload).subscribe((res) => {

      if (res['status'] === 'success') {
        // if (this.selectedMeters.length > 1) {
        //   this.eachBlockMeterInfo = this.updateDFM(res['data']);
        // }
        // if (this.selectedMeters.length === 1) {
        this.eachBlockMeterInfo = res['data'];
        this.holdEachMeterBlock = res['data'];
        // }
      }
      if (res['status'] === 'failed') {
        this._toasterService.toast('error', res.status, res.message, true);
      }
      this.isMeterServiceBusy = false;
    },
      (error) => {
        this.isMeterServiceBusy = false;
      });
  }

  setBlockType({ value }) {
    this.activeMeterBlock = value;
    this.getBlockContentDFM();
  }

  writeEachBlock(eachBlockInfo) {

    this.disableReadWrite = true;


    const reqPayload = {

      // block_type: this.activeMeterBlock,
      data: {
        bodyContent: {
          // smart_meter_configuration: this.selectedMeters,
          ...eachBlockInfo
        }
      }
    }
    this.ppsService.writeMeter(reqPayload).subscribe((res) => {
      if (res['status'] === 'success') {
        this._toasterService.toast('success', 'Success', res.message, true);
      }
      if (res['status'] === 'failed') {
        this._toasterService.toast('error', res.status, res.message, true);
      }
      this.disableReadWrite = false;

    },
      (error) => {
        this.disableReadWrite = false;
      })
  }

  readEachBlock(currentData) {


    this.isMeterServiceBusy = true;

    this.disableReadWrite = true;

    const reqPayload = {
      block_type: this.activeMeterBlock,
      sensor_id: this.selectedMeters,
    }

    this.ppsService.readMeter(reqPayload).subscribe((res) => {
      if (res['status'] === 'success') {
        this.holdEachMeterBlock['bodyContent'] = res['data']['bodyContent'];
        this.eachBlockMeterInfo = this.holdEachMeterBlock;
        this._toasterService.toast('success', 'Success', res.message, true);
      }
      if (res['status'] === 'failed') {
        this._toasterService.toast('error', res.status, res.message, true);
      }
      this.disableReadWrite = false;
      this.isMeterServiceBusy = false;

    },
      (error) => {
        this.disableReadWrite = false;
        this.isMeterServiceBusy = false;
      })
  }

  deleteCustomer() {
    const reqPayload = {
      smart_meter_configuration_id: this.selectedMeters[0]['smart_meter_configuration_id']
    }

    this.ppsService.deleteCustomer(reqPayload).subscribe((res) => {
      if (res['status'] === 'success') {
        this._toasterService.toast('success', 'Success', res.message, true);
        this.clearAllSelectedMeters();
        this.getMeterList('delete');
      }
      if (res['status'] === 'failed') {
        this._toasterService.toast('error', res.status, res.message, true);
      }
    },
      (error) => { });
  }

  // disableCustomer() {

  //   const reqPayload = {
  //     smart_meter_configuration_id: this.currentActiveMeterID
  //   }

  //   this.ppsService.disableCustomer(reqPayload).subscribe((res) => {
  //     if (res['status'] === 'success') {
  //       this._toasterService.toast('success', res.status, res.message, true);
  //       // this.clearAllSelectedMeters();
  //     }
  //     if (res['status'] === 'failed') {
  //       this._toasterService.toast('error', res.status, res.message, true);
  //     }
  //   },
  //     (error) => { });
  // }

}
