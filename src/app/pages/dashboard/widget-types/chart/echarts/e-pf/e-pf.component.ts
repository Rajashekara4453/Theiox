import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { EchartUtilityFunctions } from '../utilityfunctions';
import { globals } from '../../../../../../utilities/globals';

@Component({
  selector: 'kl-e-pf',
  templateUrl: './e-pf.component.html',
  styleUrls: ['./e-pf.component.scss']
})
export class EPfComponent implements OnInit {

  @Input('chartInfo') chartInfo = undefined;
  public options;

  public tempChartInfo = '';

  constructor(
    private _util: EchartUtilityFunctions,
    private global:globals
  ) { }

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
    if (!this.chartInfo['cData'] || (this.tempChartInfo === JSON.stringify(this.chartInfo['cData'].chartData))) {
      return
    }
    let showYGrid = true;
    let showXGrid = false;
    if(this.chartInfo['cData']['chartOptions']['grid']){
      showYGrid = this.chartInfo['cData']['chartOptions']['grid']['yGridLine'];
      showXGrid = this.chartInfo['cData']['chartOptions']['grid']['xGridLine'];
    }
    const yaxisInfo = this._util.getYaxisConfig(this.chartInfo['cData']['chartOptions'].yaxis,showYGrid);
    this.chartInfo['cData'].chartData.series = this._util.getSeriesDataUpdatedWithYaxisIndex(this.chartInfo['cData'].chartData.series, yaxisInfo['yAxisIndex']);
    if(this.chartInfo['cData'].chartData.yaxisData!=undefined) {
    this.chartInfo['cData'].chartData.series = this._util.updateTreasholdAndBenchmarkToSeries(this.chartInfo['cData'].chartData.series,this.chartInfo['cData'].chartData.yaxisData,this.chartInfo.isPf);
    }
    if(this.chartInfo['cData'].chartData && this.chartInfo['cData'].chartData.series) {
      const index = this.chartInfo['cData'].chartData.series.findIndex(ser => ser.type === 'area');
      if(index > -1) {
        this.chartInfo['cData'].chartData.series[index].type = 'line';
        this.chartInfo['cData'].chartData.series[index]['areaStyle'] = {};
      }
    }
    if(this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series != undefined && this.chartInfo['cData'].chartData.series.length>0) {
      this.chartInfo['cData'].chartData.series = this._util.updateColor(this.chartInfo['cData'].chartData.series,this.global._appConfigurations['colors']);
    }
        this.options = {
      grid: {
        containLabel:true
    },
      xAxis: {
        type: 'category',
        splitLine: {
          show: showXGrid
        },
        name: this._util.getXaxisLabel(this.chartInfo['cData']['chartOptions'].xaxis),
        axisLabel: {
          formatter: function (value, index) {
            return refObj.formatDate(value);
          }
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
      yAxis: yaxisInfo['yaxis'],
      legend: this._util.getLegendOptions(this.chartInfo['cData']['chartOptions'].legend),
      tooltip: {
        trigger: 'axis',
        confine:true,
        axisPointer: {
          type: 'cross'
        }        
    },
      series: this.chartInfo['cData'].chartData.series,
    };
    if(this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series != undefined && this.chartInfo['cData'].chartData.series.length>0) {
    this.options.yAxis.forEach(element => {
      element.data=this.chartInfo['cData']['chartData'].yaxisData;
    });
  }
    this.options['color'] = this._util.colors;
    if(this.chartInfo['cData']['chartOptions'].autoRefreshType && this.chartInfo['cData']['chartOptions'].autoRefreshType === 'realTime') {
      this.options.xAxis.type = 'time'
      delete this.options.xAxis.data;
    }
    this.tempChartInfo = JSON.stringify(this.chartInfo['cData'].chartData);
  }

  // ngDoCheck() {
  //   this.createOptions();
  // }

  formatDate(value){
    try {
      const cOption = this.chartInfo['cData']['chartOptions'];
      if(!cOption.autoRefreshType || cOption.autoRefreshType !== 'realTime') {
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
    if(cOption.legend && cOption.legend.show && cOption.legend.position) {
      delete grid[cOption.legend.position]
    }
    return {};
  }


}
