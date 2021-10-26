import { Observable } from "rxjs";
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../toastr/toastr.service';
import { AppService } from '../../services/app.service';
import { Config } from '../../config/config';

@Component({
  selector: 'kl-dynamic-filters',
  templateUrl: './dynamic-filters.component.html',
  styleUrls: ['./dynamic-filters.component.scss']
})
export class DynamicFiltersComponent implements OnInit {


  constructor(
    private _activatedRoute:ActivatedRoute,
    private _toaster:ToastrService,
    private _appService:AppService,
  ) { }

  initialLoad: Boolean = true;

  pageType: any;
  backupFilterPageData: any;
  filterPageData: any;
  action: string = '';
  isFilterApplied:Boolean = false;

  isPageLoading: Boolean = false;
  isFilterDataLoading: Boolean = false;
  isTableLoading: Boolean = false;
  isTableLoadMore: Boolean = false;
  isNoDataMessage: Boolean = false;
  isNoTableDataMessage: Boolean = false;
  isResponseFailure: Boolean = false;
  isSearchResult:Boolean = false;
  today = new Date();

  initialRangeTableList:number = 0;
  finalRangeTableList:number = 20;

  isConfirmationModalPopup:Boolean = false;
  isConfirmModal:Boolean=false;
  dataForConfirmation:any={};

  generateRechargeReceipt:Observable<any>;
  rechargeIdList:any = [];
  reqObj: any = {};

  isCheckBox: Boolean = false;
  isCheckedAll:Boolean = false;
  multiAction:Boolean = false;

  /** Send Data to Server */
  requestPayloadObj:any={
    // "isApplyFilter":false,//on load isApplyFilter will be false //On applying
  };
  onloadRequestPayload = {
    isApplyFilter:false,//on load isApplyFilter will be false //On applying
  }
  viewDataBinding:any =  {
    // "isApplyFilter":false,//on load isApplyFilter will be false //On applying
  }

  /** Date-Time Picker Settings */
  date_time_settings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy HH:mm:ss',
    defaultOpen: false,
    closeOnSelect: true
  };
  /** Single Date Picker */
  date_settings = {
    bigBanner: true,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: false,
    closeOnSelect: true
  };
  /** Multi-Select Dropdown Settings */
  multiSelectDropDownSettings = {
    singleSelection: false,
    text: 'Select',
    enableCheckAll: false,
    primaryKey: 'id',
    labelKey: 'value',
    enableSearchFilter: true,
    noDataLabel: 'No data available',
    lazyLoading: true,
    badgeShowLimit: 1,
    filterSelectAllText: 'Select all filtered results',
    filterUnSelectAllText:'Unselect all filtered results'
  };

  /** Single-Select Dropdown Settings */
  singleSelectDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    enableCheckAll: false,
    primaryKey: 'id',
    labelKey: 'value',
    enableSearchFilter: true,
    noDataLabel: 'No data available'
  };

  /** Dynamic Filters Page */
  pageURLs = {
      'action' : Config.API.GET_DYNAMIC_PAGE_URL,
  }

  ngOnInit() {
    this.getQueryParams();
  }

  createUrls(){
    const re = /smartmeterrecharge/gi;
    this.pageURLs.action = this.pageURLs.action.replace(re, this.pageType);
  }

  getQueryParams() {
    this._activatedRoute.params.subscribe((params) => {
      this.pageType = params.pageType;
      if(this.initialLoad){
        this.action = 'history';
      }
      // if(!this.initialLoad){
      //    this.initialLoad = !this.initialLoad;
      // }
      this.createUrls();
      this.getData(this.pageURLs.action, this.action, this.onloadRequestPayload);
    });
  }

  getData(page, action, dataToSend?){
    if(!dataToSend || dataToSend==undefined){
      dataToSend = {};
    }
    if(this.initialLoad){
      this.isPageLoading = true;
      this.isNoDataMessage = false;
      this.isNoTableDataMessage = false;
      this.isResponseFailure = false;
      this.isTableLoadMore = false;
    } else {
      this.isTableLoading = true;
      this.isNoDataMessage = false;
      this.isNoTableDataMessage = false;
      this.isTableLoadMore = false;
      this.isResponseFailure = false;
    }
    this._appService.getDynamicFilterPageData(page, action, dataToSend).subscribe((data)=>{
      if(data.status.toLowerCase() == 'success'){
        if(this.initialLoad && data.hasOwnProperty('filters')){
          this.filterPageData = this.getCopy(data);
          for(let filters of this.filterPageData.filters){
          if(filters.type == 'multiSelect' ) {
            this.viewDataBinding[filters.filterType] = [];
          } else if(filters.type == 'singleSelect') {
            this.viewDataBinding[filters.filterType] = '';
          } else if(filters.type == 'date') {
            this.viewDataBinding[filters.filterType] = new Date();
          } else if(filters.type == 'dateRange') {
            let fromDate = new Date(this.changeDateFormat(filters['value'].from));
            let toDate = new Date(this.changeDateFormat(filters['value'].to)); 

            this.viewDataBinding[filters.filterType] = {
              from: fromDate,
              to: toDate
            }
          }
          else {
            this.viewDataBinding[filters.filterType] = '';
          }
          }
          this.backupFilterPageData = this.getCopy(this.filterPageData);
          this.initialLoad = false;
          this.requestPayloadObj = this.getCopy(this.viewDataBinding);
          this.requestPayloadObj['isApplyFilter'] = this.onloadRequestPayload['isApplyFilter'];
        }
        this.filterPageData['body_content'] = data['body_content'];
        this.filterPageData['header_content'] = data['header_content'];
        this.requestPayloadObj['is_download'] = false;
        this.finalRangeTableList = 20;
        this.rechargeIdList = [];
        this.isTableLoading = false;
        this.isPageLoading = false;
        this.isResponseFailure = false;
        this.isFilterApplied = false;
        this.multiAction = false;
        this.isCheckedAll = false;
        if (data.body_content.length == 0) {
          this.isNoTableDataMessage = true;
        }
        if(data.body_content.length > 20) {
          this.isTableLoadMore = true;
        }
        if(action == 'delete'){
          this.getData(page, 'history');
        }
        if(data.hasOwnProperty('data')){
          this._appService.downloadReport(data.fileName);
        }
      } else {
        this._toaster.toast('error','Error','Something went wrong',true);
        this.isFilterApplied = false;
        this.isPageLoading = false;
        this.isResponseFailure = false;
        this.isTableLoading = false;
        if(this.initialLoad){
          this.isNoDataMessage = true;
        }
      }
    }, (err) => {
      this._toaster.toast('error','Error','Failed to reach server',true);
      console.log(err);
      this.isFilterApplied = false;
      this.isPageLoading = false;
      this.isNoDataMessage = false;
      this.isTableLoading = false;
      this.isResponseFailure = true;
    })
  }

  changeDateFormat(dateString:string){
    let date = dateString.split('-')[1] + '-' + dateString.split('-')[0] + '-'  + dateString.split('-')[2] ; // format '15-09-2021 10:05:10'
    return date;
    // console.log(date);
  }

  updateFilterData(action, filterType, type, eve?){
    switch(type){
      case 'singleSelect':
        if(action == 'select'){
          this.requestPayloadObj[filterType] = eve.id;
          return
        }
        if(action == 'deselect' || action == 'deselectAll'){
          this.requestPayloadObj[filterType] = '';
          return
        }
        break;

      case 'multiSelect':
        if(action == 'select'){
          this.requestPayloadObj[filterType].push(eve);
          return
        }
        if(action == 'deselect'){
          this.requestPayloadObj[filterType].splice(this.requestPayloadObj[filterType].indexOf(eve), 1);
          return
        }
        if(action == 'deselectAll'){
          this.requestPayloadObj[filterType] = [];
          return
        }
        break;

      case 'dateRange':
        this.requestPayloadObj[type][filterType] = this.getFormattedDateTime(
          new Date(this.viewDataBinding[type][filterType]),
          'DD-MM-YYYY HH:MM:SS'
        );
        break;

      case 'date':
        this.requestPayloadObj[type] = this.getFormattedDateTime(
          new Date(this.viewDataBinding[type]),
          'DD-MM-YYYY'
        );
        break;
    }
  }

  onItemSelect(eve, filterType, type){
    this.updateFilterData('select', filterType, type, eve);
  }

  onItemDeSelect(eve, filterType, type){
    this.updateFilterData('deselect', filterType, type, eve);
  }

  onDeSelectAll(filterType, type){
    this.updateFilterData('deselectAll', filterType, type);
  }

  onDateSelect(dateType, range){
    this.updateFilterData('',range, dateType);
  }

  getFormattedDateTime(date, format?): string {
    try {
      let dateVal = '';
      const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
      let month = date.getMonth() + 1;
      month = month > 9 ? month : '0' + month;
      const year = date.getFullYear();
      const HH = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
      let hh;

      if (date.getHours() > 12) {
        hh = date.getHours();
        hh = hh - 12;
      } else {
        hh = HH;
      }

      const MM =
        date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
      const SS =
        date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
      const AM_PM = date.getHours() > 12 ? 'PM' : 'AM';
      if (format) {
        switch (format) {
          case 'YYYY-MM-DD':
            dateVal = year + '-' + month + '-' + day;
            break;
          case 'YYYY/MM/DD':
            dateVal = year + '/' + month + '/' + day;
            break;
          case 'DD-MM-YYYY':
            dateVal = day + '-' + month + '-' + year;
            break;
          case 'DD/MM/YYYY':
            dateVal = day + '/' + month + '/' + year;
            break;
          case 'MM/DD/YYYY':
            dateVal = month + '/' + day + '/' + year;
            break;
          case 'DD-MM-YYYY HH:MM:SS':
            dateVal =
              day + '-' + month + '-' + year + ' ' + HH + ':' + MM + ':' + SS;
            break;
          case 'YYYY-MM-DD HH:MM:SS':
            dateVal =
              year + '-' + month + '-' + day + ' ' + HH + ':' + MM + ':' + SS;
            break;
          case 'DD-MM-YYYY HH:MM Am/Pm':
            dateVal =
              day +
              '-' +
              month +
              '-' +
              year +
              ' ' +
              hh +
              ':' +
              MM +
              ' ' +
              AM_PM;
            break;
          default:
            dateVal = year + '-' + month + '-' + day;
        }
      } else {
        dateVal = year + '-' + month + '-' + day;
      }
      return dateVal;
    } catch (error) {
      console.log(error);
    }
  }

  selectRechargeId(tr, eve){
    if(tr.recharge_id !== null && tr.recharge_id !== undefined && tr.recharge_id !== ''){
      switch(eve.target.checked){
      case true:
        this.rechargeIdList.push(tr.recharge_id);
        break;
      case false:
        this.isCheckedAll = eve.target.checked;
        for(let i = 0; i< this.rechargeIdList.length; i++){
          if(this.rechargeIdList[i] == tr.recharge_id){
            this.rechargeIdList.splice(i, 1);
          }
        }
        break;
      }
      if(this.rechargeIdList.length > 1){
        this.multiAction = true;
      } else {
        this.multiAction = false;
      }
      if(this.rechargeIdList.length == this.filterPageData.body_content.length){
        this.isCheckedAll =  true;
      } else {
        this.isCheckedAll =  false;
      }
    }
  }

  checkUncheckAll(eve){
    if(eve.target.checked){
      this.isCheckedAll = eve.target.checked;
      this.multiAction = eve.target.checked;
      this.rechargeIdList = [];
      for(let selection of this.filterPageData.body_content){
        selection.isSelected = true;
        if(selection.recharge_id !== null && selection.recharge_id !== undefined && selection.recharge_id !== ''){
          this.rechargeIdList.push(selection.recharge_id);
        }
      }
    } else {
      this.isCheckedAll = eve.target.checked;
      this.multiAction = eve.target.checked;
      for(let selection of this.filterPageData.body_content){
        selection.isSelected = false;
      }
      this.rechargeIdList = [];
    }
  }

  multiDataAction(data){
    if(this.rechargeIdList.length > 15){
      this._toaster.toast('warning','Warning','Maximum 15 items can be processed',true);
      return
    }
    this.reqObj['recharge_id']=this.rechargeIdList;
    switch(data['type']){
      case 'download':
        this.downloadProcess(this.pageURLs.action, data.value, this.reqObj);
        break;
      case 'confirm':
        this.confirmationModal(this.pageURLs.action, data.value, this.reqObj);
        break;
      default:
        this.getData(this.pageURLs.action, data.value, this.reqObj);
    }
  }

  tableAction(action,eve){
    this.isConfirmModal = false;
    const availability:Boolean = this.nullCheck(eve.recharge_id, 'Recharge id');
    if(availability){
      const rechargeId = [];
      rechargeId.push(eve.recharge_id);
      this.reqObj['recharge_id']=rechargeId; //eve.recharge_id;
      switch(action['type']){
        case 'download':
          this.downloadProcess(this.pageURLs.action, action.value, this.reqObj);
          break;
        case 'confirm':
          this.isConfirmModal = true;
          this.confirmationModal(this.pageURLs.action, action.value, this.reqObj);
          break;
        default:
          this.getData(this.pageURLs.action, action.value, this.reqObj);
      }
    }
  }

  downloadProcess(page, action, reqPayload){
    this.generateRechargeReceipt = this._appService.getDynamicFilterPageData(page, action, reqPayload);
    this.generateRechargeReceipt.subscribe((data)=>{
    if(data!=null && data.status=='success'){
      this.isFilterApplied = false;
      this._appService.downloadReport(data.data.fileName);
    } else {
      this.isFilterApplied = false;
      this._toaster.toast('error','Error','Error while downloading receipt',true);
    }
    }, (err)=>{
      this.isFilterApplied = false;
      console.log(err);
    });
    this.requestPayloadObj.is_download = false;
  }

  nullCheck(item, msg){
    if(item == null || item == undefined || item == ''){
      this._toaster.toast('warning','Warning',`${msg} not found`,true);
      return false
    } else {
      return true
    }
  }

  confirmationModal(page, action, reqPayload){
    this.dataForConfirmation['page'] = page;
    this.dataForConfirmation['action'] = action;
    this.dataForConfirmation['reqPayload'] = reqPayload;
  }

  confirmPopupApply(){
    this.getData(this.dataForConfirmation.page, this.dataForConfirmation.action, this.dataForConfirmation.reqPayload);
  }

  dateCompare(){
    if(this.requestPayloadObj.hasOwnProperty('dateRange')){
      let fromDate:any = new Date(this.viewDataBinding.dateRange['from'])
      let toDate:any = new Date(this.viewDataBinding.dateRange['to']);
      if(fromDate.getTime() > toDate.getTime()){
        this._toaster.toast( 'warning','Warning',`'From date' should be less than or equal to 'To date'`,true);
        return false;
      }
      if(this.requestPayloadObj.dateRange.from.includes("GMT") ||this.requestPayloadObj.dateRange.from.includes("T") || this.requestPayloadObj.dateRange.from.includes("Z")){
        this.requestPayloadObj.dateRange.from = this.getFormattedDateTime(new Date(this.requestPayloadObj.dateRange.from), 'DD-MM-YYYY HH:MM:SS');
      }
      if(this.requestPayloadObj.dateRange.to.includes("GMT") ||this.requestPayloadObj.dateRange.to.includes("T") || this.requestPayloadObj.dateRange.to.includes("Z")){
        this.requestPayloadObj.dateRange.to = this.getFormattedDateTime(new Date(this.requestPayloadObj.dateRange.to), 'DD-MM-YYYY HH:MM:SS');
      }
    }
    if(this.requestPayloadObj.hasOwnProperty('date')){
      const date = this.requestPayloadObj.date;
      if(date == '' || date == undefined){
        this.requestPayloadObj.date = this.getFormattedDateTime(new Date());
      } else if(this.requestPayloadObj.date.includes("GMT") || this.requestPayloadObj.date.includes("T") || this.requestPayloadObj.date.includes("Z")){
        this.requestPayloadObj.date = this.getFormattedDateTime(new Date(date), 'DD-MM-YYYY');
      }
    }
    return true;
  }

  changeSingleSelectValue(){
    for(let filt of this.filterPageData.filters){
      if(filt.type == 'singleSelect' && this.requestPayloadObj.hasOwnProperty(filt.filterType) && Array.isArray(this.requestPayloadObj[filt.filterType])){
        // if(this.requestPayloadObj.hasOwnProperty(filt.filterType) && Array.isArray(this.requestPayloadObj[filt.filterType])){
          if(this.requestPayloadObj[filt.filterType].length == 0){
            this.requestPayloadObj[filt.filterType] = '';
          } else {
            this.requestPayloadObj[filt.filterType] = this.requestPayloadObj[filt.filterType][0].id;
          }
        // }
      }
    }
  }

  filteredAction(act?){
    this.isFilterApplied = true;
    this.changeSingleSelectValue();

    switch(act){
      case 'apply':
        if(!this.requestPayloadObj.isApplyFilter){
          this.requestPayloadObj.isApplyFilter = true;
        }
        this.sendRequest();
        break
      case 'generate':
        // this.sendRequest();
        this.downloadProcess(this.pageURLs.action, 'history', this.requestPayloadObj );
        break
    }
  }

  downloadFilter(action){
    const validDate:Boolean = this.dateCompare();
    if(validDate){
      this.requestPayloadObj.isApplyFilter = false;
      this.requestPayloadObj.is_download = true;
      this.filteredAction(action);
    }
      // this.downloadProcess(this.pageURLs.action, 'history', this.requestPayloadObj );
  }

  applyFilter(action){
    const validDate:Boolean = this.dateCompare();
    if(validDate){
      this.filteredAction(action);
    }
  }

  applyDownloadFilter(){
    const validDate:Boolean = this.dateCompare();
    if(validDate){
      this.requestPayloadObj.isApplyFilter = true;
      this.requestPayloadObj.is_download = true;
      this.filteredAction('apply');
    }
  }
  errorReload(page, action, obj){
    this.initialLoad = true;
    this.getData(page, action, obj);
  }

  resetfilter(){
    this.initialLoad = true;
    this.requestPayloadObj = this.getCopy(this.onloadRequestPayload);
    this.sendRequest();
  }

  sendRequest(){
    this.getData(this.pageURLs.action, 'history', this.requestPayloadObj)
  }

  loadMoreTable(){
    this.finalRangeTableList = this.finalRangeTableList + 30;
    if (this.finalRangeTableList >= this.filterPageData.body_content.length)
      this.isTableLoadMore = false;
  }

  /**
  * Method for creating a deep copy of a json
  * @param obj Object for taking a deep copy
  */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  trackFilteredList(index){
    return index;
  }
}
