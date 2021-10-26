import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  SimpleChanges
} from '@angular/core';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDragStart
} from '@angular/cdk/drag-drop';
import { ToastrService } from '../toastr/toastr.service';
import { AuthGuard } from '../../pages/auth/auth.guard';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kl-alarm-events',
  templateUrl: './alarm-events.component.html',
  styleUrls: ['./alarm-events.component.scss']
})
export class AlarmEventsComponent implements OnInit {
  /* Variables Declarations */
  alarms: Array<any> = new Array();
  columns: Array<any> = new Array();
  searchText: any = '';
  columnsEdit: Array<any> = new Array();
  isCollapsed: boolean = false;
  headerCols: Array<any> = new Array();
  pageType: any;
  priorityList: Array<object> = [];
  colObj: object;
  selectedAlarm: number;
  movies: Array<any> = new Array();
  alarmEditArray: Array<any> = new Array();
  alarmDuplicateItem: Array<any> = new Array();
  keyStr: any;
  notificationDropdownList: Array<any> = [];
  arrNotes: Array<any> = [];
  userList: Array<any> = [];
  activeTab: String = '';
  public dashboardData: any;
  public showDashboardFilter: Boolean = false;
  @Output() dashboardFilterEmitter: EventEmitter<any> = new EventEmitter<any>();
  public timeOut: any;
  public firstTIme: boolean = true;
  public isAcknowledged: boolean = false;
  dataToPost: object;
  headerContent: any;
  alarmData: any;

  @Input() widgetData = {};
  reOcurrSeconds: number = 20000;
  subscription: Subscription;
  showPriorityList: boolean = true;
  showTable: boolean = true;
  highPriorityObject;
  showHighPriorityBlock: boolean = false;
  isShowBorder: any;
  // isNotFromWidget: boolean = false;

  currentAccess;
  holdFiltersFromBreadcrumb;
  holdFiltersFromDashboard = {
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
  isServiceBusy: boolean = false;
  isPageLoading: boolean = false;
  alarmConfiguration = {
    count: 50,
    alarmCount: [
      {
        label: '5',
        value: 5
      },
      {
        label: '10',
        value: 10
      },
      {
        label: '25',
        value: 25
      },
      {
        label: '50',
        value: 50
      },
      {
        label: '100',
        value: 100
      },
      {
        label: '200',
        value: 200
      }
    ]
  };

  constructor(
    private appService: AppService,
    private authGuard: AuthGuard,
    private toast: ToastrService
  ) {
    (this.notificationDropdownList = [
      {
        value: '1',
        label: 'SMS 1'
      },
      {
        value: '2',
        label: 'SMS 2'
      },
      {
        value: '3',
        label: 'Email'
      },
      {
        value: '4',
        label: 'Push Notification'
      },
      {
        value: '5',
        label: 'Whatsapp'
      }
    ]),
      (this.userList = [
        {
          value: '1',
          label: 'Rakesh Kulkarni'
        },
        {
          value: '2',
          label: 'Sunil Kumar M'
        },
        {
          value: '3',
          label: 'Naveen Kumar G'
        },
        {
          value: '4',
          label: 'Sourav'
        },
        {
          value: '5',
          label: 'Shachin'
        }
      ]);
    const menuObject = authGuard.getMenuObject;
    this.pageType = menuObject['ticket'];
  }

  ngOnInit() {
    this.isPageLoading = true;
    this.currentAccess = this.authGuard.getMenuObject.accessLevel;
    //this.getNotes();
    /*   setInterval(function() {
        this.getAlarmJsonList();
      }, 4000); */
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && this.widgetData !== undefined) {
      this.alarmWidgetData({});
    }
  }

  getNotes() {
    this.appService.getNotesList().subscribe((data) => {
      this.arrNotes = data.data;
    });
  }
  updateDashboardFilterFlag(event) {
    this.showDashboardFilter = event;
  }
  getAlarmJsonList(event) {
    if (this.isServiceBusy) {
      return;
    }
    this.dataToPost = event != undefined ? event : {};
    this.isServiceBusy = true;
    this.subscription = this.appService.getAlarmJson(this.dataToPost).subscribe(
      (data) => {
        if (data.status === 'success') {
          this.alarms = data.alarms;
          this.priorityList = data.priorityList;
          this.getIcons();
          if (this.firstTIme && data['headerCols']) {
            this.headerCols = data.headerCols;
            this.headerCols.forEach((myObjectAdd, index) => {
              if (
                myObjectAdd.key == 'color' ||
                myObjectAdd.key == 'alarmId' ||
                myObjectAdd.key == 'associateId' ||
                myObjectAdd.key == 'deviceId'
              ) {
                this.headerCols.splice(index, 1);
                return;
              }
            });
            this.columns = data.headerCols.slice(0); // Cloning the Object so source Object will not be affected
            this.columnsEdit = data.headerCols.slice(0); //needs to be removed
          }
          this.firstTIme = false;
          this.isServiceBusy = false;
          if (this.pageType == 'alarmEvents') {
            clearTimeout(this.timeOut);
            this.timeOut = setTimeout(
              () => this.getAlarmJsonList(this.dataToPost),
              this.reOcurrSeconds
            );
          }
        } else if (data.status === 'failed' || data.status === 'failure') {
          clearTimeout(this.timeOut);
          this.isServiceBusy = false;
          this.toast.toast('error', 'Error', data.message, true);
        }
      },
      (error) => {
        this.isServiceBusy = false;
        this.isPageLoading = false;
        if (this.pageType == 'alarmEvents') {
          this.timeOut = setTimeout(
            () => this.getAlarmJsonList(this.dataToPost),
            this.reOcurrSeconds
          );
        }
      }
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.headerCols, event.previousIndex, event.currentIndex);
    moveItemInArray(this.columnsEdit, event.previousIndex, event.currentIndex);
  }

  popUpAcknowledgeData(item: any) {
    this.alarmDuplicateItem = [];
    clearTimeout(this.timeOut);
    // let key = item.key
    this.alarmDuplicateItem = item;
    this.alarmEditArray = this.alarmDuplicateItem.slice(0); // Cloning the Object so source Object will not be affected
    this.getObjKeyValue();
  }

  getObjKeyValue() {
    this.keyStr = this.alarmEditArray;
  }

  checkBoxChangeColumn(e: any, item: any) {
    const obj = new Object();
    if (e.currentTarget.checked) {
      //onCheck adding Column

      this.headerCols.forEach((myObjectAdd, index) => {
        if (myObjectAdd == item) {
          this.columnsEdit.splice(index, 0, item);
          return;
        }
      });
    } else {
      //onUncheck deleting Column
      this.columnsEdit.forEach((myObjectDelete, index) => {
        if (myObjectDelete == item) {
          this.columnsEdit.splice(index, 1);
          return;
        }
      });
    }
  }

  alarmWidgetData(item: object, cardClick?: boolean) {
    try {
      if (
        this.widgetData.hasOwnProperty('alarms') &&
        this.widgetData.hasOwnProperty('priorityList')
      ) {
        this.alarms = this.widgetData['alarms'];
        this.priorityList = this.widgetData['priorityList'];
        this.showTable = this.widgetData['showTable'];
        this.showPriorityList = this.widgetData['showPriorityList'];
        this.isShowBorder = this.widgetData['isShowBorder'];
        this.getIcons();
        // if (this.firstTIme) {
        this.headerCols = this.widgetData['headerCols'];
        if (this.widgetData != undefined && this.headerCols != undefined) {
          this.headerCols.forEach((myObjectAdd, index) => {
            if (
              myObjectAdd.key == 'color' ||
              myObjectAdd.key == 'alarmId' ||
              myObjectAdd.key == 'associateId' ||
              myObjectAdd.key == 'deviceId'
            ) {
              this.headerCols.splice(index, 1);
              return;
            }
          });
          this.columns = this.widgetData['headerCols'].slice(0); // Cloning the Object so source Object will not be affected
          this.columnsEdit = this.widgetData['headerCols'].slice(0); //needs to be removed
        }
      }
    } catch (error) {}
  }

  applyColumnHide() {
    this.columns = this.columnsEdit.slice(0);
  }

  changeTab(tabChang: String, item: any, index: number) {
    this.activeTab = '';
    this.activeTab = tabChang;
    this.alarmData = this.alarms[index];
    this.isAcknowledged = this.alarmData['acknowledge'];
    this.popUpAcknowledgeData(item);
  }

  ngOnDestroy() {
    clearTimeout(this.timeOut);
    if (this.subscription) this.subscription.unsubscribe();
  }

  startTimeInt() {
    this.getAlarmJsonList(this.dataToPost);
  }
  onCard(item) {}

  acknowledge() {
    const alarmIdObj: object = {};
    alarmIdObj['alarm_event_id'] = this.alarmData['alarm_event_id'];
    this.appService.getAcknowledge(alarmIdObj).subscribe((data) => {
      if (data.status == 'success') {
        this.toast.toast('success', '', 'Acknowledged Successfully', true);
        this.closeModal();
      } else {
        this.toast.toast('error', '', 'Acknowlgement Failed', true);
      }
    });
  }

  keyTitleCase(keyTitleCase: any, numberIndex: number) {
    if (typeof keyTitleCase == 'string' && keyTitleCase != '')
      return keyTitleCase.replace(/\S/m, function (t) {
        return t.toUpperCase();
      });
    else return keyTitleCase;
  }
  closeModal() {
    document.getElementById('closeModalAcknowledgeID').click();
  }

  getIcons() {
    if (this.headerContent == undefined) {
      this.appService.getPriorityLevels().subscribe((data) => {
        this.isPageLoading = false;
        this.headerContent = data['icons'];
        this.updateIcons();
      });
    } else {
      this.updateIcons();
    }
  }

  updateIcons() {
    this.headerContent.forEach((element1) => {
      if (this.priorityList != undefined) {
        this.priorityList.forEach((element) => {
          if (element['icon'] == element1['value']) {
            element['icon'] = element1['class'];
          }
        });
        this.highPriorityBlock();
      }
    });
  }

  highPriorityBlock() {
    this.highPriorityObject = {};
    this.highPriorityObject['rightIconColor'] = '';
    this.highPriorityObject['rightIcon'] = '';
    for (let i = 0; i < this.priorityList.length; i++) {
      if (
        this.priorityList[i].hasOwnProperty('count') &&
        this.priorityList[i]['count'] > 0
      ) {
        this.highPriorityObject = this.priorityList[i];
        this.showHighPriorityBlock = false;
        return;
      }
    }
    if (!this.highPriorityObject.hasOwnProperty('count')) {
      this.highPriorityObject['rightIconColor'] = '#24A148';
      this.highPriorityObject['rightIcon'] = 'fa fa-check';
      this.showHighPriorityBlock = true;
    }
  }
  track(index) {
    return index;
  }

  onCountChange(count) {
    this.constructFinalFilters();
  }

  onFilterReceive(filtersReceived) {
    this.holdFiltersFromBreadcrumb = filtersReceived; // @filters from breadcrumb
    this.constructFinalFilters('breadcrumb');
  }

  onFilterReceiveCommon(filtersReceived) {
    this.holdFiltersFromDashboard = filtersReceived; // @filters from dashboard
    this.constructFinalFilters();
  }

  constructFinalFilters(from?: string) {
    if (from === 'breadcrumb') {
      const finalFilters = {
        ...this.holdFiltersFromBreadcrumb,
        ...this.holdFiltersFromDashboard,
        count: this.alarmConfiguration.count
      };
      this.getAlarmJsonList(finalFilters);
    } else {
      const finalFilters = {
        ...this.holdFiltersFromDashboard,
        ...this.holdFiltersFromBreadcrumb,
        count: this.alarmConfiguration.count
      };
      this.getAlarmJsonList(finalFilters);
    }
  }
}
