import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'kl-e-gauge',
  templateUrl: './e-gauge.component.html',
  styleUrls: ['./e-gauge.component.scss']
})
export class EGaugeComponent implements OnInit {
  @Input('chartInfo') chartInfo = undefined;
  public options: any;
  // gaugeBenchmarkValue: number;
  public tempChartInfo = '';
  interval: NodeJS.Timer;

   constructor() { }

  ngOnInit() {
    this.createOptions();  
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.createOptions();
    }
  }

  createOptions(): any {
    const refObj = this;
      this.checkNan();
    if (!this.chartInfo['cData'] || (this.tempChartInfo === JSON.stringify(this.chartInfo['cData'].chartData.series))) {
      return
    }
    let series ;
    let title = ''
   
    if (this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series.length > 0) {
      this.chartInfo['cData'].chartData.series[0]['radius'] = '100%';
      this.chartInfo['cData'].chartData.series[0]['height'] = '100%';
      this.chartInfo['cData'].chartData.series[0]['max'] = this.chartInfo.cData.chartOptions.maxValue;
      this.chartInfo['cData'].chartData.series[0]['min'] = this.chartInfo.cData.chartOptions.minValue;
      this.chartInfo['cData'].chartData.series[0]['axisLine'] = {
        'lineStyle': {
          'width': 12,
          'color': [[0.4, '#24A148'], [0.7, '#f7bd5f '], [1, '#EE4040']]
        }
      };
      if (this.chartInfo['cData'].chartOptions.hasOwnProperty('benchmark') && this.chartInfo['cData'].chartOptions.benchmark.length > 1) {
        series = this.benchmarValue();
      }
    
      /** This commented part can be deleted in later versions
       *  Now this feature is handled in wdg-display.ts,
       *  before sending the request to server for getting the data of the widget
      // if (this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series.length > 1) {
      //   series = this.chartInfo['cData'].chartData.series.slice(0, 1);
      //  } else {
      //  series = this.chartInfo['cData'].chartData.series;
      //  }
      */
       series = this.chartInfo['cData'].chartData.series;
      let labelUnit = this.chartInfo['cData'].chartOptions.yaxis[0]['name'];
      if (labelUnit !== "") { labelUnit = " " + labelUnit; }
      this.chartInfo['cData'].chartData.series[0]['detail'] =
      {
        formatter: '{value|{value}}{labeUnit|' + labelUnit + '}',
        rich: {
          value: {
            fontFamily: 'Roboto',
            fontSize: 22,
            verticalAlign: 'bottom',
            fontWeight: 500,
          },
          labeUnit: {
            fontFamily: 'Roboto',
            fontSize: 16,
            verticalAlign: 'bottom',
            padding: [1, 0, 0, 0],
            fontWeight: 500,
          }
        },
        'shadowBlur': 5,
        'width': '100%',
        'offsetCenter': ['0%', '70%'],
        'textStyle': {
          'color': 'auto',
        }
      
  };
  this.chartInfo['cData'].chartData.series[0]['axisTick'] ={
    length:6,
    lineStyle:{
      color: '#fff',
      width:2,
    }
};
  this.chartInfo['cData'].chartData.series[0]['axisLabel']={
    distance:8,
    formatter: function (value) {
      if (Number.isInteger(value)) {
        return value.toFixed(0);
      } else {
        return value.toFixed(2);
      }
    }
  };
this.chartInfo['cData'].chartData.series[0]['splitLine'] ={
  length:10,
  lineStyle:{
    width:3,
    color: '#fff',
  }
}
this.chartInfo['cData'].chartData.series[0]['startAngle'] = 215,
this.chartInfo['cData'].chartData.series[0]['endAngle'] = -35,

  this.chartInfo['cData'].chartData.series[0]['splitNumber'] = 6
 
    }
    // this.chartInfo['cData'].chartData.series[0]['data'][0]['name'] = this.chartInfo['cData'].chartData.series[0]['unit']; 
    if (series && series[0] && series[0]['name'] != '') {
      title = this.chartInfo['cData'].chartData.series[0]['name'];
    }
    this.options = {
      title: {
        text: title,
        textStyle:
        {
          fontFamily: 'Roboto-Regular',
          fontSize: 14,
          fontWeight: 400,
          color: '#868ca0',
        },
        top: "bottom",
        left: 'center',
      },
      tooltip: {
        formatter: "{a} <br/>{b}  {c}"
      },
      series: series
    };
    this.tempChartInfo = JSON.stringify(this.chartInfo['cData'].chartData.series);
  }

  // ngDoCheck() {
  //   this.createOptions();
  // }

  formatDate(value) {
    try {
      let date = new Date(value);
      let tmpMonth = String(date.getMonth() + 1);
      let tmpDay = String(date.getDate() + 1);
      if (tmpMonth.length < 2) {
        tmpMonth = `0${tmpMonth}`
      }
      if (tmpDay.length < 2) {
        tmpDay = `0${tmpDay}`
      }
      let texts = [tmpDay, tmpMonth, date.getFullYear()];
      let time = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')
      return texts.join('/') + ' ' + time;
    } catch (error) {
      console.log(error);
      return value;
    }
  }
  benchmarValue() {
    let rangeCal = this.chartInfo.cData.chartOptions.maxValue - this.chartInfo.cData.chartOptions.minValue;
    let benchmarkLength = this.chartInfo['cData'].chartOptions.benchmark.length;
    let chartBenchmarkData = this.chartInfo.cData.chartData.series[0].axisLine.lineStyle.color;
    for (let i = 0; i < benchmarkLength; i++) {
      if(i==0){
        chartBenchmarkData[benchmarkLength-1][0] = 1;
        chartBenchmarkData[benchmarkLength-1][1] = this.chartInfo.cData.chartOptions.benchmark[i].color;
      }else{
        let gaugeBenchmarkValue = (this.chartInfo.cData.chartOptions.benchmark[i].value - this.chartInfo.cData.chartOptions.minValue)/rangeCal;
        chartBenchmarkData[i-1][0] = gaugeBenchmarkValue;
        chartBenchmarkData[i-1][1] = this.chartInfo.cData.chartOptions.benchmark[i].color;
      }
    };
    chartBenchmarkData.sort();
     return this.chartInfo.cData.chartData.series;
   
  }
  checkNan(){
    if(this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series.length>0 && !this.chartInfo['cData'].chartData.series[0].hasOwnProperty('data')){
   this.chartInfo['cData'].chartData.series[0]['data']=
   [{
       name:'',
       value:"0"
   }]
 }
}
}