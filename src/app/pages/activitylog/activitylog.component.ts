import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from '../../components/toastr/toastr.service';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'kl-activitylog',
  templateUrl: './activitylog.component.html',
  styleUrls: ['./activitylog.component.scss']
})
export class ActivitylogComponent implements OnInit {
  constructor(
    private _appService: AppService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _toastLoad: ToastrService
  ) {
    this.getFilters();
  }

  time_settings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy hh:mm a',
    defaultOpen: false
  };

  isPageLoading: boolean;
  dropDownSettings = {
    singleSelection: true,
    text: 'Select',
    enableCheckAll: false,
    primaryKey: 'value',
    labelKey: 'label',
    enableSearchFilter: true,
    // enableFilterSelectAll: false,
    noDataLabel: 'No Data Available',
    filterSelectAllText: ' '
  };

  selected_filters = {
    module: [],
    users: [],
    Actions: [],
    from_date: null,
    to_date: null
  };
  module_select = '';
  user_select = '';
  action_select = '';
  table_content: any = {};
  display_table: any = {};
  table_start_index = 0;
  table_end_index: number;
  display_start_index: number;
  display_end_index: number;
  isLoadmore: boolean = false;
  isempty: boolean = false;

  activity_log_request = {
    filters: {
      from: '',
      to: '',
      user: '',
      module: '',
      action: ''
    },
    page: {
      from: 0,
      length: 100
    },
    sort: {
      type: 'ASC',
      by: 'Date'
    }
  };
  touched = false;

  onDateSelect(event, Type) {
    switch (Type) {
      case 'from':
        this.from = '';
        this.from = this.getFormattedDateTime(
          new Date(this.selected_filters.from_date),
          'DD-MM-YYYY HH:MM Am/Pm'
        );
        this.touched = true;
        break;
      case 'to':
        this.to = '';
        this.to = this.getFormattedDateTime(
          new Date(this.selected_filters.to_date),
          'DD-MM-YYYY HH:MM Am/Pm'
        );
        this.touched = true;
    }
  }

  user = [];
  module = [];
  actions = [];
  header = [];
  body = [];
  from = '';
  to = '';

  ngOnInit() {
    this.isPageLoading = true;
    this.getActivityFilters();
    this.getActivityList();
  }

  getActivityFilters() {
    this._appService.getAcitivityLogFilter({}).subscribe((data) => {
      if (data.status == 'success') {
        this.user = data.data.users;
        this.module = data.data.modules;
        this.actions = data.data.actions;

        for (const ele of this.user) {
          if (this.activity_log_request.filters.user == ele.value) {
            this.selected_filters.users[0] = ele;
          }
        }

        for (const ele of this.actions) {
          if (this.activity_log_request.filters.action == ele.value) {
            this.selected_filters.Actions[0] = ele;
          }
        }

        for (const ele of this.module) {
          if (this.activity_log_request.filters.module == ele.value) {
            this.selected_filters.module[0] = ele;
          }
        }
      } else {
      }
    });
  }

  getActivityList() {
    const reqfromdate = this.activity_log_request.filters.from;
    const reqtodate = this.activity_log_request.filters.to;

    let frm;
    let too;
    let frmtimesplit;
    let totimesplit;
    frmtimesplit = parseInt(reqfromdate.split(' ')[1].split(':')[0]);
    totimesplit = parseInt(reqtodate.split(' ')[1].split(':')[0]);

    const frmsplit = reqfromdate.split(' ')[2];
    const tosplit = reqtodate.split(' ')[2];

    if (frmsplit == 'PM') {
      frmtimesplit = frmtimesplit + 12;
    } else {
      if (frmtimesplit < 10) {
        frmtimesplit = '0' + frmtimesplit;
      }
    }
    if (tosplit == 'PM') {
      totimesplit = totimesplit + 12;
    } else {
      if (totimesplit < 10) {
        totimesplit = '0' + totimesplit;
      }
    }
    this.activity_log_request.filters.from =
      reqfromdate.split(' ')[0] +
      ' ' +
      frmtimesplit +
      ':' +
      reqfromdate.split(' ')[1].split(':')[1] +
      ':' +
      '00';

    this.activity_log_request.filters.to =
      reqtodate.split(' ')[0] +
      ' ' +
      totimesplit +
      ':' +
      reqtodate.split(' ')[1].split(':')[1] +
      ':' +
      '00';

    this._appService.getActivityLoglist(this.activity_log_request).subscribe(
      (data) => {
        if (data.status == 'success') {
          this.table_content = data;
          this.display_table.body_content = this.table_content.body_content.slice(
            this.table_start_index,
            100
          );
          this.display_table.header_content = this.table_content.header_content;
          this.table_end_index = data.page.total_records - 1;
          this.display_start_index = this.table_start_index;
          this.display_end_index = this.display_table.body_content.length;

          if (data.body_content.length > 100) {
            this.isLoadmore = true;
          }
          if (data.body_content.length == 0) {
            this.isempty = true;
          } else {
            this.isempty = false;
          }
          this.isPageLoading = false;
        } else {
          this.isPageLoading = false;
        }
      },
      (error) => {
        this.isPageLoading = false;
      }
    );
  }
  getFilters() {
    this._activatedRoute.queryParams.subscribe((params) => {
      const prm = params;

      if (prm.action != '' && prm.action != null) {
        this.activity_log_request.filters.action = prm.action;
      }
      if (prm.module != '' && prm.module != null) {
        this.activity_log_request.filters.module = prm.module;
      }
      if (prm.user != '' && prm.user != null) {
        this.activity_log_request.filters.user = prm.user;
      }

      if (
        prm.from != '' &&
        prm.from != null &&
        prm.to != '' &&
        prm.to != null
      ) {
        this.activity_log_request.filters.from = prm.from;
        this.activity_log_request.filters.to = prm.to;
        this.from = this.activity_log_request.filters.from;
        this.to = this.activity_log_request.filters.to;

        this.showDate(prm.from, prm.to);
      } else {
        this.getCurrentDateTime();
        this.from = this.activity_log_request.filters.from;
        this.to = this.activity_log_request.filters.to;
      }
    });
  }
  apply() {
    this.isPageLoading = true;
    const fromDate = new Date(this.selected_filters.from_date);
    const toDate = new Date(this.selected_filters.to_date);

    if (fromDate.getTime() > toDate.getTime()) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'From date & time  should be less than or equals to To date & time',
        true
      );
      this.isPageLoading = false;
    } else {
      this.activity_log_request.filters.from = this.from;
      this.activity_log_request.filters.to = this.to;

      if (this.from == '' && this.to == '') {
        this.getCurrentDateTime();

        this.from = this.activity_log_request.filters.from;
        this.to = this.activity_log_request.filters.to;
      }

      this.getActivityList();
      this._router.navigate(['activity-log'], {
        queryParams: {
          user: this.user_select,
          module: this.module_select,
          action: this.action_select,
          from: this.from,
          to: this.to
        }
      });
    }
  }
  onItemSelect($event, keyType) {
    switch (keyType) {
      case 'module':
        this.module_select = this.selected_filters.module[0].value;
        this.activity_log_request.filters.module = this.module_select;
        break;

      case 'user':
        this.user_select = this.selected_filters.users[0].value;
        this.activity_log_request.filters.user = this.user_select;
        break;

      case 'action':
        this.action_select = this.selected_filters.Actions[0].value;
        this.activity_log_request.filters.action = this.action_select;
        break;
    }
  }

  onDeSelectAll(event, keyType) {
    switch (keyType) {
      case 'module':
        this.selected_filters.module = event;
        this.module_select = '';
        this.activity_log_request.filters.module = '';
        break;

      case 'user':
        this.selected_filters.users = event;
        this.user_select = '';
        this.activity_log_request.filters.user = '';
        break;

      case 'action':
        this.selected_filters.Actions = event;
        this.action_select = '';
        this.activity_log_request.filters.action = '';
        break;
    }
  }
  getCurrentDateTime() {
    const currentdate = new Date();

    if (currentdate.getDate() < 10) {
      this.activity_log_request.filters.to = '0' + currentdate.getDate();
      this.activity_log_request.filters.from = '0' + currentdate.getDate();
    } else {
      this.activity_log_request.filters.to =
        this.activity_log_request.filters.to + currentdate.getDate();
      this.activity_log_request.filters.from =
        this.activity_log_request.filters.from + currentdate.getDate();
    }
    if (currentdate.getMonth() + 1 < 10) {
      this.activity_log_request.filters.to =
        this.activity_log_request.filters.to +
        '-' +
        '0' +
        (currentdate.getMonth() + 1);
      this.activity_log_request.filters.from =
        this.activity_log_request.filters.from +
        '-' +
        '0' +
        (currentdate.getMonth() + 1);
    } else {
      this.activity_log_request.filters.to =
        this.activity_log_request.filters.to +
        '-' +
        (currentdate.getMonth() + 1);
      this.activity_log_request.filters.from =
        this.activity_log_request.filters.from +
        '-' +
        (currentdate.getMonth() + 1);
    }

    this.activity_log_request.filters.to =
      this.activity_log_request.filters.to +
      '-' +
      currentdate.getFullYear() +
      ' ';

    if (currentdate.getHours() > 12) {
      let current = currentdate.getHours();
      current = current - 12;
      this.activity_log_request.filters.to =
        this.activity_log_request.filters.to +
        current +
        ':' +
        currentdate.getMinutes() +
        ' ' +
        'PM';
    } else {
      let crnthour;
      let crntmin;

      if (currentdate.getHours() <= 9) {
        crnthour = '0' + currentdate.getHours();
        this.activity_log_request.filters.to =
          this.activity_log_request.filters.to + crnthour + ':';
      } else {
        this.activity_log_request.filters.to =
          this.activity_log_request.filters.to + currentdate.getHours() + ':';
      }
      if (currentdate.getMinutes() <= 9) {
        crntmin = '0' + currentdate.getMinutes();
        this.activity_log_request.filters.to =
          this.activity_log_request.filters.to + crntmin;
      } else {
        this.activity_log_request.filters.to =
          this.activity_log_request.filters.to + currentdate.getMinutes();
      }
      this.activity_log_request.filters.to =
        this.activity_log_request.filters.to + ' ' + 'AM';
    }

    this.activity_log_request.filters.from =
      this.activity_log_request.filters.from +
      '-' +
      currentdate.getFullYear() +
      ' ' +
      '00' +
      ':' +
      '00' +
      ' ' +
      'AM';

    this.selected_filters.from_date = new Date(
      currentdate.getFullYear(),
      currentdate.getMonth(),
      currentdate.getDate(),
      0,
      0
    );

    this.selected_filters.to_date = new Date(
      currentdate.getFullYear(),
      currentdate.getMonth(),
      currentdate.getDate(),
      currentdate.getHours(),
      currentdate.getMinutes()
    );
  }

  getFormattedDateTime(date, format?): string {
    try {
      let dateVal = '';
      const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
      let month = date.getMonth() + 1;
      month = month > 9 ? month : '0' + month;
      const year = date.getFullYear();
      const HH = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
      let hh;

      if (date.getHours() > 12) {
        hh = date.getHours();
        hh = hh - 12;
      } else {
        hh = HH;
      }

      const MM =
        date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
      const SS =
        date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
      const AM_PM = date.getHours() > 12 ? 'PM' : 'AM';
      if (format) {
        switch (format) {
          case 'YYYY-MM-DD':
            dateVal = year + '-' + month + '-' + day;
            break;
          case 'YYYY/MM/DD':
            dateVal = year + '/' + month + '/' + day;
            break;
          case 'DD-MM-YYYY':
            dateVal = day + '-' + month + '-' + year;
            break;
          case 'DD/MM/YYYY':
            dateVal = day + '/' + month + '/' + year;
            break;
          case 'MM/DD/YYYY':
            dateVal = month + '/' + day + '/' + year;
            break;
          case 'DD-MM-YYYY HH:MM:SS':
            dateVal =
              day + '-' + month + '-' + year + ' ' + HH + ':' + MM + ':' + SS;
            break;
          case 'YYYY-MM-DD HH:MM:SS':
            dateVal =
              year + '-' + month + '-' + day + ' ' + HH + ':' + MM + ':' + SS;
            break;
          case 'DD-MM-YYYY HH:MM Am/Pm':
            dateVal =
              day +
              '-' +
              month +
              '-' +
              year +
              ' ' +
              hh +
              ':' +
              MM +
              ' ' +
              AM_PM;
            break;
          default:
            dateVal = year + '-' + month + '-' + day;
        }
      } else {
        dateVal = year + '-' + month + '-' + day;
      }
      return dateVal;
    } catch (error) {
      console.log(error);
    }
  }

  showDate(fromDate, toDate) {
    const splitFrom = fromDate.split(' ');
    const splitTo = toDate.split(' ');

    const SplitFRomDate = splitFrom[0].split('-');
    const SplitToDate = splitTo[0].split('-');

    const SplitFromTime = splitFrom[1].split(':');
    const SplitToTime = splitTo[1].split(':');

    const Year = SplitFRomDate[2];
    const Month = parseInt(SplitFRomDate[1]) - 1;
    const Day = SplitFRomDate[0];
    const Min = SplitFromTime[1];
    const Year1 = SplitToDate[2];
    const Month1 = parseInt(SplitToDate[1]) - 1;
    const Day1 = SplitToDate[0];
    const Min1 = SplitToTime[1];

    let Hour = SplitFromTime[0];
    let Hour1 = SplitToTime[0];

    if (splitFrom[2] == 'PM') {
      Hour = parseInt(Hour) + 12;
    }
    if (splitTo[2] == 'PM') {
      Hour1 = parseInt(Hour1) + 12;
    }
    this.selected_filters.from_date = new Date(Year, Month, Day, Hour, Min);
    this.selected_filters.to_date = new Date(Year1, Month1, Day1, Hour1, Min1);
  }

  loadMore() {
    if (this.display_end_index + 100 >= this.table_end_index) {
      this.display_end_index = this.table_end_index;
      this.display_table.body_content = this.table_content.body_content.slice(
        this.table_start_index,
        this.display_end_index
      );
      this.isLoadmore = false;
    } else {
      this.display_end_index = this.display_end_index + 100;
      this.display_table.body_content = this.table_content.body_content.slice(
        this.table_start_index,
        this.display_end_index
      );
    }
  }
  reset() {
    this.touched = false;
    this.action_select = '';
    this.module_select = '';
    this.user_select = '';
    this.from = '';
    this.to = '';
    this.activity_log_request.filters.module = '';
    this.activity_log_request.filters.action = '';
    this.activity_log_request.filters.user = '';
    this.selected_filters.Actions = [];
    this.selected_filters.module = [];
    this.selected_filters.users = [];
    this.getCurrentDateTime();
    this.apply();
  }
}
