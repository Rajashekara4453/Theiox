import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  Renderer2
} from '@angular/core';
import domtoimage from 'dom-to-image';
import { AppService } from '../../services/app.service';
import { Config } from '../../config/config';
import { ToastrService } from '../../components/toastr/toastr.service';
import { AuthService } from '../../pages/auth/auth.service';
import { globals } from '../../../app/utilities/globals';
import { AuthGuard } from '../../../app/pages/auth/auth.guard';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DataSharingService } from '../../services/data-sharing.service';
import { SidebarDetailsService } from '../sidebar/sidebar/sidebar-details.service';
import { WdgShowService } from '../../pages/dashboard/widget-manager/wdg-show/wdg-show.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'kl-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  providers: []
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  public pageType: any;
  public widgetCounter = true;
  showIcon: boolean = false;
  editMode: boolean;
  public dashBoardsaveData: any = {
    name: '',
    description: ''
  };
  subscription: Subscription;
  public objDeleteDashBoard: any = {};
  public objRenameDashboard: any = {};
  public folderData: any = {
    name: ''
  };
  newDashboard: any = { name: '', description: '' };

  dashboardTemplates: any = [];
  dashboardTemplate: string;
  breadCrumbLabel: string;
  breadCrumbIcon: string;
  isMobileView: boolean = false;
  appConfigurations: any;
  hidePinFilter: boolean = false;
  dashboardtemplateData: any = {};
  isSave: boolean = false;
  renameState = false;
  scheduleModalPopup = false;
  datepickerCloser: () => void;
  isEnterKey = false;
  isEditDash: boolean;
  dashboardNameCopy;
  targetDashboardValue;
  isServerError = false;

  // To store the current page access
  public pageAccessFor: any = {
    title: {}
  };

  // variable created for webscada pagetype for the create template
  public webScada: any = {
    webscada: 'scada'
  };
  public isScadaEditor;

  public accessForWidget: any = {};
  constructor(
    private renderer: Renderer2,
    private appService: AppService,
    private _toastLoad: ToastrService,
    private authGuard: AuthGuard,
    private router: Router,
    private _activeRoute: ActivatedRoute,
    private menudataservice: DataSharingService,
    private _dataSharing: DataSharingService,
    private global: globals,
    private _sidebarService: SidebarDetailsService,
    private _wdgShow: WdgShowService
  ) {
    this._activeRoute.params.subscribe((params) => {
      this._activeRoute.url.subscribe((activeUrl) => {
        // this.pageType = activeUrl[0].path; // for getting the dashboard id from the url
        // let x = this.authGuard.getMenuIconAndLabelUrl(this.pageType);
        // this.breadCrumbIcon = x['icon'];
        // this.breadCrumbLabel = x['label'];
        const menuObject = authGuard.getMenuObject;
        this.pageType = menuObject['ticket'];
        this.breadCrumbIcon = menuObject['icon'];
        this.breadCrumbLabel = menuObject['name'];
        this.dashboardTemplate = menuObject['type'];
      });

      this._activeRoute.queryParams.subscribe((params) => {
        const typeOfView = params['view'];
        if (typeOfView == 'editor') {
          this.isScadaEditor = true;
        } else {
          this.isScadaEditor = false;
        }
      });
      // this.dashboardId  = params['id'];
      // if (this.dashboardId == "create") {
      //   console.log("create dashboard");
      // }
      // else if (this.dashboardId) {
      //   this.loadWidgets();
      // }
      // else {
      //   this.loadFirstDashboard(); // if first time load then calling a method for loading the first dashboard
      // }
    });
    this._dataSharing.widgetCount.subscribe((data) => {
      this.widgetCounter = data < 6 ? true : false;
    });
  }
  @Input() showDashboardFilter: Boolean = false;
  @Input() dashboardData: any = {};
  @Output() dashboardFilterEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() createWidgetEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshDashboardEmitter: EventEmitter<any> = new EventEmitter<
    any
  >();
  // html canvas
  @Output() startResizingWidget: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('renameDashboardEl') inputs;
  @ViewChild('datePicker') datePicker: ElementRef;
  @ViewChild('scheduleModal') scheduleModal: ElementRef;

  public showAddWidget: Boolean = true;
  @Input() doResize: boolean;
  public isOwner: Boolean = false;
  public dashboardType = '';
  public titleDenied: string = '';
  public isShowTemplates: Boolean = false;

  public settingsForSchedule = {
    // multi select settings
    singleSelection: false,
    text: 'Select',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    badgeShowLimit: 1
  };

  renameDashboardFocus() {
    this.editMode = true;
    setTimeout(() => {
      this.inputs.nativeElement.focus();
    }, 500);
  }
  changeFn(e) {
    this.dashboardData.dashboardName = e.target.value;
    if (
      e.key != 'Enter' &&
      (this.dashboardData.dashboardName ||
        this.dashboardData.dashboardName == '') &&
      !this.isServerError
    ) {
      this.renameState = true;
    } else {
      if (this.dashboardData.dashboardName && this.isServerError) {
        this.editMode = false;
      } else {
        if (!this.isServerError) {
          this.onFocusOut();
        } else {
          this.editMode = false;
        }
      }
    }
  }
  onFocusOut() {
    if (this.dashboardData.dashboardName == '') {
      this.renameState = true;
      this.editMode = true;
    } else {
      this.editMode = true;
      if (this.targetDashboardValue == this.dashboardData.dashboardName) {
        this.isEnterKey = false;
        if (this.isServerError) {
          this.isEnterKey = true;
        }
      }
    }
    if (this.editMode && (this.renameState || this.isEnterKey)) {
      // this.editMode = false;
      this.renameState = false;
      this.isEnterKey = false;
      const postData = {};
      postData['dashboard_id'] = this.dashboardData.dashboardId;
      postData['name'] = this.dashboardData.dashboardName;
      postData['type'] = this.dashboardData.pageType;
      postData['description'] = '';
      postData['site_id'] = this.global.getCurrentUserSiteId();
      if (postData['name'] != '') {
        this.appService.saveDashboard(postData).subscribe(
          (data) => {
            if (data.status === 'success') {
              this.editMode = false;
              this._toastLoad.toast(
                'success',
                'Success',
                'Renamed successfully',
                true
              );
              this.isServerError = false;
              this.isEnterKey = false;
              this.renameState = false;
              this._sidebarService.updateSidebar();
            } else {
              this._toastLoad.toast('error', 'Error', 'Rename failed', true);
            }
          },
          (error) => {
            this.isServerError = true;
            this._toastLoad.toast(
              'error',
              'Error',
              'Failed To Rename, Please Try Again',
              true
            );
            this.renameDashboardFocus();
          }
        );
      } else {
        this.isServerError = false;
        this.renameState = true;
        this._toastLoad.toast(
          'error',
          'Error',
          'Dashboard name should not be empty',
          true
        );
        this.renameDashboardFocus();
      }
    } else {
      if (this.isServerError) {
        this.editMode = true;
      } else {
        this.editMode = false;
        this.renameState = false;
      }
    }
    if (this.dashboardData.dashboardName == '') {
      this.isEnterKey = false;
      this.renameState = false;
    }
    //  making the cursor to point the end of the dashboardName.
    const renameDashboardEl = this.inputs.nativeElement;
    if (typeof renameDashboardEl.selectionStart == 'number') {
      renameDashboardEl.selectionStart = renameDashboardEl.value.length;
    }
  }
  setChange(e) {
    this.targetDashboardValue = e.target.value;
    this.isEnterKey = true;
  }

  /* ---------------------Date Picker -------------------------- */
  public Datesettings = {
    // datepicker settings
    bigBanner: false,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: false
  };

  public shareData: any = {
    // to store dashboard share data
    userGroups: [],
    users: []
  };

  public scheduleData: any = {
    // to store schedule data
    schedule: false,
    userGroups: [],
    users: [],
    dayType: 'month',
    minutes: '',
    hours: '',
    months: '',
    startDate: new Date(),
    startDateVal: new Date(),
    endDate: new Date(),
    endDateVal: new Date()
  };

  public scheduleOptions: any = {
    // to store schedule options/meta
    userGroups: [],
    userList: [],
    minuteOptions: [],
    hoursOptions: [],
    daysOptions: [
      {
        label: 'Date',
        value: 'date'
      },
      {
        label: 'Day',
        value: 'day'
      },
      {
        label: 'Month',
        value: 'month'
      }
    ],
    Date: [],
    monthsOptions: [],
    weekdayoptions: []
  };

  public months = [
    // month meta
    {
      itemName: 'January',
      id: '1'
    },
    {
      itemName: 'February',
      id: '2'
    },
    {
      itemName: 'March',
      id: '3'
    },
    {
      itemName: 'April',
      id: '4'
    },
    {
      itemName: 'May',
      id: '5'
    },
    {
      itemName: 'June',
      id: '6'
    },
    {
      itemName: 'July',
      id: '7'
    },
    {
      itemName: 'August',
      id: '8'
    },
    {
      itemName: 'September',
      id: '9'
    },
    {
      itemName: 'October',
      id: '10'
    },
    {
      itemName: 'November',
      id: '11'
    },
    {
      itemName: 'December',
      id: '12'
    }
  ];

  public weekDays = [
    // weekday meta
    {
      itemName: 'Sunday',
      id: 'sun'
    },
    {
      itemName: 'Monday',
      id: 'mon'
    },
    {
      itemName: 'Tuesday',
      id: 'tue'
    },
    {
      itemName: 'Wednesday',
      id: 'wed'
    },
    {
      itemName: 'Thursday',
      id: 'thu'
    },
    {
      itemName: 'Friday',
      id: 'fri'
    },
    {
      itemName: 'Saturday',
      id: 'sat'
    }
  ];

  ngOnInit() {
    // this.checkAddWidgetShowOrHide();
    // this.checkDashboardOwnerOrNot();
    this.updateMenuDataHandler();
    // this.resizeHandle();
    this.appConfigurations = this.global._appConfigurations;
    this.isMobileView = this.appConfigurations['isMobileUser'];
    if (this.editMode) {
      this.editMode = false;
    }
    this.pageAccessFor = this.authGuard.getMenuObject.accessLevel;
    this.toggleTitleType(this.pageAccessFor);
    this.accessForWidget = this.authGuard.allowAccessComponent(
      'widgets',
      'create'
    );
  }

  ngOnDestroy() {
    this.hideBubbleOnWdgResize('remove');
    this.subscription.unsubscribe();
    this._wdgShow.setResize(false);
    this._wdgShow.createOrEditwidget(false);
  }

  updateMenuDataHandler() {
    this.menudataservice.currentMenuData.subscribe((data) => {
      this.dashboardType = data['type'];
    });
  }

  ngOnChanges() {
    this.checkAddWidgetShowOrHide();
    if (this.accessForWidget) {
      this.checkWidgetCount();
    }
    this.checkDashboardOwnerOrNot();
    this.doResize = this.dashboardData.isReset;
    if (!this.doResize) {
      this.hideBubbleOnWdgResize('remove');
    }
    if (this.editMode) {
      this.editMode = false;
      this.isServerError = false;
    }
    this.resizeHandle();
    this.dashboardNameCopy = this.dashboardData.dashboardName.slice();
  }

  kioskMode(event) {
    if (document.body.classList.contains('kiosk')) {
      document.body.classList.remove('kiosk');
      event.target.classList.remove('elm-delete');
      event.target.classList.add('elm-financial-dynamic-presentation');
    } else {
      document.body.classList.add('kiosk');
      event.target.classList.remove('elm-financial-dynamic-presentation');
      event.target.classList.add('elm-delete');
    }
  }

  /**
   * If user has no access, display Denied title.
   */
  toggleTitleType(accessLevel) {
    this.pageAccessFor.title = {};
    for (const accessType in accessLevel) {
      if (accessLevel[accessType]) {
        this.pageAccessFor.title[accessType] = '';
      } else {
        this.pageAccessFor.title[accessType] = 'Access Denied';
      }
    }
  }

  /**
   * Mrthod for toggling the dashboard filter
   */
  toggleFilter() {
    // this.showDashboardFilter = !this.showDashboardFilter;
    // this.dashboardFilterEmitter.emit(this.showDashboardFilter);
    if (document.body.classList.contains('pinned-filter')) {
      if (document.body.classList.contains('pin-filter')) {
        document.body.classList.remove('pin-filter');
      } else {
        document.body.classList.add('pin-filter');
      }
    } else {
      if (document.body.classList.contains('overlay-filter')) {
        document.body.classList.remove('overlay-filter');
      } else {
        document.body.classList.add('overlay-filter');
      }
    }
  }

  /**
   * Method for emitting widget create action to parent component
   */
  createWidget() {
    // if (!this.authGuard.allowAccessComponent('widgets', 'create'))
    //   return;

    const emitData = { action: 'createWidget' };
    this.createWidgetEmitter.emit(emitData);
    this._dataSharing.sendEventpinFilter('pin-filter');
  }
  /**
   * Method for emitting dashboard refresh event to parent component
   */
  refreshDashboardAction() {
    this.refreshDashboardEmitter.emit();
  }
  // doresize value set
  resizeHandle() {
    this.subscription = this._wdgShow.resizeStart.subscribe((data) => {
      this.doResize = data;
    });
    this.subscription = this._wdgShow.hideIcons.subscribe((data) => {
      this.hidePinFilter = data;
      this.isEditDash = data;
    });
  }

  /**
   * Method for printing dashboard
   */
  printDashboardAction() {
    try {
      const self = this;
      const node = document.getElementById('printDashborad');
      const breadcrumbBtnDiv = document.getElementById(
        'dashboardBreadcrumbBtns'
      );
      const dashboard = document.getElementById('dashBoradContainer');
      const dashboardParent = document.getElementById('dashBoradContainerMain');

      dashboard.classList.remove('sub-main-content');
      breadcrumbBtnDiv.setAttribute('style', 'display: none');
      window.document.body.setAttribute('style', 'overflow: flow');
      dashboardParent.setAttribute('style', 'height: auto');

      domtoimage.toPng(node).then(function (dataUrl) {
        // const base64Image = dataUrl.split('base64,')[1];

        breadcrumbBtnDiv.removeAttribute('style');
        dashboardParent.removeAttribute('style');
        window.document.body.removeAttribute('style');
        dashboard.classList.add('sub-main-content');

        const popupWin = window.open();
        popupWin.document.open();
        popupWin.document.write(
          '<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()" onafterprint="window.close()"><img style="width: 100%;" src="' +
            dataUrl +
            '"/></html>'
        );
        popupWin.document.close();

        // for download as png
        // var link = document.createElement('a');
        // link.download = 'dashboard_print.png';
        // link.href = dataUrl;
        // link.click();
        // const img = new Image();
        // img.src = dataUrl;
        // document.body.appendChild(img);
      });
    } catch (error) {
      console.log(error);
    }
  }

  onDeSelectAll(event, keyType) {
    switch (keyType) {
      case 'minutes':
        this.scheduleData.minutes = event;
        break;
      case 'hours':
        this.scheduleData.hours = event;
        break;
      case 'day':
        this.scheduleData.day = event;
        break;
      case 'date':
        this.scheduleData.date = event;
        break;
      case 'months':
        this.scheduleData.months = event;
        break;
      case 'userGroups':
        this.scheduleData.userGroups = event;
        break;
      case 'users':
        this.scheduleData.users = event;
        break;
      case 'User Group':
        this.shareData.userGroups = event;
        break;
      case 'User Name':
        this.shareData.users = event;
        break;
    }
  }

  /**
   * Method for scheduling the report dashboards
   */
  scheduleReport() {
    this.scheduleModalPopup = true;
    this.bindScheduleMetadata();
    this.resetScheduleData();
    this.updateUserMeta().then((resp: any) => {
      if (!resp) return;
      this.getScheduleInfo().then((responseJson: any) => {
        if (responseJson && responseJson.status === Config.CONSTANTS.SUCCESS) {
          // this.scheduleData = responseJson.data;
          //Merge two objects only existing
          Object.assign(this.scheduleData, responseJson.data);
          if (this.scheduleData.schedule) {
            this.scheduleData.startDateVal = new Date(
              this.scheduleData.startDateVal
            );
            this.scheduleData.endDateVal = new Date(
              this.scheduleData.endDateVal
            );
          }
          document.getElementById('addScheduleBtn').click();
          this.datepickerClose();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            responseJson ? responseJson.message : 'Failed to get schedule data',
            true
          );
        }
      });
    });
    // document.getElementById('addScheduleBtn').click();
  }

  /**
   * For saving scheduled data
   */
  saveSchedule() {
    try {
      if (
        new Date(this.scheduleData.startDateVal).getTime() <=
        new Date(this.scheduleData.endDateVal).getTime()
      ) {
        this.scheduleData.startDate = this.getFormattedDateTime(
          new Date(this.scheduleData.startDateVal),
          'DD-MM-YYYY'
        );
        this.scheduleData.endDate = this.getFormattedDateTime(
          new Date(this.scheduleData.endDateVal),
          'DD-MM-YYYY'
        );
        this.scheduleData['dashboardId'] = this.dashboardData.dashboardId;
        this.appService.saveScheduleInfo(this.scheduleData).subscribe(
          (res) => {
            if (res && res.status === Config.CONSTANTS.SUCCESS) {
              this._toastLoad.toast('success', 'Success', res.message, true);
              document.getElementById('dismissAddSchedule').click();
            } else {
              this._toastLoad.toast(
                'error',
                'Error',
                res ? res.message : 'Failed to get schedule data',
                true
              );
            }
          },
          (error) => {
            console.log('error while fetching weekday json', error);
          }
        );
      } else {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Start date should be less than or equal to End date',
          true
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Method for to check in schedul report modal the datepicker popup is open state to close it.
   */
  datepickerClose() {
    const _scheduleModal = this.scheduleModal.nativeElement;
    if (_scheduleModal) {
      this.datepickerCloser = this.renderer.listen(
        _scheduleModal,
        'click',
        (e: any) => {
          const className = _scheduleModal.classList.contains('show');
          if (!className) {
            const scheduleCancle = this.scheduleModal.nativeElement.querySelector(
              '#dismissAddSchedule'
            );
            scheduleCancle.click();
          }
        }
      );
    }
  }
  /**
   * Method for checking wether listener is present to remove and to close the modal.
   */
  cancelSchedule() {
    this.scheduleModalPopup = false;
    if (this.datepickerCloser) {
      this.datepickerCloser();
    }
  }

  /**
   * Method for checking wether show or not the add widget option
   */
  checkAddWidgetShowOrHide() {
    try {
      if (
        this.dashboardData &&
        this.dashboardData.widget &&
        this.dashboardData.widget.wcData
      ) {
        this.showAddWidget =
          this.dashboardData.pageType === 'reports' &&
          this.dashboardData.widget.wcData.length > 0
            ? false
            : true;
        this.showIcon =
          this.dashboardData.widget.wcData.length === 0 ? false : true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Method for checking wether the user has the dashboard owner access or not
   */
  checkDashboardOwnerOrNot() {
    try {
      if (this.dashboardData && this.dashboardData.isOwner) {
        this.isOwner = true;
      } else {
        this.isOwner = false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * For reset the schedule variable info
   */
  resetScheduleData() {
    try {
      this.scheduleData = {
        schedule: false,
        userGroups: [],
        users: [],
        dayType: 'month',
        minutes: '',
        hours: '',
        months: '',
        startDate: this.getFormattedDateTime(new Date(), 'DD-MM-YYYY'),
        startDateVal: new Date(),
        endDate: this.getFormattedDateTime(new Date(), 'DD-MM-YYYY'),
        endDateVal: new Date()
      };
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * For get the already saved scheduled info and bind to the model
   */
  updateScheduleData() {
    try {
      if (this.scheduleData && this.scheduleData.schedule) {
        // this.resetScheduleData();
        this.scheduleData.schedule = true;
      } else {
        this.scheduleData.schedule = false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * For getting the saved scheduled info from backend
   */
  getScheduleInfo() {
    try {
      const self = this;
      const inputJson = {
        dashboardId: this.dashboardData.dashboardId
      };
      const promise = new Promise((resolve, reject) => {
        self.appService.getScheduleInfo(inputJson).subscribe(
          (data) => {
            if (data && data.status === Config.CONSTANTS.SUCCESS) {
              resolve(data);
            } else {
              console.log('Failed to load Service data', data);
              this._toastLoad.toast('error', 'Error', data.message, true);
              resolve(undefined);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      });
      return promise;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Method for getting and assigning schedule meta
   */
  bindScheduleMetadata() {
    try {
      /* ------------------------------------------------------------------- */
      this.appService.getMinutesInfo().subscribe(
        (res) => {
          this.scheduleOptions.minuteOptions = res;
        },
        (error) => {
          console.log('error while fetching minutes json');
        }
      );
      /* ------------------------------------------------------------------- */
      this.appService.getHoursInfo().subscribe(
        (res) => {
          this.scheduleOptions.hoursOptions = res;
        },
        (error) => {
          console.log('error while fetching hours json');
        }
      );
      /* ------------------------------------------------------------------- */
      this.scheduleOptions.monthsOptions = this.months;
      /* --------------------------------------------------------------------- */
      this.scheduleOptions.weekdayoptions = this.weekDays;
      /* ----------------------------------------------------------------------- */
      this.appService.getDaysInfo().subscribe(
        (res) => {
          this.scheduleOptions.dateOptions = res;
        },
        (error) => {
          console.log('error while fetching hours json');
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * For binding the user details to the model for schedule and dashboard share
   */
  updateUserMeta() {
    try {
      const inputJson = {
        keys: ['users', 'userGroups']
      };
      const promise = new Promise((resolve, reject) => {
        this.appService.getUserListAndUserGroups(inputJson).subscribe(
          (res) => {
            if (res && res.status === Config.CONSTANTS.SUCCESS) {
              this.scheduleOptions.userGroups = res.data.userGroups;
              this.scheduleOptions.userList = res.data.users;
              resolve(res);
            } else {
              this._toastLoad.toast('error', 'Error', res.message, true);
              resolve(undefined);
            }
          },
          (error) => {
            console.log('error while fetching weekday json', error);
          }
        );
      });
      return promise;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Method for fomatting the given date format to expected date format
   * @param date input date
   * @param format expected format
   */
  getFormattedDateTime(date, format?): string {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  openDashboardModal() {
    this._dataSharing.sendEventpinFilter('pin-filter');
    this.newDashboard.name = '';
    this.newDashboard['dashboard_template_id'] = null;
    const postJSON = {
      type: ''
    };
    postJSON.type = this.pageType.replace(/\b[a-z]/g, (x) => x.toUpperCase());
    this.appService.getDashboardTemplate(postJSON).subscribe((data) => {
      if (data.status === 'success') {
        this.dashboardtemplateData[this.pageType] = data.data;
        this.isShowTemplates =
          this.dashboardtemplateData[this.pageType].length > 0 ? true : false;
      }
    });
  }

  /**
   * Method for getting all meta for dashboard share and bind open the share popup
   */
  shareDashboard() {
    try {
      this.resetDashboardShareData();
      this.updateUserMeta().then((resp: any) => {
        if (!resp) return;
        this.getShareInfo().then((responseJson: any) => {
          if (
            responseJson &&
            responseJson.status === Config.CONSTANTS.SUCCESS
          ) {
            this.shareData = responseJson.data;
            document.getElementById('openDashboardSharePopupBtn').click();
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              responseJson
                ? responseJson.message
                : 'Failed to get schedule data',
              true
            );
          }
        });
        // document.getElementById('openDashboardSharePopupBtn').click();
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * For getting already saved dashboard share info
   */
  getShareInfo() {
    try {
      const self = this;
      const inputJson = {
        dashboardId: this.dashboardData.dashboardId
      };
      const promise = new Promise((resolve, reject) => {
        self.appService.getDashboardShareInfo(inputJson).subscribe(
          (data) => {
            if (data && data.status === Config.CONSTANTS.SUCCESS) {
              resolve(data);
            } else {
              console.log('Failed to load Service data', data);
              this._toastLoad.toast('error', 'Error', data.message, true);
              resolve(undefined);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      });
      return promise;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * For saving the dashboard share information
   */
  saveDashboardShare() {
    try {
      this.shareData['dashboardId'] = this.dashboardData.dashboardId;
      // console.log('shareData', JSON.stringify(this.shareData));
      this.appService.saveDashboardShareInfo(this.shareData).subscribe(
        (res) => {
          if (res && res.status === Config.CONSTANTS.SUCCESS) {
            this._toastLoad.toast('success', 'Success', res.message, true);
            document.getElementById('dismissDashboardSharePopup').click();
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              res ? res.message : 'Failed to save share dashboard data',
              true
            );
          }
        },
        (error) => {
          console.log('error while fetching save share data');
        }
      );
      // document.getElementById('dismissDashboardSharePopup').click();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * For reset the schedule popup data
   */
  resetDashboardShareData() {
    try {
      this.scheduleData = {
        userGroups: [],
        users: []
      };
    } catch (error) {
      console.log(error);
    }
  }

  /* //Resizing Starts here */

  initateResize() {
    this.doResize = true;
    const emitResizeData = { action: 'startResize' };
    this.startResizingWidget.emit(emitResizeData);
    this.hideBubbleOnWdgResize('add');
  }

  cancelResize() {
    this.doResize = false;
    const emitResizeData = { action: 'stopResize' };
    this.startResizingWidget.emit(emitResizeData);
    this.refreshDashboardAction();
    this.hideBubbleOnWdgResize('remove');
  }

  saveResize() {
    this.doResize = false;
    const emitResizeData = { action: 'saveResize' };
    this.startResizingWidget.emit(emitResizeData);
    this.hideBubbleOnWdgResize('remove');
  }
  /* //Resizing Ends here */
  allowAccessMouseOver(compName: string, accessType: string) {
    if (compName == 'widgets') {
      if (this.authGuard.allowAccessComponent('widgets', accessType)) {
        // this.initateResize();
        this.titleDenied = '';
      } else {
        this.titleDenied = 'Access Denied';
      }
    }
    if (this.pageType == 'dashboard') {
      if (this.authGuard.allowAccessComponent('dashboard', accessType)) {
        // this.initateResize();
        this.titleDenied = '';
      } else {
        this.titleDenied = 'Access Denied';
      }
    }
    if (this.pageType == 'webscada') {
      if (this.authGuard.allowAccessComponent('webscada', accessType)) {
        this.titleDenied = '';
      } else {
        this.titleDenied = 'Access Denied';
      }
    } else {
      if (this.authGuard.allowAccessComponent('reports', accessType)) {
        // this.initateResize();
        this.titleDenied = '';
      } else {
        this.titleDenied = 'Access Denied';
      }
    }
  }
  // this method not used this fuctionality handled in another way
  // allowHide(compName: string, accessType: string) {
  //   if (compName == 'widgets') {
  //     if (this.authGuard.allowAccessComponent('widgets', accessType)) {
  //       // this.initateResize();
  //       if (this.checkWidgetCount() && accessType == 'create') {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return this.authGuard.allowAccessComponent(compName, accessType);
  //   }
  // if (this.pageType == 'dashboard') {
  //   if (this.authGuard.allowAccessComponent('dashboard', accessType)) {
  //     // this.initateResize();
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
  // if (this.pageType == 'scada') {
  //   if (this.authGuard.allowAccessComponent('scada', accessType)) {
  //     // this.initateResize();
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
  // if (this.pageType == 'reports') {
  //   {
  //     if (this.authGuard.allowAccessComponent('reports', accessType)) {
  //       // this.initateResize();
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  // }
  // if (this.pageType == 'trends') {
  //   {
  //     if (this.authGuard.allowAccessComponent('trends', accessType)) {
  //       // this.initateResize();
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  // }
  // }

  checkWidgetCount() {
    this._dataSharing.widgetCount.subscribe((data) => {
      this.widgetCounter = data < 8 ? true : false;
    });
    // return this.widgetCounter;
  }

  allowAccess(compName: string, accessType: string) {
    return this.authGuard.allowAccessComponent(compName, accessType);
  }

  hideBubbleOnWdgResize(action) {
    const bodyElement = document.getElementsByTagName('body')[0];
    switch (action) {
      case 'add':
        bodyElement.classList.add('wdgResize');
        break;

      case 'remove':
        bodyElement.classList.remove('wdgResize');
        break;

      default:
        break;
    }
  }

  // w.r.t; Delete Dashboard - Varshhhhh - starts
  deleteDashboard(action, event) {
    if (action === 'delete') {
      // this.objDeleteDashBoard['action'] = action;
      // this.objDeleteDashBoard['data'] = event;
      document.getElementById('deleteModalButton').click();
    }
  }
  // w.r.t; Delete Dashboard - Varshhhhhh - ends

  confirmDelete() {
    try {
      const postData = {};
      postData['dashboard_id'] = this.dashboardData.dashboardId;
      this.appService.deleteDashboard(postData).subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Deleted successfully',
            true
          );
          document.getElementById('dismissDelete').click();
          // this.loadPreviousDashboard.emit();
          let url;
          this.webScada[this.dashboardData.pageType]
            ? (url = this.webScada[this.dashboardData.pageType] + '/')
            : (url = this.dashboardData.pageType + '/');
          this.router.navigate([url]);
          // console.log(url);
          this._sidebarService.updateSidebar();
        } else {
          // this._toastLoad.toast('error', '', data.message, true);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  renameDashboard(menu) {
    document.getElementById('renameModalButton').click();
    this.objRenameDashboard = menu;
  }

  confirmRenameDashboard(data: any) {
    console.log(data);
    const postData = {};
    // postData['dashboard_id'] = this.objRenameDashboard['dashboard_id'];
    postData['dashboard_id'] = this.dashboardData.dashboardId;
    postData['name'] = this.dashBoardsaveData.name.trim();
    postData['type'] = this.dashboardType;
    postData['description'] = '';
    postData['site_id'] = this.global.getCurrentUserSiteId();
    this.appService.saveDashboard(postData).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast(
          'success',
          'Success',
          'Dashboard renamed successfully',
          true
        );
        this.resetRenameDashboard();
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Dashboard renamed failed',
          true
        );
        this.resetRenameDashboard();
      }
    });
  }

  resetRenameDashboard() {
    document.getElementById('dismissRename').click();
    this.dashBoardsaveData.name = '';
    // this.getSidebarMenus();
  }

  saveDashboard(type) {
    try {
      if (!this.dashboardData.pageType) {
        return;
      }
      let postData = {};
      if (type === 'folder') {
        postData = this.folderData;
      } else {
        postData = this.newDashboard;
      }
      postData['name'] = this.newDashboard.name.trim();
      this.webScada[this.dashboardData.pageType]
        ? (postData['type'] = this.webScada[
            this.dashboardData.pageType
          ].replace(/\b[a-z]/g, (x) => x.toUpperCase()))
        : (postData['type'] = this.dashboardData.pageType.replace(
            /\b[a-z]/g,
            (x) => x.toUpperCase()
          ));
      postData['site_id'] = this.global.getCurrentUserSiteId();
      if (this.newDashboard.dashboard_template_id == null) {
        delete this.newDashboard.dashboard_template_id;
      }
      if (this.validateSaveForm(postData)) {
        document
          .getElementById('saveDashboardBreadCrumb')
          .setAttribute('disabled', 'true');
        this.appService.saveDashboard(postData).subscribe((data) => {
          if (data.status === 'success') {
            document
              .getElementById('saveDashboardBreadCrumb')
              .removeAttribute('disabled');
            document.getElementById('dismissAddDashboard').click();
            this.folderData = { name: '' };
            this.newDashboard = { name: '', description: '' };
            this._sidebarService.updateSidebar();
            this._toastLoad.toast(
              'success',
              'Success',
              (this.webScada[this.dashboardData.pageType]
                ? this.webScada[this.dashboardData.pageType]
                : this.dashboardData.pageType) + '  saved successfully',
              true
            );
            let url;

            if (this.pageType == 'webscada') {
              const queryParams: Params = { view: 'editor' };
              url =
                this.webScada[this.dashboardData.pageType].toLowerCase() +
                '/' +
                data['dashboard_id'];
              this.router.navigate([url], {
                queryParams: queryParams
              });
            } else {
              url =
                this.dashboardData.pageType.toLowerCase() +
                '/' +
                data['dashboard_id'];

              this.router.navigate([url]);
            }
          } else {
            this._toastLoad.toast('error', '', data.message, true);
          }
        });
      }
    } catch (error) {
      // console.log(error);
    }
  }

  validateSaveForm(postData) {
    this.isSave = false;
    if (postData['name'] == '' && postData['dashboard_template_id'] == null) {
      this.isSave = false;
    } else if (postData['name'] !== '') {
      this.isSave = true;
    } else if (postData['dashboard_template_id'] !== null) {
      this.isSave = true;
    }
    return this.isSave;
  }
}
