import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
  ViewChild,
  Input
} from '@angular/core';
import { AppService } from '../../../services/app.service';
import { TreeModel, TreeNode, ITreeOptions } from 'angular-tree-component';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { globals } from '../../../utilities/globals';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DataSharingService } from '../../../services/data-sharing.service';
import { ToastrService } from '../../toastr/toastr.service';

@Component({
  selector: 'kl-dashboard-filters',
  templateUrl: './dashboard-filters.component.html',
  styleUrls: ['./dashboard-filters.component.scss']
})
export class DashboardFiltersComponent implements OnInit {
  // isApplied: boolean = false;  // we are not using this variable currently
  constructor(
    private appService: AppService,
    private global: globals,
    private _dataSharing: DataSharingService,
    private toastLoad: ToastrService
  ) {}
  @Output() filterEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() alarmFilteremit: EventEmitter<any> = new EventEmitter<any>();
  @Input() pageType = '';
  /* Input variables */
  filtersObj: any;
  duplicateFiltersData: any;
  deviceObj: [];
  sitesObj: Object;
  dateTypeObj: Object;
  dateTypeQuikObj: Object;
  selectType;
  isDateReq: boolean = false;
  filtersObjDate: any;
  isMobileView: boolean;
  treeEle: any = {
    selectedIds: ''
  };
  closedrop = false;
  isCollapse: boolean = false;
  isObjAvial: boolean = false;
  public showTimeRange: Boolean = false;
  dropdownList = [];
  selectedItems = [];
  jsonPostObject = [];
  dropdownSettings = {};
  dropdownSettingsDeviceGropup: {};
  singleSelectDropdownSettings = {};
  dropdownSettingsShift = {};
  public faSearch = faSearch;
  today = new Date();
  public _chartConfig = {
    filter: {
      timeRange: '',
      timeRangeLabel: 'Select',
      aggregation: 'list',
      filterList: [],
      isCustom: false,
      isDateReq: true,
      custom: {
        from: new Date(
          this.today.getFullYear(),
          this.today.getMonth(),
          this.today.getDate(),
          0,
          0,
          0,
          0
        ),
        fromDisp: new Date(
          this.today.getFullYear(),
          this.today.getMonth(),
          this.today.getDate(),
          0,
          0,
          0,
          0
        ),
        to: new Date(),
        toDisp: new Date()
      }
    }
  };

  priorityList: Array<object> = [];
  alarmFilterObject = {
    // alarmStatus:null,
    // type:null,
    // acknowledged:null,
    // priority:[],
    // tags:[],
    // count:50
  };
  jsonPostArray = []; // Post Object
  jsonPost: Object;

  public calendarSettings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy HH:mm:ss',
    defaultOpen: false,
    closeOnSelect: true,
    timeRange: 'today'
  };

  public tempOnDate = {
    from: new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate(),
      0,
      0,
      0,
      0
    ),
    fromDisp: new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate(),
      0,
      0,
      0,
      0
    ),
    to: new Date(),
    toDisp: new Date()
  }; // temparory  object to store the original object data

  public timeRangeList = [
    {
      title: '',
      list: [
        {
          label: 'Last 15 minutes',
          value: 'last_fifteen_minutes'
        },
        {
          label: 'Last 1 hours',
          value: 'last_one_hours'
        },
        {
          label: 'Last 7 days',
          value: 'last_seven_days'
        },
        {
          label: 'Last 30 days',
          value: 'last_thirty_days'
        },
        {
          label: 'Last 1 year',
          value: 'last_one_year'
        }
      ]
    },
    {
      title: '',
      list: [
        {
          label: 'Today',
          value: 'today'
        },
        {
          label: 'This week',
          value: 'this_week'
        },
        {
          label: 'This month',
          value: 'this_month'
        },
        {
          label: 'This year',
          value: 'this_year'
        }
      ]
    },
    {
      title: '',
      list: [
        {
          label: 'Yesterday',
          value: 'yesterday'
        },
        {
          label: 'Previous week',
          value: 'previous_week'
        },
        {
          label: 'Previous month',
          value: 'previous_month'
        },
        {
          label: 'Previous year',
          value: 'previous_year'
        }
      ]
    }
  ];

  public alarmFilter = [
    // {
    //   "isCollapsed": false,
    //   "title": "Status",
    //   "Status": [
    //     {
    //       "label": "Active",
    //       "value": "Active"
    //     },
    //     {
    //       "label": "Inactive",
    //       "value": "Inactive"
    //     }
    //   ]
    // },
    // {
    //   "isCollapsed": false,
    //   "title": "alarmType",
    //   "alarmType": [
    //     {
    //       "label": "Alarm",
    //       "value": "Alarm"
    //     },
    //     {
    //       "label": "Event",
    //       "value": "Event"
    //     },
    //     {
    //       "label": "Status",
    //       "value": "Status"
    //     }
    //   ]
    // },
    // {
    //   "isCollapsed": false,
    //   "title": "acknowledge",
    //   "acknowledge": [
    //     {
    //       "label": "Yes",
    //       "value": true
    //     },
    //     {
    //       "label": "No",
    //       "value": false
    //     }
    //   ]
    // },
    // {
    //   "isCollapsed": false,
    //   "title": "Count",
    //   "count":[
    //     {
    //       "label": "5",
    //       "value": 5
    //     },
    //     {
    //       "label": "10",
    //       "value": 10
    //     },
    //     {
    //       "label": "25",
    //       "value": 25
    //     },
    //     {
    //       "label": "50",
    //       "value": 50
    //     }
    //   ]
    // },
    // {
    //   "isCollapsed": false,
    //   "title": "Priority",
    //   "priorityList":[]
    // }
    // ,
    // {
    //   "isCollapsed": false,
    //   "title": "Tags",
    //   "tags":[]
    // }
  ];

  dropdownLabels = {
    Devices: 'Assets',
    'Device Group': 'Asset Group',
    'Site Hierarchy': 'Organisation Hierarchy',
    shift: 'Shift'
  };

  public options: ITreeOptions = {
    nodeHeight: (node: TreeNode) => node.data.id,
    dropSlotHeight: 3,
    useCheckbox: true,
    getChildren: this.getChildren.bind(this),
    // value changed from false to true
    useTriState: true
  };
  leafModeSelectedIds: any = [];
  isTreeMode: boolean;
  id: any = [];

  treeMode: string = 'leafMode';

  currentMode: string = 'Leaf Mode';
  @HostListener('document:click', ['$event'])
  clickout(event) {
    this.closeDropdownValues();
  }

  ngOnInit() {
    this.getFilters();
    this.isMobileView = this.global._appConfigurations['isMobileUser'];
    // this.getSites();
    // this.getDateTypeQuikPicks();
    // this.getDevices();
    // this.getDateType();

    this.dropdownSettings = {
      singleSelection: false,
      text: 'Select ',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      labelKey: 'label',
      primaryKey: 'value',
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered  Devices',
      filterUnSelectAllText: 'Un-select the Filtered  Devices',
      lazyLoading: true,
      enableCheckAll: false
    };

    this.dropdownSettingsDeviceGropup = {
      singleSelection: false,
      text: 'Select ',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      labelKey: 'label',
      primaryKey: 'value',
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered  Devices',
      filterUnSelectAllText: 'Un-select the Filtered  Devices',
      lazyLoading: true,
      enableCheckAll: false
    };
    this.dropdownSettingsShift = {
      singleSelection: false,
      text: 'Select ',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      labelKey: 'label',
      primaryKey: 'value',
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Shift',
      filterUnSelectAllText: 'Un-select the Shift',
      lazyLoading: true,
      enableCheckAll: false
    };
    this.singleSelectDropdownSettings = {
      singleSelection: true,
      idField: 'value',
      textField: 'label',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  getFilters() {
    const input = {
      filter: [
        { site_id: this.global.getCurrentUserSiteId() },
        { user_id: this.global.userId }
      ],
      filter_by: 'shift'
    };
    this.appService.getFilters(input).subscribe((response) => {
      if (response && response['status'] === 'success') {
        this.filtersObj = response.data.filterOptions;
        this.duplicateFiltersData = this.getCopy(response.data.filterOptions);
      } else {
        this.filtersObj = [];
        // this.filtersObjDate;
        // console.log("Error when filtering filter data");
      }
    });
    // if(this.pageType == 'alarmEvents') {
    //   const objGet = {
    //     "id":"new",
    //     "filter": [{ "site_id": this.global.getCurrentUserSiteId() }]
    //   }
    //   this.appService.getAlarmConf(this.global.deploymentModeAPI.ALARM_CONFIGURATION_GET, objGet).subscribe(data => {
    //     if (data.hasOwnProperty("data") && data.data.status == "success") {
    //       this.alarmFilter[this.alarmFilter.length-1]['priorityList'] = data.data.headerContent['alarmPriorityTypes'];
    //     }
    //   });
    // }
  }
  getDevices() {
    this.appService.getDevicesNew().subscribe((data) => {
      this.deviceObj = data.data;
    });
  }

  getDateType() {
    this.appService.getDateType().subscribe((data) => {
      this.dateTypeObj = data.data;
    });
  }

  getDateTypeQuikPicks() {
    this.appService.getDateTypeQuikPicks().subscribe((data) => {
      this.dateTypeQuikObj = data.data;
    });
  }

  getSites() {
    this.appService.getSitesNew().subscribe((data) => {
      this.sitesObj = data.data;
    });
  }

  onClickCollapse(item: any) {
    if (item.isCollapsed === undefined) {
      item['isCollapsed'] = true;
    } else {
      item['isCollapsed'] = !item.isCollapsed;
    }
  }

  onDeSelectAll(event, keyType, i, j) {
    switch (keyType) {
      case 'devices':
        this.filtersObj[j].filters[i].value = event;
        break;
      case 'shift':
        this.filtersObj[j].filters[i].value = event;
        break;
      case 'deviceGroups':
        this.filtersObj[j].filters[i].value = event;
        break;
      case 'priority':
        this.alarmFilterObject[keyType] = event;
      case 'tags':
        this.alarmFilterObject[keyType] = event;
    }
  }

  getChildren(node: any) {
    const newNodes = [
      {
        name: 'child1'
      },
      {
        name: 'child2'
      }
    ];
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(newNodes), 1000);
    });
  }

  emittedTreeData(data) {
    this.treeEle = data.treeData;
    for (const filterCategory of this.filtersObj) {
      for (const filter of filterCategory.filters) {
        if (filter.type == 'tree') {
          filter['state'] = data.treeData.state;
        }
      }
    }
  }

  /*   submitting Filter
   */
  appyFilter() {
    if (this.isMobileView) {
      this.hidefilter();
    }
    if (document.body.classList.contains('pin-filter')) {
    } else {
      document.body.classList.remove('overlay-filter');
    }
    try {
      const filteredData = [];
      const chartInput = this.getCopy(this._chartConfig);
      const filter = chartInput.filter;
      if (filter.isCustom) {
        delete filter.timeRange;
        delete filter.timeRangeLabel;
        const from_date = String(filter.custom.from);
        const to_date = String(filter.custom.to);
        filter.custom.from = this.getFormattedDateTime(
          new Date(from_date),
          'DD-MM-YYYY HH:MM:SS'
        );
        filter.custom.to = this.getFormattedDateTime(
          new Date(to_date),
          'DD-MM-YYYY HH:MM:SS'
        );
        const tempObj = {
          isDateReq: this.isDateReq,
          type: 'dateTime',
          value: {},
          isCustom: filter.isCustom
        };
        tempObj.value['from'] = filter.custom.from;
        tempObj.value['to'] = filter.custom.to;
        tempObj.value['fromDisp'] = filter.custom.fromDisp;
        tempObj.value['toDisp'] = filter.custom.toDisp;
        filteredData.push(tempObj);
      } else {
        const tempObj = {
          isDateReq: this.isDateReq,
          type: 'dateTime',
          value: filter.timeRange,
          label: filter.timeRangeLabel,
          isCustom: filter.isCustom
        };
        filteredData.push(tempObj);
        delete filter.custom;
      }
      for (const filterCategory of this.filtersObj) {
        for (const filter of filterCategory.filters) {
          const obj: any = {
            type: filter.filterType
          };
          if (filterCategory.type === 'multiSelect') {
            obj['value'] = [];
            for (const item of filter.list) {
              if (item.isChecked) {
                obj['value'].push(item);
              }
            }
          } else if (filter.type === 'tree' && filter.state) {
            // if (filter.state.selectedLeafNodeIds) {
            //   const keyList = Object.keys(filter.state.selectedLeafNodeIds);
            //   const ele = {
            //     selectedIds: [],
            //     type: filter.type
            //   }
            //   for (let key of keyList) {
            //     if (filter.state.selectedLeafNodeIds[key]) {
            //       ele.selectedIds.push(key)
            //     }
            //   }
            //   if (ele.selectedIds.length > 0) {
            //     // console.log(ele);
            //     filteredData.push(ele);
            //   }
            // }

            const ele = {
              selectedIds: this.treeEle['selectedIds'],
              type: filter.type
            };
            filteredData.push(ele);
          } else {
            obj['value'] = filter.value;
          }

          if (obj['value']) {
            filteredData.push(obj);
          }
        }
      }
      const inputJson = {
        action: 'filterChange',
        data: filteredData
      };
      this.filterEmitter.emit(inputJson);
    } catch (error) {
      console.log(error);
    }
  }
  applyFilterAlarm() {
    let alarmFilterEmitObject = {};
    const filteredData = [];
    for (const filterCategory of this.filtersObj) {
      for (const filter of filterCategory.filters) {
        const obj: any = {
          type: filter.filterType
        };
        if (filterCategory.type === 'multiSelect') {
          obj['value'] = [];
          for (const item of filter.list) {
            if (item.isChecked) {
              obj['value'].push(item);
            }
          }
        } else if (filter.type === 'tree' && filter.state) {
          const ele = {
            selectedIds: this.treeEle['selectedIds'],
            type: filter.type
          };
          filteredData.push(ele);
        } else {
          obj['value'] = filter.value;
        }

        if (obj['value']) {
          filteredData.push(obj);
        }
      }
    }
    alarmFilterEmitObject = {
      assetsData: filteredData
      // ...this.alarmFilterObject
    };
    this.alarmFilteremit.emit(alarmFilterEmitObject);
  }

  clearFilter() {
    if (this.isMobileView) {
      this.hidefilter();
    }
    if (document.body.classList.contains('pin-filter')) {
    } else {
      document.body.classList.remove('overlay-filter');
    }
    // if(this._chartConfig.filter.timeRange){
    this.isDateReq = false;
    this.tempOnDate = {
      from: new Date(
        this.today.getFullYear(),
        this.today.getMonth(),
        this.today.getDate(),
        0,
        0,
        0,
        0
      ),
      fromDisp: new Date(
        this.today.getFullYear(),
        this.today.getMonth(),
        this.today.getDate(),
        0,
        0,
        0,
        0
      ),
      to: new Date(),
      toDisp: new Date()
    };
    this._chartConfig.filter.custom = this.tempOnDate;
    delete this._chartConfig.filter.timeRangeLabel;
    this.filtersObj = this.getCopy(this.duplicateFiltersData);
    const inputJson = {
      action: 'filterChange',
      data: [],
      filtersObjDate: this._chartConfig.filter.timeRange
    };
    this.alarmFilterObject = {
      // alarmStatus:null,
      // type:null,
      // acknowledged:null,
      // priority:[],
      // tags:[],
      // count:50
    };
    this.pageType == 'alarmEvents'
      ? this.sendDefaultAlarmFilters()
      : this.filterEmitter.emit(inputJson);
    // }
  }
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
  }

  /*   Storing into Object on Checkbox change
   */
  checkBoxChange(event: any, item: any, title: String) {
    item['title'] = title;
    // item["isChecked"] = event.currentTarget.checked;
    this.checkMappedObject(item, title);
  }

  onSelctChange(event: any, title: String) {
    if (title == 'dateField') {
    }
  }
  checkMappedObject(item: any, title: String) {
    try {
      myObject: Object;
      this.jsonPostArray.forEach((myObject, index) => {
        if (myObject.hasOwnProperty('key') && myObject['key'] == title) {
          this.appendItemToArray(item, myObject);
          this.isObjAvial = true;
        }
      });
      if (!this.isObjAvial) {
        this.appendItemToArray(
          item,
          this.createJSONObject(item, 'multiSelelction')
        );
        this.isObjAvial = false;
      }
    } catch (error) {}
  }

  createJSONObject(item: any, type: String) {
    const obj = new Object();
    const data = [];
    obj['key'] = item.title;
    obj['type'] = type;
    obj['data'] = [];
    return obj;
  }

  createObj(objAdd: any, value: String, label: String, isType: boolean) {
    if (!isType) {
      objAdd['value'] = value;
      objAdd['label'] = label;
    } else {
      objAdd['value'] = value;
      objAdd['label'] = label;
      objAdd['type'] = label;
    }
    return objAdd;
  }

  appendItemToArray(item: any, appendObj: object) {
    try {
      const objId = new Object();
      myObject: Object;
      if (appendObj.hasOwnProperty('data')) {
        if (appendObj['data'].length <= 0) {
          appendObj['data'].push(
            this.createObj(objId, item.id, item.displayName, false)
          );
        } else if (appendObj['data'].length > 0) {
          appendObj['data'].forEach((myObject, index) => {
            if (myObject.value == item.id) {
              appendObj['data'].splice(index, 1);
            }
          });
          return;
        } else {
          appendObj['data'].push(
            this.createObj(objId, item.id, item.displayName, false)
          );
        }
      }
      this.jsonPostArray.push(appendObj);
    } catch (error) {}
  }
  searchFilter(value: string, treeModel: TreeModel) {
    treeModel.filterNodes((node: TreeNode) =>
      this.fuzzysearch(value, node.data.name)
    );
  }
  fuzzysearch(needle: string, haystack: string) {
    const haystackLC = haystack.toLowerCase();
    const needleLC = needle.toLowerCase();

    const hlen = haystack.length;
    const nlen = needleLC.length;

    if (nlen > hlen) {
      return false;
    }
    if (nlen === hlen) {
      return needleLC === haystackLC;
    }
    outer: for (let i = 0, j = 0; i < nlen; i++) {
      const nch = needleLC.charCodeAt(i);

      while (j < hlen) {
        if (haystackLC.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      return false;
    }
    return true;
  }

  onItemSelect(event) {
    // console.log(event);
  }
  onSelectAll(event) {
    // console.log(event);
  }
  multiSelectChange(item) {
    // console.log(item);
  }
  closeFilterWidget() {
    // let inputJson = {
    //   action: 'close',
    //   data: false
    // }
    // this.filterEmitter.emit(inputJson);
    document.body.classList.remove('pin-filter');
    document.body.classList.remove('overlay-filter');
  }
  hidefilter() {
    // document.body.classList.remove('pin-filter');
    this._dataSharing.sendEventpinFilter('pin-filter');
  }
  showDropdownValues(event) {
    event.stopPropagation();
    event.preventDefault();

    this.closedrop = true;
    this.showTimeRange = !this.showTimeRange;
    if (!this._chartConfig.filter.isCustom) {
      const today = new Date();
      this.tempOnDate = {
        from: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        ),
        fromDisp: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        ),
        to: new Date(),
        toDisp: new Date()
      };
    } else {
      this.tempOnDate = JSON.parse(
        JSON.stringify(this._chartConfig.filter.custom)
      );
    }
  }

  closeDropdownValues() {
    this.closedrop = false;

    if (this.showTimeRange) {
      this.showTimeRange = false;
      // if (!this.isApplied && !this._chartConfig.filter.isCustom) {
      //   if (!this._chartConfig.filter.isCustom) {
      //     this.tempOnDate = {
      //       from: new Date(
      //         this.today.getFullYear(),
      //         this.today.getMonth(),
      //         this.today.getDate(),
      //         0,
      //         0,
      //         0,
      //         0
      //       ),
      //       fromDisp: new Date(
      //         this.today.getFullYear(),
      //         this.today.getMonth(),
      //         this.today.getDate(),
      //         0,
      //         0,
      //         0,
      //         0
      //       ),
      //       to: new Date(),
      //       toDisp: new Date()
      //     };
      //   }
      // }
    }
  }
  selectTimeRange(selectedVal) {
    this._chartConfig.filter.timeRange = selectedVal.value;
    this._chartConfig.filter.timeRangeLabel = selectedVal.label;
    this._chartConfig.filter.isCustom = false;
    this.isDateReq = true;
    // this.isApplied = false;
    this.closeDropdownValues();
  }
  clearTimeRange() {
    this.isDateReq = false;
    delete this._chartConfig.filter.timeRangeLabel;
  }
  onDateSelect(event, key) {
    const dateString = event.toISOString().split('.')[0] + 'Z';
    this.tempOnDate[key] = dateString;
    // this.isApplied = false;
  }
  applyCustomRange() {
    const fromDate = new Date(this.tempOnDate['fromDisp']);
    const toDate = new Date(this.tempOnDate['toDisp']);
    if (fromDate.getTime() <= toDate.getTime()) {
      this._chartConfig.filter.custom = this.tempOnDate;
      const from = this.getFormattedDateTime(fromDate, 'DD-MM-YYYY HH:MM:SS');
      const to = this.getFormattedDateTime(toDate, 'DD-MM-YYYY HH:MM:SS');
      this._chartConfig.filter.timeRange = '';
      this._chartConfig.filter.timeRangeLabel = from + ' - ' + to;
      this._chartConfig.filter.isCustom = true;
      this.isDateReq = true;
      // this.isApplied = true;
      this.closeDropdownValues();
    } else {
      this.toastLoad.toast(
        'warning',
        'Warning',
        'From date should be less than or equals to To date',
        true
      );
    }
  }

  getFormattedDateTime(date, format?): string {
    let dateVal = '';
    const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    let month = date.getMonth() + 1;
    month = month > 9 ? month : '0' + month;
    const year = date.getFullYear();
    const HH = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    const MM =
      date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    const SS =
      date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
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
        default:
          dateVal = year + '-' + month + '-' + day;
      }
    } else {
      dateVal = year + '-' + month + '-' + day;
    }
    return dateVal;
  }
  getTreeModeLocalStorage() {
    // By deafult LeafMode
    if (window.localStorage.getItem('treeMode') === undefined) {
      this.treeMode = 'leafMode';
    } else {
      this.treeMode = window.localStorage.getItem('treeMode');
    }
    if (this.treeMode === null || this.treeMode === undefined) {
      this.treeMode = 'leafMode';
    }
    this.changeTreeModeView(this.treeMode);
  }

  changeTreeModeView(mode) {
    switch (mode) {
      case 'treeMode':
        this.isTreeMode = true;
        break;

      case 'leafMode':
        this.isTreeMode = false;
        break;

      default:
        break;
    }
  }

  switchMode(tree: TreeModel) {
    // console.log(this.treeMode);
    // console.log(tree);
    if (this.treeMode === 'treeMode') {
      this.treeModeFunction(tree);
    } else if (this.treeMode === 'leafMode') {
      this.leafModeFunction(tree);
    }
  }

  public changeTreeMode(mode, tree) {
    window.localStorage.setItem('treeMode', mode);
    this.treeMode = mode;
    this.changeTreeModeView(this.treeMode);
    if (this.treeMode === 'treeMode') {
      this.currentMode = 'Tree Mode';
      this.treeModeFunction(tree);
    } else if (this.treeMode === 'leafMode') {
      this.currentMode = 'Leaf Mode';
      this.leafModeFunction(tree);
    }
  }

  leafModeFunction(tree: TreeModel) {
    const chartInput = this.getCopy(this._chartConfig);
    const filter = chartInput.filter;
    Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
      const node: TreeNode = tree.getNodeById(x);
      if (node.isSelected) {
        this.leafModeSelectedIds.push(node.data.id);
      }
      this.treeEle['selectedIds'] = this.leafModeSelectedIds;
    });
  }

  treeModeFunction(tree: TreeModel) {
    Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
      const node: TreeNode = tree.getNodeById(x);
      if (node.isSelected) {
        this.id.push(node.data.id);

        if (this.id.includes(node.parent.data.id)) {
          return;
        } else {
          this.id.push(node.parent.data.id);
        }
      }
    });
    this.treeEle['selectedIds'] = this.id;
  }

  sendDefaultAlarmFilters() {
    const filters = {
      assetsData: [
        {
          type: 'deviceGroups',
          value: []
        },
        {
          type: 'shift',
          value: []
        },
        {
          type: 'devices',
          value: []
        },
        {
          type: 'tree',
          selectedIds: []
        }
      ]
    };
    this.alarmFilteremit.emit(filters);
  }
}
