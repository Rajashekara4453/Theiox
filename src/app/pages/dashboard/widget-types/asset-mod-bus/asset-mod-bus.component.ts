import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AppService } from '../../../../services/app.service';


@Component({
  selector: 'kl-asset-mod-bus',
  templateUrl: './asset-mod-bus.component.html',
  styleUrls: ['./asset-mod-bus.component.scss']
})
export class AssetModBusComponent implements OnInit {
  @Input() vData: any;
  @Output() assetActionEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionEmitter: EventEmitter<any> = new EventEmitter<any>();
  chartOptions: any;
  chartConfg:any;
  labelValue: String = '-';
  labelUnit: string;
  widgetTitle: any;
  conditionController: any;
  actionBgColor: any;
  conditionVal: any;
  isHistoryExecutionTableLoadMore: boolean;
  isHistoryLoading: boolean = false;
  historyExecutionTable = [];
  queryStringHistoryTable = "";
  initialRangeHistoryExecutionTable = 0;
  finalRangeHistoryExecutionTable = 25;
  isHistoryDataMessage: boolean = false
  historyExecutionData = [];
  historyDefaultDropdownValue = "Activity";
  historyExecutionDropdownList = [];
  isHistoryResponse: boolean = false;
  historyRetryId: any;
  headerLabelName: any;
  retryActionId: any;
  headerWidgetLabel: any;
  isOnImageTriggerable: boolean=false;
  timeCounter:number;
  intervalToDestroy: NodeJS.Timer;
  timer:number;
  isImageOn: boolean=false;
  isImageOff: boolean=false;

  constructor( private _appService: AppService,
    private toastLoad: ToastrService,) { 
   
  }

  ngOnInit() {
    this.chartConfg=this.vData;
    this.widgetTitle=this.vData.title;
    if(this.vData.cData.hasOwnProperty('chartData') && this.vData.cData.chartData.hasOwnProperty('series') && this.vData.cData.chartData.series.length>0 
    && this.vData.cData.chartData.series[0].hasOwnProperty('data') && this.vData.cData.chartData.series[0].data.length>0
    ){
      this.seriesData();
      this.checkBubbleColor();
    }
     this.chartOptions=this.vData.cData.chartOptions;
   
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.labelUnit = this.vData.cData.chartOptions.yaxis[0]['name'];
      if(this.vData.cData.hasOwnProperty('chartData') && this.vData.cData.chartData.hasOwnProperty('series') &&  this.vData.cData.chartData.series.length>0
      && this.vData.cData.chartData.series[0].hasOwnProperty('data') && this.vData.cData.chartData.series[0].data.length>0
      ){
       this.seriesData();
       this.checkBubbleColor();

     }
    }
  }
  triggerAction(labelData){
    let triggerInput={
      asset_action_id:labelData.labelActionId,
      label:labelData.label,
      type:"dashboard"
    }
    this.assetActionEmitter.emit(triggerInput);
  }
seriesData(){
  this.labelValue=this.vData.cData.chartData.series[0].data[this.vData.cData.chartData.series[0].data.length - 1][1];
  if(this.labelValue!=="" && this.labelValue!==null){
    this.conditionsData();
  }
 
}

conditionsData(){
  this.actionBgColor = '';
  this.conditionController =this.vData.cData.chartOptions.assetControls;
  if(!this.vData.cData.chartOptions.isAction && !this.vData.cData.chartOptions.isActionEnabled) {
this.conditionController=[];
  }
  for(let i=0;i<this.conditionController.length;i++) {
    if(this.conditionController[i].hasOwnProperty('condition') &&
    this.getConditionState(this.conditionController[i])) {
        this.actionBgColor = this.getColor(this.conditionController[i].color);
        return; 
      }
  }
}
getColor(id) {
  let valueToReturn;
  if(this.vData.cData.chartOptions.isAction || this.vData.cData.chartOptions.isActionEnabled){
  if(id=="0"){
    valueToReturn = this.vData.cData.chartOptions.write_register[0]['color']
  } else {
    valueToReturn = this.vData.cData.chartOptions.write_register_actions[0]['color']
  }
  return valueToReturn;
}
}

getConditionState(eachCondition){
  let satisfy = false;
  if(eachCondition.isRangeValue && eachCondition.fromValue!=null && eachCondition.toValue!=null){
    if(eval(this.labelValue + ">" + eachCondition.fromValue) && 
  eval(this.labelValue + "<" + eachCondition.toValue)) {
    satisfy = true;
    this.isOnImageTriggerable=satisfy;
  }
  } else if(eachCondition.value!=null){
    satisfy = eval(this.labelValue + eachCondition['condition'] + eachCondition.value)
    this.isOnImageTriggerable=satisfy;
  }
  return satisfy
}
onImageActionTrigger(time:number){
 
  this.timer= time;
  setTimeout(() => {
    if(this.timer===0){
      document.getElementById("triggerActionOnImageBtn" + this.vData.widget_id).click();
    }else{
      this.onImageActionTrigger(--this.timer);
    }
  }, 1000);
  // }
  
}
checkBubbleColor(){
  if(this.chartOptions.hasOwnProperty('assetControls')){
    for(let i=0;i<this.chartOptions.assetControls.length;i++){
      if(this.chartOptions.assetControls[i].color=="0"){
        this.isImageOn=true;
        this.isImageOff=false
      }
      else if(this.chartOptions.assetControls[i].color=="1"){
        this.isImageOff=true;
        this.isImageOn=false;
      }
    }
  }
}
triggerConfirmModal(){
  this.timer=0
  for(let i=0;i<this.chartOptions.assetControls.length;i++){
    if(this.chartOptions.assetControls[i].color=="0"  ){
    let objGet = {
      "asset_action_id":'',
      "type": "dashboard"
    };
    objGet.asset_action_id=this.vData.cData.chartOptions.write_register_actions[0].labelActionId; 
    this._appService.triggerAssetControlData(objGet).subscribe((triggerResponse) => {
      if (triggerResponse['status'] === 'success') {
        this.toastLoad.toast('success', 'Success', 'Action Triggered Successfully', true);
      }
      else {
        this.toastLoad.toast('error', 'Error', 'Action Couldn`t Be Triggered', true);
      }
    }, (err) => {
      console.log(err);
      this.toastLoad.toast('error', 'Error', 'Failed To Reach Server', true);
    });
break;
  }
    if(this.chartOptions.assetControls[i].color=="1"){
    let objGet = {
      "asset_action_id":'',
      "type": "dashboard"
    };
  objGet.asset_action_id=this.vData.cData.chartOptions.write_register[0].labelActionId;
 
    this._appService.triggerAssetControlData(objGet).subscribe((triggerResponse) => {
      if (triggerResponse['status'] === 'success') {
        this.toastLoad.toast('success', 'Success', 'Action Triggered Successfully', true);
      }
      else {
        this.toastLoad.toast('error', 'Error', 'Action Couldn`t Be Triggered', true);
      }
    }, (err) => {
      console.log(err);
      this.toastLoad.toast('error', 'Error', 'Failed To Reach Server', true);
    });
break;
  }
}
  // }
}

triggerModalCancel(){
  this.timer=0
}

actionHistory(seriesData,id?){
  this.isHistoryExecutionTableLoadMore = false;
  // this.headerLabelName = actionName;
  this.isHistoryResponse = false;
  this.isHistoryDataMessage = false;
  this.historyExecutionDropdownList = [];
  this.historyExecutionData = [];
  this.queryStringHistoryTable = "";
  this.historyDefaultDropdownValue = "Activity";
  this.isHistoryLoading = true;
  let objGet = {};
  this.headerWidgetLabel=this.vData.title;
  if (id === 0) {
    this.headerLabelName=seriesData.label;
    this.retryActionId=seriesData.labelActionId
    objGet = {
      "asset_action_id":seriesData.labelActionId,
      "type":'dashboard'
    };
  }
  if (id === 1) {
    this.headerLabelName=seriesData.label;
    this.retryActionId=seriesData.labelActionId
    objGet = {
      "asset_action_id":seriesData.labelActionId,
      "type":'dashboard'
    };
  
    
  }
  else if(id===undefined) {
    objGet = {
      "asset_action_id":this.retryActionId,
      "type":'dashboard'
    };
  }
  
  this._appService.historyAssetControlData(objGet).subscribe((historyData) =>{
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
  } );
  
}
actionHistoryInfo(id){
  this.isHistoryExecutionTableLoadMore = false;
  this.isHistoryLoading = true;
  this.isHistoryResponse = false;
  this.isHistoryDataMessage = false;
  this.queryStringHistoryTable = "";
  this.isHistoryExecutionTableLoadMore = false;
  let objGet = {
    "execution_id": id,
    "type":'dashboard'
  };
  for (let i = 0; i < this.historyExecutionDropdownList.length; i++) {
    if (this.historyExecutionDropdownList[i].execution_id === id) {
      this.historyDefaultDropdownValue = this.historyExecutionDropdownList[i].date_and_time + " by " + this.historyExecutionDropdownList[i].triggered_by
    }
  }
  this._appService.historyInfoAssetControlData(objGet).subscribe((historyInfoData) => {
    this.isHistoryLoading = false;
    if (historyInfoData.body_content.length>0) {
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
cancelHistoryInfoModal() {
  this.historyExecutionDropdownList = [];
  this.historyExecutionData = [];
  this.queryStringHistoryTable = "";
  this.isHistoryExecutionTableLoadMore = false;
  this.finalRangeHistoryExecutionTable = 30;
}
trackAssetControlList(index) {
  return index;
}
}
