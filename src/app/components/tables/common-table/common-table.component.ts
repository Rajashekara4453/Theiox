import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'kl-common-table',
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.scss']
})
export class CommonTableComponent implements OnInit {
  @Input() tableData;
  constructor() {
    this.tableData = {};
  }

  ngOnInit() {}

  ngOnChanges() {
    this.tableData = this.tableData;
  }

  convertToTime(timeArray: string) {
    if (timeArray == undefined || timeArray == '' || timeArray == null) {
      return '';
    }
    const tempTimeArray = JSON.parse(timeArray);
    let convertTimeArray: string = '';
    tempTimeArray.forEach((data) => {
      data = data.split('-').join('/');
      data = data.replace(' ', ',');
      convertTimeArray += data + '\n';
    });
    return convertTimeArray;
  }

  ngOnDestroy() {
    this.tableData = {};
  }
  track(index) {
    return index;
  }
  
}
