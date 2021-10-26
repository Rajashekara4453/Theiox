import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnDestroy
} from '@angular/core';
import {
  faPlusSquare,
  faChartBar,
  faWindowClose
} from '@fortawesome/free-regular-svg-icons';
import { AppService } from '../../../../services/app.service';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { globals } from '../../../../utilities/globals';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, Observable, Subject, Subscription } from 'rxjs';
import { AuthGuard } from './../../../../../app/pages/auth/auth.guard';
import { WdgShowService } from '../wdg-show/wdg-show.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { PreviewPopUpService } from '../../preview-pop-up.service';

@Component({
  selector: 'kl-wdg-create',
  templateUrl: './wdg-create.component.html',
  styleUrls: ['./wdg-create.component.scss']
})
export class WdgCreateComponent implements OnInit, OnDestroy {
  @Output('wdgConfigEmitter') wdgConfigEmitter = new EventEmitter(); // to emit the widget config data for save
  @Input('dashboardInfo') dashboardInfo = {
    // dashboard info
    dashboardId: ''
  };

  // icon info
  public faPlusSquare = faPlusSquare;
  public faChartBar = faChartBar;
  public faWindowClose = faWindowClose;
  public widgetSelection: Boolean = false; // flag for show or not config section
  public widgetDataLiveShow: Boolean = false; // live widget or not
  public _chartConfig; // to store chart configuration data
  public isPreviewLoading: Boolean = false; // flag to specify widget data is loading or not
  public isEditWidget: Boolean = false; // flag to store widget is in edit mode or not
  public write_register = [];
  reportTemplateList: any;
  reportFormat = 'excel';

  public widgetDataLive: any = {
    isPreview: true,
    wcData: []
  };

  @Input() pageType: any; // to store dashboard type info
  public today = new Date(); // initialise date instance
  @Input() widgetConfigData: any = {
    // widget configuration data
    wcType: 'create',
    wcSelect: '',
    wcData: {
      title: '',
      description: '',
      isTitleShow: true,
      isLiveEnabled: true,
      isFlexi: false,
      w: '4',
      h: '400',
      disableResize: false,
      isPreview: true,
      cType: '',
      wcType: '',
      wAction: {
        show: false
      },
      cData: {
        chartOptions: {
          autoRefresh: false,
          isMap: '',
          chartType: '',
          isTile: '',
          filter: {
            isCustom: false,
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
              to: new Date(),
              fromDisp: new Date(
                this.today.getFullYear(),
                this.today.getMonth(),
                this.today.getDate(),
                0,
                0,
                0,
                0
              ),
              toDisp: new Date()
            }
          },
          reportType: '',
          reportFormat: {
            template_id: '',
            logo: '',
            row_aggregator: {
              status: true,
              SUM: false,
              AVERAGE: false,
              MAX: false,
              MIN: false
            },
            row_functions: [],
            column_aggregator: {
              status: true,
              SUM: false,
              AVERAGE: false,
              MAX: false,
              MIN: false
            },
            column_functions: [],
            consider_null: false,
            client_name: '',
            client_location: '',
            device_name: '',
            employee_details: {
              Employee_1: '',
              Employee_2: '',
              Employee_3: '',
              Employee_4: ''
            }
          },
          userDetails: {},
          write_register: [{}],
          write_register_actions: [{}]
        },
        chartData: {
          series: [],
          category: []
        }
      }
    }
  };

  public showPreview = true; // flag for show or hide widget preview
  public showConfig = false; // flag for show or hide configurations

  // chart options metadata
  public chartOptions: any = {};

  public stepNumber = 1; // active step number step 1 = widget selection, step 2 = widget configuration

  // widget types(chart type) list
  public visualizationMeta = {
    dashboard: [
      {
        type: 'chart',
        label: 'Historical Data',
        value: 'charts',
        items: [
          {
            cType: 'bar',
            label: 'KPI',
            isNormaltile: true,
            disabled: false,
            img: 'kpi.svg',
            type: 'chart'
          },
          {
            cType: 'kpi',
            label: 'Custom KPI',
            isPue: true,
            disabled: false,
            img: 'pue-kpi.svg',
            type: 'chart'
          },
          {
            cType: 'pfgraph',
            label: 'PF Chart',
            isPf: true,
            disabled: false,
            img: 'line.svg',
            type: 'chart'
          },
          {
            cType: 'bar',
            label: 'Map',
            isMap: true,
            isTile: false,
            disabled: false,
            img: 'map.svg',
            type: 'chart'
          },
          {
            cType: 'alarm',
            label: 'Alarm',
            isAlarmFilter: true,
            disabled: false,
            img: 'table.svg',
            type: 'chart'
          },
          {
            cType: 'bar',
            label: 'Tile',
            isTile: true,
            disabled: false,
            img: 'normaltile.svg',
            type: 'chart'
          },
          {
            cType: 'table',
            label: 'Table',
            isTile: false,
            disabled: false,
            img: 'table.svg',
            type: 'chart'
          },
          {
            cType: 'pie',
            label: 'Pie',
            isTile: false,
            disabled: false,
            img: 'pie.svg',
            type: 'chart'
          },
          {
            cType: 'stackedBar',
            label: 'Stacked',
            isTile: false,
            disabled: false,
            img: 'stacked.svg',
            type: 'chart'
          },
          {
            cType: 'combination',
            label: 'Combined',
            isTile: false,
            disabled: false,
            img: 'markArea.svg',
            type: 'chart'
          },
          {
            cType: 'line',
            label: 'Line',
            isTile: false,
            disabled: false,
            img: 'line.svg',
            type: 'chart'
          },
          {
            cType: 'bar',
            label: 'Bar',
            isTile: false,
            disabled: false,
            img: 'bar.svg',
            type: 'chart'
          },
          {
            cType: 'markLine',
            label: 'MarkLine',
            isTile: false,
            disabled: false,
            img: 'markLine.svg',
            type: 'chart'
          },
          {
            cType: 'markPoint',
            label: 'MarkPoint',
            isTile: false,
            disabled: false,
            img: 'markPoint.svg',
            type: 'chart'
          },
          {
            cType: 'area',
            label: 'Area',
            isTile: false,
            disabled: false,
            img: 'area.svg',
            type: 'chart'
          },
          {
            cType: 'scatter',
            label: 'Scatter',
            isTile: false,
            disabled: false,
            img: 'scatter.svg',
            type: 'chart'
          }

          // ,
          // {
          //   cType: 'flexiTiles',
          //   label: 'Flexi Tile',
          //   isTile: false,
          //   disabled: false,
          //   img: 'treemap.svg',
          //   type: 'chart',
          // }
        ]
      },
      {
        type: 'live',
        label: 'Live Data',
        value: 'Live',
        items: [
          {
            cType: 'bar',
            label: 'KPI',
            isNormaltile: true,
            disabled: false,
            img: 'kpi.svg',
            type: 'live'
          },
          {
            cType: 'harmonics',
            label: 'Harmonics',
            isTile: false,
            disabled: false,
            img: 'bar.svg',
            type: 'live'
          },
          {
            cType: 'gauge',
            label: 'Gauge',
            // isTile: false,
            isGauge: true,
            disabled: false,
            img: 'gauge.svg',
            type: 'live'
          },
          {
            cType: 'map',
            label: 'Map',
            isMapLive: true,
            isTile: false,
            disabled: false,
            img: 'map.svg',
            type: 'live',
          },
          {
            cType: 'table',
            label: 'Table',
            isTile: false,
            disabled: false,
            img: 'table.svg',
            type: 'live'
          },
          {
            cType: 'hvbar',
            label: 'Horizontal Progress Bar',
            isProgresswidget: true,
            isHorizontal: true,
            disabled: false,
            img: 'bar-range-horizontal.svg',
            type: 'live'
          },
          {
            cType: 'hvbar',
            label: 'Vertical Progress Bar',
            isProgresswidget: true,
            isHorizontal: false,
            disabled: false,
            img: 'bar-range-verticle.svg',
            type: 'live'
          }
          // ,
          // {
          //   cType: 'line',
          //   label: 'Line',
          //   isTile: false,
          //   disabled: false,
          //   img: 'line.svg',
          //   type: 'live',

          // },
          // {
          //   cType: 'bar',
          //   label: 'Bar',
          //   isTile: false,
          //   disabled: false,
          //   img: 'bar.svg',
          //   type: 'live',

          // },
          // {
          //   cType: 'area',
          //   label: 'Area',
          //   isTile: false,
          //   disabled: false,
          //   img: 'area.svg',
          //   type: 'live',

          // },
          // {
          //   cType: 'scatter',
          //   label: 'Scatter',
          //   isTile: false,
          //   disabled: false,
          //   img: 'scatter.svg',
          //   type: 'live',
          // }
        ]
      },
      {
        type: 'live',
        label: 'Asset Control',
        value: 'Live',
        items: [
          {
            cType: 'modbus_write_widget',
            label: 'ON/OFF',
            isModeBus: true,
            disabled: false,
            img: 'onOffTile.svg',
            type: 'live'
          }
        ]
      }
    ],
    reports: [
      {
        type: 'chart',
        label: 'Excel',
        value: 'excel',
        items: []
      },
      {
        type: 'chart',
        label: 'Pdf',
        value: 'pdf',
        items: []
      }
    ],
    trends: [
      {
        type: 'chart',
        label: 'Historical Data',
        value: 'charts',
        items: [
          {
            cType: 'line',
            label: 'Line',
            isTile: false,
            disabled: false,
            img: 'line.svg',
            type: 'chart'
          },
          {
            cType: 'bar',
            label: 'Bar',
            isTile: false,
            disabled: false,
            img: 'bar.svg',
            type: 'chart'
          },
          {
            cType: 'area',
            label: 'Area',
            isTile: false,
            disabled: false,
            img: 'area.svg',
            type: 'chart'
          },
          {
            cType: 'scatter',
            label: 'Scatter',
            isTile: false,
            disabled: false,
            img: 'scatter.svg',
            type: 'chart'
          },
          {
            cType: 'table',
            label: 'Table',
            isTile: false,
            disabled: false,
            img: 'table.svg',
            type: 'chart'
          },
          {
            cType: 'pie',
            label: 'Pie',
            isTile: false,
            disabled: false,
            img: 'pie.svg',
            type: 'chart'
          },
          {
            cType: 'stackedBar',
            label: 'Stacked',
            isTile: false,
            disabled: false,
            img: 'stacked.svg',
            type: 'chart'
          },
          {
            cType: 'combination',
            label: 'Combination',
            isTile: false,
            disabled: false,
            img: 'markArea.svg',
            type: 'chart'
          },
          // {
          //   cType: 'flexiTiles',
          //   label: 'Flexi Tile',
          //   isTile: false,
          //   disabled: false,
          //   img: 'treemap.svg',
          //   type: 'chart',
          // },
          {
            cType: 'markLine',
            label: 'MarkLine',
            isTile: false,
            disabled: false,
            img: 'markLine.svg',
            type: 'chart'
          },
          {
            cType: 'markPoint',
            label: 'MarkPoint',
            isTile: false,
            disabled: false,
            img: 'markPoint.svg',
            type: 'chart'
          }
        ]
      }
    ]
  };

  public visualizationData: any; // to store chart list based on dashboard type
  filterMenu: any;
  isToaster: boolean = false;
  currentBlockData = { index: 0, isClicked: true };
  latlongData = [];
  isSaveLoading: boolean;
  responseData: Observable<any>;
  alarmWidgetData: any;
  modeBusData: any;
  showImagePicker: boolean = false;
  subscriptions: Subscription;
  previewObservable: Subscription;
  
  /**
   * Getter for getting widget data
   */
  get widgetData(): any {
    return this.widgetConfigData.wcData;
  }
  constructor(
    private _appService: AppService,
    private _toastLoad: ToastrService,
    private global: globals,
    private http: HttpClient,
    private authGuard: AuthGuard,
    private _wdgShowService: WdgShowService,
    private previewService: PreviewPopUpService
  ) {}

  ngOnInit() {
    const getSubject = new Subject<any>();
    this.previewCheckModal();
    let getJSON$ = this.getWidgetCOnfigurationJson();
    getJSON$.subscribe((getJSON) => {
      if (!getJSON) {
        return;
      } else {
        this.openWidgetConfigPopup();
        this.setVisualizationData();
      }
    });
    if (!this.widgetConfigData) {
      // if new widget is creating
      this.widgetConfigData = {
        wcType: 'create',
        wcSelect: '',
        wcData: {
          title: '',
          description: '',
          isTitleShow: true,
          isLiveEnabled: true,
          isFlexi: false,
          isPf: false,
          isNormaltile: false,
          isGauge: false,
          isModeBus: false,
          isTile: '',
          isMap: '',
          w: '4',
          h: '400',
          isPreview: true,
          cType: '',
          wcType: '',
          wAction: {
            show: false
          },
          cData: {
            chartOptions: {
              autoRefresh: false,
              isPreview: true,
              chartType: '',
              filter: {
                isCustom: false,
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
                  to: new Date(),
                  fromDisp: new Date(
                    this.today.getFullYear(),
                    this.today.getMonth(),
                    this.today.getDate(),
                    0,
                    0,
                    0,
                    0
                  ),
                  toDisp: new Date()
                }
              },
              reportType: '',
              reportFormat: {
                template_id: '',
                logo: '',
                row_aggregator: {
                  status: true,
                  SUM: false,
                  AVERAGE: false,
                  MAX: false,
                  MIN: false
                },
                row_functions: [],
                column_aggregator: {
                  status: true,
                  SUM: false,
                  AVERAGE: false,
                  MAX: false,
                  MIN: false
                },
                column_functions: [],
                consider_null: false,
                client_name: '',
                client_location: '',
                device_name: '',
                employee_details: {
                  Employee_1: '',
                  Employee_2: '',
                  Employee_3: '',
                  Employee_4: ''
                },
                cost: 0,
                sec_columns: []
              },
              userDetails: {}
            },
            chartData: {}
          },
          cConfig: {}
        }
      };
    }
  }

  // setting visualization data according to the pageType input, sent from the dashboard component
  // TODO: make it dynamic, according to the dashboard_id
  setVisualizationData() {
    this.visualizationData = this.visualizationMeta[this.pageType];
  }

  /**
   * Method for initialize the widget configuration
   */
  openWidgetConfigPopup() {
    try {
      this.widgetConfigData.wcData['isPreview'] = true;
      // this.getChartMeta().then(data => { // api call for getting all filter metadata
      //   this.chartOptions.yaxis.tags = data['tags'];
      //   this.chartOptions.filter.filterMeta = {
      //     hierarchy: data['site'],
      //     deviceGroups: data['device_group'],
      //     devices: data['devices'],
      //     tagGroups: data['tag_group'],
      //     sites: data['site_list']
      //   };

      // });
      if (this.widgetConfigData.wcType == 'update') {
        this.stepNumber = 2;
        this.showPreview = false;
        this.showConfig = true;
        this.isEditWidget = true;
      }
      this._wdgShowService.setResize(false);
      this._wdgShowService.createOrEditwidget(true);
      this.getFilterTypeMenu();
      this.getPriorityTypeList();
      this.getChartUnitInfo().then((data) => {
        // api call for getting unit convertion informations
        if (this.widgetConfigData.wcSelect !== 'live') {
          this.widgetSelection = true;
        }
        this.chartOptions.yaxis.units = data;
        if (this.widgetConfigData.wcType == 'update') {
          // if (this.widgetConfigData.wcData['cData']['chartOptions']['autoRefreshType'] === 'realTime') {
          //   this.previewChartLive(); // method call for previewing live chart
          // }
          this.stepNumber = 2;
          this.showPreview = false;
          this.showConfig = true;
          this.isEditWidget = true;
        } else {
          this.stepNumber = this.stepNumber == 2 ? this.stepNumber : 1;
          this.setDefaultChartSelection();
          this.widgetConfigData.wcSelect = 'chart';
          this.isEditWidget = false;
        }
      });
      if (this.pageType == 'reports') {
        this.handleReportFormatChange('excel', 0);
        // this.handleReportFormatChange("pdf",1);
      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for closing widget configuration
   */
  closeWidgetConfigPopup() {
    try {
      this.widgetSelection = false;
      const emitData = {
        type: 'close'
      };
      this._wdgShowService.createOrEditwidget(false);
      this.wdgConfigEmitter.emit(this.getCopy(emitData));
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for updating active tab name
   * @param tabname selected tab name
   */
  wdgTypeTabChanged(tabname) {
    try {
      this.widgetConfigData.wcSelect = tabname.type;
      this.widgetConfigData.wcType = '';
      this.reportFormat = tabname.label;
    } catch (error) {
      //console.log(error);
    }
  }

  handleReportFormatChange(typeOfReport, arrayNum) {
    let objGet: object = {};
    objGet['type'] = typeOfReport;
    this.subscriptions = this._appService
      .getReportTemplate(objGet)
      .subscribe((data) => {
        if (data != null && data.status == 'success')
          this.reportTemplateList = data.data;
        //for shift SEC report added
        // this.reportTemplateList.push({"label":"Shift SEC Report","value":"template_119"});
        for (let data of this.reportTemplateList) {
          const templateData = {
            cType: 'table',
            label: data.label,
            isTile: false,
            disabled: false,
            value: typeOfReport,
            templateId: data.value,
            img: 'table.svg',
            type: 'chart'
          };
          this.visualizationMeta[this.pageType][arrayNum].items.push(
            templateData
          );
        }
      });
  }

  /**
   * For setting the default chart type or widget type
   */
  setDefaultChartSelection() {
    try {
      if (this.pageType) {
        if (
          this.visualizationMeta &&
          this.visualizationMeta[this.pageType].length > 0
        ) {
          this.widgetConfigData.wcSelect = this.visualizationMeta[
            this.pageType
          ]['type'];
          this.widgetConfigData.wcType = '';
        }
      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Chart type selection action
   * @param item selected chart details
   */
  chartTypeChanged(item) {
    try {
      if (item.disabled) {
        return;
      }
      this.widgetConfigData.wcSelect = item.type;
      this.widgetConfigData.wcType = item.cType;
      this.widgetConfigData.wcData.title = '';
      this.widgetConfigData.wcData.isTile = item.isTile;
      this.widgetConfigData.wcData.isNormaltile = item.isNormaltile
        ? true
        : false;
      this.widgetConfigData.wcData.isProgressbar = item.isProgresswidget
        ? true
        : false;
      this.widgetConfigData.wcData.isGauge = item.isGauge ? true : false;
      this.widgetConfigData.wcData.isPue = item.isPue ? true : false;
      this.widgetConfigData.wcData.isPf = item.isPf ? true : false;
      this.widgetConfigData.wcData.isAlarmFilter = item.isAlarmFilter
        ? true
        : false;
      this.widgetConfigData.wcData.isModeBus = item.isModeBus ? true : false;
      this.widgetConfigData.wcData.isMap = item.isMap ? true : false;
      this.widgetConfigData.wcData.cType = item.cType;
      this.widgetConfigData.wcData['cTypeLabel'] = item.label;
      this.widgetConfigData.wcData['isHorizontal'] = item.isHorizontal
        ? true
        : false;
      this.widgetConfigData.wcData.cData.chartOptions.chartType = item.cType;
      this.widgetConfigData.wcData.cData.chartOptions.reportFormat.template_id =
        item.templateId;
      this.widgetConfigData.wcData.cData.chartData = {};
      this.widgetConfigData.wcData.isTitleShow = true;
      this.setChartTemplate(item); // initialise chart options
      this.changeStepAction('next'); // goto configuration page
      this.showPreview = false;
      this.showConfig = true;
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for returning selected widget type
   */
  getChartLabel() {
    try {
      return this.widgetConfigData &&
        this.widgetConfigData.wcData &&
        this.widgetConfigData.wcData.cTypeLabel
        ? this.widgetConfigData.wcData.cTypeLabel
        : '';
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Step change action method
   * @param action next or prev
   */
  changeStepAction(action) {
    try {
      switch (action) {
        case 'next':
          this.stepNumber += 1;
          break;
        case 'prev':
          this.stepNumber -= 1;
          break;
      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for initialising configurations for a new widget
   */
  setChartTemplate(repoType) {
    try {
      const today = new Date();
      const userObject = this.authGuard.accessUserObject();
      this._chartConfig = {
        img: '',
        isImageShow: true,
        autoRefresh: true,
        autoRefreshType: 'ajax',
        isVertical: false,
        is_common_filter: false,
        isFlexi: false,
        isShowActionValue: false,
        isShowActionButtons: false,
        isActionEnabled: true,
        controlsData: [],
        isLiveEnabled: true,
        isAction: false,
        viewFormat: true,
        is_preview: true,
        isDateShow: {
          value: true,
          label: 'Left'
        },
        format: 'DD/MM/YYYY',
        autoRefreshTime: 60,
        maxDecimalPoint: 2,
        grid: {
          xGridLine: false,
          yGridLine: true
        },
        isPf: this.widgetConfigData.wcData.isPf,
        isTile: this.widgetConfigData.wcData.isTile,
        isNormaltile: this.widgetConfigData.wcData.isNormaltile,
        isGauge: this.widgetConfigData.wcData.isGauge,
        isPue: this.widgetConfigData.wcData.isPue,
        isModeBus: this.widgetConfigData.wcData.isModeBus,
        chartType: this.widgetConfigData.wcType,
        isHorizontal: this.widgetConfigData.wcData['isHorizontal'],
        legend: {
          show: true,
          position: 'bottom'
        },
        xaxis: {},
        yaxis: [],
        filter: {
          timeRange: 'today',
          timeRangeLabel: 'Today',
          aggregation: 'list',
          filterList: [],
          isCustom: false,
          dateOverwrite: true,
          custom: {
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
          },
          compare: {
            comparison: false,
            comparisonPeriod: 'previous_period',
            custom: {
              from: this.getFormattedDateTime(
                new Date(),
                'DD-MM-YYYY HH:MM:SS'
              ),
              to: this.getFormattedDateTime(new Date(), 'DD-MM-YYYY HH:MM:SS')
            }
          }
        },
        reportType: repoType.value,
        reportFormat: {
          template_id: this.widgetConfigData.wcData.cData.chartOptions
            .reportFormat.template_id,
          logo: '',
          row_aggregator: {
            status: true,
            SUM: false,
            AVERAGE: false,
            MAX: false,
            MIN: false
          },
          row_functions: [],
          column_aggregator: {
            status: true,
            SUM: false,
            AVERAGE: false,
            MAX: false,
            MIN: false
          },
          column_functions: [],
          consider_null: false,
          client_name: '',
          client_location: '',
          device_name: '',
          employee_details: {
            Employee_1: '',
            Employee_2: '',
            Employee_3: '',
            Employee_4: ''
          },
          cost: 0,
          sec_columns: []
        },
        userDetails: {}
      };
      this.chartOptions.yaxis['colors'] = this.global._appConfigurations[
        'colors'
      ];

      switch (this.widgetConfigData.wcSelect) {
        case 'chart':
          this.widgetConfigData.wcData['wResize'] = {
            h: 4,
            w: 6,
            x: 0,
            y: 100
          };
          this._chartConfig.xaxis = {
            label: '',
            type: 'timeSeries',
            aggregation: null,
            format: 'dd/MM/yyyy HH:mm:ss'
          };
          this._chartConfig.grid = {
            xGridLine: false,
            yGridLine: true
          };
          const firstYaxis = {
            isAdvance: false,
            name: '',
            group: null,
            isCustomValue: false, //for pue widget
            aggregation: null,
            tag: null,
            selectedUnit: null,
            selectedUnitVal: null,
            conversionFactor: '1',
            unit: null,
            unitInfo: null,
            color: 'null',
            position: 'left',
            threshold: false,
            thresholdValue: 100,
            benchmark: false,
            benchmarkValue: 100,
            isInverse: false,
            isPf: this.widgetConfigData.wcData.isPf,
            isTile: this.widgetConfigData.wcData.isTile,
            isNormaltile: this.widgetConfigData.wcData.isNormaltile,
            isGauge: this.widgetConfigData.wcData.isGauge,
            isMap: this.widgetConfigData.wcData.isMap ? true : false,
            type: this.widgetConfigData.wcType,
            function: {
              name: null,
              tag1: null,
              tag2: null,
              operator: null,
              isCustom: false,
              tag3: null,
              frequency: null,
              shift: null
            },
            devices: [],
            deviceGroups: []
          };
          if (['pie', 'table'].indexOf(this.widgetConfigData.wcType) > -1) {
            delete firstYaxis.color;
            delete firstYaxis.threshold;
            delete firstYaxis.thresholdValue;
            delete firstYaxis.benchmark;
            delete firstYaxis.benchmarkValue;
            delete firstYaxis.position;
            this.widgetConfigData.wcData.isShowToolBox = false;
            this.widgetConfigData.wcData.isPieClick = false;
            this.widgetConfigData.wcData['pieDropdownList'] = [];
          }
          if (this.widgetConfigData.wcData.cType === 'alarm') {
            this.alarmWidgetFilterSet();
            this._chartConfig['showPriorityList'] = true;
            this._chartConfig['showTable'] = true;
            this._chartConfig['isShowBorder'] = false;
          }

          if (['pie'].indexOf(this.widgetConfigData.wcType) > -1) {
            delete this._chartConfig.filter.compare;
            this._chartConfig.viewFormat = true;
          }
          if (
            this.widgetConfigData.wcType === 'combination' ||
            this.widgetConfigData.wcType === 'pfgraph'
          ) {
            firstYaxis.type = 'line';
          }
          this._chartConfig.yaxis = [firstYaxis];
          if (this.widgetConfigData.wcData.isPue) {
            this._chartConfig.yaxis = [
              {
                conversionFactor: 1,
                function: {
                  frequency: null,
                  isCustom: false,
                  name: null,
                  operator: null,
                  shift: null,
                  tag1: null,
                  tag2: null,
                  tag3: null
                },
                CustomMultiplicationFactor: 1,
                isCustomValue: false,
                tagCustomValue: 0,
                isSetShow: true,
                isAdvance: false,
                name: 'Set 1',
                selectedUnit: null,
                selectedUnitVal: null,
                tag: null,
                unit: null,
                unitInfo: null,
                set: 1
              },
              {
                conversionFactor: 1,
                set: 2,
                CustomMultiplicationFactor: 1,
                isCustomValue: false,
                tagCustomValue: 0,
                function: {
                  frequency: null,
                  isCustom: false,
                  name: null,
                  operator: null,
                  shift: null,
                  tag1: null,
                  tag2: null,
                  tag3: null
                },
                isSetShow: true,
                isAdvance: false,
                name: 'Set 2',
                selectedUnit: null,
                selectedUnitVal: null,
                tag: null,
                unit: null,
                unitInfo: null
              },
              {
                CustomMultiplicationFactor: 1,
                operator: '+',
                isSetShow: true,
                label: 'Result',
                value_1: 1,
                value_2: 2,
                customUnit: '',
                set: 3
              }
            ];
          }
          this._chartConfig.isReadYaxisFilter = false;
          if (
            this.widgetConfigData.wcData.isModeBus &&
            this.widgetConfigData.wcSelect !== 'live'
          ) {
            this.chartOptions['modBuscolors'] = this.global._appConfigurations[
              'modbusColors'
            ];
            this._chartConfig.write_register = [
              {
                relay_operation: null,
                label: 'ON',
                color: '#EE4040'
              },
              {
                relay_operation: null,
                label: 'OFF',
                color: '#EE4040'
              }
            ];
          }
          if (this.widgetConfigData.wcType === 'flexiTiles') {
            //  delete this._chartConfig.yaxis;
            this.widgetConfigData.wcData.isFlexi = true;
            this._chartConfig.xaxis['dimensionalTag'] = 'devices';
            this._chartConfig.flexiTiles = {
              noOfTagsToSwapOnInterval: null,
              noOfBlocksToSwapOnInterval: null,
              isShowUnit: false,
              isShowControls: false,
              blocks: [
                {
                  name: null,
                  isAdvance: false,
                  progressTag: null,
                  selectedProgressTag: [
                    {
                      name: '',
                      group: null,
                      aggregation: null,
                      tag: null,
                      selectedUnit: null,
                      selectedUnitVal: null,
                      conversionFactor: '1',
                      unit: null,
                      unitInfo: null,
                      color: null,
                      position: 'left',
                      threshold: true,
                      thresholdValue: 100,
                      benchmark: true,
                      benchmarkValue: 100,
                      isInverse: false,
                      isComparisonRequired: false,
                      isTile: this.widgetConfigData.wcData.isTile,
                      isMap: this.widgetConfigData.wcData.isMap ? true : false,
                      type: this.widgetConfigData.wcType,
                      function: {
                        name: null,
                        tag1: null,
                        tag2: null,
                        operator: null,
                        isCustom: false,
                        tag3: null,
                        frequency: null,
                        shift: null
                      }
                    }
                  ],
                  isShowProgressBar: false,
                  tags: [
                    {
                      name: '',
                      group: null,
                      aggregation: null,
                      tag: null,
                      selectedUnit: null,
                      selectedUnitVal: null,
                      conversionFactor: '1',
                      unit: null,
                      unitInfo: null,
                      color: null,
                      position: 'left',
                      threshold: false,
                      thresholdValue: 100,
                      benchmark: false,
                      benchmarkValue: 100,
                      isInverse: false,
                      isComparisonRequired: false,
                      isTile: this.widgetConfigData.wcData.isTile,
                      isMap: this.widgetConfigData.wcData.isMap ? true : false,
                      type: this.widgetConfigData.wcType,
                      function: {
                        name: null,
                        tag1: null,
                        tag2: null,
                        operator: null,
                        isCustom: false,
                        tag3: null,
                        frequency: null,
                        shift: null
                      }
                    }
                  ]
                }
              ]
            };
          } else {
            this.widgetConfigData.wcData.isFlexi = false;
          }
          if (this.widgetConfigData.wcType === 'stackedBar') {
            this._chartConfig.xaxis.stackBy = 'tagsunit';
            this._chartConfig.xaxis.unitReference = 'convertedUnit';
          }
          if (this.widgetConfigData.wcData.isNormaltile) {
            this.widgetConfigData.wcData.h = 160;
            this.widgetConfigData.wcData.w = 3;
            this._chartConfig.filter.compare.comparison = false;
          }

          if (
            ['bar'].indexOf(this.widgetConfigData.wcType) > -1 &&
            (this.widgetConfigData.wcData.isTile ||
              this.widgetConfigData.wcData.isMap)
          ) {
            for (
              let index = 0;
              index < this.chartOptions.filter.compare.length;
              index++
            ) {
              //Comparsion dsiabling Functionality
              this._chartConfig.filter.compare.comparison = false;
            }
          }
          if (
            this.widgetConfigData.wcType === 'bar' &&
            !this.widgetConfigData.wcData.isMap &&
            !this.widgetConfigData.wcData.isNormaltile &&
            !this.widgetConfigData.wcData.isTile
          ) {
            this._chartConfig.bar_orientation = 'vertical';
          }
          if (
            !this.widgetConfigData.wcData.isNormaltile &&
            !this.widgetConfigData.wcData.isMap &&
            this.widgetConfigData.wcType !== 'pfgraph' &&
            this.widgetConfigData.wcType !== 'kpi'
          ) {
            this._chartConfig.xaxis.sort = 'default';
            this._chartConfig.xaxis.limit_results = 0;
          }
          if (this.widgetConfigData.wcType === 'markLine') {
            this._chartConfig.visualMap = {
              top: 10,
              right: 10,
              pieces: [
                {
                  gt: 0,
                  lte: 1000,
                  color: null,
                  backupValue: 'null',
                  colorReference: 'color 0'
                }
              ]
            };
          }

          if (this.widgetConfigData.wcType === 'markPoint') {
            this._chartConfig.yaxis[0].markPointData = null;
          }
          if (this.pageType == 'reports') {
            this.widgetConfigData.wcData['wResize'] = {
              h: 8,
              w: 12,
              x: 0,
              y: 0
            };
            this._chartConfig.autoRefresh = false;
            this._chartConfig.userDetails = {
              user_role: userObject.userRole != null ? userObject.userRole : '',
              user_role_name:
                userObject.userRole != null ? userObject.userRoleName : '',
              name: userObject.userRole != null ? userObject.userName : '',
              full_name: userObject.userRole != null ? userObject.fullName : '',
              user_name: userObject.userRole != null ? userObject.userName : '',
              user_id: userObject.userRole != null ? userObject.user_id : '',
              email: userObject.userRole != null ? userObject.eMail : '',
              user_role_description:
                userObject.userRole != null
                  ? userObject.userRoleDescription
                  : '',
              client_id:
                userObject.userRole != null ? userObject.client_id : '',
              site_id: this.global.getCurrentUserSiteId()
            };
          }
          break;
        case 'live':
          this.widgetConfigData.wcData['wResize'] = {
            h: 4,
            w: 6,
            x: 0,
            y: 100
          };
          this._chartConfig.grid = {
            xGridLine: false,
            yGridLine: true
          };
          // asset control live widget to generate the widget data for next iteration
          if (
            this.widgetConfigData.wcData.isModeBus &&
            this.widgetConfigData.wcSelect == 'live'
          ) {
            this._chartConfig['write_register'] = [
              {
                label: 'ON',
                color: '#EE4040',
                id: '0'
              }
            ];
            this._chartConfig['write_register_actions'] = [
              {
                label: 'OFF',
                color: '#EE4040',
                id: '1'
              }
            ];
            this._chartConfig['assetActions'] = [
              {
                assets: [],
                tags: [],
                write_value: null,
                disabledInput: false
              }
            ];
            this._chartConfig['assetActionsData'] = [
              {
                assets: [],
                tags: [],
                write_value: null,
                disabledInput: false
              }
            ];
            this._chartConfig.assetControls = [
              {
                value: null,
                toValue: null,
                fromValue: null,
                color: '0',
                condition: '==',
                isRangeValue: false
              }
            ];
          }
          this._chartConfig['isVertical'] = false;
          if (this._chartConfig.chartType == 'harmonics') {
            this._chartConfig['harmonics'] = {
              volt_or_amps: 'Volts',
              phase: ['R'],
              tag_range: 'All',
              custom_value: '',
              benchmark: false,
              benchmarkValue: 100,
              threshold: false,
              thresholdValue: 100
            };
          }
          // this._chartConfig.isAdvance = false;
          if (
            this.widgetConfigData.wcData.isNormaltile ||
            this.widgetConfigData.wcData.isGauge ||
            this.widgetConfigData.wcData.isProgressbar ||
            (this.widgetConfigData.wcData.isModeBus &&
              this.widgetConfigData.wcSelect !== 'live')
          ) {
            this._chartConfig['benchmark'] = [];
            this._chartConfig['isShowBorder'] = true;
          }
          this._chartConfig.autoRefresh = true;
          this._chartConfig.autoRefreshType = 'realTime';
          this._chartConfig.autoRefreshTime = '';
          this._chartConfig.minValue = 0;
          this._chartConfig.maxValue = 10000;
          this._chartConfig.sectorColors = [
            [0.2, '#91c7ae'],
            [0.8, '#63869e'],
            [1, '#c23531']
          ];
          this._chartConfig.xaxis = {
            label: '',
            type: 'timeSeries',
            aggregation: null,
            format: 'dd/MM/yyyy HH:mm:ss'
          };
          this._chartConfig['format'] = 'DD-MM-YYYY HH:MM:SS';
          const firstYaxisLive = {
            name: '',
            group: null,
            aggregation: null,
            tag: null,
            device: null, //for asset cpntrol live widget
            unit: null,
            color: null,
            position: 'left',
            threshold: false,
            thresholdValue: 100,
            benchmark: false,
            benchmarkValue: 100,
            type: this.widgetConfigData.wcType
          };
          if (this.widgetConfigData.wcData.isNormaltile) {
            this.widgetConfigData.wcData.h = 160;
            this.widgetConfigData.wcData.w = 3;
            this.widgetConfigData.wcData.disableResize = true;
          }
          this._chartConfig.yaxis = [firstYaxisLive];
          break;
      }
      this.widgetConfigData.wcData.cData.chartOptions = this.getCopy(
        this._chartConfig
      );
    } catch (error) {
      //console.log(error);
    }
  }

  getBlockIndex(e) {
    this.currentBlockData = e;
  }

  /**
   * Method for formating the date to the given formate
   * @param date date to convert
   * @param format date formate
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
      //console.log(error);
    }
  }
  getFilterTypeMenu() {
    const show = {
      type: true,
      priority: true,
      count: true,
      alarmStatus: true,
      acknowledged: true
    };
    this.subscriptions = this._appService.getFilterMenu().subscribe((data) => {
      if (data[0].status == 'success') {
        this.chartOptions.filter['filterTypeBackup'] = {
          ...data[0].data[0],
          ...show
        };
        for (let i = 0; i < this.chartOptions.filter.types.length; i++) {
          this.chartOptions.filter.types[i].isShow =
            data[0].data[0][this.chartOptions.filter.types[i].value];
          this.chartOptions.filter.types[i].label =
            data[0].data[1][this.chartOptions.filter.types[i].value];
        }
        this.chartOptions.filter[
          'typesBackup'
        ] = this.chartOptions.filter.types;
        if (this.widgetConfigData.wcData.cType === 'alarm') {
          this.alarmWidgetFilterSet();
        }
        this.chartOptions = { ...this.chartOptions };
      }
    });
  }

  async getPriorityTypeList() {
    const objGet = {
      filter: []
    };
    objGet['filter'].push({ site_id: this.global.getCurrentUserSiteId() });
    const priorityData = await this._appService
      .getAlarmPriorityTypes(
        this.global.deploymentModeAPI.ALARM_PRIORITY_TYPE_GET,
        objGet
      )
      .toPromise();
    priorityData['data'].forEach((element) => {
      this.chartOptions['benchmark']['priorityTypes'].push({
        id: element.id,
        color: element.priorityColor,
        icon: element.icon,
        label: element.name,
        value: element.unique_name
      });
    });
    this.getIcons();
  }

  async getIcons() {
    const levels = await this._appService.getPriorityLevels().toPromise();
    this.updateIcons(levels['icons']);
  }

  updateIcons(icons) {
    if (icons != undefined) {
      icons.forEach((element1) => {
        this.chartOptions['benchmark']['priorityTypes'].forEach((element) => {
          if (element['icon'] == element1['value']) {
            element['iconReference'] = element['icon'];
            element['icon'] = element1['class'];
          }
        });
      });
    }
    this.widgetSelection = true;
  }
  alarmWidgetFilterSet() {
    const dd = [
      {
        value: 'type',
        label: 'Alarm Type',
        type: 'dropdown',
        disabled: false,
        isShow: true
      },
      {
        value: 'priority',
        label: 'Alarm Priority',
        type: 'multiCheckboxSelect',
        disabled: false,
        isShow: true
      },
      // {
      //   "value": "tags",
      //   "label": "Tags",
      //   "type": "multiCheckboxSelect",
      //   "disabled": false,
      //   "isShow": true
      // },
      {
        value: 'count',
        label: 'Count',
        type: 'dropdown',
        disabled: false,
        isShow: true
      },
      {
        value: 'alarmStatus',
        label: 'Alarm Status',
        type: 'dropdown',
        disabled: false,
        isShow: true
      },
      {
        value: 'acknowledged',
        label: 'Acknowledge',
        type: 'dropdown',
        disabled: false,
        isShow: true
      }
    ];
    this.chartOptions.filter.types = [];
    this.chartOptions.filter.types = [
      ...this.chartOptions.filter.typesBackup,
      ...dd
    ];
  }

  /**
   * To update live configuration from basic-chart-config component
   * @param $event configuration
   */
  updateOptions($event) {
    this.widgetConfigData.wcData = $event;
  }

  /**
   * To update live configuration from live-chart-config component
   * @param $event configuration
   */
  updateOptionsLive($event) {
    this.widgetConfigData.wcData = $event;
  }

  /**
   * Preview button action
   */
  previewChart() {
    try {
      this.isToaster = false;
      let count = 0;
      let mapToast = false;
      this.widgetConfigData.wcData.isShowToolBox = false;
      const chartInput = this.getCopy(
        this.widgetConfigData.wcData.cData.chartOptions
      );
      if (
        !chartInput.isReadYaxisFilter &&
        chartInput.filter.filtersData.length === 0
      ) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please select atleast one filter',
          true
        );
        this.isToaster = true;
      }
      if (
        chartInput.filter.hasOwnProperty('compare') &&
        chartInput.filter['compare'].comparison &&
        chartInput.chartType == 'table' &&
        this.pageType != 'reports' &&
        chartInput.yaxis.length > 1
      ) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please select only one tag for comparison',
          true
        );
        this.isToaster = true;
      }
      if (chartInput.hasOwnProperty('flexiTiles')) {
        if (
          chartInput.flexiTiles.noOfBlocksToSwapOnInterval == null ||
          chartInput.flexiTiles.noOfTagsToSwapOnInterval === null
        ) {
          if (chartInput.flexiTiles.noOfTagsToSwapOnInterval === null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter no of tags to display',
              true
            );
            this.isToaster = true;
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter no of blocks to display',
              true
            );
            this.isToaster = true;
          }
        }

        if (chartInput.flexiTiles.hasOwnProperty('blocks'))
          chartInput.yaxis = [];
        for (let i = 0; i < chartInput.flexiTiles.blocks.length; i++) {
          if (chartInput.flexiTiles.blocks[i].isShowProgressBar) {
            for (
              let k = 0;
              k < chartInput.flexiTiles.blocks[i].selectedProgressTag.length;
              k++
            ) {
              if (
                chartInput.flexiTiles.blocks[i].selectedProgressTag[k].tag ==
                null
              ) {
                this._toastLoad.toast(
                  'error',
                  'Error',
                  'Please select tag in progress bar',
                  true
                );
                this.isToaster = true;
              }
            }
          }
          for (
            let j = 0;
            j < chartInput.flexiTiles.blocks[i].tags.length;
            j++
          ) {
            if (chartInput.flexiTiles.blocks[i].tags[j].tag == null) {
              this._toastLoad.toast(
                'error',
                'Error',
                'Please select tag',
                true
              );
              this.isToaster = true;
            } else {
              chartInput.yaxis.push(chartInput.flexiTiles.blocks[i].tags[j]);
              chartInput.chartType = 'bar';
              chartInput['isFlexi'] = true;
            }
          }
        }
        chartInput.yaxis = [];
        let objTempYaxis = {};
        if (chartInput.xaxis.dimensionalTag === 'all') {
          chartInput.flexiTiles.blocks.forEach((element) => {
            element.tags.forEach((tagElement) => {
              objTempYaxis[tagElement['name']] = tagElement;
            });
          });
        } else {
          if (Object.keys(this.currentBlockData).length > 0) {
            chartInput.flexiTiles.blocks[
              this.currentBlockData['index']
            ].tags.forEach((tagElement) => {
              objTempYaxis[tagElement['name']] = tagElement;
            });
            if (
              chartInput.flexiTiles.blocks[
                this.currentBlockData['index']
              ].hasOwnProperty('isShowProgressBar') &&
              chartInput.flexiTiles.blocks[this.currentBlockData['index']]
                .isShowProgressBar
            ) {
              if (
                chartInput.flexiTiles.blocks[this.currentBlockData['index']]
                  .selectedProgressTag.length > 1
              ) {
                let count = 0;
                for (
                  count == 0;
                  count <
                  chartInput.flexiTiles.blocks[this.currentBlockData['index']]
                    .selectedProgressTag.length;
                  count++
                ) {
                  if (
                    objTempYaxis.hasOwnProperty(
                      chartInput.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count].name
                    )
                  ) {
                    objTempYaxis[
                      chartInput.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count].name
                    ].tag.isProgressTag = true;
                    objTempYaxis[
                      chartInput.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count].name
                    ].tag.isBlockTag = true;
                  } else {
                    chartInput.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[count].tag.isProgressTag = true;
                    objTempYaxis[
                      chartInput.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count].name
                    ] =
                      chartInput.flexiTiles.blocks[
                        this.currentBlockData['index']
                      ].selectedProgressTag[count];
                  }
                }
              } else {
                if (
                  objTempYaxis.hasOwnProperty(
                    chartInput.flexiTiles.blocks[this.currentBlockData['index']]
                      .selectedProgressTag[0].name
                  )
                ) {
                  objTempYaxis[
                    chartInput.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0].name
                  ].tag.isProgressTag = true;
                  objTempYaxis[
                    chartInput.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0].name
                  ].tag.isBlockTag = true;
                } else {
                  chartInput.flexiTiles.blocks[
                    this.currentBlockData['index']
                  ].selectedProgressTag[0].tag.isProgressTag = true;
                  objTempYaxis[
                    chartInput.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0].name
                  ] =
                    chartInput.flexiTiles.blocks[
                      this.currentBlockData['index']
                    ].selectedProgressTag[0];
                }
              }
            }
          }
        }
        for (var key in objTempYaxis) {
          chartInput.yaxis.push(objTempYaxis[key]);
        }
        chartInput.chartType = 'bar';
      }
      if (
        this.widgetConfigData.wcData.isMap &&
        chartInput.filter.filtersData.length > 0
      ) {
        for (
          count == 0;
          count < chartInput.filter.filtersData.length;
          count++
        ) {
          if (chartInput.filter.filtersData[count].type === 'tree') {
            mapToast = true;
          }
        }
        if (!mapToast) {
          this._toastLoad.toast(
            'error',
            'Error',
            'Please select hierarchy',
            true
          );
          this.isToaster = true;
        }
      }
      if (
        chartInput.hasOwnProperty('yaxis') &&
        chartInput.yaxis.length >= 1 &&
        !this.widgetConfigData.wcData.isFlexi &&
        !this.widgetConfigData.wcData.isAlarmFilter
      ) {
        let count = 0;
        for (count == 0; count < chartInput.yaxis.length; count++) {
          if (
            chartInput.yaxis[count].hasOwnProperty('tag') &&
            !chartInput.yaxis[count]['isCustomValue'] &&
            chartInput.yaxis[count].tag == null
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select atleast one tag',
              true
            );
            this.isToaster = true;
          }
          if (
            chartInput.isReadYaxisFilter &&
            chartInput.yaxis[count]['devices'].length == 0 &&
            chartInput.yaxis[count]['deviceGroups'].length == 0
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select atleast one filter',
              true
            );
            this.isToaster = true;
          }
          if (
            chartInput['isPue'] &&
            !chartInput.yaxis[count]['isCustomValue'] &&
            chartInput.yaxis[count].hasOwnProperty(
              'CustomMultiplicationFactor'
            ) &&
            chartInput.yaxis[count]['CustomMultiplicationFactor'] == null
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter multiplication factor',
              true
            );
            this.isToaster = true;
          }
        }
        if (chartInput['isPue'] && chartInput['img'] == '') {
          this._toastLoad.toast(
            'error',
            'Error',
            'Please choose an image',
            true
          );
          this.isToaster = true;
        }
      }
      if (chartInput.maxDecimalPoint < 0) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Restrict decimal cannot be a negative value',
          true
        );
        this.isToaster = true;
      }
      if (chartInput.maxDecimalPoint === null) {
        chartInput.maxDecimalPoint = 0;
      }
      if (this.pageType == 'reports' || this.pageType == 'dashboard') {
        this.widgetAdvancedMode(chartInput);
      }
      if (!this.isToaster) {
        if (chartInput.hasOwnProperty('is_preview')) {
          chartInput.is_preview = true;
        } else {
          chartInput.is_preview = true;
        }
        this.widgetConfigData.wcData.cData.chartOptions = this.getCopy(
          chartInput
        );
        this.updateChartData();
      }
    } catch (error) {
      //console.log(error);
    }
  }
  closePreviewPop() {
    this.showPreview = false;
    this._wdgShowService.dateClick(false);
    this.widgetConfigData.wcData.isShowToolBox = false;
    this.previewService.previewCheck({ state: '', data: [] });
    this.widgetConfigData.wcData['pieDropdownList'] = [];
    this.widgetConfigData.wcData = { ...this.widgetConfigData.wcData };
    this.widgetConfigData.wcData['isBackArrowClicked'] = '';
    
  }

  /**
   * Method for getting chart data from backend and assign to the widget data
   */
  updateChartData() {
    try {
      const self = this;
      self.isPreviewLoading = true;
      const chartInput = this.getCopy(this.widgetConfigData);
      delete chartInput.wcData.cData.chartData;
      const widgetTmp = this.getCopy(this.widgetConfigData);
      let tempData = this.getCopy(
        this.widgetConfigData.wcData.cData.chartOptions
      );
      if (tempData['filter']['isCustom']) {
        let temp = tempData['filter']['custom'];
        if (temp['from'].indexOf('T') > -1) {
          tempData['filter']['custom']['from'] = this.getFormattedDateTime(
            new Date(temp['from']),
            'DD-MM-YYYY HH:MM:SS'
          );
        }
        if (temp['to'].indexOf('T') > -1) {
          tempData['filter']['custom']['to'] = this.getFormattedDateTime(
            new Date(temp['to']),
            'DD-MM-YYYY HH:MM:SS'
          );
        }
      }
      // this.widgetAdvancedMode(tempData);
      // if (!this.isToaster) {
      tempData['yaxis'] = tempData.yaxis;
      tempData['dashboardId'] = this.dashboardInfo.dashboardId;
      // self.showPreview = true; // assigning dashboard i
      if (
        !chartInput.wcData.isMap &&
        !chartInput.wcData.isPue &&
        !chartInput.wcData.isPf &&
        !chartInput.wcData.isAlarmFilter
      ) {
        this.getChartData(tempData).then((data) => {
          if (data && data['chartData']) {
            widgetTmp.wcData.cData.chartData = data['chartData'];
            self.widgetConfigData.wcData = self.getCopy(widgetTmp.wcData);
            if (
              this.widgetConfigData.wcData.cType == 'pie' &&
              this.widgetConfigData.wcData.isShowToolBox &&
              this.widgetConfigData.wcData.isPreview
            ) {
              this.widgetConfigData.wcData.isPieClick = false;
              this.widgetConfigData.wcData.pieDropdownList = this.previewService.stepBackPiePreview(
                this.widgetConfigData.wcData['isBackArrowClicked'],
                this.widgetConfigData.wcData
              );
            }
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 500);
          } else {
            widgetTmp.wcData.cData.chartData = {
              series: [],
              category: []
            };
            self.widgetConfigData.wcData.cData.chartData = undefined;
            self.widgetConfigData.wcData = self.getCopy(widgetTmp.wcData);
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 500);
          }
          self.showPreview = true;
        });
      } else if (chartInput.wcData.isMap) {
        this.getLatLong(tempData);
      } else if (chartInput.wcData.isPue || chartInput.wcData.isPf) {
        this.getPueChartData(tempData);
      } else if (chartInput.wcData.isAlarmFilter) {
        //this.markers = data;
        this.getAlarmList();
      }
    } catch (error) {
      this.isPreviewLoading = false;
    }
  }

  /**
   * Method for getting the chart data for api
   * @param input chart configuration for getting data
   */
  getChartData(input) {
    try {
      const promise = new Promise((resolve) => {
        if (this.pageType === 'reports') {
          this.responseData = this._appService.getPreviewChartDataReport(input);
        } else {
          this.responseData = this._appService.getPreviewChartData(input);
        }
        this.subscriptions = this.responseData.subscribe(
          (data) => {
            try {
              if (data.status === 'success') {
                this._wdgShowService.dateClick(true);
                resolve(data.data);
              } else {
                // this._toastLoad.toast('error', 'Error', data.message, true);
                setTimeout(() => {
                  this.isPreviewLoading = false;
                }, 1000);
                resolve(false);
                this._wdgShowService.dateClick(true);
              }
            } catch (e) {
              this.isPreviewLoading = false;
              resolve(false);
              this._wdgShowService.dateClick(true);
              this.widgetConfigData.wcData.isPieClick = false;
            }
          },
          (error) => {
            //console.log(error);
            setTimeout(() => {
              this.isPreviewLoading = false;
            }, 1000);
          }
        );
      });
      return promise;
    } catch (error) {
      //console.log(error);
    }
  }

  getLatLong(nodes) {
    const self = this;
    let mapIdData;
    const filterData = nodes.filter.filterList;
    const dataToSend = {
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
    if (filterData !== undefined) {
      filterData.forEach((element) => {
        if (element.type == 'tree') {
          mapIdData = element.value;
        }
      });
    }
    dataToSend['data']['selectedIds'] = mapIdData.selectedIds;
    dataToSend['data']['tree'] = mapIdData.metaData;
    this.subscriptions = this._appService.getSiteDataMap(dataToSend).subscribe(
      (data) => {
        try {
          if (data.status === 'success') {
            //this.markers = data;
            this.latlongData = data.data;
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 1000);
            self.showPreview = true;
            this._wdgShowService.dateClick(true);
          } else {
            this.latlongData = [];
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 1000);
            self.showPreview = true;
            this._wdgShowService.dateClick(true);
          }
        } catch (e) {
          this.latlongData = [];
          self.isPreviewLoading = false;
          self.showPreview = true;
          this._wdgShowService.dateClick(true);
        }
      },
      (error) => {
        this._wdgShowService.dateClick(false);
        setTimeout(function () {
          self.isPreviewLoading = false;
        }, 1000);
      }
    );
  }

  getPueChartData(temp) {
    const self = this;
    const widgetTmp = this.getCopy(this.widgetConfigData);
    const dataToSend = {
      dashboardId: temp['dashboardId'],
      filter: temp.filter,
      yaxis: temp.yaxis,
      chartType: temp['chartType'],
      maxDecimalPoint: temp['maxDecimalPoint']
    };
    if (widgetTmp.wcData.isPf) {
      dataToSend['xaxis'] = temp.xaxis;
    }
    this.subscriptions = this._appService.getPueData(dataToSend).subscribe(
      (data) => {
        try {
          if (data.status === 'success') {
            widgetTmp.wcData.cData.chartData = widgetTmp.wcData.isPf
              ? data.data.chartData
              : data.data;
            if (widgetTmp.wcData.isPf) {
              widgetTmp.wcData.cData['chartData']['yaxisData'] =
                data.data['yaxisData']['data'];
            }
            self.widgetConfigData.wcData = self.getCopy(widgetTmp.wcData);
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 1000);
          } else {
            widgetTmp.wcData.cData.chartData = {};
            self.widgetConfigData.wcData.cData.chartData = undefined;
            self.widgetConfigData.wcData = self.getCopy(widgetTmp.wcData);
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 1000);
          }
          self.showPreview = true;
          this._wdgShowService.dateClick(true);
        } catch (e) {
          this.isPreviewLoading = false;
          widgetTmp.wcData.cData.chartData = {};
          self.widgetConfigData.wcData.cData.chartData = undefined;
          self.widgetConfigData.wcData = self.getCopy(widgetTmp.wcData);
          self.showPreview = true;
          this._wdgShowService.dateClick(true);
        }
      },
      (error) => {
        this._wdgShowService.dateClick(false);
        setTimeout(function () {
          self.isPreviewLoading = false;
        }, 1000);
      }
    );
  }

  getAlarmList() {
    const self = this;
    const widgetTmp = this.getCopy(this.widgetConfigData.wcData);
    const dataToPost = {
      alarmStatus: null,
      type: null,
      assetsData: [],
      acknowledged: null,
      priority: [],
      count: 10
    };
    // this.dataToPost = event!=undefined?event:{};
    widgetTmp.cData.chartOptions.filter.filtersData.forEach((element) => {
      if (
        element.id != 'priority' &&
        element.id != 'count' &&
        element.id != 'type' &&
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
    });
    this.subscriptions = this._appService.getAlarmJson(dataToPost).subscribe(
      (data) => {
        try {
          if (data) {
            this.alarmWidgetData = data;
            this.alarmWidgetData['showPriorityList'] =
              widgetTmp.cData.chartOptions['showPriorityList'];
            this.alarmWidgetData['showTable'] =
              widgetTmp.cData.chartOptions['showTable'];
            this.alarmWidgetData['isShowBorder'] =
              widgetTmp.cData.chartOptions['isShowBorder'];
            this.alarmWidgetData['widget_id'] = widgetTmp['widget_id'];
            this._wdgShowService.dateClick(true);
            self.showPreview = true;
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 500);
          } else {
            this.alarmWidgetData = {};
            setTimeout(function () {
              self.isPreviewLoading = false;
            }, 500);
            self.showPreview = true;
            this._wdgShowService.dateClick(true);
          }
        } catch (e) {
          this.alarmWidgetData = {};
          self.isPreviewLoading = false;
          self.showPreview = true;
          this._wdgShowService.dateClick(true);
        }
      },
      (error) => {
        setTimeout(function () {
          self.isPreviewLoading = false;
        }, 1000);
        this._wdgShowService.dateClick(false);
      }
    );
  }

  /* Method to validate advance mode fields and set value to shift and function*/
  widgetAdvancedMode(tempData) {
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;
    if (
      this.pageType == 'reports' &&
      tempData.reportFormat['template_id'] !== 'template_101' &&
      tempData.reportFormat['template_id'] !== 'template_201'
    ) {
      for (count2 == 0; count2 < tempData.yaxis.length; count2++) {
        if (tempData.yaxis[count2].isAdvance) {
          if (tempData.yaxis[count2].function.frequency == null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select frequency',
              true
            );
            this.isToaster = true;
          } else if (tempData.yaxis[count2].function.name == null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select function',
              true
            );
            this.isToaster = true;
          } else if (
            tempData.yaxis[count2].function.shift == null &&
            tempData.yaxis[count2].function.frequency == 'shift' &&
            tempData.yaxis[count2].isAdvance
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select shift',
              true
            );
            this.isToaster = true;
          }
          if (tempData.yaxis[count2].function.name !== null) {
            for (
              count1 == 0;
              count1 < tempData.yaxis[count2].function.name.length;
              count1++
            ) {
              if (
                tempData.yaxis[count2].function.name[count1].label !== undefined
              ) {
                tempData.yaxis[count2].function.name[count1] =
                  tempData.yaxis[count2].function.name[count1].value;
              }
            }
          }
          count1 = 0;
          if (tempData.yaxis[count2].function.shift !== null) {
            for (
              count3 == 0;
              count3 < tempData.yaxis[count2].function.shift.length;
              count3++
            ) {
              if (
                tempData.yaxis[count2].function.shift[count3].label !==
                undefined
              ) {
                tempData.yaxis[count2].function.shift[count3] =
                  tempData.yaxis[count2].function.shift[count3].value;
              }
            }
          }
          count3 = 0;
        }
      }
      this.widgetConfigData.wcData.cData.chartOptions = tempData;
    } else if (
      tempData.reportFormat['template_id'] == 'template_101' ||
      tempData.reportFormat['template_id'] == 'template_201' ||
      (this.pageType == 'dashboard' && !tempData.isFlexi)
    ) {
      for (count2 == 0; count2 < tempData.yaxis.length; count2++) {
        if (tempData.yaxis[count2].isAdvance) {
          if (tempData.yaxis[count2].function.frequency == null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select frequency',
              true
            );
            this.isToaster = true;
          } else if (tempData.yaxis[count2].function.name == null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select function',
              true
            );
            this.isToaster = true;
          }
        }
      }
    } else if (
      tempData.reportFormat['template_id'] == 'template_101' ||
      tempData.reportFormat['template_id'] == 'template_201' ||
      (this.pageType == 'dashboard' && tempData.isFlexi)
    ) {
      for (count2 == 0; count2 < tempData.flexiTiles.blocks.length; count2++) {
        let countx = 0;
        for (
          countx == 0;
          countx < tempData.flexiTiles.blocks[count2].tags.length;
          countx++
        ) {
          if (tempData.flexiTiles.blocks[count2].tags[countx].isAdvance) {
            if (
              tempData.flexiTiles.blocks[count2].tags[countx].function
                .frequency == null
            ) {
              this._toastLoad.toast(
                'error',
                'Error',
                'Please select frequency',
                true
              );
              this.isToaster = true;
            } else if (
              tempData.flexiTiles.blocks[count2].tags[countx].function.name ==
              null
            ) {
              this._toastLoad.toast(
                'error',
                'Error',
                'Please select function',
                true
              );
              this.isToaster = true;
            }
          }
        }
        if (tempData.flexiTiles.blocks[count2].isShowProgressBar) {
          let countx = 0;
          for (
            countx == 0;
            countx <
            tempData.flexiTiles.blocks[count2].selectedProgressTag.length;
            countx++
          ) {
            if (
              tempData.flexiTiles.blocks[count2].selectedProgressTag[countx]
                .isAdvance
            ) {
              if (
                tempData.flexiTiles.blocks[count2].selectedProgressTag[countx]
                  .function.frequency == null
              ) {
                this._toastLoad.toast(
                  'error',
                  'Error',
                  'Please select frequency in progress bar',
                  true
                );
                this.isToaster = true;
              } else if (
                tempData.flexiTiles.blocks[count2].selectedProgressTag[countx]
                  .function.name == null
              ) {
                this._toastLoad.toast(
                  'error',
                  'Error',
                  'Please select function in progress bar',
                  true
                );
                this.isToaster = true;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Method for getting unit convertion metadata from api
   */
  getChartUnitInfo() {
    try {
      const input = {};
      input['filter'] = [];
      input['filter'].push(
        { site_id: this.global.getCurrentUserSiteId() },
        { user_id: this.global.userId }
      );
      const promise = new Promise((resolve) => {
        this.subscriptions = this._appService
          .getChartUnitMetaData(input)
          .subscribe((data) => {
            if (data && data.status === 'success') {
              resolve(data.data);
            } else {
              resolve(false);
              // this._toastLoad.toast('error', 'Error', data.message, true);
            }
          });
      });
      return promise;
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for creating a deep copy of a json
   * @param obj Object for taking a deep copy
   */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  /**
   * Method for saving widget configuration
   */
  saveWidgetConfig() {
    try {
      this.isToaster = false;
      let colorMap = {
        null: null
      };
      const chartInput = this.getCopy(
        this.widgetConfigData.wcData.cData.chartOptions
      );
      if (
        !chartInput.isReadYaxisFilter &&
        chartInput.filter.filtersData.length === 0
      ) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please select atleast one filter',
          true
        );
        this.isToaster = true;
      }
      if (
        chartInput.chartType == 'harmonics' &&
        chartInput.harmonics.tag_range == 'Custom' &&
        chartInput.harmonics.custom_value == ''
      ) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please enter custom value range',
          true
        );
        this.isToaster = true;
      }
      if (
        chartInput.filter.hasOwnProperty('compare') &&
        chartInput.filter['compare'].comparison &&
        chartInput.chartType == 'table' &&
        this.pageType != 'reports' &&
        chartInput.yaxis.length > 1
      ) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please select only one tag for comparison',
          true
        );
        this.isToaster = true;
      }
      if (chartInput.hasOwnProperty('flexiTiles')) {
        if (
          chartInput.flexiTiles.noOfBlocksToSwapOnInterval == null ||
          chartInput.flexiTiles.noOfTagsToSwapOnInterval === null
        ) {
          if (chartInput.flexiTiles.noOfTagsToSwapOnInterval === null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter no of tags to display',
              true
            );
            this.isToaster = true;
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter no of blocks to display',
              true
            );
            this.isToaster = true;
          }
        }
      }
      if (chartInput.chartType == 'gauge') {
        if (chartInput.minValue == null || chartInput.maxValue == null) {
          const gaugeToaster = chartInput.minValue == null ? 'Min' : 'Max';
          this._toastLoad.toast(
            'error',
            'Error',
            'Please enter ' + gaugeToaster + ' value',
            true
          );
          this.isToaster = true;
        }
        if (chartInput.minValue > chartInput.maxValue) {
          this._toastLoad.toast(
            'error',
            'Error',
            'Min value shouldn not exceed Max value ',
            true
          );
          this.isToaster = true;
        }
      }
      if (
        chartInput.chartType == 'modbus_write_widget' &&
        this.widgetConfigData.wcSelect != 'live'
      ) {
        chartInput.write_register.forEach((elment) => {
          if (elment.relay_operation == null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter action value',
              true
            );
            this.isToaster = true;
          }
        });
      }
      if (
        chartInput.chartType == 'modbus_write_widget' &&
        this.widgetConfigData.wcSelect == 'live'
      ) {
        if (
          this.widgetConfigData.wcData.title == '' ||
          this.widgetConfigData.wcData.title == null
        ) {
          this._toastLoad.toast(
            'error',
            'Error',
            'Please Enter Widget name',
            true
          );
          this.isToaster = true;
        }
        if (!chartInput.isActionEnabled && !chartInput.isAction) {
          this._toastLoad.toast(
            'error',
            'Error',
            'Please Enable Minimum One Action',
            true
          );
          this.isToaster = true;
        }

        if (chartInput.img == '') {
          this._toastLoad.toast('error', 'Error', 'Please Pick An Image', true);
          this.isToaster = true;
        }
        if (chartInput.hasOwnProperty('assetControls')) {
          for (let i = 0; i < chartInput.assetControls.length; i++) {
            if (!chartInput.assetControls[i].isRangeValue) {
              console.log(typeof(chartInput.assetControls[i].value));

              if (
                chartInput.assetControls[i].value === null ||
                chartInput.assetControls[i].value === ""
              ) {
                this._toastLoad.toast(
                  'error',
                  'Error',
                  'Please enter comparator value',
                  true
                );
                this.isToaster = true;
              }
            } else if (chartInput.assetControls[i].isRangeValue) {
              if (
                chartInput.assetControls[i].fromValue === null ||
                chartInput.assetControls[i].fromValue === ""
              ) {
                this._toastLoad.toast(
                  'error',
                  'Error',
                  'Please enter comparator`s from value',
                  true
                );
                this.isToaster = true;
              }
              if (
                chartInput.assetControls[i].toValue === null ||
                chartInput.assetControls[i].toValue === ""
              ) {
                this._toastLoad.toast(
                  'error',
                  'Error',
                  'Please enter comparator`s to value',
                  true
                );
                this.isToaster = true;
              }
            }
            if (
              chartInput.assetControls[i].fromValue >
              chartInput.assetControls[i].toValue
            ) {
              this._toastLoad.toast(
                'error',
                'Error',
                'Comparator from value should be lesser than to value',
                true
              );
              this.isToaster = true;
            }
          }
        }
      }
      if (
        chartInput.hasOwnProperty('benchmark') &&
        chartInput.benchmark.length > 0
      ) {
        chartInput.benchmark.forEach((element) => {
          if (
            element.priority != '' &&
            !element.isShowMax &&
            element.value == null
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter benchmark value',
              true
            );
            this.isToaster = true;
          }
          if (element.value > chartInput.maxValue && element.isShowValue) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Benchmark value should not exceed Max value',
              true
            );
            this.isToaster = true;
          }
        });
      }
      if (
        chartInput.flexiTiles != undefined &&
        chartInput.flexiTiles.hasOwnProperty('blocks')
      ) {
        chartInput.yaxis = [];
        for (let i = 0; i < chartInput.flexiTiles.blocks.length; i++) {
          for (
            let j = 0;
            j < chartInput.flexiTiles.blocks[i].tags.length;
            j++
          ) {
            if (chartInput.flexiTiles.blocks[i].isShowProgressBar) {
              for (
                let k = 0;
                k < chartInput.flexiTiles.blocks[i].selectedProgressTag.length;
                k++
              ) {
                if (
                  chartInput.flexiTiles.blocks[i].selectedProgressTag[k].tag ==
                  null
                ) {
                  this._toastLoad.toast(
                    'error',
                    'Error',
                    'Please select tag in progress bar',
                    true
                  );
                  this.isToaster = true;
                }
              }
            }

            if (chartInput.flexiTiles.blocks[i].tags[j].tag == null) {
              this._toastLoad.toast(
                'error',
                'Error',
                'Please select atleast one tag',
                true
              );
              this.isToaster = true;
            } else {
              chartInput.yaxis.push(chartInput.flexiTiles.blocks[i].tags[j]);
              chartInput.chartType = 'bar';
              chartInput['isFlexi'] = true;
            }
          }
        }
      }
      if (
        chartInput.chartType !== 'harmonics' &&
        chartInput.yaxis.length >= 1 &&
        !this.widgetConfigData.wcData.isFlexi &&
        !this.widgetConfigData.wcData.isAlarmFilter
      ) {
        let count = 0;
        for (count == 0; count < chartInput.yaxis.length; count++) {
          if (
            chartInput.yaxis[count].hasOwnProperty('tag') &&
            !chartInput.yaxis[count]['isCustomValue'] &&
            chartInput.yaxis[count].tag == null
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select atleast one tag',
              true
            );
            this.isToaster = true;
          }
          if (
            chartInput.isReadYaxisFilter &&
            chartInput.yaxis[count]['devices'].length == 0 &&
            chartInput.yaxis[count]['deviceGroups'].length == 0
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select atleast one filter',
              true
            );
            this.isToaster = true;
          }
          if (
            chartInput['isPue'] &&
            !chartInput.yaxis[count]['isCustomValue'] &&
            chartInput.yaxis[count].hasOwnProperty(
              'CustomMultiplicationFactor'
            ) &&
            chartInput.yaxis[count]['CustomMultiplicationFactor'] == null
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter multiplication factor',
              true
            );
            this.isToaster = true;
          }
        }
        if (chartInput['isPue'] && chartInput['img'] == '') {
          this._toastLoad.toast(
            'error',
            'Error',
            'Please choose an image',
            true
          );
          this.isToaster = true;
        }
      }
      if (
        this.widgetConfigData.wcData.isMap &&
        chartInput.filter.filtersData.length > 0
      ) {
        let mapToast = false;
        for (
          let count = 0;
          count < chartInput.filter.filtersData.length;
          count++
        ) {
          if (chartInput.filter.filtersData[count].type === 'tree') {
            mapToast = true;
          }
        }
        if (!mapToast) {
          this._toastLoad.toast(
            'error',
            'Error',
            'Please select hierarchy',
            true
          );
          this.isToaster = true;
        }
      }
      if (chartInput.maxDecimalPoint < 0) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Restrict decimal cannot be a negative value',
          true
        );
        this.isToaster = true;
      }
      if (chartInput.maxDecimalPoint === null) {
        this.widgetConfigData.wcData.cData.chartOptions.maxDecimalPoint = 0;
      }
      if (this.pageType == 'reports' || this.pageType == 'dashboard') {
        this.widgetAdvancedMode(chartInput);
      }
      if (!this.isToaster) {
        this.widgetConfigData.wcData.isPreview = false;
        this.widgetConfigData.wcData.is_preview = false;
        this.widgetConfigData.wcData.wAction.show = true;
        this.widgetConfigData.wcData.wcType = this.widgetConfigData.wcSelect;
        if (this.widgetConfigData.wcSelect !== 'live') {
          this.widgetConfigData.wcData.cData.chartData = {
            series: [],
            category: []
          }
        } else {
          delete this.widgetConfigData.wcData.cData.chartOptions.markers
        }
        let tempData = this.widgetConfigData.wcData;
        if (tempData['cData']['chartOptions']['filterBackup']) {
          delete tempData['cData']['chartOptions']['filterBackup'];
        }
        delete tempData.cData.chartOptions.harmonic_tags;
        if (tempData['cData']['chartOptions']['filter']['isCustom']) {
          let temp = tempData['cData']['chartOptions']['filter']['custom'];
          if (temp['from'].indexOf('T') > -1) {
            tempData['cData']['chartOptions']['filter']['custom'][
              'from'
            ] = this.getFormattedDateTime(
              new Date(temp['from']),
              'DD-MM-YYYY HH:MM:SS'
            );
          }
          if (temp['to'].indexOf('T') > -1) {
            tempData['cData']['chartOptions']['filter']['custom'][
              'to'
            ] = this.getFormattedDateTime(
              new Date(temp['to']),
              'DD-MM-YYYY HH:MM:SS'
            );
          }
        }

        if (
          tempData.cData.chartOptions.hasOwnProperty('dateBackup') ||
          tempData.cData.chartOptions.filter.hasOwnProperty('customBackup')
        ) {
          delete tempData['cData']['chartOptions']['dateBackup'],
            delete tempData['cData']['chartOptions']['filter']['customBackup'];
        }
        const emitData = {
          type: 'save',
          data: tempData
        };
        this.isSaveLoading = true;
        this.wdgConfigEmitter.emit(this.getCopy(emitData));
      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for previewing live widgets data
   */
  previewChartLive() {
    try {
      const chartInput = this.getCopy(
        this.widgetConfigData.wcData.cData.chartOptions
      );
      this.isToaster = false;
      if (chartInput.filter.filtersData.length === 0) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please select atleast one filter',
          true
        );
        this.isToaster = true;
      } else if (
        chartInput.chartType !== 'harmonics' &&
        chartInput.hasOwnProperty('yaxis') &&
        chartInput.yaxis.length >= 1
      ) {
        let count = 0;
        for (count == 0; count < chartInput.yaxis.length; count++) {
          if (chartInput.yaxis[count].tag == null) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please select atleast one tag',
              true
            );
            this.isToaster = true;
          }
        }
      }
      if (
        chartInput.chartType == 'harmonics' &&
        chartInput.harmonics.tag_range == 'Custom' &&
        chartInput.harmonics.custom_value == ''
      ) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please enter custom value range',
          true
        );
        this.isToaster = true;
      }
      if (chartInput.chartType == 'gauge' || chartInput.chartType == 'hvbar') {
        if (chartInput.minValue == null || chartInput.maxValue == null) {
          const gaugeToaster = chartInput.minValue == null ? 'Min' : 'Max';
          this._toastLoad.toast(
            'error',
            'Error',
            'Please enter ' + gaugeToaster + ' value',
            true
          );
          this.isToaster = true;
        }
        if (chartInput.minValue > chartInput.maxValue) {
          this._toastLoad.toast(
            'error',
            'Error',
            'Min value should not exceed Max value ',
            true
          );
          this.isToaster = true;
        }
      }
      if (
        chartInput.hasOwnProperty('benchmark') &&
        chartInput.benchmark.length > 0
      ) {
        chartInput.benchmark.forEach((element) => {
          if (
            element.priority != '' &&
            !element.isShowMax &&
            element.value == null
          ) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Please enter benchmark value',
              true
            );
            this.isToaster = true;
          }
          if (element.value > chartInput.maxValue && element.isShowValue) {
            this._toastLoad.toast(
              'error',
              'Error',
              'Benchmark value should not exceed Max value',
              true
            );
            this.isToaster = true;
          }
        });
      }
      if(chartInput.maxDecimalPoint < 0){
        this._toastLoad.toast('error', 'Error', 'Restrict decimal cannot be a negative value', true);
        this.isToaster = true;
      }
      if(chartInput.maxDecimalPoint === null){
        chartInput.maxDecimalPoint = 0;
      }
      if (!this.isToaster) {
        this.widgetConfigData.wcData.cData.chartOptions = this.getCopy(
          chartInput
        );
        this.updateChartDataLive();
      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for getting topic names for live widgets from api
   * @param input chart options for getting topics for live widget
   */
  getChartDataLiveTopics(input) {
    try {
      let postData;
      postData = this.getCopy(input);
      // delete postData['filter']['filterList'];
      const promise = new Promise((resolve) => {
        this.subscriptions = this._appService
          .getPreviewChartDataTopics(postData)
          .subscribe(
            (data) => {
              if (data && data.status === 'success') {
                resolve(data);
              } else {
                // this._toastLoad.toast('error', 'Error', data.message, true);
                this.isPreviewLoading = false;
                resolve(false);
              }
            },
            (error) => {
              //console.log(error);
              // this._toastLoad.toast('error', 'Error', "Error while getting response from service", true);
              this.isPreviewLoading = false;
              resolve(false);
            }
          );
      });
      return promise;
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for updating live chart data
   */
  updateChartDataLive() {
    try {
      const self = this;
      self.isPreviewLoading = true;
      const chartInput = this.getCopy(this.widgetConfigData);
      delete chartInput.wcData.cData.chartData;
      const widgetTmp = this.getCopy(this.widgetConfigData);
      // widgetTmp.wcData.cData.chartOptions = this._chartConfig;
      this.getChartDataLiveTopics(
        this.widgetConfigData.wcData.cData.chartOptions
      ).then((data) => {
        // if (data && data['topics']) {
        if (data && (data['status'] === 'success') && data['topics']) {
          widgetTmp.wcData.cData.chartOptions.autoRefresh = true,
            widgetTmp.wcData.cData.chartOptions.autoRefreshType = "realTime",
            widgetTmp.wcData.cData.chartOptions['topics'] = data['topics'];
           if(widgetTmp.wcData.cData.chartOptions.chartType == 'harmonics'){
            widgetTmp.wcData.cData.chartOptions['harmonic_tags'] = data['harmonic_tags'];
           }
          if(widgetTmp.wcData.cType == 'map'){
            widgetTmp.wcData.cData.chartOptions['markers'] = data['markers'];
            widgetTmp.wcData.cData.chartOptions.markers.forEach(element => {
              if(element.hasOwnProperty('device_mapping')) {
                element['image'] = "../../../../../assets/images/finder_map-marker.png";
              element['tableData'] = this.getLiveChartDataForDigital(widgetTmp.wcData.cData.chartOptions, element['device_mapping']);
              }
            });
          }
          if (['table'].indexOf(widgetTmp.wcData.cData.chartOptions.chartType) > -1) {
            widgetTmp.wcData.cData.chartData = this.getLiveChartDataForDigital(widgetTmp.wcData.cData.chartOptions, data['device_mapping'])
          } else if(widgetTmp.wcData.cType != 'map'){
            if (!widgetTmp.wcData.cData.chartData) {
              widgetTmp.wcData.cData = {
                chartData: {
                  series: []
                }
              };
            }
            if (!widgetTmp.wcData.cData.chartData.series) {
              widgetTmp.wcData.cData.chartData = {
                series: []
              };
            }
            widgetTmp.wcData.cData.chartData.series = this.getLiveChartSeries(
              widgetTmp.wcData.cData.chartOptions,
              data['device_mapping']
            );
          }
          this.widgetDataLiveShow = false;
          setTimeout(function () {
            self.widgetConfigData.wcData = widgetTmp.wcData;
            self.widgetDataLive.wcData = [widgetTmp.wcData];
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
          // this._toastLoad.toast('error', 'Error', 'Error occurred while Fetching Preview', true);
        }
        this.showPreview = true;
      });
      this._wdgShowService.dateClick(true);
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

  getWidgetCOnfigurationJson(): Observable<any> {
    const replaySubject = new ReplaySubject();
    try {
      this.http
        .get('./assets/build-data/dashboard/widgets/wdg-configuration.json')
        .subscribe((data) => {
          this.chartOptions = data;
          replaySubject.next(true);
        });
    } catch (error) {
      replaySubject.next(false);
    }
    return replaySubject.asObservable();
  }

  imageStateEvent(event) {
    this.showImagePicker = event;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this._wdgShowService.dateClick(false);
    this.previewObservable.unsubscribe();
  }
  previewCheckModal() {
    this.previewObservable = this.previewService.previewBoolean.subscribe(
      (message) => {
        if (message.state === 'preview') {
          this.widgetConfigData.wcData = { ...message.data };
          this.updateChartData();
        }
      }
    );
  }
}
