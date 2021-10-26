import { Component, Input, OnInit } from '@angular/core';
import { AppService } from '../../../app/services/app.service';

@Component({
  selector: 'kl-asset-control-history',
  templateUrl: './asset-control-history.component.html',
  styleUrls: [
    './asset-control-history.component.scss',
    '../../pages/assest-control-list/assest-control-list.component.scss'
  ]
})
export class AssetControlHistoryComponent implements OnInit {
  @Input() action_id: String;
  @Input() headerLabelName: String;
  @Input() pageType: String;
  @Input() headerTitle: String = 'History';

  isHistoryExecutionTableLoadMore: boolean;
  isHistoryResponse: boolean = false;
  isHistoryDataMessage: boolean = false;
  historyExecutionDropdownList = [];
  historyExecutionData = [];
  queryStringHistoryTable: string = '';
  historyDefaultDropdownValue: string = 'Activity';
  isHistoryLoading: boolean = false;
  historyRetryId: any;
  historyExecutionTable: any = [];
  finalRangeHistoryExecutionTable = 25;

  constructor(private _appService: AppService) {}

  ngOnInit() {}

  ngOnChanges() {
    this.action_id.includes('asset_action_')
      ? this.actionHistory(this.action_id)
      : null;
  }

  actionHistory(id, actionName?) {
    this.isHistoryExecutionTableLoadMore = false;
    this.isHistoryResponse = false;
    this.isHistoryDataMessage = false;
    this.historyExecutionDropdownList = [];
    this.historyExecutionData = [];
    this.queryStringHistoryTable = '';
    this.historyDefaultDropdownValue = 'Activity';
    this.isHistoryLoading = true;
    this.headerLabelName = '';
    let objGet = {};
    if (id === undefined) {
      objGet = {
        asset_action_id: this.historyRetryId,
        type: this.pageType
      };
    } else {
      this.historyRetryId = id;
      objGet = {
        asset_action_id: id,
        type: this.pageType
      };
    }
    this._appService.historyAssetControlData(objGet).subscribe(
      (historyData) => {
        this.isHistoryLoading = false;
        if (historyData.status === 'success') {
          this.historyExecutionDropdownList = historyData.data;
          historyData['action_name']
            ? (this.headerLabelName = '- ' + historyData['action_name'])
            : null;
          if (this.historyExecutionDropdownList.length > 0) {
            this.actionHistoryInfo(
              this.historyExecutionDropdownList[0].execution_id
            );
          }
        } else {
          this.isHistoryResponse = false;
          this.isHistoryExecutionTableLoadMore = false;
          this.isHistoryDataMessage = true;
          this.isHistoryLoading = false;
        }
      },
      (err) => {
        console.log(err);
        this.isHistoryLoading = false;
        this.isHistoryResponse = true;
        this.isHistoryDataMessage = false;
      }
    );
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
    this.queryStringHistoryTable = '';
    this.isHistoryExecutionTableLoadMore = false;
    const objGet = {
      execution_id: id,
      type: this.pageType
    };
    for (let i = 0; i < this.historyExecutionDropdownList.length; i++) {
      if (this.historyExecutionDropdownList[i].execution_id === id) {
        this.historyDefaultDropdownValue =
          this.historyExecutionDropdownList[i].date_and_time +
          ' by ' +
          this.historyExecutionDropdownList[i].triggered_by;
      }
    }
    this._appService.historyInfoAssetControlData(objGet).subscribe(
      (historyInfoData) => {
        this.isHistoryLoading = false;
        if (historyInfoData) {
          this.isHistoryDataMessage = false;
          this.historyExecutionData = historyInfoData;
          this.historyExecutionTable = historyInfoData.body_content;
          if (
            this.historyExecutionTable.length >=
            this.finalRangeHistoryExecutionTable
          ) {
            this.isHistoryExecutionTableLoadMore = true;
          }
        } else {
          this.historyExecutionData = [];
          this.isHistoryExecutionTableLoadMore = false;
          this.isHistoryDataMessage = true;
          this.isHistoryResponse = false;
          this.isHistoryLoading = false;
        }
      },
      (err) => {
        console.log(err);
        this.isHistoryLoading = false;
        this.isHistoryResponse = true;
        this.isHistoryDataMessage = false;
      }
    );
  }

  cancelHistoryInfoModal() {
    this.historyExecutionDropdownList = [];
    this.historyExecutionData = [];
    this.queryStringHistoryTable = '';
    this.isHistoryExecutionTableLoadMore = false;
    this.finalRangeHistoryExecutionTable = 30;
  }
}
