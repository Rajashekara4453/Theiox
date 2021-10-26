import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { AppService } from '../../../../../services/app.service';
@Component({
  selector: 'kl-dashboard-tiles',
  templateUrl: './dashboard-tiles.component.html',
  styleUrls: ['./dashboard-tiles.component.scss']
})
export class DashboardTilesComponent implements OnInit {
  isPositive: boolean = false;
  @Input() doCompare: boolean = false;
  tr1: Array<any> = [];
  tr2: Array<any> = [];


  @Input() public isPreview = false; // Check preview


  @Input() cData: any;
  public rowLength: number = 0;
  public tempChartInfo = '';
  public comparedValue: number = 0;
  public seriesLevelCompare: boolean = false;
  isShowArrow: boolean;
  constructor(
    private _appService: AppService,
  ) { }
  ngOnInit() {
    this.getCopy();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cData']) {
      this.getCopy();    }
  }
  getCopy() {
    const refObj = this;
    if (!this.cData.chartData.series || this.cData.chartData.series.length <= 0 || (this.tempChartInfo === JSON.stringify(this.cData.chartData))) {
      return
    }

    if (this.cData.chartOptions.filter.hasOwnProperty('compare') && this.cData.chartOptions.filter.compare.hasOwnProperty('comparison') &&
      this.cData.chartOptions.filter.compare.comparison) {
      this.doCompare = true;
      this.tr2 = ['#', 'Current Value', 'Previous Value', 'Performance'];
      this.comparedView()
    } else {
      this.doCompare = false;
      this.tr2 = ['#', 'Current Value'];
      this.nonComparedView()
    }
  }

  comparedView() {
    let data;
    this.tr1 = [];
    for (let count = 0; count < this.cData.chartData.category.length; count++) {
        data = this.insertObjectOnComparsion(count);
      this.tr1.push(data);
    }
  }

  insertObjectOnComparsion(row) {
    let count = 0
    const rowData = {
      '#': this.cData.chartData.category[row],
      'Current Value': '',
      'Previous Value': ''
    };
    // 'isPreviousValue' new key  
    if (this.cData.chartData.series.length > 0) {
      this.cData.chartData.series.forEach(element => {
        for (count == 0; count < element.data.length; count++) {
          if (element.data[count][0] == this.cData.chartData.category[row] && !element['isPreviousValue']) {
            rowData['Current Value'] = element.data[count][1];
          } else if (element.data[count][0] == this.cData.chartData.category[row] && element['isPreviousValue']) {
            rowData['Previous Value'] = element.data[count][1];
          }
        }
        count = 0;
      });
    }
    if (rowData['Current Value'] != null && rowData['Previous Value'] != null) {
      const pData = this.valueCompare(rowData['Current Value'], rowData['Previous Value']);
      rowData['Performance'] = { value: pData.pValue, isArrow: pData.isShow };
    } else {
      rowData['Performance'] = { value: '-', isArrow: false };
    }
    return rowData;
  }

  insertObjectWithoutComparsion(row) {
    let count = 0
    const rowData = {
      '#': this.cData.chartData.category[row],
      'Current Value': '',
      'Previous Value': ''
    };
    this.cData.chartData.series.forEach((element, index) => {
      if (element.hasOwnProperty("data")) {
        for (count == 0; count < element.data.length; count++) {
          if (element.data[count][0] == this.cData.chartData.category[row]) {
            rowData['Current Value'] = element.data[count][1];
          }
        }
        count = 0;
      }
    });

    return rowData
  }
  nonComparedView() {
    let data;
    this.tr1 = [];
    for (let count = 0; count < this.cData.chartData.category.length; count++) {
      data = this.insertObjectWithoutComparsion(count);
      this.tr1.push(data);
    }

  }
  // ngDoCheck() {
  //   this.getCopy();
  // }

  valueCompare(value1: any, value2: any) {
    try {
      value1 = parseFloat(value1);
      value2 = parseFloat(value2);
      if (value2 != 0) {
        this.isShowArrow = true;
        this.comparedValue = parseFloat(((((value1 - value2) / value2) * 100).toFixed(1)));
        return { isShow: this.isShowArrow, pValue: Math.abs(this.comparedValue) + '%' };
      } else {
        this.isShowArrow = false;
        return { isShow: this.isShowArrow, pValue: '-' };
      }
    } catch (error) {

    }
  }

  getColorDifference() {
    if (this.comparedValue >= 0) {
      this.isPositive = true;
      return this.cData.chartOptions.yaxis[0].isInverse? 'arrow-color-down' : 'arrow-color-up';
    } else {
      this.isPositive = false;
      return this.cData.chartOptions.yaxis[0].isInverse? 'arrow-color-up' : 'arrow-color-down';
    }
}

track(id) {
  return id
}

}
