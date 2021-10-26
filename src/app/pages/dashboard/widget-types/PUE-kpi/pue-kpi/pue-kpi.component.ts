import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'kl-pue-kpi',
  templateUrl: './pue-kpi.component.html',
  styleUrls: ['./pue-kpi.component.scss']
})
export class PueKpiComponent implements OnInit {

  @Input() vData;
  data  = {};
  constructor() { }

  ngOnInit() {
    this.data = this.vData.chartData;
    // console.log(this.vData.chartData);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.data = this.vData.chartData;
    }
  }
  // ngDoCheck() {
  //   if(this.vData.chartData!= undefined){
  //     this.data = this.vData.chartData;
  //   } else {
  //     this.data ={};
  //   }
  // }
}
