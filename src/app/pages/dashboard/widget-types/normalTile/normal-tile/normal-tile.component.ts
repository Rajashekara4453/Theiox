import { Component, OnInit, Input, SimpleChanges} from '@angular/core';

@Component({
  selector: 'kl-normal-tile',
  templateUrl: './normal-tile.component.html',
  styleUrls: ['./normal-tile.component.scss'],
})
export class NormalTileComponent implements OnInit {

  @Input() cData;

  labelValue: String;
  labelUnit: String; 
  percentageVal: any = 0.00;
  doCompare: boolean;
  isShowArrow: boolean;
  isPositive: boolean = false;
  differenceValue: number;
  secondValue: any;
  title: any;
  priorityList: any;
  textColor:string;
  showFooter: boolean = false;
  condition: any;
  
  constructor() { }

  ngOnInit() {
    this.getCopy();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.getCopy()
    }
  }

  getCopy(){
    const refObj = this;
    if (!this.cData.hasOwnProperty('chartData') || !this.cData['chartData'].hasOwnProperty('series') || this.cData.chartData.series.length <= 0 ) {
      return
    }
    this.title = this.cData.chartData.series[0]['name']
    if (this.cData.chartOptions.filter.hasOwnProperty('compare') && this.cData.chartOptions.filter.compare.comparison) {
      this.doCompare = true;
      this.comparedView();
    } else {
      this.doCompare = false;
      if(this.cData.chartOptions.hasOwnProperty('benchmark')){
        this.priorityList = this.cData.chartOptions.benchmark;
        this.showFooter = this.priorityList.length>0?true:false;
      }
      this.nonComparedView();
    }
  }

  nonComparedView(){
   if(this.cData.chartData.series[0].hasOwnProperty('data') && this.cData.chartData.series[0].data.length>0){
    this.labelValue = this.cData.chartData.series[0].data[this.cData.chartData.series[0].data.length - 1][1];
    this.labelUnit = this.cData.chartOptions.yaxis[0]['name'];
    if(this.cData.chartOptions.autoRefreshType == 'realTime' && this.cData.chartOptions.hasOwnProperty('benchmark')){ 
      for(let i=0;i<this.priorityList.length;i++) {
        if(this.priorityList[i].hasOwnProperty('condition') && this.priorityList[i]['condition']!=null&&
         eval(this.labelValue + this.priorityList[i]['condition']['value'] + this.priorityList[i].value)) {
            this.textColor = this.priorityList[i].color;
            this.condition = this.priorityList[i]['condition']['value'];
            return; 
          } else {
            this.textColor = '#24A148';
          }
      }
    }
   } else {
     this.labelValue = '';
     this.labelUnit = '';
   }
  }

  comparedView(){
    const viewData = this.cData.chartData;
   if(viewData.hasOwnProperty('series') && this.cData.chartData.series.length>1 && this.cData.chartData.series[0].hasOwnProperty('data')
   && this.cData.chartData.series[0].data.length>0 && this.cData.chartData.series[1].data.length>0) {
    this.differenceValue = viewData.series[0].data[0][1]-viewData.series[1].data[0][1];
    this.labelValue = viewData.series[0].data[0][1];
    this.labelUnit = this.cData.chartOptions.yaxis[0]['name'];
    this.secondValue = viewData.series[1].data[0][1];
    if(this.differenceValue>0 && this.secondValue!=0){
      this.isPositive = true;
      this.percentageVal = ((this.differenceValue/viewData.series[1].data[0][1])*100).toFixed(2);
    } else if(this.differenceValue!=0 && this.secondValue!=0){
      this.isPositive = false;
      this.percentageVal = (((this.differenceValue * -1)/viewData.series[1].data[0][1])*100).toFixed(2);  
    } else {
      this.percentageVal = 0;
    }
   } else {
    this.labelValue = '';
    this.labelUnit = '';
    this.percentageVal = 0;
  }
  }

  getColorDifference() {
    if (this.differenceValue >= 0) {
      this.isPositive = true;
      return this.cData.chartOptions.yaxis[0].isInverse? 'arrow-color-down' : 'arrow-color-up';
    } else {
      this.isPositive = false;
      return this.cData.chartOptions.yaxis[0].isInverse? 'arrow-color-up' : 'arrow-color-down';
    }
}

  // ngDoCheck() {
  //   this.getCopy();
  // }

}
