import {
  Component,
  OnInit,
  Input,
  SimpleChange,
  Output,
  EventEmitter,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { faCompress } from '@fortawesome/free-solid-svg-icons';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../../services/app.service';
import { Config } from '../../../../config/config';
import { EchartUtilityFunctions } from '../../widget-types/chart/echarts/utilityfunctions';
import { AuthGuard } from '../../../../pages/auth/auth.guard';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { globals } from '../../../../utilities/globals';
import { DataSharingService } from '../../../../services/data-sharing.service';
import { Paho } from '../../../../../../node_modules/ng2-mqtt/mqttws31';
import { Observable } from 'rxjs/Observable';
import { WdgShowService } from '../wdg-show/wdg-show.service';
import { PreviewPopUpService } from '../../preview-pop-up.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'kl-wdg-display',
  templateUrl: './wdg-display.component.html',
  styleUrls: ['./wdg-display.component.scss']
})
export class WdgDisplayComponent implements OnInit {
  pageId: string;
  timer: number = 60;
  counterTime: number;
  intervalToDestroy: NodeJS.Timer;
  showTimeRange: boolean;
  showClear: boolean;
  responseData: Observable<any>;
  today = new Date();
  priorityTypeData: any;
  isApplied: boolean = true;
  blinkIndicator = false;
  selectedPhase = [];

  /** Rotate bar chart */
  isRotateBar: boolean = false;

  colors = {
    R: '#EE4040',
    Y: '#FFE348',
    B: '#12496E'
  };
  public pageAccessFor: any = {
    title: {}
  };
  public accessForWidget: any = {};
  triggerData: any;
  previewObservable: Subscription;

  constructor(
    private _appService: AppService,
    private router: Router,
    private _util: EchartUtilityFunctions,
    private authGuard: AuthGuard,
    private toastLoad: ToastrService,
    private global: globals,
    private _activeRoute: ActivatedRoute,
    private menudataservice: DataSharingService,
    private _wdgShow: WdgShowService,
    private previewService: PreviewPopUpService
  ) {
    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.indexOf('/dashboard') === -1) {
          this.refreshFlag = false;
        }
      }
    });
    this._activeRoute.params.subscribe((params) => {
      this._activeRoute.url.subscribe((activeUrl) => {
        this.pageType = activeUrl[0].path; // for getting the dashboard id from the url
        this.pageId = params.id;
      });
    });
  }
  @ViewChild('target', { read: ViewContainerRef }) entry: ViewContainerRef;
  @Input('widgetInfo') widgetInfo; // one widget configuration data
  @Input('filteredData') filteredData = []; // dashboard filter data
  @Input('dashboardInfo') dashboardInfo = {
    // dashbord information
    dashboardName: '',
    dashboardId: '',
    isOwner: false
  };
  @Input() timeRangeList: Object;
  @Input() mapData;
  @Input() alarmWidgetData;
  @Input('mqttData') mqttData; // mqtt data input from parent component
  @Output() blockIndex: EventEmitter<object> = new EventEmitter<object>(); // block index for flexitiles from child to parent
  @Output('editWidgetEmitter') editWidgetEmitter = new EventEmitter(); // output emitter to send editted widget config data
  @Output('actionEmitter') actionEmitter = new EventEmitter(); // output emitter to send widget action to parent component
  public widgetDataLive: any = {
    isPreview: true,
    wcData: []
  };
  titleDenied: string = '';
  showPreview: boolean;
  widgetDataLiveShow: boolean;
  isPreviewLoading: boolean;
  isMobileView: boolean;

  public autoRefreshInstance: any; // to store setTimeout instance for refreshing widget data
  public _mqttClient; // variable for storing all mqtt client instance
  public expandWidget: Boolean = false; // flag to store widget expand to fullscreen or not

  public faCompress = faCompress; // icon for compress fullscreen widget

  public refreshFlag = true; // flag to store auto refresh enabled or disabled

  public chartWidth = ''; // store widget width

  public PREV_WIDTH = '12'; // preview widget width

  public isLoading: Boolean = false; // flag to store page data is loaded or not

  public isOwner = false; // to store is the user is a dashboard owner not not

  public wDatatemp: any = {
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
  }; // to store the copy of  selection date original object of widgetInfo

  currentBlockData: object = {};
  public widgetIdStore: Array<String> = []; // flag to store page data is loaded or not
  public dashboardType = '';
  public pageType: any;
  public isWidgetInQueue: boolean = false;

  // date time picker settings
  public calendarSettings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy HH:mm:ss',
    defaultOpen: false,
    closeOnSelect: true
  };
  downloadUIBtnName: string = 'Quick Download';
  downloadServerBtnName: string = 'Download';
  // Varsha - working
  companyNameReportUI: string = '';
  downloadUIBtnTitle: string = 'Quickly Download What You See';
  harmonics = {
    voltoramps: [
      {
        value: 'Volts',
        label: 'Volts'
      },
      {
        value: 'Amps',
        label: 'Amps'
      }
    ],
    phases: [
      {
        value: 'R',
        label: 'R'
      },
      {
        value: 'Y',
        label: 'Y'
      },
      {
        value: 'B',
        label: 'B'
      }
    ],
    tags: [
      {
        value: 'All',
        label: 'All'
      },
      {
        value: 'Odd',
        label: 'Odd'
      },
      {
        value: 'Even',
        label: 'Even'
      }
    ]
  };

  ngOnInit() {
    this.setChartDataAndOptions();
    this.updateMqttData();
    this.checkDashboardOwnerOrNot();
    this.updateMenuDataHandler();
    if (this.widgetInfo.wcType == 'live') {
      this.widgetInfo = this.updateChartDataLive();
      if (
        this.widgetInfo.isNormaltile ||
        this.widgetInfo.isGauge ||
        this.widgetInfo.isProgressbar
      ) {
        this.getPriorityTypeList();
      }
    }
    if (this.pageType == 'reports') {
      this.getReportDownloadSettings();
    }
    this.isMobileView = this.global._appConfigurations['isMobileUser'];
    this.pageAccessFor = this.authGuard.getMenuObject.accessLevel;
    this.accessForWidget = this.authGuard.allowAccessComponent('widgets');
    this.previewCheckModal();
  }

  updateMenuDataHandler() {
    this.menudataservice.currentMenuData.subscribe((data) => {
      this.dashboardType = data['type'];
    });
  }
  expandWidgetFunc() {
    this.expandWidget = true;
  }
  compressWidgetFunc() {
    this.expandWidget = false;
  }

  ngOnChanges(changes: SimpleChange) {
    if (changes['mqttData']) {
      this.updateMqttData();
    } else if (changes['filteredData']) {
      this.clearMqttInstance();
      this.applyDashboardFilter();
    } else if (changes['widgetInfo']) {
      this.setChartDataAndOptions();
    }
    this.checkDashboardOwnerOrNot();
  }

  /**
   * Method for updating the user is a dashboard owner or not
   */
  checkDashboardOwnerOrNot() {
    if (this.dashboardInfo && this.dashboardInfo.isOwner) {
      this.isOwner = true;
    } else {
      this.isOwner = false;
    }
  }
  /**
   * Method for appling dashboard filter data to the widget configurations
   */
  applyDashboardFilter() {
    try {
      const chartOpt = this.widgetInfo['cData']['chartOptions']; // chart options
      // if (!chartOpt.autoRefresh || (chartOpt.autoRefresh && chartOpt.autoRefreshType === 'realTime')) { // for skipping filter to realtime(mqtt) chart

      if (!chartOpt.autoRefresh) {
      } else {
        this.clearAutoRefreshIntervalInstances();
        clearInterval(this.intervalToDestroy);
      }
      //to achieve override functionality for on clicking widget save by shashi.
      let filterListCount = 0;
      let dashbordFiltersCount = 0;
      for (
        filterListCount == 0;
        filterListCount < chartOpt.filter.filterList.length;
        filterListCount++
      ) {
        for (
          dashbordFiltersCount == 0;
          dashbordFiltersCount < chartOpt.filter.filtersData.length;
          dashbordFiltersCount++
        ) {
          chartOpt.filter.filtersData[dashbordFiltersCount].overwrite =
            chartOpt.filter.filterList[filterListCount].overwrite;
        }
      }
      if (chartOpt['filterBackup'] === undefined) {
        chartOpt['filterBackup'] = this.getCopy(chartOpt['filter']);
      }

      if (this.filteredData.length > 0) {
        chartOpt['is_common_filter'] = true;
      }

      // for pie drill down to differntiate live filter 
      if (this.filteredData.length > 0 && chartOpt.chartType==="pie") {
        chartOpt['is_pieDrill_common_filter'] = true;
      }
      for (let option of this.filteredData) {
        if (
          chartOpt['filterBackup'] &&
          chartOpt['filterBackup']['filtersData']
        ) {
          if (option.type === 'dateTime') {
            if (option.isDateReq && chartOpt['filter']['dateOverwrite']) {
              const item = this.getCopy(chartOpt['filterBackup']);
              item.isCustom = option.isCustom ? true : false;
              if (item.isCustom) {
                item['custom'] = {
                  from: option.value['from'],
                  to: option.value['to'],
                  fromDisp: option.value['fromDisp'],
                  toDisp: option.value['toDisp']
                };
                item['timeRangeLabel'] =
                  option.value['from'] + ' - ' + option.value['to'];
              } else {
                item['timeRange'] = option.value;
                item['timeRangeLabel'] = option.label;
              }
              chartOpt['filter'] = this.getCopy(item);
            }
          } 
          if(this.widgetInfo.isShowToolBox && this.widgetInfo.hasOwnProperty('pieDropdownList') && this.widgetInfo.pieDropdownList.length>0){
            this.widgetInfo.pieDropdownList=[];
            this.widgetInfo.isShowToolBox=false;
          }
          else {
            const _ind = chartOpt['filterBackup']['filtersData'].findIndex(
              (el) => {
                if (el.type == 'tree') {
                  return el.type === option.type;
                } else {
                  return el.id === option.type;
                }
              }
            );
            if (
              _ind > -1 &&
              chartOpt['filterBackup']['filtersData'][_ind] &&
              chartOpt['filterBackup']['filtersData'][_ind].overwrite
            ) {
              const item = this.getCopy(
                chartOpt['filterBackup']['filtersData'][_ind]
              );
              if (option.type === 'tree' && option['selectedIds'].length > 0) {
                item['selectedIds'] = option['selectedIds'];
              } else if (option.value.length > 0) {
                item.value = option.value;
                if(chartOpt.chartType==="pie"){
                  this.widgetInfo['cData']['chartOptions']['pieDashboardFilterData']=option.value;
                }
              }
              chartOpt['filter']['filtersData'][_ind] = this.getCopy(item);
            }
          }
        }
      }
      this.widgetInfo['cData']['chartOptions'] = this.getCopy(chartOpt);
      if (this.filteredData.length === 0) {
        this.widgetInfo['cData']['chartOptions']['filter'] = this.getCopy(
          chartOpt['filterBackup']
        );
        if (this.widgetInfo.cType === 'pie') {
          this.widgetInfo.isShowToolBox = false;
          chartOpt['is_pieDrill_common_filter'] = false;
          this.widgetInfo.pieDropdownList = [];
          this.widgetInfo['cData']['chartOptions']['filter']['filtersData'] = chartOpt.filter.filterList;
          
        }
        chartOpt['is_common_filter'] = false;
      }
      this.setChartDataAndOptions();
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method to clone a JSON data
   * @param obj JSON data
   */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
  }

  /**
   * Method for setting chart data and auto refresh intervals
   */
  setChartDataAndOptions() {
    this.clearAutoRefreshIntervalInstances();
    if (
      !this.widgetInfo ||
      (!this.widgetInfo.cType && !this.widgetInfo.cData)
    ) {
      return undefined;
    }
    this.refreshFlag = this.widgetInfo.isPreview ? false : true;
    this.chartWidth = this.widgetInfo.isPreview
      ? this.PREV_WIDTH
      : this.widgetInfo.w;
    this.assignChartOptionAndData(this.widgetInfo);
  }

  //To get position for show Date feature.
  // this feature is not available now
  // getPosition(){
  //   if(this.widgetInfo.cData.chartOptions.hasOwnProperty('isDateShow')) {
  //     switch(this.widgetInfo.cData.chartOptions.isDateShow.label) {
  //       // case 'Left':
  //       //   return 'justify-content-start';
  //       // case 'Right':
  //       //   return 'justify-content-end';
  //       // case 'Center':
  //       //   return 'justify-content-center';
  //       // case 'None':
  //       //   return 'd-none'
  //     }
  //   }
  // }

  /**
   * Method for getting a chart data and assign it into widget configuration
   * @param wInfo
   */
  assignChartOptionAndData(wInfo) {
    try {
      /** Remove this logic when all dashboards have been updated
       *  Logic created on 29/6/21, it will be almost one week to update all the dashboards after this is released
       */
      if (
        wInfo.cType == 'bar' &&
        !wInfo.isNormaltile &&
        !wInfo.isMap &&
        !wInfo.isTile
      ) {
        if (!wInfo.cData.chartOptions.hasOwnProperty('bar_orientation')) {
          wInfo.cData.chartOptions.bar_orientation = 'vertical';
        } else {
          if (wInfo.cData.chartOptions.bar_orientation === 'horizontal') {
            this.isRotateBar = true;
          }
        }
      } else {
        delete wInfo.cData.chartOptions.bar_orientation;
      }
      /** Remove till this line */
      const chartOpt = wInfo['cData']['chartOptions'];
      if (!wInfo['isPreview'] && chartOpt['autoRefreshType'] === 'ajax') {
        this.getChartData(wInfo).then((data) => {
          if (data && data['chartData'] && !wInfo.isModeBus && !wInfo.isMap) {
            if (wInfo.cType == 'flexiTiles')
              data['chartData']['index'] = this.currentBlockData['index'];
            wInfo['cData']['chartData'] = data['chartData'];
          }
          if (wInfo.isAlarmFilter) {
            this.alarmWidgetData = data;
            this.alarmWidgetData[
              'showPriorityList'
            ] = this.widgetInfo.cData.chartOptions['showPriorityList'];
            this.alarmWidgetData[
              'showTable'
            ] = this.widgetInfo.cData.chartOptions['showTable'];
            this.alarmWidgetData[
              'isShowBorder'
            ] = this.widgetInfo.cData.chartOptions['isShowBorder'];
            this.alarmWidgetData['widget_id'] = this.widgetInfo['widget_id'];
            this.alarmWidgetData[
              'chartOptions'
            ] = this.widgetInfo.cData.chartOptions;
          }
          if (data && wInfo.isPue) {
            wInfo['cData']['chartData'] = data;
          }
          if (wInfo.isMap) {
            this.mapData = data;
          }
          if (data && wInfo.isModeBus) {
            wInfo['cData']['chartData'] = data;
          }
          if (wInfo.isPf) {
            wInfo['cData']['chartData']['yaxisData'] =
              data['yaxisData']['data'];
          }
          if (
            !wInfo['isPreview'] &&
            this.pageType !== 'reports' &&
            chartOpt['autoRefresh'] 
          ) {
            this.setAutoRefresh(wInfo);
          }
          this.widgetInfo = this.getCopy(wInfo);
        });
      } else if (
        chartOpt['autoRefreshType'] === 'realTime' &&
        chartOpt['is_common_filter']
      ) {
        // do nothing
        this.applyFilterrLive(wInfo);
      } else if (wInfo['isPreview'] && wInfo.isFlexi) {
        if (wInfo.cType == 'flexiTiles')
          wInfo['cData']['chartData']['index'] = this.currentBlockData['index'];
      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method to initialise auto refesh to widget/chart data
   * @param wInfo
   */
  setAutoRefresh(wInfo: any) {
    const chartOpt = wInfo['cData']['chartOptions'];
    this.refreshData(chartOpt);
  }

  /**
   * Method for initializing the auto refresh(ajax call)
   * @param chartOpt chart config options
   * @param wInfo widget data
   */
  refreshData(chartOpt) {
    const _refObj = this;
    this.timer = chartOpt['autoRefreshTime'];
    this.intervalToDestroy = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      }
      if (this.timer == 0 && !_refObj.isLoading) {
        _refObj.updateChartData(this.widgetInfo);
      }
    }, 1000);
  }

  /**
   * Method for getting chart data from backend
   */
  getChartData(wInfo) {
    try {
      let self = this;
      self.isLoading = true;
      const chartOpt = wInfo['cData']['chartOptions'];

      if (wInfo.cType == 'flexiTiles') {
        chartOpt.yaxis = [];
        let objTempYaxis = {};
        if (chartOpt.xaxis.dimensionalTag === 'all') {
          chartOpt.flexiTiles.blocks.forEach((element) => {
            element.tags.forEach((tagElement) => {
              objTempYaxis[tagElement['name']] = tagElement;
            });
          });
        } else {
          if (Object.keys(this.currentBlockData).length > 0) {
            chartOpt.flexiTiles.blocks[
              this.currentBlockData['index']
            ].tags.forEach((tagElement) => {
              objTempYaxis[tagElement['name']] = tagElement;
            });
            if (
              chartOpt.flexiTiles.blocks[
                this.currentBlockData['index']
              ].hasOwnProperty('isShowProgressBar') &&
              chartOpt.flexiTiles.blocks[this.currentBlockData['index']]
                .isShowProgressBar
            ) {
              if (
                chartOpt.flexiTiles.blocks[this.currentBlockData['index']]
                  .selectedProgressTag.length > 1
              ) {
                let count = 0;
                for (
                  count == 0;
                  count <
                  chartOpt.flexiTiles.blocks[this.currentBlockData['index']]
                    .selectedProgressTag.length;
                  count++
                ) {
                  if (
                    objTempYaxis.hasOwnProperty(
                      chartOpt.flexiTiles.blocks[this.currentBlockData['index']]
                        .selectedProgressTag[count].name
                    )
                  ) {
                    objTempYaxis[
                      chartOpt.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count].name
                    ].tag.isProgressTag = true;
                    objTempYaxis[
                      chartOpt.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count].name
                    ].tag.isBlockTag = true;
                  } else {
                    chartOpt.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[count].tag.isProgressTag = true;
                    objTempYaxis[
                      chartOpt.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count].name
                    ] =
                      chartOpt.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count];
                  }
                }
              } else {
                if (
                  objTempYaxis.hasOwnProperty(
                    chartOpt.flexiTiles.blocks[this.currentBlockData['index']]
                      .selectedProgressTag[0].name
                  )
                ) {
                  objTempYaxis[
                    chartOpt.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0].name
                  ].tag.isProgressTag = true;
                  objTempYaxis[
                    chartOpt.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0].name
                  ].tag.isBlockTag = true;
                } else {
                  chartOpt.flexiTiles.blocks[
                    this.currentBlockData['index']
                  ].selectedProgressTag[0].tag.isProgressTag = true;
                  objTempYaxis[
                    chartOpt.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0].name
                  ] =
                    chartOpt.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0];
                }
              }
            }
          }
        }
        for (var key in objTempYaxis) {
          chartOpt.yaxis.push(objTempYaxis[key]);
        }
        chartOpt.chartType = 'bar';
      } else if (wInfo.cType == 'markLine' || wInfo.cType == 'markPoint') {
        chartOpt.chartType = 'line';
      }
      if (!chartOpt.hasOwnProperty('is_common_filter')) {
        chartOpt['is_common_filter'] = false;
      }
      if (!chartOpt.hasOwnProperty('is_preview')) {
        chartOpt['is_preview'] = false;
      } else {
        chartOpt['is_preview'] = false;
      }
      const promise = new Promise((resolve, reject) => {
        const dataToSend = self.getCopy(chartOpt);
        dataToSend['widgetId'] = wInfo['widget_id'];
        dataToSend['yaxis'] = dataToSend['yaxis'];
        dataToSend['dashboardId'] = self.dashboardInfo.dashboardId;
        if (this.pageId == self.dashboardInfo.dashboardId && !wInfo.isMap) {
          //To send preview req for current working dashboard only

          if (this.pageType === 'reports') {
            this.responseData = this._appService.getChartInfoReport(dataToSend);
          } else if (
            !wInfo.isPue &&
            !wInfo.isPf &&
            this.widgetInfo.cType != 'alarm'
          ) {
            this.responseData = this._appService.getChartInfo(dataToSend);
          } else if (wInfo.isPue || wInfo.isPf) {
            let toSend;
            if (!dataToSend['is_common_filter'] && !wInfo.isPf) {
              toSend = {
                widgetId: wInfo['widget_id']
              };
            } else if (!wInfo.isPf) {
              toSend = {
                dashboardId: dataToSend['dashboardId'],
                filter: dataToSend.filter,
                yaxis: dataToSend.yaxis,
                chartType: dataToSend['chartType'],
                maxDecimalPoint: dataToSend['maxDecimalPoint']
              };
            } else {
              toSend = dataToSend;
            }
            this.responseData = this._appService.getPueData(toSend);
          }
          if (this.widgetInfo.cType == 'alarm') {
            const dataToPost = {
              alarmStatus: null,
              type: null,
              assetsData: [],
              acknowledged: null,
              priority: [],
              count: 10
            };
            this.widgetInfo.cData.chartOptions.filter.filtersData.forEach(
              (element) => {
                if (
                  element.id != 'priority' &&
                  element.id != 'type' &&
                  element.id != 'count' &&
                  element.id != 'alarmStatus' &&
                  element.id != 'acknowledged'
                ) {
                  dataToPost['assetsData'] = [];
                  element.type != 'tree'
                    ? dataToPost['assetsData'].push({
                        type: element.id,
                        value: element.value
                      })
                    : dataToPost['assetsData'].push({
                        type: element.type,
                        selectedIds: element.selectedIds
                      });
                } else if (element.id == 'priority') {
                  dataToPost[element.id] = [];
                  element.value.forEach((element1) => {
                    dataToPost[element.id].push(element1);
                  });
                } else {
                  dataToPost[element.id] = element.value['value'];
                }
              }
            );
            this._appService.getAlarmJson(dataToPost).subscribe(
              (data) => {
                try {
                  if (data) {
                    self.isLoading = false;
                    resolve(data);
                  } else {
                    self.isLoading = false;
                    resolve([]);
                  }
                } catch (e) {
                  self.isLoading = false;
                  resolve([]);
                }
              },
              (error) => {
                self.isLoading = false;
                resolve([]);
              }
            );
          }
          if (this.widgetInfo.cType == 'modbus_write_widget') {
            let dataToPost = {
              module_id: null
            };
            if (!dataToSend['is_common_filter']) {
              dataToPost['module_id'] = this.widgetInfo.widget_id;
            } else {
              dataToPost['cType'] = this.widgetInfo.cType;
              dataToPost['module_id'] = this.widgetInfo.widget_id;
              dataToPost['device_instance_id'] =
                chartOpt.filter.filtersData[0].value[0].value;
              dataToPost['module_type'] = this.pageType;
            }
            this._appService.getModbusJson(dataToPost).subscribe((data) => {
              if (data.status === 'success') {
                self.isLoading = false;
                resolve(data);
              } else {
                self.isLoading = false;
                resolve({});
              }
              (error) => {
                this.isLoading = false;
                resolve({});
              };
            });
          } else if (this.responseData) {
            this.responseData.subscribe(
              (data) => {
                try {
                  if (data.status === Config.CONSTANTS.SUCCESS && data.data) {
                    self.isLoading = false;
                    resolve(data.data);
                    if (
                      this.widgetInfo.cType == 'pie' &&
                      !self.isLoading &&
                      !this.widgetInfo.isPreview &&
                      this.widgetInfo.isShowToolBox
                    ) {
                      this.widgetInfo.isPieClick = false;
                      this.previewService.stepBackPiePreview(
                        this.widgetInfo['isBackArrowClicked'],
                        this.widgetInfo
                      );
                    }
                  } else {
                    self.isLoading = false;
                    resolve({
                      chartData: {
                        series: [],
                        category: []
                      }
                    });
                  }
                } catch (error) {
                  self.isLoading = false;
                  resolve({
                    chartData: {
                      series: [],
                      category: []
                    }
                  });
                }
              },
              (error) => {
                //console.log(error);
                this.isLoading = false;
                resolve({
                  chartData: {
                    series: [],
                    category: []
                  }
                });
              }
            );
          }
        } else if (
          this.pageId == self.dashboardInfo.dashboardId &&
          wInfo.isMap
        ) {
          const self = this;
          let mapIdData;
          const filterData = dataToSend.filter.filterList;
          const dataToPost = {
            filter: [
              {
                site_id:
                  this.global.getCurrentUserSiteId() != null
                    ? this.global.getCurrentUserSiteId()
                    : ''
              }
            ],
            data: {}
          };
          if (filterData !== undefined && !dataToSend['is_common_filter']) {
            filterData.forEach((element) => {
              if (element.type == 'tree') {
                mapIdData = element.value;
              }
            });
          } else {
            dataToSend.filter.filtersData.forEach((element) => {
              if (element.type == 'tree') {
                mapIdData = element;
              }
            });
          }
          dataToPost['data']['selectedIds'] = mapIdData.selectedIds;
          dataToPost['data']['tree'] = mapIdData.metaData;
          this._appService.getSiteDataMap(dataToPost).subscribe(
            (data) => {
              try {
                if (data.status === 'success') {
                  self.isLoading = false;
                  resolve(data.data);
                } else {
                  self.isLoading = false;
                  resolve([]);
                }
              } catch (error) {
                self.isLoading = false;
                resolve([]);
              }
            },
            (error) => {
              this.isLoading = false;
              resolve([]);
            }
          );
        }
      });
      return promise;
    } catch (error) {
      //console.log(error);
    }
  }
  modbusActions(dataToPost) {
    const chartOpt = this.widgetInfo.cData.chartOptions;
    dataToPost['cType'] = this.widgetInfo.cType;
    dataToPost['module_id'] = this.widgetInfo.widget_id;
    dataToPost['device_instance_id'] =
      chartOpt.filter.filterList[0].value[0].value;
    dataToPost['module_type'] = this.pageType;
    dataToPost.write_register.forEach((element) => {
      element['tag_id'] = chartOpt.yaxis[0].tag.value;
    });
    this._appService.getModbusCreate(dataToPost).subscribe(
      (data) => {
        try {
          if (data.status === 'success') {
            this.assignChartOptionAndData(this.widgetInfo);
          } else {
            this.isLoading = false;
            this.assignChartOptionAndData(this.widgetInfo);
          }
        } catch (e) {
          this.isLoading = false;
          this.assignChartOptionAndData(this.widgetInfo);
        }
      },
      (error) => {
        this.isLoading = false;
        this.assignChartOptionAndData(this.widgetInfo);
      }
    );
  }
  // assetActions(dataToPost){

  // }

  /**
   * Method for updating chart data to widget config
   * @param wInfo widget info
   */
  updateChartData(wInfo) {
    try {
      this.getChartData(wInfo).then((data) => {
        if (data && !wInfo.isPue && !wInfo.isModeBus && !wInfo.isMap) {
          if (wInfo.cType == 'flexiTiles')
            data['chartData']['index'] = this.currentBlockData['index'];
          wInfo['cData']['chartData'] = data['chartData'];
          if (wInfo.isPf) {
            wInfo['cData']['chartData']['yaxisData'] =
              data['yaxisData']['data'];
          }
        } else if (wInfo.isAlarmFilter) {
          this.alarmWidgetData = data;
          this.alarmWidgetData[
            'showPriorityList'
          ] = this.widgetInfo.cData.chartOptions['showPriorityList'];
          this.alarmWidgetData[
            'showTable'
          ] = this.widgetInfo.cData.chartOptions['showTable'];
          this.alarmWidgetData[
            'isShowBorder'
          ] = this.widgetInfo.cData.chartOptions['isShowBorder'];
          this.alarmWidgetData['widget_id'] = this.widgetInfo['widget_id'];
          this.alarmWidgetData[
            'chartOptions'
          ] = this.widgetInfo.cData.chartOptions;
        } else if (wInfo.isModeBus) {
          wInfo['cData']['chartData'] = data;
        } else if (wInfo.isMap) {
          this.mapData = data;
        } else {
          wInfo['cData']['chartData'] = data;
        }
        this.widgetInfo = this.getCopy(wInfo);
        this.timer = this.widgetInfo.cData.chartOptions['autoRefreshTime'];
      });
    } catch (error) {
      //console.log(error);
      this.timer = this.widgetInfo.cData.chartOptions['autoRefreshTime'];
    }
  }
  /**
   * Method for updating the mqtt data to the particular widget type
   */
  updateMqttData() {
    try {
      if (!this.widgetInfo) {
        return;
      }
      let chartData = this.widgetInfo['cData']['chartData'];
      const chartOpt = this.widgetInfo['cData']['chartOptions'];
      if (
        ['table'].indexOf(this.widgetInfo['cType']) > -1 &&
        this.mqttData &&
        this.mqttData.topic &&
        this.mqttData.data &&
        chartOpt.autoRefreshType === 'realTime' &&
        chartOpt['topics'] &&
        chartOpt['autoRefresh'] == true
      ) {
        // console.log("Widget Name:" + this.widgetInfo.title, "TOPICS:" + chartOpt['topics']);
        chartData = this.updateDataValueForTable(chartOpt, chartData); // method call for updating live values for table component including digital
      } else if(this.widgetInfo.cType == 'map'){
        this.widgetInfo['cData'].chartOptions.markers.forEach(element => {
          element['tableData'] = this.updateDataValueForTable(chartOpt, element['tableData']);
        });;
      }
      else if (this.mqttData && this.mqttData.topic && this.mqttData.data
        && (chartOpt.autoRefresh && chartOpt.autoRefreshType === 'realTime') && chartOpt['topics']) {
        const dataParamKeys = chartOpt['topics'][this.mqttData.topic];
        if (
          this.widgetInfo['cData']['chartData'] &&
          this.widgetInfo['cData']['chartData']['category']
        ) {
          delete this.widgetInfo['cData']['chartData']['category'];
        }
        if (chartData && chartData['series'] && dataParamKeys) {
          for (
            let eachSeries = 0;
            eachSeries < chartData['series'].length;
            eachSeries++
          ) {
            for (
              let MqttData = 0;
              MqttData < dataParamKeys.length;
              MqttData++
            ) {
              if (
                dataParamKeys[MqttData] ===
                  chartData['series'][eachSeries]['tag']['value'] &&
                this.mqttData.topic ===
                  chartData['series'][eachSeries].topicName &&
                typeof this.mqttData.data[dataParamKeys[MqttData]] !=
                  'undefined'
              ) {
                // console.log('MessageMapped');
                if (!chartData['series'][eachSeries]['data']) {
                  chartData['series'][eachSeries]['data'] = [];
                }
                let conversionFactor = 1;
                if (chartData['series'][eachSeries]['conversionFactor']) {
                  try {
                    conversionFactor = parseFloat(
                      chartData['series'][eachSeries]['conversionFactor']
                    );
                  } catch (error) {
                    conversionFactor = 1;
                  }
                }
                if (
                  this.widgetInfo['cType'] === 'gauge' ||
                  this.widgetInfo.isProgressbar
                ) {
                  let sectorColors = {
                    lineStyle: {
                      color: [
                        [0.2, '#91c7ae'],
                        [0.8, '#63869e'],
                        [1, '#c23531']
                      ]
                    }
                  };
                  if (chartData['series'][eachSeries]['data'].length === 0) {
                    if (chartOpt.sectorColors) {
                      sectorColors.lineStyle.color = chartOpt.sectorColors;
                      chartData['series'][eachSeries][
                        'axisLine'
                      ] = sectorColors;
                    } else {
                      chartData['series'][eachSeries][
                        'axisLine'
                      ] = sectorColors;
                    }
                    chartData['series'][eachSeries]['min'] = 0;
                    chartData['series'][eachSeries]['max'] = 10000;
                    if (
                      chartOpt['minValue'] !== '' &&
                      chartOpt['maxValue'] !== ''
                    ) {
                      chartData['series'][eachSeries]['min'] =
                        chartOpt.minValue;
                      chartData['series'][eachSeries]['max'] =
                        chartOpt.maxValue;
                    }
                    let tempObj = {
                      name: '',
                      value: 0
                    };
                    chartData['series'][eachSeries]['data'].push(tempObj);
                  }
                  if (this.mqttData.data[dataParamKeys[MqttData]].length == 2) {
                    // ((this.mqttData.data[dataParamKeys[MqttData]][1]).toFixed(2)/1000).toFixed(2);
                    chartData['series'][eachSeries]['data'][0]['value'] = (
                      this.mqttData.data[dataParamKeys[MqttData]][1] *
                      conversionFactor
                    ).toFixed(chartOpt['maxDecimalPoint']);
                  }
                } else if (this.widgetInfo['cType'] === 'tiles') {
                  if (chartData['series'][eachSeries]['data'].length === 0) {
                    let tempObj = {
                      previousValue: '',
                      currentValue: '',
                      inverse: false,
                      unit: chartData['series'][eachSeries]['unit'],
                      type: ''
                    };
                    chartData['series'][eachSeries]['data'].push(tempObj);
                    if (
                      this.mqttData.data[dataParamKeys[MqttData]].length == 2
                    ) {
                      chartData['series'][eachSeries]['data'][0][
                        'currentValue'
                      ] = (
                        this.mqttData.data[dataParamKeys[MqttData]][1] *
                        conversionFactor
                      ).toFixed(chartOpt['maxDecimalPoint']);
                      chartData['series'][eachSeries]['data'][0][
                        'date'
                      ] = this._util.getDateTimeFormatted(
                        this.mqttData.data[dataParamKeys[MqttData]][0],
                        'dd/MM/yyy'
                      );
                    }
                  } else {
                    chartData['series'][eachSeries]['data'][0]['currentValue'] =
                      chartData['series'][eachSeries]['data'][0][
                        'currentValue'
                      ];
                    chartData['series'][eachSeries]['data'][0][
                      'previousValue'
                    ] = (
                      this.mqttData.data[dataParamKeys[MqttData]][1] *
                      conversionFactor
                    ).toFixed(chartOpt['maxDecimalPoint']);
                    chartData['series'][eachSeries]['data'][0][
                      'date'
                    ] = this._util.getDateTimeFormatted(
                      this.mqttData.data[dataParamKeys[MqttData]][0],
                      'dd/MM/yyy'
                    );
                  }
                } else {
                  if (!chartData['series'][eachSeries]['data']) {
                    chartData['series'][eachSeries]['data'] = [];
                  }
                  let newData = JSON.parse(
                    JSON.stringify(this.mqttData.data[dataParamKeys[MqttData]])
                  );
                  newData[1] = (newData[1] * conversionFactor).toFixed(
                    chartOpt['maxDecimalPoint']
                  );
                  newData = this.checkRepeatedMqtt(
                    newData,
                    chartData['series'][eachSeries]['data']
                  );
                  if (newData != '') {
                    chartData['series'][eachSeries]['data'].push(newData);
                  }
                }
                if (this.widgetInfo['cType'] === 'tiles') {
                  let tmp = this.getCopy(chartData);
                  this.widgetInfo['cData']['chartData'] = undefined;
                  setTimeout(() => {
                    this.widgetInfo['cData']['chartData'] = tmp;
                    this.widgetInfo['lastRefresh'] = this.mqttData.data[
                      dataParamKeys[MqttData]
                    ][0];
                  }, 500);
                } else {
                  this.widgetInfo['cData']['chartData'] = chartData;
                  this.widgetInfo['lastRefresh'] = this.mqttData.data[
                    dataParamKeys[MqttData]
                  ][0];
                }
              }
            }
          }
        }
      }
      this.widgetInfo = this.getCopy(this.widgetInfo);
    } catch (error) {
      //console.log(error);
    }
  }
  updateChartDataLive() {
    try {
      const self = this;
      self.isPreviewLoading = true;
      const chartInput = this.getCopy(this.widgetInfo);
      delete chartInput.cData.chartData;
      const widgetTmp = this.getCopy(this.widgetInfo);
      // widgetTmp.wcData.cData.chartOptions = this._chartConfig;
      this.getChartDataLiveTopics(this.widgetInfo.cData.chartOptions).then(
        (data) => {
          // if (data && data['topics']) {
          if (data && data['status'] === 'success' && data['topics']) {
            (widgetTmp.cData.chartOptions.autoRefresh = true),
              (widgetTmp.cData.chartOptions.autoRefreshType = 'realTime');
            if (widgetTmp.cData.chartOptions.chartType == 'harmonics') {
              widgetTmp.cData.chartOptions['harmonic_tags'] =
                data['harmonic_tags'];
            }
            widgetTmp.cData.chartOptions['topics'] = data['topics'];
            if(widgetTmp.cType == 'map'){
              widgetTmp.cData.chartOptions['markers'] = data['markers'];
              widgetTmp.cData.chartOptions.markers.forEach(element => {
              if(element.hasOwnProperty('device_mapping')) {
                element['image'] = "../../../../../assets/images/finder_map-marker.png"
                element['tableData'] = this.getLiveChartDataForDigital(widgetTmp.cData.chartOptions, element['device_mapping']);
              }
              });
            }
          if (['table'].indexOf(widgetTmp.cData.chartOptions.chartType) > -1) {
            widgetTmp.cData.chartData = this.getLiveChartDataForDigital(widgetTmp.cData.chartOptions, data['device_mapping'])
          } else if(widgetTmp.cType != 'map'){
            if (!widgetTmp.cData.chartData) {
              widgetTmp.cData = {
                chartData: {
                  series: []
                }
              }
            }
              if (!widgetTmp.cData.chartData.series) {
                widgetTmp.cData.chartData = {
                  series: []
                };
              }
              widgetTmp.cData.chartData.series = this.getLiveChartSeries(
                widgetTmp.cData.chartOptions,
                data['device_mapping']
              );
            }
            this.widgetDataLiveShow = false;
            setTimeout(function () {
              self.widgetInfo = widgetTmp;
              self.widgetDataLive.wcData = [widgetTmp];
              self.widgetDataLiveShow = true;
              self.isPreviewLoading = false;
            }, 500);
          }
          this.widgetInfo = { ...widgetTmp };
          this.widgetInfo['cData'] = { ...widgetTmp.cData };
          this.setRealtimeRefresh();
          this.showPreview = true;
        }
      );
      return widgetTmp;
    } catch (error) {
      //console.log(error);
    }
  }

  getChartDataLiveTopics(input) {
    try {
      let postData;
      postData = this.getCopy(input);
      // delete postData['filter']['filterList'];
      const promise = new Promise((resolve) => {
        this._appService.getPreviewChartDataTopics(postData).subscribe(
          (data) => {
            if (data && data.status === 'success') {
              resolve(data);
            } else {
              // this._toastLoad.toast('error', 'Error', data.message, true);
              this.isPreviewLoading = false;
              resolve({});
            }
          },
          (error) => {
            //console.log(error);
            // this._toastLoad.toast('error', 'Error', "Error while getting response from service", true);
            this.isPreviewLoading = false;
            resolve({});
          }
        );
      });
      return promise;
    } catch (error) {
      //console.log(error);
    }
  }
  /**
   * Method for creating chart series using chart configurations and device mapping data
   * @param chartOpt chart options
   * @param deviceMapping Device mapping info
   */
  getLiveChartSeries(chartOpt, deviceMapping) {
    try {
      const ser = [];
      const tagInfo = {};
      let tags = [];
      // chartOpt.yaxis = chartOpt.yaxis;
      if (chartOpt.chartType == 'harmonics') {
        tags = [...chartOpt.yaxis, ...chartOpt.harmonic_tags];
      } else {
        tags = chartOpt.yaxis;
      }
      for (let series of tags) {
        if (series.tag != null && series.tag.value) {
          tagInfo[series.tag['value']] = series;
        }
      }
      const topicList = Object.keys(chartOpt.topics);
      for (let topic of topicList) {
        chartOpt.topics[topic].forEach((element, index) => {
          if (tagInfo[element]) {
            const obj = this.getCopy(tagInfo[element]);
            obj['topicName'] = topic;
            // obj['name'] = deviceMapping[topic.split('/')[3]] + '_' + obj.tag.label;
            obj['name'] = deviceMapping[topic.split('/')[3]];
            if (
              tags[index].tag != null &&
              tags[index].tag.value == obj.tag.value
            ) {
              ser.splice(index, 0, obj);
            } else {
              tags.forEach((ele, index1) => {
                if (ele.tag != null && ele.tag.value == obj.tag.value) {
                  ser.splice(index1, 0, obj);
                }
              });
            }
          }
        });
      }
      return ser;
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for binding live table widget mqtt configurations
   * @param chartOpt chart config
   * @param deviceMapping device details for creating the toping and mapping it with tags
   */
  getLiveChartDataForDigital(chartOpt, deviceMapping) {
    const tableData: any = {
      bodyContent: [],
      headerContent: []
    };
    try {
      const tagInfo = {};
      for (let series of chartOpt.yaxis) {
        if (series.tag.value) {
          tagInfo[series.tag.value] = series;
        }
      }
      const rowHeaderKey = 'xaxis';
      const rowIdKey = 'id';
      const header = [];
      let body = [];
      header.push({
        key: rowHeaderKey,
        label: chartOpt.xaxis.label
      });
      for (let key of Object.keys(tagInfo)) {
        let tagNameLabel = tagInfo[key].tag ? tagInfo[key].tag.label : key;
        if (chartOpt.chartType === 'table' || chartOpt.chartType === 'map') {
          tagNameLabel += tagInfo[key].unit ? `(${tagInfo[key].unit})` : '';
        }
        const obj = {
          key: key,
          label: tagNameLabel
        };
        header.push(obj);
      }
      const topicList = Object.keys(chartOpt.topics);
      for (let topic of topicList) {
        if(deviceMapping.hasOwnProperty(topic.split('/')[3])){
          const eachRow: any = {};
          eachRow[rowHeaderKey] = deviceMapping[topic.split('/')[3]];
        eachRow[rowIdKey] = topic.split('/')[3];
        for (let tagId of Object.keys(tagInfo)) {
          eachRow[tagId] = ' ';
        }
        body.push(eachRow);
        }
        }
        // Modify body array if duplicate devices are there
      let newArray = [];
      let uniqueObject = {};
      for (let i in body) {
        const objTitle = body[i]['xaxis'];
        uniqueObject[objTitle] = body[i];
      }
      for (let j in uniqueObject) {
        newArray.push(uniqueObject[j]);
      }
      body = newArray;
      tableData.headerContent = header;
      tableData.bodyContent = body;
      return tableData;
    } catch (error) {
      //console.log(error);
      return tableData;
    }
  }
  /**
   * Method for updating the mqtt data to a table widget
   * @param chartOpt chart config
   * @param chartData chart data
   */
  updateDataValueForTable(chartOpt, chartData) {
    try {
      const dataParamKeys = chartOpt['topics'][this.mqttData.topic];
      if (chartData && chartData['bodyContent'] && dataParamKeys) {
        let decimalPoints = 2;
        let conversionFactor = 1;
        const index = chartData['bodyContent'].findIndex((row) => {
          return this.mqttData.topic.includes(row['id']);
        });
        if (index > -1) {
          for (let MqttTagId of dataParamKeys) {
            if (
              typeof this.mqttData.data[MqttTagId] !== 'undefined' &&
              chartData['bodyContent'][index][MqttTagId] &&
              this.mqttData.data[MqttTagId].length === 2
            ) {
              const dataVal = this.mqttData.data[MqttTagId][1];
              if (this.widgetInfo['cType'] === 'table' || this.widgetInfo.cType === 'map') {
                decimalPoints = chartOpt['maxDecimalPoint'];
                const res = chartOpt.yaxis.filter(
                  (ele) => ele.tag.value === MqttTagId
                );
                if (res.length > 0) {
                  conversionFactor = res[0]['conversionFactor'];
                }
              }
              chartData['bodyContent'][index][MqttTagId] =
                typeof dataVal === 'number'
                  ? (dataVal * Number(conversionFactor)).toFixed(
                      Number(decimalPoints)
                    )
                  : dataVal;
              this.widgetInfo['lastRefresh'] = this.mqttData.data[MqttTagId][0];
            }
          }
        }
      }
      return chartData;
    } catch (error) {
      //console.log(error);
      return chartData;
    }
  }

  /**
   * Method called for updating the widget data instantly irrespective of auto refresh
   * @param wInfo widget information
   */
  refreshWidgetData(wInfo) {
    try {
      if (!wInfo) {
        return;
      }
      // if (this.widgetIdSearch(wInfo['widget_id'])) {
      //   this.widgetIdPop(wInfo['widget_id']);
      // }
      this.updateChartData(wInfo);
    } catch (error) {
      //console.log(error);
    }
  }
  /**
   * Method for creating a random data for testing
   */
  randomData() {
    const now = new Date();
    const value = Math.floor(Math.random() * Math.floor(1000));
    return {
      name: now.toString(),
      value: [now.getTime(), Math.round(value)]
    };
  }

  ngOnDestroy() {
    this.clearAutoRefreshIntervalInstances();
    this.clearMqttInstance();
    if (this.intervalToDestroy) {
      clearInterval(this.intervalToDestroy);
      this.intervalToDestroy = undefined;
    }
    this.previewObservable.unsubscribe();
  }
  /**
   * Method for clear/kill the auto refresh instances
   */
  clearAutoRefreshIntervalInstances() {
    if (this.autoRefreshInstance) {
      clearInterval(this.autoRefreshInstance);
      clearTimeout(this.autoRefreshInstance);
      this.autoRefreshInstance = undefined;
    }
  }
  /**
   * Method for deleting widget
   */
  deleteWidget() {
    try {
      if (!this.widgetInfo.widget_id) {
        return;
      }
      const dataToSend = {
        widget_id: this.widgetInfo.widget_id
      };
      this.actionEmitter.emit(dataToSend);
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for emitting widget config data for editing to parent component
   */
  editWidget() {
    this.editWidgetEmitter.emit(this.widgetInfo);
  }

  getCurrentBlockData(e) {
    this.currentBlockData = e;
    if (this.currentBlockData['isClicked'] == true)
      this.assignChartOptionAndData(this.widgetInfo);
    this.blockIndex.emit(e);
  }

  allowAccessMouseOver(compName: string, accessType: string) {
    if (this.dashboardType == 'Reports') {
      compName = 'reports';
    }
    if (this.authGuard.allowAccessComponent(compName, accessType)) {
      // this.initateResize();
      this.titleDenied = '';
    } else {
      this.titleDenied = 'Access Denied';
    }
  }

  allowAccess(compName: string, accessType: string) {
    if (this.dashboardType == 'Dashboard') {
      return this.authGuard.allowAccessComponent(compName, accessType);
    } else {
      return this.authGuard.allowAccessComponent('reports', accessType);
    }
  }

  generateAndDownloadReport() {
    let objGet = {};
    objGet = this.getCopy(this.widgetInfo['cData']['chartOptions']);
    objGet['widgetId'] = this.widgetInfo['widget_id'];
    objGet['dashboardId'] = this.dashboardInfo.dashboardId;
    objGet['dashboardName'] = this.dashboardInfo.dashboardName;
    objGet['widgetName'] = this.widgetInfo.title;
    objGet['reportName'] = this.widgetInfo.title;
    this.toastLoad.toast(
      'info',
      'Info',
      'You can resume. The report template will continue to download.',
      true
    );
    this.responseData = this._appService.generateReport(objGet);
    this.responseData.subscribe((data) => {
      if (data != null && data.status == 'success') {
        this._appService.downloadReport(data.data.fileName);
      } else {
        this.toastLoad.toast(
          'error',
          'Error',
          'Error While Downloading..',
          true
        );
      }
    });
  }

  // Fetch settings for Report from DB.
  getReportDownloadSettings() {
    const dataToSend = {};
    this._appService
      .getReportDownloadSettings(dataToSend)
      .subscribe((settingsData) => {
        if (settingsData.length > 0) {
          const Reportsettings = settingsData[0]['data']['downloadFrom'];

          // UI Download Settings
          if (Reportsettings['ui'] === undefined) {
            this.setDefaultReportSettings('UIBtnName');
            this.setDefaultReportSettings('UIBtnTitle');
            this.setDefaultReportSettings('companyNameUI');
          } else {
            if (Reportsettings['ui']['downloadButtonName'] === undefined) {
              this.setDefaultReportSettings('UIBtnName');
            } else {
              this.downloadUIBtnName =
                Reportsettings['ui']['downloadButtonName'];
            }
            if (Reportsettings['ui']['downloadButtonTitle'] === undefined) {
              this.setDefaultReportSettings('UIBtnTitle');
            } else {
              this.downloadUIBtnTitle =
                Reportsettings['ui']['downloadButtonTitle'];
            }
            if (Reportsettings['ui']['companyName'] === undefined) {
              this.setDefaultReportSettings('companyNameUI');
            } else {
              this.companyNameReportUI = Reportsettings['ui']['companyName'];
            }
          }

          // Server Download Settings
          if (Reportsettings['server'] === undefined) {
            this.setDefaultReportSettings('ServerBtnName');
          } else {
            if (Reportsettings['server']['downloadButtonName'] === undefined) {
              this.setDefaultReportSettings('ServerBtnName');
            } else {
              this.downloadServerBtnName =
                Reportsettings['server']['downloadButtonName'];
            }
          }
        } else {
          this.setDefaultReportSettings('all');
        }
      });
  }

  // Default Settings if No record for settings in DB (data-content)
  setDefaultReportSettings(setDefaultKey: string) {
    switch (setDefaultKey) {
      case 'UIBtnName':
        this.downloadUIBtnName = 'Quick Download';
        break;

      case 'UIBtnTitle':
        this.downloadUIBtnTitle = 'Quickly Download What You See';
        break;

      case 'companyNameUI':
        this.companyNameReportUI = '';
        break;

      case 'ServerBtnName':
        this.downloadServerBtnName = 'Download';
        break;

      case 'all':
        this.downloadUIBtnName = 'Quick Download';
        this.companyNameReportUI = '';
        this.downloadServerBtnName = 'Download';
        this.downloadUIBtnTitle = 'Quickly Download What You See';
        break;

      default:
        break;
    }
  }

  // Downloads the HTML table to excel format
  exportTableAsExcel(e) {
    // console.log(this.widgetInfo);
    const industryName = this.widgetInfo['cData']['chartOptions'][
      'reportFormat'
    ]['client_name'];
    const timeRange = this.widgetInfo['cData']['chartOptions']['filter'][
      'timeRangeLabel'
    ];
    const reportName = this.widgetInfo['title'];
    const logo =
      '<tr> <td> <h3>' + this.companyNameReportUI + '</h3></td></tr>';
    // const logo = '<th> <tr> <img src = "./assets/images/logo.png" alt="elmeasure logo" /> </tr> </th>';
    // tslint:disable-next-line: prefer-template
    const header =
      '<tr><td> <b> Time Range:   ' + timeRange + '</b> </td> </tr>';
    const a = document.createElement('a');

    const data_type = 'data:application/vnd.ms-excel';
    const table_div = $('#table_ref table');
    const table_html =
      '<table>' +
      '<tr> <td>' +
      header +
      '</tr> </td>' +
      table_div.html().replace(/ /g, '%20') +
      '</table>';

    // '<tr> <td>' + logo + '</tr> </td>' +

    a.href = data_type + ', ' + table_html;
    a.download = reportName + '.xls';
    // triggering the function
    a.click();
    // just in case, prevent default behaviour
    // e.preventDefault();

    return false;
  }

  /**
   * Method for Storing WidgetId before sending request
   */
  widgetIdPush(widgetQueryId: string) {
    let isAvailWidget: boolean = false;
    for (let index = 0; index < this.widgetIdStore.length; index++) {
      if (this.widgetIdStore[index] === widgetQueryId) {
        isAvailWidget = true;
      }
    }
    if (!isAvailWidget) {
      this.widgetIdStore.push(widgetQueryId);
    }
  }
  /**
   * Method for Searching WidgetId
   */
  widgetIdSearch(widgetQueryId: string) {
    let isAvailWidget: boolean = false;
    for (let index = 0; index < this.widgetIdStore.length; index++) {
      if (this.widgetIdStore[index] === widgetQueryId) {
        isAvailWidget = true;
        return true;
      }
    }
    if (!isAvailWidget) {
      return false;
    }
  }

  allowHide(compName: string, accessType: string) {
    if (this.dashboardType == 'Dashboard') {
      return this.authGuard.allowAccessComponent(compName, accessType);
    } else {
      return this.authGuard.allowAccessComponent('reports', accessType);
    }
  }

  allowHideforAll() {
    if (this.authGuard.allowAccessComponent(this.pageType, 'edit')) {
      return true;
    } else if (this.authGuard.allowAccessComponent(this.pageType, 'delete')) {
      return true;
    } else if (
      this.pageType == 'reports' &&
      this.authGuard.allowAccessComponent(this.pageType, 'view')
    ) {
      return true;
    } else {
      return false;
    }
  }

  applyFilterrLive(wInfo) {
    try {
      const self = this;
      self.isPreviewLoading = true;
      const chartInput = wInfo;
      if(wInfo.cType != 'table' && wInfo.cType != 'map' && wInfo.cData.chartOptions.filter.filtersData[0].value.length > 1){
        wInfo.cData.chartOptions.filter.filtersData[0].value = wInfo.cData.chartOptions.filter.filtersData[0].value.slice(0,1);
      }
      // this.setRealtimeRefresh();
      delete chartInput.cData.chartData;
      const widgetTmp = wInfo;
      const chartLevel = wInfo.cData.chartOptions
      this.getChartDataLiveTopics(widgetTmp.cData.chartOptions).then(data => {
        if (data && (data['status'] === 'success') && data['topics']) {
          widgetTmp.cData.chartOptions.autoRefresh = true,
            widgetTmp.cData.chartOptions.autoRefreshType = "realTime",
            widgetTmp.cData.chartOptions['topics'] = data['topics'];
            if(widgetTmp.cData.chartOptions.chartType == 'harmonics'){
              widgetTmp.cData.chartOptions.yaxis = data['harmonic_tags'];
             }
            if(widgetTmp.cType == 'map'){
              widgetTmp.cData.chartOptions['markers'] = data['markers'];
              widgetTmp.cData.chartOptions.markers.forEach(element => {
                element['tableData'] = this.getLiveChartDataForDigital(widgetTmp.cData.chartOptions, element['device_mapping']);
              });;
            }
          if (['table'].indexOf(widgetTmp.cData.chartOptions.chartType) > -1) {
            widgetTmp.cData.chartData = this.getLiveChartDataForDigital(widgetTmp.cData.chartOptions, data['device_mapping'])
          } else if(widgetTmp.cType != 'map'){
            if (!widgetTmp.cData.chartData) {
              widgetTmp.cData.chartData = {};
            }
            if (!widgetTmp.cData.chartData.series) {
              widgetTmp.cData.chartData = {
                series: []
              };
            }
            if (!widgetTmp.cData.chartOptions) {
              widgetTmp.cData.chartOptions = {};
            } else {
              widgetTmp.cData.chartData.series = this.getLiveChartSeries(
                widgetTmp.cData.chartOptions,
                data['device_mapping']
              );
            }
          }
          this.widgetDataLiveShow = false;
          this.autoRefreshInstance = setTimeout(function () {
            self.widgetDataLive.wcData = [widgetTmp];
            self.widgetDataLiveShow = true;
            self.isPreviewLoading = false;
          }, 500);
        } else {
          // widgetTmp.wcData.cData.chartOptions = {
          // };
          // this.widgetConfigData.wcData.cData.chartOptions = undefined
          // setTimeout(function () {
          //   self.widgetConfigData.wcData = widgetTmp.wcData;
          //   self.isPreviewLoading = false;
          // }, 500);
          // this.toastLoad.toast('error', 'Error', 'Error occurred while Fetching Preview', true);
        }
        /** this.widgetInfo = {...wInfo};*/
        this.clearMqttInstance();
        this.widgetInfo = this.getCopy(wInfo);
        this.setRealtimeRefresh();
        // this.mqttData.refresh();;
        this.showPreview = true;
      });
    } catch (error) {
      ////console.log(error);
    }
  }
  setRealtimeRefresh() {
    const _refObj = this;
    const clientId = 'mqttjs_' + Math.random().toString(17).substr(2, 8);
    if (this._mqttClient) {
      return;
    }
    this._mqttClient = Paho.MQTT.Client;
    const host = Config.CONSTANTS.MQTT.ip;
    const port = Config.CONSTANTS.MQTT.port;
    this._mqttClient = new Paho.MQTT.Client(host, Number(port), clientId);
    this._mqttClient.onMessageArrived = (message: Paho.MQTT.Message) => {
      // console.log("MQTT data arrived");
      this.mqttData = {
        topic: message.destinationName, // topic
        data: message.payloadString ? JSON.parse(message.payloadString) : {} // data
      };
      this.updateMqttData();
    };

    this._mqttClient.onConnectionLost = (responseObject: Object) => {
      this.blinkIndicator = false;
      console.log('Connection Lost');
    };

    this._mqttClient.connect({
      useSSL: Config.CONSTANTS.MQTT.useSSL,
      userName: Config.CONSTANTS.MQTT.userName,
      password: Config.CONSTANTS.MQTT.password,
      onFailure: _refObj.onFailed.bind(this),
      onSuccess: _refObj.onConnected.bind(this),
      keepAliveInterval: 45
    });
    // userName: 'biswajit', password: 'admin'
  }

  /**
   * Method called when mqtt connection failed
   * @param errorCode Error messages
   */
  private onFailed(errorCode) {
    console.log('Failed', errorCode);
  }

  private onConnected(): void {
    let newData = this.widgetInfo;
    console.log('Filter Live Connected');
    this.blinkIndicator = true;
    const chartOpt = newData.cData.chartOptions;
    if (chartOpt.autoRefresh && chartOpt.autoRefreshType === 'realTime') {
      if (chartOpt.topics) {
        const topics = chartOpt.topics;
        const topicsList = Object.keys(topics);
        if (topicsList.length > 0) {
          this.subscribeTotopic(topicsList, 0);
        }
      }
    }
  }

  subscribeTotopic(topicsList, topic) {
    this._mqttClient.subscribe(topicsList[topic], {
      onSuccess: (msg) => {
        // console.log(msg.grantedQos);
        topic++;
        if (topic < topicsList.length) {
          this.subscribeTotopic(topicsList, topic);
        }
      },
      onFailure: (errorMessage) => {
        // console.log(errorMessage);
        topic++;
        if (topic < topicsList.length) {
          this.subscribeTotopic(topicsList, topic);
        }
      }
    });
  }

  clearMqttInstance() {
    if (this._mqttClient) {
      this._mqttClient = undefined;
      console.log('Filter Live DisConnected');
    }
  }
  // ngDoCheck() {
  //   this.updateMqttData();
  // }

  checkRepeatedMqtt(arrData, arrSeries) {
    if (arrSeries.length <= 0) {
      arrData[1] = arrData[1];
      return arrData;
    }
    for (let index = 0; index < arrSeries.length; index++) {
      if (arrData[0] == arrSeries[index][0]) {
        ///timeStamp Comparsion
        return '';
      }
    }
    arrData[1] = arrData[1];
    return arrData;
  }

  //Date selection popup code
  showDropdownValues(event) {
    try {
      // event.stopPropagation();
      event.preventDefault();
      this._wdgShow.dateClick(true);
      const wData = this.widgetInfo.cData.chartOptions;
      // if (wData.filter.isCustom && !wData.filter.hasOwnProperty('customBackup') && !wData.hasOwnProperty('dateBackup')) {
      //   wData.filter['customBackup'] = {};
      //   wData.filter['customBackup'] = JSON.parse(JSON.stringify(wData.filter.custom));
      // } else
      // if (!wData.hasOwnProperty('dateBackup') && !wData.filter.isCustom  || !wData.filter.isCustom) {
      //   wData['dateBackup'] = {
      //     timeRange: wData.filter.timeRange,
      //     timeRangeLabel: wData.filter.timeRangeLabel,
      //     isCustom: wData.filter.isCustom
      //   };
      //    wData.filter.custom = {
      //     from: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //     fromDisp: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //     to: new Date(),
      //     toDisp: new Date()
      // }
      // }
      if (!wData.filter.isCustom) {
        this.wDatatemp = {
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
      } else {
        this.wDatatemp = JSON.parse(JSON.stringify(wData.filter.custom));
      }
      wData['is_common_filter'] = true;
      this.showTimeRange = true;
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for updating custom dates into chart options
   * @param event selected date event
   * @param key key where needs to update the value
   */
  onDateSelect(event, key) {
    try {
      this.showClear = true;
      const dateString = event.toISOString().split('.')[0] + 'Z';
      this.wDatatemp[key] = dateString;
      // this.isApplied = false;
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for assigning predefined time range into the chart options
   * @param selectedVal selected range
   */
  selectTimeRange(selectedVal) {
    try {
      this.showClear = true;
      const wData = this.widgetInfo.cData.chartOptions;
      wData.filter.timeRange = selectedVal.value;
      wData.filter.timeRangeLabel = selectedVal.label;
      wData.filter.isCustom = false;
      this.updateChartData(this.widgetInfo);
      this.isApplied = false;
      this.closeDropdownValues();
    } catch (error) {
      // console.log(error);
    }
  }
  /**
   * Method for closing custom tim range popup
   */
  closeDropdownValues() {
    if (this.showTimeRange) {
      this.showTimeRange = false;
      // if (!this.isApplied && !this.widgetInfo.cData.chartOptions.filter.isCustom) {
      //   if(!this.widgetInfo.cData.chartOptions.filter.isCustom) {
      //     this.wDatatemp = {
      //   from: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //   fromDisp: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //   to: new Date(),
      //   toDisp: new Date()
      //     };
      //   }
      // }
    }
    this._wdgShow.dateClick(false);
  }
  resetDate() {
    const wData = this.widgetInfo.cData.chartOptions;
    if (wData.filter.isCustom && !wData.hasOwnProperty('dateBackup')) {
      wData.filter.custom = wData.filter.customBackup;
      delete wData.filter.customBackup;
    } else {
      if (wData.filter.hasOwnProperty('customBackup')) {
        wData.filter.isCustom = true;
        wData.filter.custom = wData.filter.customBackup;
        delete wData.filter.customBackup;
      } else if (wData.hasOwnProperty('dateBackup')) {
        wData.filter.timeRangeLabel = wData.dateBackup.timeRangeLabel;
        wData.filter.timeRange = wData.dateBackup.timeRange;
        wData.filter.isCustom = wData.dateBackup.isCustom;
        delete wData.dateBackup;
      }
    }
    this.showClear = false;
    wData['is_common_filter'] = false;
    this.updateChartData(this.widgetInfo);
  }

  track(index) {
    return index;
  }

  /**
   * Apply button inside time range click action
   */
  applyCustomRange() {
    try {
      const wData = this.widgetInfo.cData.chartOptions;
      let fromDate = new Date(this.wDatatemp['fromDisp']);
      let toDate = new Date(this.wDatatemp['toDisp']);
      if (fromDate.getTime() <= toDate.getTime()) {
        wData.filter.custom = this.wDatatemp;
        let from = this._util.getFormattedDateTime(
          fromDate,
          'DD-MM-YYYY HH:MM:SS'
        );
        let to = this._util.getFormattedDateTime(toDate, 'DD-MM-YYYY HH:MM:SS');
        wData.filter.timeRange = '';
        wData.filter.timeRangeLabel = from + ' - ' + to;
        wData.filter.custom['from'] = from;
        wData.filter.custom['to'] = to;
        wData.filter.isCustom = true;
        wData.filter.custom.dateOverwrite = true;
        this.updateChartData(this.widgetInfo);
        this.isApplied = true;
        this.closeDropdownValues();
        this.showClear = true;
      } else {
        this.toastLoad.toast(
          'warning',
          'Warning',
          'From date should be less than or equals to To date',
          true
        );
      }
    } catch (error) {
      // console.log(error);
    }
  }
  getPriorityTypeList() {
    const objGet = {
      filter: []
    };
    objGet['filter'].push({ site_id: this.global.getCurrentUserSiteId() });
    if (this.priorityTypeData == undefined) {
      this._appService
        .getAlarmPriorityTypes(
          this.global.deploymentModeAPI.ALARM_PRIORITY_TYPE_GET,
          objGet
        )
        .subscribe(
          (data) => {
            if (
              (data.status == 'success' && data.data != '') ||
              data.data != []
            ) {
              this.priorityTypeData = data.data;
              this.updatePriorityList();
            }
          },
          (err) => {
            this.priorityTypeData = [];
          }
        );
    }
  }
  updatePriorityList() {
    this.priorityTypeData.forEach((element) => {
      if (this.widgetInfo.cData.chartOptions.hasOwnProperty('benchmark')) {
        this.widgetInfo.cData.chartOptions.benchmark.forEach((element1) => {
          if (element1.id == element.id) {
            element1['color'] = element['priorityColor'];
            element1['iconReference'] = element['icon'];
          }
        });
      }
    });
    this.updateIcons();
  }

  updateIcons() {
    this._appService.getPriorityLevels().subscribe((data) => {
      let icons = data.icons;
      if (icons != undefined) {
        icons.forEach((element) => {
          if (this.widgetInfo.cData.chartOptions.hasOwnProperty('benchmark')) {
            this.widgetInfo.cData.chartOptions.benchmark.forEach((element1) => {
              if (element1['iconReference'] == element['value']) {
                element1['icon'] = element['class'];
              }
            });
          }
        });
      }
    });
  }

  apply(eve, key) {
    this._mqttClient = undefined;
    let index = this.widgetInfo.cData.chartOptions.harmonics[key].indexOf(eve);
    if (key == 'phase') {
      if (!this.widgetInfo.cData.chartOptions.harmonics[key].includes(eve)) {
        this.widgetInfo.cData.chartOptions.harmonics[key].push(eve);
        this.selectedPhase.push(eve);
      } else {
        this.widgetInfo.cData.chartOptions.harmonics[key].splice(index, 1);
        this.selectedPhase.splice(index, 1);
      }
    } else {
      if (this.widgetInfo.cData.chartOptions.harmonics[key] !== eve) {
        this.widgetInfo.cData.chartOptions.harmonics[key] = eve;
      }
    }
    this.widgetInfo = this.updateChartDataLive();
    this.setRealtimeRefresh();
  }
  assetActionsTrigger(actionData, time: number) {
    this.triggerData = actionData;
    this.counterTime = time;
    setTimeout(() => {
      if (this.counterTime === 0) {
        document
          .getElementById(
            'triggerActionModalclose_' + this.widgetInfo.widget_id
          )
          .click();
      } else {
        this.assetActionsTrigger(actionData, --this.counterTime);
      }
    }, 1000);
  }
  triggerConfirmModal(data) {
    let objGet = {
      asset_action_id: '',
      type: 'dashboard'
    };
    objGet.asset_action_id = data.asset_action_id;
    this._appService.triggerAssetControlData(objGet).subscribe(
      (triggerResponse) => {
        if (triggerResponse['status'] === 'success') {
          this.toastLoad.toast(
            'success',
            'Success',
            'Action Triggered Successfully',
            true
          );
        } else {
          this.toastLoad.toast(
            'error',
            'Error',
            'Action Couldn`t Be Triggered',
            true
          );
        }
      },
      (err) => {
        console.log(err);

        this.toastLoad.toast('error', 'Error', 'Failed To Reach Server', true);
      }
    );
  }
  triggerModalCancel() {
    this.counterTime = 0;
  }
  // for pie drill down on clicking on back arrow
  onBackShowPreviousMenu() {
    let indexOfElementToDelete = null;
    for (
      let i = 0;
      i < this.widgetInfo.cData.chartOptions.filter.filtersData.length;
      i++
    ) {
      this.widgetInfo.pieDropdownList.filter((element,index)=>{
        if(element.id == this.widgetInfo.dropdownValue.id) {
          indexOfElementToDelete = index;
        }
      });
      if (
        this.widgetInfo['pieDropdownList'].length > 1 &&
        this.widgetInfo['pieDropdownList'][indexOfElementToDelete].type ==
          this.widgetInfo.cData.chartOptions.filter.filtersData[i].id 
      ) {
        this.widgetInfo.cData.chartOptions.filter.filtersData[
          i
        ].value = this.widgetInfo['pieDropdownList'][
          indexOfElementToDelete+1
        ];
        this.widgetInfo['isBackArrowClicked'] = 'back';
      } 
      else 
        {
          if(this.widgetInfo.cData.chartOptions.is_pieDrill_common_filter && this.widgetInfo['pieDropdownList'][0].type ==
            this.widgetInfo.cData.chartOptions.filter.filtersData[i].id ) {
            this.widgetInfo.cData.chartOptions.filter.filtersData[i].value=this.widgetInfo['cData']['chartOptions'].pieDashboardFilterData;
          } else {
            this.widgetInfo.cData.chartOptions.filter.filtersData = this.widgetInfo.cData.chartOptions.filter.filterList;
          }
        this.widgetInfo['pieDropdownList'] = [];
        this.widgetInfo.isShowToolBox = false;
      }    
    }
    if (this.widgetInfo.isPreview) {
      this.previewService.previewCheck({
        state: 'preview',
        data: this.widgetInfo
      });
    } else {
      if (this.intervalToDestroy) {
        clearInterval(this.intervalToDestroy);
        this.intervalToDestroy = undefined;
      }
      this.assignChartOptionAndData(this.widgetInfo);
    }

  }

  // for pie drill down on clicking on dropdown values
  onChangeDDPieNodes(ddLabelsData) {
    if (!this.isLoading) {
      for (
        let i = 0;
        i < this.widgetInfo.cData.chartOptions.filter.filtersData.length;
        i++
      ) {
        if (
          this.widgetInfo['pieDropdownList'].length > 1 &&
          ddLabelsData.type ==
            this.widgetInfo.cData.chartOptions.filter.filtersData[i].id
        ) {
          this.widgetInfo.cData.chartOptions.filter.filtersData[
            i
          ].value = ddLabelsData;
          this.widgetInfo['isBackArrowClicked'] = 'change';
        }
      }
      if (this.widgetInfo.isPreview) {
        this.previewService.previewCheck({
          state: 'preview',
          data: this.widgetInfo
        });
      } else {
        if (this.intervalToDestroy) {
          clearInterval(this.intervalToDestroy);
          this.intervalToDestroy = undefined;
        }
        this.assignChartOptionAndData(this.widgetInfo);
      }
    }
  }

  rotateBarChart(wInfo) {
    try {
      if (!wInfo) {
        return;
      }
      if (wInfo.cData.chartOptions.bar_orientation === 'vertical') {
        wInfo.cData.chartOptions.bar_orientation = 'horizontal';
        this.isRotateBar = true;
      } else if (wInfo.cData.chartOptions.bar_orientation === 'horizontal') {
        wInfo.cData.chartOptions.bar_orientation = 'vertical';
        this.isRotateBar = false;
      }
      this.updateChartData(wInfo);
    } catch (error) {
      //console.log(error);
    }
  }
   previewCheckModal() {
    this.previewObservable = this.previewService.previewBoolean.subscribe(
      (message) => {
        if (
          message.state === 'widget' &&
          this.widgetInfo.widget_id == message.data.widget_id &&
          this.widgetInfo.isShowToolBox
        ) {
          this.widgetInfo = { ...message.data };
          this.assignChartOptionAndData(this.widgetInfo);
        }
      }
    );
  }
}
