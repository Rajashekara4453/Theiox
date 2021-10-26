import { Component, Input, OnInit } from '@angular/core';
import { AppService } from '../../../app/services/app.service';

@Component({
  selector: 'kl-asset-control-more-info',
  templateUrl: './asset-control-more-info.component.html',
  styleUrls: [
    './asset-control-more-info.component.scss',
    '../../pages/assest-control-list/assest-control-list.component.scss'
  ]
})
export class AssetControlMoreInfoComponent implements OnInit {
  @Input() action_id: String;
  @Input() headerLabelName: String;
  @Input() pageType: String;
  @Input() headerTitle: String = 'More Info';
  @Input() typeOfAction: String = 'action';

  isMoreInfoLoading: boolean = false;
  isActionMoreInfoResponse: boolean;
  actionMoreInfoData: any = [];
  isActionMoreInfoLoadMore: boolean;
  historyRetryId: any;
  actionMoreInfoTable: any;
  isActionMoreInfoSchedule: any;
  finalRangeActionMoreInfoTable: any;
  isActionMoreInfoData: boolean;
  hideTemplateContents = false;

  constructor(private _appService: AppService) {}

  ngOnInit() {}
  ngOnChanges() {
    this.action_id.includes('asset_action_')
      ? this.moreInfoForAction(this.action_id)
      : null;
  }

  moreInfoForAction(id, actionName?) {
    this.typeOfAction === 'scada'
      ? (this.hideTemplateContents = true)
      : (this.hideTemplateContents = false);
    this.actionMoreInfoData = [];
    this.isMoreInfoLoading = true;
    this.isActionMoreInfoResponse = false;
    this.isActionMoreInfoData = false;
    this.isActionMoreInfoLoadMore = false;
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
    this._appService.moreInfoAssetControlData(objGet).subscribe(
      (moreInfoData) => {
        this.isMoreInfoLoading = false;
        if (moreInfoData && !moreInfoData.status) {
          this.actionMoreInfoData = moreInfoData;
          this.actionMoreInfoTable = moreInfoData.body_content;
          this.headerLabelName = '- ' + moreInfoData['action_name'];
          this.isActionMoreInfoSchedule = moreInfoData.schedule.schedule;
          if (
            moreInfoData.body_content.length >=
            this.finalRangeActionMoreInfoTable
          ) {
            this.isActionMoreInfoLoadMore = true;
          }
        } else {
          this.isActionMoreInfoData = true;
          this.isActionMoreInfoLoadMore = false;
        }
      },
      (err) => {
        console.log(err);
        this.isMoreInfoLoading = false;
        this.isActionMoreInfoResponse = true;
      }
    );
  }

  moreInfoCancel() {
    this.actionMoreInfoData = [];
    this.finalRangeActionMoreInfoTable = 10;
    this.isActionMoreInfoData = false;
    this.isActionMoreInfoResponse = false;
  }
}
