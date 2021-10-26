
import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';
import { globals } from '../../utilities/globals';
import { AuthGuard } from '../auth/auth.guard';
import { ToastrService } from '../../components/toastr/toastr.service';


@Component({
  selector: 'kl-assest-control-list',
  templateUrl: './assest-control-list.component.html',
  styleUrls: ['./assest-control-list.component.scss']
})
export class AssestControlListComponent implements OnInit {
  pageUrl: any;

  constructor(private _appService: AppService, private _global: globals, private _router: Router,
    private _authGuard: AuthGuard,
    private _toastLoad: ToastrService) {
    const menuObject = this._authGuard.getMenuObject
    this.pageUrl=menuObject['url']
    this.pageAccessFor=menuObject.accessLevel;
  }

  pageAccessFor;
  isToaster: boolean = false;
  isCreateFirstAssetControl: boolean;
  timer: number;
  intervalToDestroy: NodeJS.Timer;
  triggeredActionId;
  deleteActionId;
  pageType = 'action';
  headerLabelName: any;

  /**For Asset Control List */
  isPageLoading: boolean = false;
  assetControlList: any = [];
  isloadMoreAssetControlList: boolean = false;
  initialRangeAssetControlList = 0;
  finalRangeAssetControlList = 32;
  queryStringAssetControlList = "";
  isAssetControlListResponse: boolean = false;
  isAssetControlListResponseStatus: boolean = false;

  /**For Action More Info */
  isMoreInfoLoading: boolean = false;
  isActionMoreInfoData: boolean = false;
  actionMoreInfoData = [];
  isActionMoreInfoSchedule: boolean = false;
  initialRangeActionMoreInfoTable = 0;
  finalRangeActionMoreInfoTable = 10;
  actionMoreInfoTable = [];
  isActionMoreInfoLoadMore: boolean = false;
  isActionMoreInfoResponse: boolean = false;

  /**For History All Data */
  isHistoryDataMessage: boolean = false
  historyExecutionData = [];
  historyDefaultDropdownValue = "Activity";
  historyExecutionDropdownList = [];
  isHistoryResponse: boolean = false;
  historyRetryId: any;

  /**For History Execution Table */
  isHistoryLoading: boolean = false;
  historyExecutionTable = [];
  queryStringHistoryTable = "";
  initialRangeHistoryExecutionTable = 0;
  finalRangeHistoryExecutionTable = 25;
  isHistoryExecutionTableLoadMore: boolean = false;
triggerConfirmName
  ngOnInit() {
    this.getAssetControlList();
  }
  /**
   * Fetch and Load the asset control list to the view
   */
  getAssetControlList() {
    this.isPageLoading = true;
    this.isAssetControlListResponseStatus = false;
    this.isAssetControlListResponse = false;
    let objGet = {
      "type": this.pageType
    };
    this._appService.getAssetControlList(objGet).subscribe((listData) => {
      this.isPageLoading = false;
      if (listData.status === "success") {
        this.isCreateFirstAssetControl = listData.actions_data.length == 0 ? true : false;
        this.assetControlList = listData.actions_data;
        if (listData.actions_data.length >= this.finalRangeAssetControlList) {
          this.isloadMoreAssetControlList = true;
        }
      } else if (listData.status === "failed" || listData.status === undefined || listData.status === null) {
        this.isAssetControlListResponse = true;
        this.isAssetControlListResponseStatus = true;
        this._toastLoad.toast('error', 'Error', 'Received Status Failed', true);
        this.isToaster = true;
      }
    }, (err) => {
      console.log(err);
      this.isPageLoading = false;
      this.isAssetControlListResponseStatus = false;
      this.isAssetControlListResponse = true;
    });
  }
  /**
   * Load more asset control actions
   */
  loadMoreAssetControlList() {
    this.finalRangeAssetControlList = this.finalRangeAssetControlList + 100;
    if (this.finalRangeAssetControlList >= this.assetControlList.length)
      this.isloadMoreAssetControlList = false;
  }


  /**
   * Show the more info of a particular asset control
   * @param id is the asset_action_id from the action
   */
  moreInfoForAction(id, actionName) {
    this.headerLabelName = actionName;
    this.actionMoreInfoData = [];
    this.isMoreInfoLoading = true;
    this.isActionMoreInfoResponse = false;
    this.isActionMoreInfoData = false;
    this.isActionMoreInfoLoadMore = false;
    let objGet = {};
    if (id === undefined) {
      objGet = {
        "asset_action_id": this.historyRetryId,
        "type": this.pageType
      };
    } else {
      this.historyRetryId = id;
      objGet = {
        "asset_action_id": id,
        "type": this.pageType
      };
    }
    this._appService.moreInfoAssetControlData(objGet).subscribe((moreInfoData) => {
      this.isMoreInfoLoading = false;
      if (moreInfoData && !moreInfoData.status) {
        this.actionMoreInfoData = moreInfoData;
        this.actionMoreInfoTable = moreInfoData.body_content;
        this.isActionMoreInfoSchedule = moreInfoData.schedule.schedule;
        if (moreInfoData.body_content.length >= this.finalRangeActionMoreInfoTable) {
          this.isActionMoreInfoLoadMore = true;
        }
      }
      else {
        this.isActionMoreInfoData = true;
        this.isActionMoreInfoLoadMore = false;
      }
    }, (err) => {
      console.log(err);
      this.isMoreInfoLoading = false;
      this.isActionMoreInfoResponse = true;
    });
  }
  /**
   * Load more action data table
   */
  loadMoreInfo() {
    this.finalRangeActionMoreInfoTable = this.finalRangeActionMoreInfoTable + 10;
    if (this.finalRangeActionMoreInfoTable >= this.actionMoreInfoTable.length)
      this.isActionMoreInfoLoadMore = false;
  }
  /**
   * Cancel action more info
   */
  moreInfoCancel() {
    this.actionMoreInfoData = [];
    this.finalRangeActionMoreInfoTable = 10;
    this.isActionMoreInfoData = false;
    this.isActionMoreInfoResponse = false;
  }


  /**
   * @param id is the asset_action_id from the action
   */
  deleteActionControl(id) {
    this.deleteActionId = id;
  }
  /**
   * Confirm delete for the respective asset_action_id
   */
  deleteConfirm() {
    let objGet = {
      "asset_action_id": this.deleteActionId,
      "type": this.pageType
    };
    this._appService.deleteAssetControlData(objGet).subscribe((response) => {
      if (response['status'] === 'success') {
        this._toastLoad.toast('success', 'Success', 'Action Deleted Successfully', true);
        this.isToaster = true;
        this.getAssetControlList();
      }
      else {
        this._toastLoad.toast('error', 'Error', 'Deleting Failed', true);
        this.isToaster = true;
      }
    }, (err) => {
      console.log(err);
      this.isPageLoading = false;
      this._toastLoad.toast('error', 'Error', 'Failed To Reach Server', true);
      this.isToaster = true;
    });
  }

  /**
   * @param id for the respective asset_action_id
   */
  triggerAction(id,assetControl) {
  this.triggerConfirmName=assetControl.action_name
    this.triggeredActionId = id;
    this.timer = 9;
    this.intervalToDestroy = setInterval(() => {
      this.timer--;
      if (this.timer == 0) {
        document.getElementById("dismissTriggerModal").click();
        clearInterval(this.intervalToDestroy);
        this.intervalToDestroy = undefined;
      }
    }, 1000);
  }
  /**
   * Confirm trigger for the respective action
   */
  triggerConfirm() {
    let objGet = {
      "asset_action_id": this.triggeredActionId,
      "type": this.pageType
    };
    this._appService.triggerAssetControlData(objGet).subscribe((triggerResponse) => {
      if (triggerResponse['status'] === 'success') {
        this._toastLoad.toast('success', 'Success', 'Action Triggered Successfully', true);
        this.isToaster = true;
      }
      else {
        this._toastLoad.toast('error', 'Error', 'Action Couldn`t Be Triggered', true);
        this.isToaster = true;
      }
    }, (err) => {
      console.log(err);
      this.isPageLoading = false;
      this._toastLoad.toast('error', 'Error', 'Failed To Reach Server', true);
      this.isToaster = true;
    });
  }


  /**
   * @param id for the respective asset_action_id
   * Show the history data of the respective action
   */
  actionHistory(id, actionName) {
    this.isHistoryExecutionTableLoadMore = false;
    this.headerLabelName = actionName;
    this.isHistoryResponse = false;
    this.isHistoryDataMessage = false;
    this.historyExecutionDropdownList = [];
    this.historyExecutionData = [];
    this.queryStringHistoryTable = "";
    this.historyDefaultDropdownValue = "Activity";
    this.isHistoryLoading = true;
    let objGet = {};
    if (id === undefined) {
      objGet = {
        "asset_action_id": this.historyRetryId,
        "type": this.pageType
      };
    } else {
      this.historyRetryId = id;
      objGet = {
        "asset_action_id": id,
        "type": this.pageType
      };
    }
    this._appService.historyAssetControlData(objGet).subscribe((historyData) => {
      this.isHistoryLoading = false;
      if (historyData.status === 'success') {
        this.historyExecutionDropdownList = historyData.data;
        if (this.historyExecutionDropdownList.length > 0) {
          this.actionHistoryInfo(this.historyExecutionDropdownList[0].execution_id);
        }
      }
      else {
        this.isHistoryResponse = false;
        this.isHistoryExecutionTableLoadMore = false;
        this.isHistoryDataMessage = true;
      }
    }, (err) => {
      console.log(err);
      this.isHistoryLoading = false;
      this.isHistoryResponse = true;
      this.isHistoryDataMessage = false;
    });
  }
  /**
   * @param id for the respective execution id
   * Method for showing the execution data in the table
   */
  actionHistoryInfo(id) {
    this.isHistoryExecutionTableLoadMore = false;
    this.isHistoryLoading = true;
    this.isHistoryResponse = false;
    this.isHistoryDataMessage = false;
    this.queryStringHistoryTable = "";
    this.isHistoryExecutionTableLoadMore = false;
    let objGet = {
      "execution_id": id,
      "type": this.pageType
    };
    for (let i = 0; i < this.historyExecutionDropdownList.length; i++) {
      if (this.historyExecutionDropdownList[i].execution_id === id) {
        this.historyDefaultDropdownValue = this.historyExecutionDropdownList[i].date_and_time + " by " + this.historyExecutionDropdownList[i].triggered_by
      }
    }
    this._appService.historyInfoAssetControlData(objGet).subscribe((historyInfoData) => {
      this.isHistoryLoading = false;
      if (historyInfoData) {
        this.isHistoryDataMessage = false;
        this.historyExecutionData = historyInfoData;
        this.historyExecutionTable = historyInfoData.body_content;
        if (this.historyExecutionTable.length >= this.finalRangeHistoryExecutionTable) {
          this.isHistoryExecutionTableLoadMore = true;
        }
      } else {
        this.historyExecutionData = [];
        this.isHistoryExecutionTableLoadMore = false;
        this.isHistoryDataMessage = true;
        this.isHistoryResponse = false;
      }
    }, (err) => {
      console.log(err);
      this.isHistoryLoading = false;
      this.isHistoryResponse = true;
      this.isHistoryDataMessage = false;
    });
  }
  /**
   * Load the rest of the execution data in the table
   */
  loadMoreHistoryLists() {
    this.finalRangeHistoryExecutionTable = this.finalRangeHistoryExecutionTable + 30;
    if (this.finalRangeHistoryExecutionTable >= this.historyExecutionTable.length)
      this.isHistoryExecutionTableLoadMore = false;
  }
  /**
   * Cancel history data modal
   */
  cancelHistoryInfoModal() {
    this.historyExecutionDropdownList = [];
    this.historyExecutionData = [];
    this.queryStringHistoryTable = "";
    this.isHistoryExecutionTableLoadMore = false;
    this.finalRangeHistoryExecutionTable = 30;
  }

  /**
   * Method for creating a new action
   *  * Method for going to the edit/configuration page
   *  * Method for scheduling the action in configuration
   *   * @param id for the respective asset_action_id
   */
  onClickAssetActions(mode:string, id?:string) {
    if (mode) {
      if (mode === 'create') {
        this._router.navigate([this.pageUrl, mode]);
      }
      else if (mode === 'edit') {
        this._router.navigate([this.pageUrl, mode, id]);
      }
      else if (mode === 'schedule') {
        this._router.navigate([this.pageUrl, mode, id], { queryParams: { 'schedule': true } });

      }
    }
  }


  /**For trackBy in *ngFor of assetControlList*/
  trackAssetControlList(index) {
    return index;
  }

}

