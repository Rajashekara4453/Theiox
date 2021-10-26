import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceloaderService } from '../../../components/loader/serviceloader/serviceloader.service';
import { PpsService } from '../pps.service';

@Component({
  selector: 'kl-listview',
  templateUrl: './listview.component.html',
  styleUrls: ['./listview.component.scss']
})
export class ListviewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private _ppsService: PpsService,
    private loader: ServiceloaderService
  ) {}
  page: any;
  meterDropdownSettings = {};
  meters: Array<any> = [];
  isPageLoading = false;
  selectedMeters: Array<any> = [];
  pageLoaded: Boolean = false;
  table_data = [];
  bodyContent_length = 0;
  ngOnInit() {
    this.getMeterList();
    this.meterDropdownSettings = {
      primaryKey: 'smart_meter_configuration_id',
      labelKey: 'smart_meter_configuration_name',
      lazyLoading: true,
      text: 'Select meters',
      singleSelection: true,
      // selectAllText: 'Select All',
      // unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableFilterSelectAll: false,
      classes: 'myclass custom-class'
    };
    this.route.params.subscribe((params) => {
      this.page = params.page;
    });
  }
  getMeterList() {
    this.pageLoaded = true;
    this._ppsService.getMeterList({}).subscribe((res) => {
      if (res['status'] === 'success') {
        this.meters = res['smart_meter_configuration_list'];
        this.isPageLoading = true;
      }
    });
  }
  onMeterSelect(item: any) {
    debugger;
    const url = '/app2/' + this.page + '/getlist';
    const dataToPost = item;
    this.pageLoaded = false;
    this._ppsService.fetchList(url, dataToPost).subscribe((data) => {
      if (data.status === 'success') {
        this.pageLoaded = true;
        this.table_data = data.data;
        this.bodyContent_length = this.table_data['bodyContent'].length;
      }
    });
  }
}
