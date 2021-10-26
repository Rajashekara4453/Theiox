import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { ServiceloaderService } from '../../../components/loader/serviceloader/serviceloader.service';
import { PpsService } from '../pps.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kl-dynamic-pages',
  templateUrl: './dynamic-pages.component.html',
  styleUrls: ['./dynamic-pages.component.scss']
})
export class DynamicPagesComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private _ppsService: PpsService,
    private loader: ServiceloaderService,
    private _toaster: ToastrService,
    private _router: Router
  ) {}
  public DFMinput: Object = {};
  dmfLoading = false;
  page: any;
  dropdownSettings = {};
  dataItems: any;
  selectedValue: Array<any> = [];
  isPageLoading: Boolean = false;
  private rechargeSubscription = new Subscription();
  private costmanagementSubscription = new Subscription();
  @ViewChild('confirmModalTrigger') modalTrigger: ElementRef;
  cpyActionData: any;
  modalBodylabel:string;
  moduleName: any;
  ngOnInit() {
    // this.loader.show();
    this.dropdownSettings = {
      primaryKey: 'customer_id',
      labelKey: 'customer_name',
      lazyLoading: true,
      text: 'Select Asset',
      singleSelection: true,
      // selectAllText: 'Select All',
      // unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableFilterSelectAll: false,
      classes: 'myclass custom-class'
    };
    this.getQueryParams();
  }
  getQueryParams() {
    this.route.params.subscribe((params) => {
      this.page = params.page;
      this.moduleName = params.module ? params.module : 'pps';
      this.DFMinput = [];
      this.costmanagementSubscription.unsubscribe();
      this.rechargeSubscription.unsubscribe();
      if (this.route.snapshot.queryParams['dd']) {
        if (this.route.snapshot.queryParams.dd === '1') {
          this.selectedValue = null;
          this.dmfLoading = false;
          this.GetList();
        } else if (this.route.snapshot.queryParams.dd === '0') {
          this.isPageLoading = false;
          this.onSelect();
        } else {
          this._router.navigate(['page-notfound']);
        }
      } else {
        this.isPageLoading = false;
        this.onSelect();
      }
    });
  }
  GetList() {
    const dataToPost = {};
    this.isPageLoading = false;
    this.loader.show();
    this.rechargeSubscription = this._ppsService
      .GetList(this.page, dataToPost)
      .subscribe(
        (data) => {
          if (data.status === 'success') {
            this.dataItems = data['customer_list'];
            this.isPageLoading = true;
            this.loader.hide();
          } else {
            this._toaster.toast('error', 'Error', data.message, true);
            this.loader.hide();
          }
        },
        (error) => {
          this._toaster.toast('error', 'Error', error.statusText, true);
          this.loader.hide();
        }
      );
  }
  onSelect(item?) {
    let dataToPost = {};
    if (item != undefined) {
      dataToPost = {
        customer_id: item.customer_id
      };
    }
    this.dmfLoading = false;
    this.loader.show();
    this.costmanagementSubscription = this._ppsService
      .fetchDFM(this.page, dataToPost)
      .subscribe(
        (data) => {
          if (data.status === 'success') {
            this.DFMinput = data.data;
            this.dmfLoading = true;
            this.loader.hide();
          } else {
            this._toaster.toast('error', 'Error', data.message, true);
            this.loader.hide();
          }
        },
        (error) => {
          this._toaster.toast('error', 'Error', error.statusText, true);
          this.loader.hide();
        }
      );
  }
  getGeneralInfo(value) {
    const dataToPost = {
      data: {
        bodyContent: value
      }
    };
    this._ppsService.saveDFMData(this.page, dataToPost).subscribe(
      (data) => {
        if (data.status === 'success') {
          this._toaster.toast('success', 'Success', data.message, true);
          this.onCancel();
        } else {
          this._toaster.toast('error', 'Error', data.message, true);
        }
      },
      (error) => {
        this._toaster.toast('error', 'Error', error.statusText, true);
      }
    );
  }
  onCancel() {
    this.getQueryParams();
    this.dmfLoading = false;
    this.selectedValue = null;
  }

  onCustomAction(actionData, isCalledFromModal?:boolean) {

    let holdActionData = {
      customAction:null,
      formData:null
    }

    if(actionData.hasOwnProperty('customAction')) {
      holdActionData.customAction = actionData['customAction'];
    } else {
      holdActionData.customAction = actionData;
    }

    if(actionData.hasOwnProperty('formData')) {
      holdActionData.formData = actionData['formData'];
    }

    if(isCalledFromModal) {
      if(holdActionData.customAction['isConfirm']) {
        holdActionData.customAction['isConfirm'] = false;
      }
    }

    if(holdActionData.customAction['isConfirm']) {
      this.cpyActionData = holdActionData;
      this.modalTrigger.nativeElement.click();
      return;
    }

    let dataToPost = {};
    let action;

    if(holdActionData.formData) {
      dataToPost = {
        data: {
          bodyContent: holdActionData.formData
        }
      }
    }
    
    if(holdActionData.customAction) {
      action = holdActionData.customAction['buttonId'];
    }

    if (holdActionData.customAction['isReloadDFM']) {
      this.dmfLoading = false;
      this.loader.show();
    }
    this._ppsService.dynamicEndpointGenerator(this.moduleName, this.page, action, dataToPost).subscribe(
      (data) => {
        if (data.status === 'success') {
          if (holdActionData.customAction['isReloadDFM']) {
            this.DFMinput = data.data;
            this.dmfLoading = true;
            this.loader.hide();
          }
          this._toaster.toast('success', 'Success', data.message, true);
        } else {
          this._toaster.toast('error', 'Error', data.message, true);
          this.loader.hide();
        }
      },
      (error) => {
        this._toaster.toast('error', 'Error', error.statusText, true);
        this.loader.hide();
      }
    );
  }


  onDeSelect() {
    this.dmfLoading = false;
    this.selectedValue = null;
  }
  onRecharge(body) {
    if (this.page === 'smartmeterrecharge') {
      const dfmData = this.DFMinput;
      const recharge_tax = dfmData['bodyContent']['recharge_tax'];
      let rechargeAmt;
      let taxDeduction;
      if (recharge_tax > 0) {
        taxDeduction = (body.value * recharge_tax) / 100;
        taxDeduction = Number(taxDeduction.toFixed(3));
        rechargeAmt = body.value - taxDeduction;
      } else {
        rechargeAmt = body.value;
        taxDeduction = Number(recharge_tax.toFixed(3));
      }
      dfmData['bodyContent']['recharge_amount'] = Number(
        rechargeAmt.toFixed(3)
      );
      dfmData['bodyContent']['tax_deduction'] = taxDeduction;
      this.DFMinput = dfmData;
    }
  }
}
