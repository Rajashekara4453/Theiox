import { AfterContentInit,Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'kl-horizontal-vertical-bar',
  templateUrl: './horizontal-vertical-bar.component.html',
  styleUrls: ['./horizontal-vertical-bar.component.scss']
})
export class HorizontalVerticalBarComponent implements OnInit, OnChanges,AfterContentInit {

  @Input() widgetData: any;
  scaleValues = [];
  benchmarks = [
  ]
  scaleMaxValue = 0;
  viewBoxWidth = 400;
  scaleMinValue: any = '';
  pointerValue = 0;
  pointerObject = {
    pointerValue: '',
    fromwidth: '-15 0',
    towidth: ''
  };
  @ViewChild("outlet", { read: ViewContainerRef }) outletRef: ViewContainerRef;
  @ViewChild("content", { read: TemplateRef }) contentRef: TemplateRef<any>;
  assetLabel: any;
  unitLabel: any;

  constructor() { }
  ngOnInit() {

    this.scaleMaxValue = this.widgetData['cData'].chartOptions.maxValue;
    this.scaleMinValue = this.widgetData['cData'].chartOptions.minValue;
    if (this.widgetData['cData']['chartOptions'].benchmark.length > 0) {
      this.benchmarks = [...this.widgetData['cData']['chartOptions'].benchmark];
      this.getWidthForrect();
    } else {
      this.defaultBar();
    }
    this.calculate();
  }

  // #24A148 #f7bd5f #EE4040
  ngOnChanges(changes: SimpleChanges) {
    if (changes['widgetData']) {
      this.calculate();
      this.rerender();
    }
  }

  ngAfterContentInit() {
    this.rerender();
  }

  private rerender() {
    this.outletRef.clear();
    this.outletRef.createEmbeddedView(this.contentRef);
  }

  defaultBar() {
    let eachRectWidth = this.viewBoxWidth/3;
    let difference = (this.scaleMaxValue - this.scaleMinValue) / 3;
    let colors = {
      "0":"#24A148",
      "1":"#f7bd5f",
      "2":"#EE4040"
    }
    for(let i=0;i<3;i++) {
      let pushObj = {
        color:colors[i],
        value:0,
        width:0
      }
      pushObj['value']=i==0?difference:difference + this.benchmarks[i-1]['value'];
      pushObj['width']=i==0?eachRectWidth:eachRectWidth + this.benchmarks[i-1]['width'];
      this.benchmarks.push(pushObj)
    }
    this.benchmarks = this.benchmarks.sort(function (a, b) { return b.width - a.width });
    // console.log(this.benchmarks)
  }

  calculate() {
    let parts = 5;
    this.scaleValues = [];
    let difference = (this.scaleMaxValue-this.scaleMinValue) / 4;
    let newValue = this.scaleMinValue;
    for (let i = 0; i < parts; i++) {
      const obj = {
        value: null,
        width: null
      }
      newValue = i == 0 ? this.scaleMinValue : (difference + this.scaleValues[i - 1]['value']);
      obj['value'] = newValue;
      obj['width'] = i == 0 ? 0 : this.scaleValues[i-1]['width']+100;
      this.scaleValues.push(obj)
    }
    // console.log(this.scaleValues)
    this.getPointerValue();
  }

  getPointerValue() {
    if (this.widgetData['cData']['chartData']!=undefined && this.widgetData['cData']['chartData'].hasOwnProperty('series') && this.widgetData['cData']['chartData'].series.length > 0
    // && this.widgetData['cData']['chartData'].series[0].hasOwnProperty('data') && this.widgetData['cData']['chartData'].series[0].data.length > 0 
    ) {
      let mqttValue :any;
      this.assetLabel = this.widgetData['cData'].chartData.series[0].name;
      this.unitLabel = this.widgetData['cData'].chartData.series[0].unit;
      if(this.widgetData['cData']['chartData'].series[0].hasOwnProperty('data')){
        mqttValue = this.widgetData['cData']['chartData'].series[0].data[0].value;
      }else{
        mqttValue = 0;
      }
      this.pointerValue = this.getPointerWidth(mqttValue);
      this.pointerObject['pointerValue'] = mqttValue;
      this.pointerObject['unitlabel'] = this.unitLabel;
      this.pointerObject['towidth'] = this.pointerValue > this.viewBoxWidth ? '385' : this.getPointer(this.pointerValue);
      this.pointerObject['fromwidth'] = this.pointerObject['towidth'];
    }
  }

  getPointer(pointerValue) {
    return (pointerValue - 15) + ' 0';
  }

  getPointerWidth(mqttValue){
    let rangeValue = this.scaleValues.find((currentValue, index, arr)=>{
      return currentValue.value>mqttValue;
    })
    return rangeValue!=undefined?(mqttValue * rangeValue['width']) / rangeValue['value']:400;
  }

  getTextLabelwidth(currentRectWidth, nextRectWidth) {
    return (((currentRectWidth - nextRectWidth) / 2) + nextRectWidth) - 14;
  }

  getRectLabels(i) {
    let labeWidth = i <this.benchmarks.length-1 ? this.getTextLabelwidth(this.benchmarks[i].width, this.benchmarks[i + 1].width) : (this.benchmarks[i].width / 2)-14;
    return labeWidth
  }
  getDvalues(pa, type) {
    let value;
    let pathID = pa['width'];
    value = type == 'path' ? 'M' + pathID + ',94.2L' + pathID + ', 102' : pathID;
    return value;
  }

  getWidthForrect() {
    for (let i = 0; i < this.benchmarks.length; i++) {
      let increment = i==0?this.scaleMaxValue:this.benchmarks[i]['value'];
      this.benchmarks[i]['width'] = ((increment * this.viewBoxWidth) / this.scaleMaxValue)
    }
    this.benchmarks = this.benchmarks.sort(function (a, b) { return b.width - a.width });
    // console.log(this.benchmarks);
    this.getTextWidth();
  }

  getTextWidth() {
    for (let i = 0; i < this.benchmarks.length; i++) {
      this.benchmarks[i]['textLabelWidth'] = this.getRectLabels(i);
    }
    // console.log(this.benchmarks)
  }

  getViewboxvalues() {
    let height = this.widgetData['cData'].chartOptions.isHorizontal?'0 0 400 136':'0 0 136 400';
    return height;
  }

}
