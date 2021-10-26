import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { EchartUtilityFunctions } from '../utilityfunctions';
import { globals } from '../../../../../../utilities/globals';


@Component({
  selector: 'kl-e-bar',
  templateUrl: './e-bar.component.html',
  styleUrls: ['./e-bar.component.scss']
})
export class EBarComponent implements OnInit {
  @Input('chartInfo') chartInfo = undefined;

  public options: any;

  public tempChartInfo = '';

  constructor(
    private _util: EchartUtilityFunctions,
    private global:globals
  ) { }

  ngOnInit() {
    // console.log('onInit', this.chartInfo);
    this.createOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartInfo']) {
      this.createOptions();
    }
  }
  createOptions(): any {
    const refObj = this;
    if (!this.chartInfo['cData'] || (this.tempChartInfo === JSON.stringify(this.chartInfo['cData'].chartData))) {
      return
    }
    let showYGrid = true;
    let showXGrid = false;
    // console.log("this",this.chartInfo)
    if (this.chartInfo['cData']['chartOptions']['grid']) {
      showYGrid = this.chartInfo['cData']['chartOptions']['grid']['yGridLine'];
      showXGrid = this.chartInfo['cData']['chartOptions']['grid']['xGridLine'];
    }
    const yaxisInfo = this._util.getYaxisConfig(this.chartInfo['cData']['chartOptions'].yaxis, showYGrid);
    this.chartInfo['cData'].chartData.series = this._util.getSeriesDataUpdatedWithYaxisIndex(this.chartInfo['cData'].chartData.series, yaxisInfo['yAxisIndex']);
    this.chartInfo['cData'].chartData.series = this._util.updateTreasholdAndBenchmarkToSeries(this.chartInfo['cData'].chartData.series);
    if (this.chartInfo.cData.chartOptions.filter.hasOwnProperty('compare') && this.chartInfo.cData.chartOptions.filter.compare.comparison) {
      if(this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series != undefined && this.chartInfo['cData'].chartData.series.length>0) {
        this.chartInfo['cData'].chartData.series = this._util.assignColorOnlyComparsion(this.chartInfo['cData'].chartData.series);
      }
    } else if(this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series != undefined && this.chartInfo['cData'].chartData.series.length>0) {
      this.chartInfo['cData'].chartData.series = this._util.updateColor(this.chartInfo['cData'].chartData.series,this.global._appConfigurations['colors']);
    }
  
    this.options = {
       grid: {
        containLabel:true
    },
      xAxis: {
        type: 'category',
        axisLine:{onZero:true},
        splitLine: {
          show: showXGrid
        },
        name: this._util.getXaxisLabel(this.chartInfo['cData']['chartOptions'].xaxis),
        axisLabel: {
          formatter: function (value, index) {
            return refObj.formatDate(value);
          }
        },
        axisTick:{
          alignWithLabel:true
        },
        axisPointer: {
          label: {
            formatter: function (value, index) {
              return refObj.formatDate(value.value);
            }
          }
        },
        data: this.chartInfo['cData'].chartData.category
      },
    
      dataZoom: [{
        type: 'inside'
      }],
      tooltip: {
        confine:true,
      },
      yAxis: yaxisInfo['yaxis'],
      legend:this._util.getLegendOptions(this.chartInfo['cData']['chartOptions'].legend),
      series: this.chartInfo['cData'].chartData.series
    };
    
    /** Horizontal Orientation */
    if(this.chartInfo.cData.chartOptions.bar_orientation === 'horizontal'){
      let newYaxis = this.options.xAxis;
      this.options.xAxis = yaxisInfo['yaxis'];
      this.options.yAxis = newYaxis;
      for(let _zoom of this.options.dataZoom){
        _zoom.yAxisIndex = 0;
      }
      if(this.options.series){
        for(let _series of this.options.series){
          _series.xAxisIndex = _series.yAxisIndex;
          delete _series.yAxisIndex;
          if(_series.benchmark || _series.threshold){
            for(let _benchmark of _series.markLine.data){
              _benchmark.xAxis = _benchmark.yAxis;
              delete _benchmark.yAxis;
            }
          }
        }
      }
      let horizontalOffset:number = 0;
      for(let i = 0; i < this.options.xAxis.length; i++){
        if(i == 0){
          this.options.xAxis[i].position = 'bottom';
        } else {
          this.options.xAxis[i].position = 'top';
        }
        if(i > 1){
          horizontalOffset = horizontalOffset + 50;
        }
        this.options.xAxis[i].offset = horizontalOffset;
      }
    }
    this.options['color'] = this._util.colors;
    if (this.chartInfo['cData']['chartOptions'].autoRefreshType && this.chartInfo['cData']['chartOptions'].autoRefreshType === 'realTime') {
      this.options.xAxis.type = 'time'
      delete this.options.xAxis.data;
    }
    this.tempChartInfo = JSON.stringify(this.chartInfo['cData'].chartData);
  }

  // ngDoCheck() {
  //   this.createOptions();
  // }

  formatDate(value) {
    try {
      const cOption = this.chartInfo['cData']['chartOptions'];
      if (!cOption.autoRefreshType || cOption.autoRefreshType !== 'realTime') {
        return value;
      }
      return this._util.getDateTimeFormatted(value, cOption.xaxis.format);
    } catch (error) {
      console.log(error);
      return value;
    }
  }
  
  getGridOption() {
    let grid: any = {
      containLabel: false,
      left: 50,
      right: 50,
      top: 30,
      bottom: 30
    }
    const cOption = this.chartInfo['cData']['chartOptions'];
    if (cOption.legend && cOption.legend.show && cOption.legend.position) {
      delete grid[cOption.legend.position]
    }
    return {};
  }
}
