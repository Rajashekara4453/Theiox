import { Component, OnInit, Input } from '@angular/core';
import { EchartUtilityFunctions } from '../utilityfunctions';

@Component({
  selector: 'kl-stack-bar',
  templateUrl: './stack-bar.component.html',
  styleUrls: ['./stack-bar.component.scss']
})
export class StackBarComponent implements OnInit {

  @Input('chartInfo') chartInfo = undefined;



  public options: any;

  public tempChartInfo = '';

  constructor(
    private _util: EchartUtilityFunctions
  ) { }

  ngOnInit() {
    // console.log('onInit', this.chartInfo);
    this.createOptions();
  }

  ngOnChanges() {
    // console.log('changes', this.chartInfo);
    this.createOptions();
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
    if (this.chartInfo.cData.chartData.series !== undefined) {
      if (this.chartInfo.cData.chartOptions.filter.hasOwnProperty('compare') && this.chartInfo.cData.chartOptions.filter.compare.comparison && this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series.length>1) {
        this.chartInfo['cData'].chartData.series = this._util.assignColorOnlyComparsion(this.chartInfo['cData'].chartData.series);
      } 
    if ((this.chartInfo['cData']['chartOptions'].xaxis.stackBy == 'tagsunit') && (this.chartInfo['cData']['chartOptions'].xaxis.type == 'timeSeries')) {
      if (this.chartInfo['cData']['chartOptions'].xaxis.unitReference == 'convertedUnit') {
        for (let j = 0; j < this.chartInfo['cData']['chartOptions'].yaxis.length; j++) {
          for (let i = 0; i < this.chartInfo.cData.chartData.series.length; i++) {
            if (this.chartInfo['cData'].chartData.series[i].unit == this.chartInfo['cData']['chartOptions'].yaxis[j].unitInfo.label) {
              this.chartInfo['cData'].chartData.series[i]['stack'] = this.chartInfo['cData'].chartData.series[i].unit;
              this.chartInfo['cData'].chartData.series[i].type = 'bar';
              this.chartInfo['cData'].chartData.series[i].color = null;
            }
          }
        }
      }
      else if (this.chartInfo['cData']['chartOptions'].xaxis.unitReference == 'baseUnit') {

        for (let j = 0; j < this.chartInfo['cData']['chartOptions'].yaxis.length; j++) {
          for (let i = 0; i < this.chartInfo.cData.chartData.series.length; i++) {

            if (this.chartInfo['cData'].chartData.series[i].selectedUnit == this.chartInfo['cData']['chartOptions'].yaxis[j].tag.unit.label) {
              this.chartInfo['cData'].chartData.series[i]['stack'] = this.chartInfo['cData'].chartData.series[i].selectedUnit;
              this.chartInfo['cData'].chartData.series[i].type = 'bar';
              this.chartInfo['cData'].chartData.series[i].color = null;
            }

          }
        }
      }

    }
    else if ((this.chartInfo['cData']['chartOptions'].xaxis.stackBy == 'filtertype') && (this.chartInfo['cData']['chartOptions'].xaxis.type == 'timeSeries')) {
      if (this.chartInfo['cData']['chartOptions'].xaxis.unitReference == 'baseUnit') {
        for (let i = 0; i < this.chartInfo['cData'].chartData.series.length; i++) {
          this.chartInfo['cData'].chartData.series[i]['stack'] = this.chartInfo['cData'].chartData.series[i].groupName + "_" + this.chartInfo.cData.chartData.series[i].selectedUnit;
          this.chartInfo['cData'].chartData.series[i].type = 'bar';
          this.chartInfo['cData'].chartData.series[i].color = null;
        }
      }
      else if (this.chartInfo['cData']['chartOptions'].xaxis.unitReference == 'convertedUnit') {
        for (let i = 0; i < this.chartInfo.cData.chartData.series.length; i++) {
          this.chartInfo['cData'].chartData.series[i]['stack'] = this.chartInfo['cData'].chartData.series[i].groupName + "_" + this.chartInfo.cData.chartData.series[i].unitInfo.value;
          this.chartInfo['cData'].chartData.series[i].type = 'bar';
          this.chartInfo['cData'].chartData.series[i].color = null;
        }
      }
    }
  }

  
    this.options = {
      grid: {
        containLabel:true
    },
      xAxis: {
        type: 'category',
        axisLine: { onZero: true },
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
      tooltip: {
        confine:true
      },
      yAxis: yaxisInfo['yaxis'],
      legend:this._util.getLegendOptions(this.chartInfo['cData']['chartOptions'].legend),
      series:this.chartInfo['cData'].chartData.series
    };
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
}
