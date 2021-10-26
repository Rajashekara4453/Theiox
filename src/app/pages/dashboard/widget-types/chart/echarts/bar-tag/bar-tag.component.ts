import { Component, OnInit, Input } from '@angular/core';
import { EchartUtilityFunctions } from '../utilityfunctions';
import { globals } from '../../../../../../utilities/globals';

@Component({
  selector: 'kl-bar-tag',
  templateUrl: './bar-tag.component.html',
  styleUrls: ['./bar-tag.component.scss']
})
export class BarTagComponent implements OnInit {
  @Input('chartInfo') chartInfo = undefined;
  @Input('chartOptions') chartOptions;
  public options: any;
  tempChartInfo: string;
  constructor(
    private _util: EchartUtilityFunctions,
    private global:globals
  ) { }

  ngOnInit() {
    this.createOptions();
  }

  ngOnChanges() {
    this.createOptions();
  }
  createOptions(): any {
    const refObj = this;
    let yaxisInfo = {};
    let tags = [];
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
    if (this.chartInfo['cData']['chartOptions'].hasOwnProperty('harmonic_tags')) {
      tags = [...this.chartInfo['cData']['chartOptions'].yaxis, ...this.chartInfo['cData']['chartOptions'].harmonic_tags];
      yaxisInfo = this._util.getYaxisConfig(tags, showYGrid);
    } else {
      yaxisInfo = this._util.getYaxisConfig(this.chartInfo['cData']['chartOptions'].yaxis, showYGrid);
    }
    if (yaxisInfo.hasOwnProperty('yAxisIndex')) {this.chartInfo['cData'].chartData.series = this._util.getSeriesDataUpdatedWithYaxisIndex(this.chartInfo['cData'].chartData.series, yaxisInfo['yAxisIndex']);}
    this.chartInfo['cData'].chartData.series = this._util.updateTreasholdAndBenchmarkToSeries(this.chartInfo['cData'].chartData.series);
    if (this.chartInfo['cData'].chartData.hasOwnProperty('series') && this.chartInfo['cData'].chartData.series != undefined && this.chartInfo['cData'].chartData.series.length > 0) {
      this.chartInfo['cData'].chartData.series = this._util.updateColor(this.chartInfo['cData'].chartData.series, this.global._appConfigurations['colors']);
    }
    this.options = {
      grid: {
        containLabel: true
      },
      xAxis: {
        type: 'category',
      },

      dataZoom: [{
        type: 'inside'
      }],
      tooltip: {


      },
      yAxis: yaxisInfo['yaxis'],
      legend: this._util.getLegendOptions(this.chartInfo['cData']['chartOptions'].legend),
      series: this.chartInfo['cData'].chartData.series
    };

    if (this.chartInfo['cData']['chartOptions'].autoRefreshType && this.chartInfo['cData']['chartOptions'].autoRefreshType === 'realTime') {
      this.options.xAxis = {
        type: 'category',
        data: [],
        axisTick: {
          show: false
        },
        splitLine: {
          show: showXGrid
        },
        axisLine: { onZero: true },
        name: this._util.getXaxisLabel(this.chartInfo['cData']['chartOptions'].xaxis),
      }
      
      this.options['color'] = this._util.colors;
      if (this.chartInfo['cData'].chartData.hasOwnProperty('series') &&
      this.chartInfo['cData'].chartData['series']!= undefined && this.chartInfo['cData'].chartData['series'].length > 0) {
        this.chartInfo['cData'].chartData.series.forEach(element => {
          tags.forEach(element1 => {
            if (element.hasOwnProperty('data') && element1.tag!=null && element1.tag.value == element.tag.value && element['data'].length > 0) {
              this.options.xAxis.data.push(element1.name);
              element['data'][element['data'].length - 1][0] = element1.name;
            }
          });
          element['type'] = 'bar';
          element['barGap'] = '-100%';
        });
      }
    }
    this.tempChartInfo = JSON.stringify(this.chartInfo['cData'].chartData);
  }

  ngDoCheck() {
    this.createOptions();
  }

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
