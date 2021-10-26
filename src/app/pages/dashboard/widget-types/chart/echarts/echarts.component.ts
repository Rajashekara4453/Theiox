import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'kl-echarts',
  templateUrl: './echarts.component.html',
  styleUrls: ['./echarts.component.scss']
})
export class EchartsComponent implements OnInit {
  @Input() eChartData: Object;
  public cType: String = '';
  public eChartDataTemp = '';
  public chartHeight = '';
  public PREV_HIEGHT = '220'; // preview chart hight
  pieData: any;
  constructor() {}

  ngOnInit() {
    // console.log('eChartData -init', this.eChartData);
    this.cType = this.eChartData['cType'];
    this.chartHeight = this.eChartData['isPreview']
      ? this.PREV_HIEGHT
      : String(
          this.eChartData['h'] -
            (this.eChartData['wcType'] != 'live' ? 115 : 155)
        );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eChartData']) {
      // console.log('eChartData -changes', this.eChartData);
      this.cType = this.eChartData['cType'];
      this.chartHeight = this.eChartData['isPreview']
        ? this.PREV_HIEGHT
        : String(
            this.eChartData['h'] -
              (this.eChartData['wcType'] != 'live' ? 115 : 155)
          );
    }
  }
}
