import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PreviewPopUpService } from '../../../../preview-pop-up.service';
import { EchartUtilityFunctions } from '../utilityfunctions';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'kl-e-pie',
  templateUrl: './e-pie.component.html',
  styleUrls: ['./e-pie.component.scss']
})
export class EPieComponent implements OnInit {
  @Input('chartInfo') chartInfo = undefined;

  public options: any;
  public tempChartInfo = '';
  constructor(
    private _util: EchartUtilityFunctions,
    private previewService: PreviewPopUpService
  ) {}

  ngOnInit() {
    this.createOptions();
  }

  ngOnChanges() {
    this.createOptions();
  }
  createOptions(): any {
    //this.chartInfo['cData'].chartData.series[0]['label'] = {};
    if (
      !this.chartInfo['cData'] ||
      this.tempChartInfo === JSON.stringify(this.chartInfo['cData'].chartData)
    ) {
      return;
    }
    if (!this.chartInfo['cData']) {
      return;
    }
    this.options = {
      tooltip: {
        trigger: 'item',
        show: false
      },

      legend: this._util.getLegendOptions(
        this.chartInfo['cData']['chartOptions'].legend
      ),
      // legend:
      // {
      //   type: 'scroll',
      //   orient: 'horizontal',
      //   right: 10,
      //   bottom: 10,
      //   left: 'center',
      //   width:'100%',
      //   backgroundColor: '#fff',
      // },
      series: [
        {
          name: 'pie',
          type: 'pie',
          radius: '80%',
          selectedMode: 'single',
          center: ['50%', '50%'],
          label: {
            normal: {
              formatter: '{b|{b}} \n {c|{c}}  {per|{d}%} ',
              show: true,
              position: 'outside',
              padding: [4, 5],
              backgroundColor: '#eee',
              borderColor: '#aaa',
              borderWidth: 1,
              // width: 200,
              rich: {
                b: {
                  color: '#999',
                  lineHeight: 22,
                  align: 'center'
                },
                c: {
                  fontSize: 17
                },
                per: {
                  color: '#eee',
                  backgroundColor: 'color',
                  padding: [2, 4],
                  lineHeight: 22
                }
              }
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '17',
                fontWeight: 'bold'
              }
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 20,
            lineStyle: {
              color: '#000000'
            }
          }
        }
      ]
    };
    if (this.chartInfo.cData.chartData.hasOwnProperty('series')) {
      // this.options.legend['data']= this.chartInfo.cData.chartData.series.data;
      this.options.series[0][
        'data'
      ] = this.chartInfo.cData.chartData.series.data;
      this.options.legend['backgroundColor'] = 'rgba(255,255,255,0.4)';
    }
    if (!this.chartInfo.cData.chartOptions['viewFormat']) {
      this.options.series[0].label.normal['position'] = 'center';
      this.options.series[0].label.normal['show'] = false;
    } else {
      this.options.series[0].label.normal['position'] = 'outside';
      this.options.series[0].label.normal['show'] = true;
    }
    let label = {};
    //this.chartInfo['cData'].chartData.series[0]['label'] = {};
    this.options['color'] = this._util.colors;
    this.tempChartInfo = JSON.stringify(this.chartInfo['cData'].chartData);
  }
  // ngDoCheck() {
  //   this.createOptions();
  // }

  // drill down feature on clicking on chart
  onChartClick(event) {
    if (event.data.is_clickable) {
      if (!this.chartInfo.isShowToolBox) {
        this.chartInfo['pieDropdownList'] = [];
      }
      this.chartInfo.isShowToolBox = true;
      this.chartInfo.isPieClick = true;
      let dropdownLabels;
        dropdownLabels = event.data.name.replace(
          '_' +
            this.chartInfo.cData.chartOptions.yaxis[0].tag.label +
            ' (' +
            this.chartInfo.cData.chartOptions.yaxis[0].unit +
            ')',
          ''
        );
      
      // for dropdown array on clikcing on nodes obj accessing and pushing into the array
      this.chartInfo.pieDropdownList.unshift({
        hierarchy_list: event.data.hierarchy_list,
        id: event.data.id,
        is_clickable: event.data.is_clickable,
        value: event.data.value,
        label: dropdownLabels,
        type: event.data['type']
      });
      // Preview Api request on clikcing and replacing the  filtersdata with nodes obj
      this.chartInfo['dropdownValue'] = this.chartInfo.pieDropdownList[0];
      for (
        let i = 0;
        i < this.chartInfo.cData.chartOptions.filter.filtersData.length;
        i++
      ) {
        if (
          event.data.type ==
          this.chartInfo.cData.chartOptions.filter.filtersData[i].id
        ) {
          this.chartInfo.cData.chartOptions.filter.filtersData[i].value = {
            label: dropdownLabels,
            value: event.data.value,
            is_clickable: event.data.is_clickable,
            id: event.data.id,
            hierarchy_list: event.data.hierarchy_list,
            type: event.data['type']
          };
        }
      }
      if (this.chartInfo.isPreview) {
        this.previewService.previewCheck({
          state: 'preview',
          data: this.chartInfo
        });
      } else {
        this.previewService.previewCheck({
          state: 'widget',
          data: this.chartInfo
        });
      }
    }
  }
}
