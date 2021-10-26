import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
  Input,
  SimpleChanges
} from '@angular/core';
import { ITreeOptions } from 'angular-tree-component';
import { AppService } from '../../../../../../app/services/app.service';
import { AuthGuard } from '../../../../../../app/pages/auth/auth.guard';
import { ToastrService } from '../../../../../components/toastr/toastr.service';
import { ActivatedRoute } from '@angular/router';
import { globals } from '../../../../../utilities/globals';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WdgShowService } from '../../wdg-show/wdg-show.service';

@Component({
  selector: 'kl-basic-chart-config',
  templateUrl: './basic-chart-config.component.html',
  styleUrls: ['./basic-chart-config.component.scss']
})
export class BasicChartConfigComponent implements OnInit {
  @Input('chartConfig') chartConfig; // chart configurations form parent component

  @Output('chartConfigChange') chartConfigChange = new EventEmitter(); // emitter for sending updated chart options to parent component
  @Input('chartOptions') chartOptions; // chart options from parent component

  @Output('reportConfigurationChange')
  reportConfigurationChange = new EventEmitter(); // emitter for sending updated report options to parent component
  @Input() pageType: string;
  @Output() imagePickerState = new EventEmitter();

  public confTabType = 'general'; // for enabling active tab

  public showPrevBtn: boolean; // for enable or disable preview button

  public showTimeRange: Boolean = false; // for showing/hiding custom time range

  // public selectedFilterType = undefined; // variable for saving selected filter type

  isBlockExpanded: boolean = true;

  reportFormat: string;
  reportTemplateList: Array<object> = [];
  dropdownSettingsShift = {};
  reportTemplate: string;
  files;
  filestring: string = '';
  selectModes = [];
  comparisonControlObject = {};

  // date time picker settings
  public calendarSettings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy HH:mm:ss',
    defaultOpen: false,
    closeOnSelect: true
  };
  imagePickerSettings = {
    isContentProjection: false,
    isSingleSelection: true,
    isUploadEnabled: false
  };
  @Input() showImagePicker = false;
  today = new Date();
  tempData = {
    data: '',
    set: 0,
    key: 0
  };
  emittedCount = 0;
  shiftData: Array<object> = [];
  reportTemplateId: any;
  isClicked: boolean;
  isCheckBox: boolean;
  isCompareTable: boolean = false;
  responseData: Observable<any>;
  disableSort: boolean = false;
  // isApplied: boolean = false;  // we are not using this variable currently
  // displayModesFromParent = [];
  @Input() get showPreview() {
    // for getting chart preview toggle button status
    return this.showPrevBtn;
  }
  public alarmFilter = {
    alarmStatus: [
      {
        label: 'Active',
        value: 'Active'
      },
      {
        label: 'Inactive',
        value: 'Inactive'
      }
    ],
    type: [
      {
        label: 'Alarm',
        value: 'Alarm'
      },
      {
        label: 'Event',
        value: 'Event'
      },
      {
        label: 'Status',
        value: 'Status'
      }
    ],
    acknowledged: [
      {
        label: 'Yes',
        value: true
      },
      {
        label: 'No',
        value: false
      }
    ],
    count: [
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
      }
    ]
  };

  @Output() showPreviewChange: EventEmitter<boolean> = new EventEmitter<
    boolean
  >(); // emitter for updating preview toggle button change

  set showPreview(v: boolean) {
    // set method for updating chart preview toggle button
    this.showPrevBtn = v;
    this.showPreviewChange.emit(this.showPrevBtn);
  }

  public treeOptions: ITreeOptions = {
    // Tree stucture for hierarchy data
    // nodeHeight: (node: TreeNode) => node.data.value,
    // dropSlotHeight: 6,
    useCheckbox: true,
    useTriState: true,
    useVirtualScroll: true,
    nodeHeight: 22
  };
  dropdownSettingsAsset = {
    singleSelection: false,
    text: 'Select ',
    enableSearchFilter: true,
    classes: 'myclass custom-class',
    labelKey: 'label',
    primaryKey: 'value',
    enableFilterSelectAll: true,
    filterSelectAllText: 'Select filtered Asset',
    filterUnSelectAllText: 'Un-select filtered Assets',
    lazyLoading: true,
    enableCheckAll: false
  };
  dropdownSettingsAssetGroup = {
    singleSelection: false,
    text: 'Select ',
    enableSearchFilter: true,
    classes: 'myclass custom-class',
    labelKey: 'label',
    primaryKey: 'value',
    enableFilterSelectAll: true,
    filterSelectAllText: 'Select filtered Asset Group',
    filterUnSelectAllText: 'Un-select filtered Asset Groups',
    lazyLoading: true,
    enableCheckAll: false
  };
  // list of all custom time ranges
  public timeRangeList: any;

  constructor(
    private appService: AppService,
    private authGuard: AuthGuard,
    private http: HttpClient,
    private global: globals,
    private toastLoad: ToastrService,
    private _activeRoute: ActivatedRoute,
    private _wdgShow: WdgShowService
  ) {
    this._activeRoute.params.subscribe((params) => {
      this._activeRoute.url.subscribe((activeUrl) => {
        this.pageType = activeUrl[0].path; // for getting the dashboard id from the url
      });
    });
  }

  public tempOnDateSelect = {
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

  ngOnInit() {
    try {
      this.http
        .get('./assets/build-data/dashboard/widgets/date-list.json')
        .subscribe((data) => {
          this.timeRangeList = data;
        });
    } catch (error) {}
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
    this.reportTemplateId = this._chartConfig['reportFormat'].template_id;
    if (this._chartConfig['filter']['custom'] === undefined) {
      this._chartConfig['filter']['custom'] = {};
      this._chartConfig['filter']['custom']['fromDisp'] = new Date(
        this.today.getFullYear(),
        this.today.getMonth(),
        this.today.getDate(),
        0,
        0,
        0,
        0
      );
      this._chartConfig['filter']['custom']['toDisp'] = new Date();
    }

    if (!this._chartConfig['grid']) {
      this._chartConfig['grid'] = {
        xGridLine: false,
        yGridLine: true
      };
    }
    if (this._chartConfig.isNormaltile) {
      this.isCheckBox = true;
    }
    if (this.chartConfig.isMap) {
      this.selectModes = ['multiSelect'];
    }
    if (this.chartConfig.isModeBus) {
      this.isCheckBox = true;
    }
    // if(this.chartConfig.isMap) {
    //   this.displayModesFromParent.push("singleSelect");
    // }
    if (this._chartConfig.isPue) {
      this.filterTypeSet();
    } else {
      this.revertOptions();
    }
    this.disableOrEnableFilterTypes();
    this.updateXaxisTypeOpts();
    this.updateFilterAggrOptions();
    this.updateFilterListMetadata();
    this.getShiftData();
    this.getChartMetaEdit({ id: 'tags' });
    this.comparisonControlObject = this.global._appConfigurations;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._chartConfig.isPue) {
      this.filterTypeSet();
    } else {
      this.revertOptions();
    }
    if (!this._chartConfig['grid']) {
      this._chartConfig['grid'] = {
        xGridLine: false,
        yGridLine: true
      };
    }
    if (
      this._chartConfig.chartType == 'alarm' &&
      !this._chartConfig.hasOwnProperty('showTable') &&
      !this._chartConfig.hasOwnProperty('showPriorityList')
    ) {
      this._chartConfig['showPriorityList'] = true;
      this._chartConfig['showTable'] = true;
    }
    this.disableOrEnableFilterTypes();
    this.updateXaxisTypeOpts();
    this.updareXaxisCategoryOptions();
    this.updateFilterAggrOptions();
    this.updateFilterListMetadata();
    this.updateColorYaxisColor();
  }

  /**
   * Method for updating the latest options into parent component
   */
  updateChartConfOptions() {
    this.chartConfigChange.emit(this.chartConfig);
  }

  /**
   * Method for closing custom range popup when clicking outside
   * @param event Click event
   */
  @HostListener('document:click', ['$event'])
  clickout() {
    this.closeDropdownValues();
  }

  /**
   * Method for setting current date as from and to date by default
   * @param event Filter date click event
   */
  showDropdownValues(event) {
    try {
      event.stopPropagation();
      event.preventDefault();
      this._wdgShow.dateClick(true);
      if (!this._chartConfig.filter.isCustom) {
        // const temp = this.getCopy(this._chartConfig); this temp object we are not using
        const today = new Date();
        this.tempOnDateSelect = {
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
        // this._chartConfig = this.getCopy(temp);
      } else {
        this.tempOnDateSelect = JSON.parse(
          JSON.stringify(this._chartConfig.filter.custom)
        );
      }
      this.showTimeRange = true;
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for defining a property or options needs to show or hide
   * @param attrName attribute name(type)
   */
  isAttributeShow(attrName) {
    try {
      if (!attrName) return;
      let isShow = true;
      switch (attrName) {
        case 'color':
          isShow =
            ['stackedBar', 'pie', 'table'].indexOf(
              this._chartConfig['chartType']
            ) === -1 &&
            !this.chartConfig.isMap &&
            !this._chartConfig.isTile &&
            !this._chartConfig.isNormaltile &&
            !this._chartConfig.isPue
              ? true
              : false;
          break;
        case 'benchmark':
          isShow =
            ['pie', 'table'].indexOf(this._chartConfig['chartType']) === -1 &&
            !this._chartConfig.isTile &&
            !this.chartConfig.isMap &&
            !this._chartConfig.isNormaltile &&
            !this._chartConfig.isPue
              ? true
              : false;
          break;
        case 'threshold':
          isShow =
            ['pie', 'table'].indexOf(this._chartConfig['chartType']) === -1 &&
            !this._chartConfig.isTile &&
            !this.chartConfig.isMap &&
            !this._chartConfig.isNormaltile &&
            !this._chartConfig.isPue
              ? true
              : false;
          break;
        case 'position':
          isShow =
            ['pie', 'table', 'pfgraph'].indexOf(
              this._chartConfig['chartType']
            ) === -1 &&
            !this.chartConfig.isMap &&
            !this._chartConfig.isTile &&
            !this._chartConfig.isNormaltile &&
            !this._chartConfig.isPue
              ? true
              : false;
          break;
        case 'compare':
          break;
        case 'yaxisAddBtn':
          isShow =
            this._chartConfig.isTile ||
            this._chartConfig.isNormaltile ||
            this._chartConfig.isPue ||
            this.chartConfig.isMap ||
            ['pie'].indexOf(this._chartConfig['chartType']) === 0
              ? false
              : true;
          break;
        case 'yaxisDeleteBtn':
          isShow =
            ['pie'].indexOf(this._chartConfig['chartType']) === -1 &&
            !this._chartConfig.isTile &&
            !this._chartConfig.isPue
              ? true
              : false;
          break;
        case 'chartType':
          isShow =
            ['combination'].indexOf(this.chartConfig.cType) === -1
              ? false
              : true;
          break;
        case 'grid':
          isShow =
            ['pie', 'table'].indexOf(this._chartConfig['chartType']) === -1 &&
            !this._chartConfig.isNormaltile &&
            !this._chartConfig.isPue
              ? true
              : false;
          break;
        case 'legend':
          isShow =
            ['digital', 'table'].indexOf(this._chartConfig['chartType']) ===
              -1 && !this._chartConfig.isNormaltile
              ? true
              : false;
          break;
        case 'unitConverter':
          isShow =
            ['digital'].indexOf(this._chartConfig['chartType']) === -1
              ? true
              : false;
          break;
      }
      return isShow;
    } catch (error) {
      // console.log(error);
    }
  }

  track(index) {
    return index;
  }

  /**
   * Method for closing custom tim range popup
   */
  closeDropdownValues() {
    if (this.showTimeRange) {
      this.showTimeRange = false;
      // if(!this.isApplied) {
      //   this._chartConfig.filter.custom =  {
      //     from: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //     to: new Date(),
      //     fromDisp: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //     toDisp: new Date()
      //   }
      // }
      //if (!this.isApplied && !this._chartConfig.filter.isCustom) {
      //if (!this._chartConfig.filter.isCustom) {

      //this.tempOnDateSelect = {
      //from: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //fromDisp: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0),
      //to: new Date(),
      //toDisp: new Date()
      //};
      //}
      //}
      this._wdgShow.dateClick(false);
    }
  }

  /**
   * Getter for getting chart options
   */
  get _chartConfig() {
    return this.chartConfig && this.chartConfig['cData']
      ? this.chartConfig['cData']['chartOptions']
      : undefined;
  }

  /**
   * Method for setting all the chart options into the variable
   */
  set _chartConfig(value) {
    this.chartConfig['cData']['chartOptions'] = value;
  }

  // For PUE widget Converting filter type into 2 sets.
  filterTypeSet() {
    this.chartOptions.filter.types.forEach((element, index) => {
      if (
        element.label != '' &&
        (element.value == 'devices' ||
          element.value == 'device_group' ||
          element.value == 'site') &&
        !element.label.includes('(Set 1)') &&
        !element.label.includes('(Set 2)')
      ) {
        element['set'] = 1;
        element.label = element.label + '(Set 1)';
        const setLabel2 = { ...element };
        setLabel2.set = 2;
        setLabel2.label =
          setLabel2.label.substring(0, setLabel2.label.length - 7) + '(Set 2)';
        this.chartOptions.filter.types.splice(index + 1, 0, setLabel2);
      }
    });
  }

  // reverting chartOptions changes made for PUE widget filter type into sets
  revertOptions() {
    const filterTypes = this.chartOptions.filter.types;
    // this.chartOptions.filter.types.forEach((element,index) => {
    for (
      let element = 0;
      element < this.chartOptions.filter.types.length;
      element++
    ) {
      if (
        (filterTypes[element].value == 'devices' ||
          filterTypes[element].value == 'device_group' ||
          filterTypes[element].value == 'site') &&
        (filterTypes[element].label.includes('(Set 1)') ||
          filterTypes[element].label.includes('(Set 2)'))
      ) {
        if (filterTypes[element].label.includes('(Set 2)')) {
          this.chartOptions.filter.types.splice(element, 1);
          element--;
        } else {
          filterTypes[element].label = filterTypes[element].label.substring(
            0,
            filterTypes[element].label.length - 7
          );
        }
      }
      if (
        this.chartConfig.cType != 'alarm' &&
        (filterTypes[element].label.includes('Alarm') ||
          filterTypes[element].label.includes('Acknowledge') ||
          filterTypes[element].label.includes('Count'))
      ) {
        this.chartOptions.filter.types.splice(element, 1);
        element--;
      }
    }
    // });
  }

  //For pue widget last tag
  operandChange(value) {
    if (value == 1) {
      this._chartConfig.yaxis[this._chartConfig.yaxis.length - 1][
        'value_2'
      ] = 2;
    } else {
      this._chartConfig.yaxis[this._chartConfig.yaxis.length - 1][
        'value_2'
      ] = 1;
    }
  }

  /**
   * Method for adding a Yaxis options
   */
  addYaxisAction() {
    try {
      let yConf: any = {};
      switch (this.chartConfig.cType) {
        case 'line':
        case 'bar':
        case 'area':
        case 'table':
        case 'scatter':
        case 'combination':
        case 'markLine':
        case 'markPoint':
        case 'stackedBar':
        case 'pfgraph':
          yConf = {
            isAdvance: false,
            name: '',
            group: null,
            aggregation: null,
            tag: null,
            selectedUnit: null,
            conversionFactor: '1',
            unit: null,
            unitInfo: null,
            color: 'null',
            colorReference: 'color 0',
            position: 'left',
            threshold: false,
            thresholdValue: 100,
            benchmark: false,
            benchmarkValue: 100,
            type: this.chartConfig.cType,
            function: {
              name: null,
              tag1: null,
              tag2: null,
              shift: null,
              operator: null,
              isCustom: false,
              tag3: null,
              frequency: null
            },
            devices: [],
            deviceGroups: []
          };
          if (['pie', 'table'].indexOf(this.chartConfig.wcType) > -1) {
            delete yConf.color;
            delete yConf.threshold;
            delete yConf.thresholdValue;
            delete yConf.benchmark;
            delete yConf.benchmarkValue;
            delete yConf.position;
          }
        case 'markPoint':
          yConf.markPointData = null;
          break;
        case 'stackedBar':
          if (['stackedBar'].indexOf(this.chartConfig.wcType) > -1) {
            delete yConf.color;
          }
      }
      yConf.type =
        this.chartConfig.cType === 'combination' ||
        this.chartConfig.cType === 'pfgraph'
          ? 'line'
          : this.chartConfig.cType;
      this._chartConfig['yaxis']
        ? this._chartConfig['yaxis'].push(yConf)
        : (this._chartConfig['yaxis'] = [yConf]);
      this.disableOrEnableFilterTypes();
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Methos for updating chart option values, option list etc.
   */
  updateFilterAggrOptions() {
    try {
      if (!this.chartOptions.filter || !this.chartOptions.filter.aggregation) {
        return;
      }
      const chartInput = this.getCopy(this._chartConfig);

      if (
        (['pie'].indexOf(chartInput.chartType) > -1 ||
          chartInput.isTile ||
          chartInput.isNormaltile ||
          this.chartConfig.isMap ||
          chartInput.hasOwnProperty('flexiTiles')) &&
        chartInput.xaxis.type === 'timeSeries'
      ) {
        chartInput.xaxis.type = 'category';
      }

      if (chartInput.xaxis.type === 'category') {
        chartInput.xaxis.dimensionalTag = chartInput.xaxis.dimensionalTag
          ? chartInput.xaxis.dimensionalTag
          : 'devices';
      }
      chartInput.filter.aggregation =
        chartInput.xaxis.type === 'category' &&
        chartInput.filter.aggregation === 'list'
          ? 'sum'
          : chartInput.filter.aggregation;
      for (let aggr of this.chartOptions.filter.aggregation) {
        if (chartInput.xaxis.type === 'category' && aggr.value == 'list') {
          aggr.disabled = true;
        } else {
          aggr.disabled = false;
        }
      }
      this._chartConfig = this.getCopy(chartInput);
      this.toggleSortEnableDisable(chartInput);
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for updating xaxis type options based on the chart options
   */
  updateXaxisTypeOpts() {
    try {
      if (!this._chartConfig || !this.chartOptions) return;
      this.disableShift();
      const chartInput = this.getCopy(this._chartConfig);
      for (let type of this.chartOptions.xaxis.types) {
        if (
          (chartInput.chartType === 'pie' ||
            this.chartConfig.isMap ||
            this.chartConfig.isNormaltile ||
            chartInput.isTile ||
            chartInput.hasOwnProperty('flexiTiles')) &&
          type.value === 'timeSeries'
        ) {
          type.disabled = true;
        } else if (
          chartInput.chartType === 'stackedBar' &&
          type.value === 'category'
        ) {
          type.disabled = true;
        } else {
          type.disabled = false;
        }
      }
    } catch (error) {
      // console.log(error);
    }
  }

  disableShift() {
    let i = 0;
    if (
      ((this._chartConfig.reportFormat['template_id'] == 'template_101' ||
        this._chartConfig.reportFormat['template_id'] == 'template_201') &&
        this.pageType == 'reports') ||
      this.pageType == 'dashboard'
    ) {
      for (i == 0; i < this.chartOptions.yaxis.frequency.length; i++) {
        if (this.chartOptions.yaxis.frequency[i].label == 'Shift') {
          this.chartOptions.yaxis.frequency[i]['disabled'] = true;
        }
      }
    } else {
      for (i == 0; i < this.chartOptions.yaxis.frequency.length; i++) {
        if (this.chartOptions.yaxis.frequency[i].label == 'Shift') {
          this.chartOptions.yaxis.frequency[i]['disabled'] = false;
        }
      }
    }
  }

  onDeSelectAll(event, keyType, i, j) {
    switch (keyType) {
      case 'name':
        this._chartConfig.yaxis[i].function.name = event;
        break;
      case 'shift':
        this._chartConfig.yaxis[i].function.shift = [];
        break;
      case 'asset':
        this._chartConfig.yaxis[i]['devices'] = [];
        break;
      case 'assetgroup':
        this._chartConfig.yaxis[i]['deviceGroup'] = [];
        break;
    }
    this.toggleSortEnableDisable(this._chartConfig);
  }
  /**
   * Method for updating xaxis dimentional tag options based on the chart options
   */
  updareXaxisCategoryOptions() {
    try {
      if (!this._chartConfig || !this.chartOptions) return;
      const chartInput = this.getCopy(this._chartConfig);
      if (this.pageType == 'reports') {
        this.chartOptions.xaxis.dateFormats.push({
          value: 'dd/MM/yyyy',
          label: 'dd/MM/yyyy'
        });
        this.updateYaxisOnEditReport(chartInput);
      }
      for (let diTag of this.chartOptions.xaxis.dimensionalTag) {
        if (
          ['digital'].indexOf(chartInput.chartType) > -1 &&
          diTag.value !== 'devices'
        ) {
          diTag.disabled = true;
        } else {
          diTag.disabled = false;
        }
      }
    } catch (error) {
      // console.log(error);
    }
  }

  updateYaxisOnEditReport(chartInput) {
    let count = 0;
    let count1 = 0;
    let count3 = 0;
    if (
      this.pageType == 'reports' &&
      chartInput.reportFormat['template_id'] !== 'template_101' &&
      chartInput.reportFormat['template_id'] !== 'template_201'
    ) {
      for (count == 0; count < this._chartConfig.yaxis.length; count++) {
        if (
          this._chartConfig.yaxis[count].isAdvance &&
          this._chartConfig.yaxis[count].function.shift['label'] !== 'undefined'
        ) {
          if (this.chartOptions.yaxis.shiftValue.length > 0) {
            for (
              count1 == 0;
              count1 < this._chartConfig.yaxis[count].function.shift.length;
              count1++
            ) {
              for (
                count3 == 0;
                count3 < this.chartOptions.yaxis.shiftValue.length;
                count3++
              ) {
                if (
                  this._chartConfig.yaxis[count].function.shift[count1] ==
                  this.chartOptions.yaxis.shiftValue[count3].value
                ) {
                  this._chartConfig.yaxis[count].function.shift[
                    count1
                  ] = this.chartOptions.yaxis.shiftValue[count3];
                }
              }
              count3 = 0;
            }
            count1 = 0;
          }
        }
        if (
          this._chartConfig.yaxis[count].isAdvance &&
          this._chartConfig.yaxis[count].function.name['label'] !== 'undefined'
        ) {
          if (this.chartOptions.yaxis.function.length > 0) {
            for (
              count1 == 0;
              count1 < this._chartConfig.yaxis[count].function.name.length;
              count1++
            ) {
              for (
                count3 == 0;
                count3 < this.chartOptions.yaxis.function.length;
                count3++
              ) {
                if (
                  this._chartConfig.yaxis[count].function.name[count1] ==
                  this.chartOptions.yaxis.function[count3].value
                ) {
                  this._chartConfig.yaxis[count].function.name[
                    count1
                  ] = this.chartOptions.yaxis.function[count3];
                }
              }
              count3 = 0;
            }
            count1 = 0;
          }
        }
      }
      count = 0;
    }
  }
  /**
   * Method for updating custom dates into chart options
   * @param event selected date event
   * @param key key where needs to update the value
   */
  onDateSelect(event, key) {
    try {
      // this._chartConfig.filter.isCustom = true;
      const dateString = event.toISOString().split('.')[0] + 'Z';
      this.tempOnDateSelect[key] = dateString;
      // this.isApplied =false;
    } catch (error) {
      // console.log(error);
    }
  }

  onDateSelectCompare(event, key) {
    try {
      const dateString = event.toISOString().split('.')[0] + 'Z';
      let convertedDate = this.getFormattedDateTime(
        new Date(dateString),
        'DD-MM-YYYY HH:MM:SS'
      );
      this._chartConfig.filter.compare.custom[key] = convertedDate;
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Apply button inside time range click action
   */
  applyCustomRange() {
    try {
      let fromDate = new Date(this.tempOnDateSelect['fromDisp']);
      let toDate = new Date(this.tempOnDateSelect['toDisp']);
      if (fromDate.getTime() <= toDate.getTime()) {
        this._chartConfig.filter.custom = this.tempOnDateSelect;
        let from = this.getFormattedDateTime(fromDate, 'DD-MM-YYYY HH:MM:SS');
        let to = this.getFormattedDateTime(toDate, 'DD-MM-YYYY HH:MM:SS');
        this._chartConfig.filter.timeRange = '';
        this._chartConfig.filter.timeRangeLabel = from + ' - ' + to;
        this._chartConfig.filter.isCustom = true;
        this._chartConfig.filter.custom.dateOverwrite = true;
        // this.isApplied = true;
        this.closeDropdownValues();
        this.disableOrEnableFilterTypes();
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

  /**
   * Method for assigning predefined time range into the chart options
   * @param selectedVal selected range
   */
  selectTimeRange(selectedVal) {
    try {
      this._chartConfig.filter.timeRange = selectedVal.value;
      this._chartConfig.filter.timeRangeLabel = selectedVal.label;
      this._chartConfig.filter.isCustom = false;
      // this.isApplied = false;
      this.closeDropdownValues();
      this.disableOrEnableFilterTypes();
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for adding filter data based on the selected filter type
   */
  addFilter(type) {
    try {
      // this.selectedFilterType = type;
      if (!type) {
        return;
      }
      this.isClicked = true;
      this['isClickedFilter' + type.label] = true;
      this.getChartMeta(type);
    } catch (error) {
      // console.log(error);
    }
  }
  addReloadFilter(filterType) {
    this.getChartMetaEdit(filterType);
  }
  getShiftData() {
    const input = {
      cType: this.chartConfig.cType,
      fetch_meta_data_by: ['shift'],
      filter: [
        { site_id: this.global.getCurrentUserSiteId() },
        { user_id: this.global.userId }
      ]
    };
    input['fetch_meta_data_by'].push('devices', 'device_group');
    this.appService.getChartConfigMetaData(input).subscribe((data) => {
      if (this.chartOptions.yaxis.shiftValue.length < 1) {
        const value = data.data['shift'];
        this.chartOptions.yaxis.shiftValue = value;
        this.chartOptions.yaxis['devices'] = data.data['devices'];
        this.chartOptions.yaxis['deviceGroups'] = data.data['device_group'];
      }
    });
  }
  onFunctionSelect(element, index) {
    let i = 0;
    this._chartConfig.yaxis[index].function.name = [];
    if (element.length == 0) {
      this._chartConfig.yaxis[index].function.name = null;
    }
    for (i == 0; i < element.length; i++) {
      const value = element[i];
      this._chartConfig.yaxis[index].function.name.push(value);
    }
  }

  onShiftSelect(element, index) {
    let i = 0;
    this._chartConfig.yaxis[index].function.shift = [];
    if (element.length == 0) {
      this._chartConfig.yaxis[index].function.shift = null;
    }
    for (i == 0; i < element.length; i++) {
      const value = element[i];
      this._chartConfig.yaxis[index].function.shift.push(value);
    }
  }

  OnItemDeSelect(element, key, index) {
    this._chartConfig.yaxis[index][key] = element;
    this.toggleSortEnableDisable(this._chartConfig);
  }
  onItemSelect(event) {
    this.toggleSortEnableDisable(this._chartConfig);
  }

  getChartMeta(selectedFilterType) {
    try {
      const input = {
        cType: this.chartConfig.cType,
        fetch_meta_data_by: [selectedFilterType.value, 'tags'],
        filter: [
          { site_id: this.global.getCurrentUserSiteId() },
          { user_id: this.global.userId }
        ]
      };
      const mapping = {
        site: 'hierarchy',
        device_group: 'deviceGroups',
        tag_group: 'tagGroups',
        devices: 'devices',
        site_list: 'sites',
        shift: 'shift'
      };

      const item = {
        title: selectedFilterType.label,
        id: mapping[selectedFilterType.value],
        value: [],
        set: selectedFilterType.set,
        overwrite: true,
        type: selectedFilterType.type,
        list: []
      };
      if (
        this.chartConfig.cType == 'alarm' &&
        (selectedFilterType.value == 'priority' ||
          selectedFilterType.value == 'type' ||
          selectedFilterType.value == 'alarmStatus' ||
          selectedFilterType.value == 'acknowledged' ||
          selectedFilterType.value == 'count' ||
          selectedFilterType.value == 'tags')
      ) {
        item['id'] = selectedFilterType.value;
      }
      if (this.chartConfig.isPue) {
        item.overwrite = false;
      } else {
        item.overwrite = true;
      }

      //input['filter'] = [];
      //input['filter'].push({ 'site_id': this.global.getCurrentUserSiteId() });
      const promise = new Promise((resolve) => {
        const objGet = {
          id: 'new',
          filter: [{ site_id: this.global.getCurrentUserSiteId() }]
        };
        this.responseData =
          selectedFilterType.value != 'priority' &&
          selectedFilterType.value != 'type' &&
          selectedFilterType.value != 'alarmStatus' &&
          selectedFilterType.value != 'acknowledged' &&
          selectedFilterType.value != 'count'
            ? this.appService.getChartConfigMetaData(input)
            : this.appService.getAlarmConf(
                this.global.deploymentModeAPI.ALARM_CONFIGURATION_GET,
                objGet
              );
        this.responseData.subscribe((data) => {
          if (data) {
            data = data.data;
            resolve(data);
            // api call for getting all filter metadata
            if (
              selectedFilterType.value != 'priority' &&
              selectedFilterType.value != 'tags' &&
              !this.alarmFilter.hasOwnProperty(selectedFilterType.value)
            ) {
              this.chartOptions.yaxis.tags = data['tags'];
              this.chartOptions.filter.filterMeta = {
                hierarchy: data['site'],
                deviceGroups: data['device_group'],
                devices: data['devices'],
                tagGroups: data['tag_group'],
                sites: data['site_list'],
                shift: data['shift']
              };

              if (
                this.chartOptions.filter.filterMeta[
                  mapping[selectedFilterType.value]
                ]
              ) {
                item.list = this.chartOptions.filter.filterMeta[
                  mapping[selectedFilterType.value]
                ];
              }
            } else {
              item.list = !this.alarmFilter.hasOwnProperty(
                selectedFilterType.value
              )
                ? selectedFilterType.value == 'tags'
                  ? data.tags
                  : data.headerContent['alarmPriorityTypes']
                : this.alarmFilter[selectedFilterType.value];
              if (selectedFilterType.value == 'type') {
                item.value = item.list[0];
              }
            }
            const chartInput = this.getCopy(this._chartConfig);
            chartInput.filter.filterList.push(item);
            this._chartConfig = this.getCopy(chartInput);
            // this.selectedFilterType = undefined;
            this.disableOrEnableFilterTypes();
            this.isClicked = false;
            this['isClickedFilter' + item.title] = false;
          } else {
            resolve(false);
            // this._toastLoad.toast('error', 'Error', data.message, true);
          }
        });
      });
      return promise;
    } catch (error) {
      // console.log(error);
    }
  }

  getChartMetaEdit(type) {
    try {
      const mapping = {
        hierarchy: 'site',
        deviceGroups: 'device_group',
        tagGroups: 'tag_group',
        devices: 'devices',
        sites: 'site_list',
        shift: 'shift',
        tags: 'tags'
      };
      const input = {
        cType: this.chartConfig.cType,
        fetch_meta_data_by: [mapping[type.id]],
        filter: [
          { site_id: this.global.getCurrentUserSiteId() },
          { user_id: this.global.userId }
        ]
      };
      //input['filter'] = [];
      //input['filter'].push({ 'site_id': this.global.getCurrentUserSiteId() });
      // if (this.chartOptions.yaxis.tags.length == 0) {
      const promise = new Promise((resolve) => {
        this.appService.getChartConfigMetaData(input).subscribe((data) => {
          if (data && data.status === 'success') {
            data = data.data;
            resolve(data);
            // api call for getting all filter metadata
            if (data.hasOwnProperty('tags')) {
              this.chartOptions.yaxis.tags = data['tags'];
            }
            if (mapping[type] != 'tags') {
              this._chartConfig.filter.filterList.forEach((element) => {
                if (element.id == type.id) {
                  if (element.type != 'tree' && element['set'] == type['set']) {
                    element.list = data[mapping[type.id]];
                    element.value.forEach((element1) => {
                      element.list.forEach((element3) => {
                        if (
                          element1.label == element3.label &&
                          element1.checked
                        ) {
                          element3.checked = true;
                        }
                      });
                    });
                  } else if (
                    element.type == 'tree' &&
                    element['set'] == type['set']
                  ) {
                    element.list = data[mapping[type.id]];
                    element.value.metadata = { ...data[mapping[type.id]] };
                  }
                }
              });
            }
          } else {
            resolve(false);
            // this._toastLoad.toast('error', 'Error', data.message, true);
          }
        });
      });
      return promise;
      //  }
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for deleting filter
   * @param index index of filter for deletion
   */
  deleteFilterRow(index) {
    try {
      if (index > -1) {
        const chartInput = this.getCopy(this._chartConfig);
        chartInput['filter']['filterList'].splice(index, 1);
        this._chartConfig = this.getCopy(chartInput);
        this.disableOrEnableFilterTypes();
      }
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for updating the filter list metadata while editing a widget
   */
  updateFilterListMetadata() {
    try {
      const chartInput = this.getCopy(this._chartConfig);
      if (!chartInput || !chartInput.filter || !chartInput.filter.filtersData) {
        return;
      }
      this.chartOptions.filter.types.forEach((element) => {
        if (element.label != '') {
          element.isShow = this.chartOptions.filter['filterTypeBackup'][
            element.value
          ];
        }
      });
      chartInput.filter.filterList = [];
      for (let eachFilter of chartInput.filter.filtersData) {
        let key = eachFilter.id;
        if (eachFilter.type === 'tree') {
          key = 'hierarchy';
        }
        const mapping = {
          hierarchy: 'site',
          deviceGroups: 'device_group',
          tagGroups: 'tag_group',
          devices: 'devices',
          sites: 'site_list'
        };
        const res = this.chartOptions.filter.types.filter(
          (el) => el.value === mapping[key]
        );
        if (res.length > 0) {
          const filterTypeMeta: any = res[0];
          const item = {
            title: filterTypeMeta.label,
            id: filterTypeMeta.value,
            value: eachFilter.value,
            overwrite: eachFilter.overwrite,
            type: filterTypeMeta.type,
            // dateOverwrite :eachFilter.dateOverwrite,
            list: []
          };
          if (eachFilter.type === 'tree') {
            item.value = eachFilter;
          }
        }
      }
      // this._chartConfig = chartInput;
      this.disableOrEnableFilterTypes();
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for disable/enable filter type dropdown values
   */
  disableOrEnableFilterTypes() {
    try {
      if (!this._chartConfig || !this._chartConfig.filter) {
        return;
      }
      //   if(this.chartConfig.isMap)
      //   {
      //    this.chartOptions.filter.types.forEach(element => {
      //      if(element.value!== 'site') {
      //        element.disabled = true;
      //      }
      //    });
      //  } else
      //  {
      if (this._chartConfig.isPue) {
        this.chartOptions.filter.types.forEach((element) => {
          if (
            element.value !== 'devices' &&
            element.value !== 'device_group' &&
            element.value !== 'site'
          ) {
            element.isShow = false;
          }
        });
      }
      if (this._chartConfig.isModeBus) {
        this.chartOptions.filter.types.forEach((element) => {
          if (element.value !== 'devices') {
            element.isShow = false;
          }
        });
      } else if (this.chartConfig.isMap) {
        this.chartOptions.filter.types.forEach((element) => {
          if (element.value !== 'device_group' && element.value !== 'site') {
            element.isShow = false;
          }
        });
      }

      for (let item of this.chartOptions.filter.types) {
        const filterMapp = {
          Sites: 'Organisation',
          Hierarchy: 'Organisation Hierarchy',
          Devices: 'Assets',
          'Device Group': 'Asset Group',
          'Hierarchy(Set 1)': 'Organisation Hierarchy(Set 1)',
          'Hierarchy(Set 2)': 'Organisation Hierarchy(Set 2)',
          'Devices(Set 1)': 'Assets(Set 1)',
          'Devices(Set 2)': 'Assets(Set 2)',
          'Device Group(Set 1)': 'Asset Group(Set 1)',
          'Device Group(Set 2)': 'Asset Group(Set 2)'
        };
        this._chartConfig.filter.filterList.forEach((efl) => {
          if (filterMapp.hasOwnProperty(efl.title)) {
            efl.title = filterMapp[efl.title];
          }
        });
        const res = this._chartConfig.filter.filterList.filter(
          (fl) => fl.title === item.label
        );
        if (res && res.length > 0) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      }
      //  }
      this.updateChartConfig();
      // console.log(JSON.stringify(this.chartOptions.filter.types));
    } catch (error) {
      // console.log(error);
    }
  }

  emittedTreeData(treeData, set) {
    this.tempData = {
      data: treeData,
      set: set,
      key: this.emittedCount + 1
    };
  }

  /**
   * Method for creating and updating the chart options
   */
  updateChartConfig() {
    try {
      let count = 0;
      const chartInput = this.getCopy(this._chartConfig);
      const filter = chartInput.filter;
      if (filter.filterList.length > 0) {
        for (count == 0; count < filter.filterList.length; count++) {
          if (
            (filter.filterList[count].type == 'tree' &&
              !filter.filterList[count].hasOwnProperty('treeMode')) ||
            (filter.filterList[count].type == 'tree' &&
              filter.filterList[count].hasOwnProperty('treeMode'))
          ) {
            if (
              (this.tempData.key >= 0 ||
                this.tempData.data !== filter.filterList[count].treeMode) &&
              filter.filterList[count]['set'] == this.tempData['set'] &&
              this.tempData.data !== ''
            ) {
              filter.filterList[count]['treeMode'] = this.tempData['data'];
            }
          }
        }
      }
      if (filter.isCustom) {
        delete filter.timeRange;
      }
      filter['filtersData'] = [];

      for (let item of filter.filterList) {
        const tmp = this.getCopy(item);
        if (item.type === 'multiCheckboxSelect') {
          if (item.value.length > 0) {
            filter['filtersData'].push(tmp);
          }
        } else if (item.type === 'tree') {
          if (item.value.selectedIds && item.value.selectedIds.length > 0) {
            const tempDta = tmp.value;
            tempDta['overwrite'] = true;
            tempDta['dateOverwrite'] = true;
            filter['filtersData'].push(tempDta);
          }
        } else if (item.type === 'dropdown') {
          if (item.value.hasOwnProperty('value')) {
            filter['filtersData'].push(tmp);
          }
        }
      }
      chartInput.filter = filter;
      // console.log('chartInput', chartInput);
      this._chartConfig = chartInput;
      this.toggleSortEnableDisable(this._chartConfig);
      this.updateChartConfOptions();
    } catch (error) {
      // console.log(error);
    }
  }

  onChangeTimeSeriesGroupBy() {
    this.toggleSortEnableDisable(this._chartConfig);
  }

  onComparisonChange(){
    this.toggleSortEnableDisable(this._chartConfig);
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
      // console.log(error);
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
   * Method for deleting a Yaxis configuration
   * @param index Yaxis row index for deletion
   */
  deleteYaxisSeries(index) {
    try {
      if (index > -1) {
        this._chartConfig['yaxis'].splice(index, 1);
      }
      this.disableOrEnableFilterTypes();
    } catch (error) {
      // console.log(error);
    }
  }
  //   onFocus() {
  //     if (this.chartOptions.yaxis.tags.length === 0) {
  //       this.toastLoad.toast('error', 'Error', 'Please select atleast one filter', true);
  //     }
  //  }
  /**
   * Tag change action method
   * @param series Yaxis series data
   */
  tagChangeAction(series) {
    try {
      if (!this.chartOptions.yaxis.tags || !series.tag) {
        series.unit = '';
      }
      if (!series.aggregation || series.aggregation === null) {
        series.selectedUnit = series.tag.unit ? series.tag.unit.label : '';
        series.unit = series.tag.unit ? series.tag.unit.label : '';
        series.unitInfo =
          series.tag.hasOwnProperty('unit') && series.tag.unit
            ? series.tag.unit
            : null;
        series.conversionFactor =
          series.hasOwnProperty('unitInfo') &&
          series.unitInfo != null &&
          series.unitInfo.factor
            ? series.unitInfo.factor
            : 1;
        series.name =
          !series.name || series.name == ''
            ? series.tag.label || ''
            : series.name;
      } else {
        // To do: for multiple tag selection
      }
      if (series.isAdvance) series.function.tag1 = series.tag;
      this.disableOrEnableFilterTypes();
    } catch (error) {
      // console.log(error);
    }
  }

  progressTagChangeAction(block: any, index) {
    this._chartConfig.flexiTiles.blocks[index].progressTag =
      block.selectedProgressTag[0].tag;
    // block.selectedProgressTag.name = !block.selectedProgressTag.tag.name || block.selectedProgressTag.tag.name == '' ? block.selectedProgressTag.tag.label || '' : block.selectedProgressTag.tag.name;
  }

  /**
   * Unit change action method
   * @param series Yaxis series data
   */
  unitChangeAction(series) {
    try {
      if (!series.unitInfo) {
        series.unit = series.selectedUnit;
      }
      series.unit =
        series.unitInfo && series.unitInfo.label ? series.unitInfo.label : '';
      series.conversionFactor =
        series.unitInfo && series.unitInfo.factor ? series.unitInfo.factor : 1;
      this.disableOrEnableFilterTypes();
    } catch (err) {
      // console.log(err)
    }
  }

  /**
   * Method for returning unit list for each yaxis series config
   */
  getUnitList(series) {
    try {
      return series.tag && series.tag.unit && series.tag.unit.value
        ? this.chartOptions.yaxis.units[series.tag.unit.value]
        : [];
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for assigning selected hierarchy data into chart options
   * @param data selected hierarchy data
   * @param id hierarchy id
   */
  emittedData(data, id, set) {
    try {
      const chartInput = this._chartConfig;
      chartInput.filter.filterList.forEach((element) => {
        if (element.id === id && element['set'] === set) {
          if (data.hasOwnProperty('treeData') && data.treeData.type == 'tree') {
            element.value = data.treeData;
            element.value['set'] = set;
          } else {
            element.value = data;
          }
        }
      });
      this._chartConfig = this.getCopy(chartInput);
      this.disableOrEnableFilterTypes();
    } catch (error) {
      // console.log(error);
    }
  }
  compareSwitch(value) {
    this._chartConfig.yaxis[0].color = value ? '#000000' : null;
    this.isCompareTable =
      value && this.chartConfig.cType == 'table' ? true : false;
  }
  toggleExpandCollepseImg() {
    this.isBlockExpanded = !this.isBlockExpanded;
  }

  toggleTagExpandCollepseImg(index: number) {
    this._chartConfig.flexiTiles.blocks[index].isTagBlockExpanded = !this
      ._chartConfig.flexiTiles.blocks[index].isTagBlockExpanded;
  }
  moveUp(itemindextomove, movetoindex) {
    const nextItem = this._chartConfig.yaxis[movetoindex];
    this._chartConfig.yaxis[movetoindex] = this._chartConfig.yaxis[
      itemindextomove
    ];
    this._chartConfig.yaxis[itemindextomove] = nextItem;
  }

  addTag(index: number) {
    this._chartConfig.flexiTiles.blocks[index].tags.unshift({
      isAdvance: false,
      name: '',
      group: null,
      aggregation: null,
      tag: null,
      selectedUnit: null,
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
      type: this.chartConfig.cType,
      function: {
        name: null,
        tag1: null,
        tag2: null,
        shift: null,
        operator: null,
        isCustom: false,
        tag3: null,
        frequency: null
      }
    });
    // this._chartConfig.yaxis.push({
    //   name: null,
    //   tag: null,
    //   selectedUnit: null,
    //   selectedUnitVal: null,
    //   unit: null,
    //   isInverse: false,
    //   isComparisonRequired: false,
    //   type: this.chartConfig.cType,
    // });
  }
  clearColor(isColor, index) {
    this._chartConfig.yaxis[index].color = null;
  }
  clearProgressColor(isColor, blockindex, tagIndex) {
    this._chartConfig.flexiTiles.blocks[blockindex].selectedProgressTag[
      tagIndex
    ].color = null;
  }

  addBlock() {
    this._chartConfig.flexiTiles.blocks.unshift({
      name: null,
      progressTag: null,
      selectedProgressTag: [
        {
          name: '',
          group: null,
          aggregation: null,
          tag: null,
          selectedUnit: null,
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
          type: this.chartConfig.cType,
          function: {
            name: null,
            tag1: null,
            tag2: null,
            shift: null,
            operator: null,
            isCustom: false,
            tag3: null,
            frequency: null
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
          type: this.chartConfig.cType,
          function: {
            name: null,
            tag1: null,
            tag2: null,
            shift: null,
            operator: null,
            isCustom: false,
            tag3: null,
            frequency: null
          }
        }
      ]
    });
  }

  deleteBlock(index) {
    if (this._chartConfig.flexiTiles.blocks.length > 1) {
      this._chartConfig.flexiTiles.blocks.splice(index, 1);
    }
  }

  deleteTag(blockIndex, tagIndex) {
    this._chartConfig.flexiTiles.blocks[blockIndex].tags.splice(tagIndex, 1);
  }

  addNewRange() {
    this._chartConfig['visualMap']['pieces'].splice(0, 0, {
      gt: 0,
      lte: 0,
      color: null,
      backupValue: 'null',
      colorReference: 'color 0'
    });
  }

  deleteRange(index: number) {
    this._chartConfig['visualMap']['pieces'].splice(index, 1);
    if (this._chartConfig['visualMap']['pieces'].length == 0)
      this.addNewRange();
  }

  handleReportTemplateClicked() {
    this.confTabType = 'reportTemplate';
    this.handleReportFormatChange();
  }

  handleReportFormatChange() {
    let objGet: object = {};
    objGet['type'] = this._chartConfig.reportType;
    this.appService.getReportTemplate(objGet).subscribe((data) => {
      if (data != null && data.status == 'success')
        this.reportTemplateList = data.data;
    });
  }

  updateXaxisCategoryOptionsForAdvanced() {
    if (this._chartConfig['isAdvance']) {
      this._chartConfig.xaxis.type = 'timeSeries';
      this._chartConfig.filter.aggregation = 'list';
      for (let i = 0; i < this.chartOptions.xaxis.types.length; i++) {
        this.chartOptions.xaxis.types[i].disabled =
          this.chartOptions.xaxis.types[i].value == 'category';
      }
      for (let i = 0; i < this.chartOptions.filter.aggregation.length; i++) {
        this.chartOptions.filter.aggregation[i].disabled =
          this.chartOptions.filter.aggregation[i].value != 'list';
      }
    } else {
      for (let i = 0; i < this.chartOptions.xaxis.types.length; i++) {
        this.chartOptions.xaxis.types[i].disabled = false;
      }
      for (let i = 0; i < this.chartOptions.filter.aggregation.length; i++) {
        this.chartOptions.filter.aggregation[i].disabled = false;
      }
    }
  }

  reportConfiguration() {
    this.reportConfigurationChange.emit(this.chartConfig);
  }

  // getFiles(event) {
  //   const source = this._wdg.filesReader(event);
  //   if(source.isToast){
  //     this.toastLoad.toast('error', 'Error', source.message, true);
  //   }
  //   if(this.pageType == 'dashboard'){
  //     this._chartConfig.img = 'data:image/png;base64,' + source.data;
  //   }
  //   if(this.pageType=='reports'){
  //     this._chartConfig.reportFormat.logo =source.data;
  //     const userObject = this.authGuard.accessUserObject();
  //     this._chartConfig.userDetails = {
  //     "user_role": userObject.userRole != null ? userObject.userRole : '',
  //     "user_role_name": userObject.userRole != null ? userObject.userRoleName : '',
  //     "name": userObject.userRole != null ? userObject.userName : '',
  //     "full_name": userObject.userRole != null ? userObject.fullName : '',
  //     "user_name": userObject.userRole != null ? userObject.userName : '',
  //     "user_id": userObject.userRole != null ? userObject.user_id : '',
  //     "email": userObject.userRole != null ? userObject.eMail : '',
  //     "user_role_description": userObject.userRole != null ? userObject.userRoleDescription : '',
  //     "client_id": userObject.userRole != null ? userObject.client_id : '',
  //     "site_id": this.global.getCurrentUserSiteId(),
  //     }
  //   }
  // }

  getFiles(event) {
    if (event.target.files[0].size > 256000) {
      this.toastLoad.toast(
        'error',
        'Error',
        'Select File less then 256KB',
        true
      );
      event.target.value = '';
      this._chartConfig.reportFormat.logo = '';
      this._chartConfig.img = '';
    } else if (
      event.target.files[0].type != 'image/jpeg' &&
      event.target.files[0].type != 'image/png'
    ) {
      this.toastLoad.toast('error', 'Error', 'Select jpeg/png File', true);
      event.target.value = '';
      this._chartConfig.reportFormat.logo = '';
      this._chartConfig.img = '';
    } else {
      this.files = event.target.files;
      const reader = new FileReader();
      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(this.files[0]);
    }
  }

  handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString); // Converting binary string data.
    switch (this.pageType) {
      case 'dashboard':
        this._chartConfig.img = 'data:image/png;base64,' + this.filestring;
        break;
      case 'reports':
        this._chartConfig.reportFormat.logo = this.filestring;
        const userObject = this.authGuard.accessUserObject();
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
            userObject.userRole != null ? userObject.userRoleDescription : '',
          client_id: userObject.userRole != null ? userObject.client_id : '',
          site_id: this.global.getCurrentUserSiteId()
        };
    }
    // this._chartConfig.img = 'data:image/png;base64,' + this.filestring;
  }

  handleReportAggregatorchange(type: string) {
    Object.keys(this._chartConfig.reportFormat[type + '_aggregator']).forEach(
      (aggregatorElement) => {
        if (aggregatorElement != 'status')
          this._chartConfig.reportFormat[type + '_aggregator'][
            aggregatorElement
          ] =
            this._chartConfig.reportFormat[type + '_functions'].indexOf(
              aggregatorElement
            ) != -1
              ? true
              : false;
      }
    );
  }

  handleReportTemplateChange() {
    if (
      this._chartConfig.reportFormat.template_id == 'template_102' ||
      this._chartConfig.reportFormat.template_id == 'template_202' ||
      this._chartConfig.reportFormat.template_id == 'template_103' ||
      this._chartConfig.reportFormat.template_id == 'template_203'
    ) {
      this._chartConfig.xaxis.type = 'timeSeries';
      for (let i = 0; i < this.chartOptions.xaxis.types.length; i++) {
        this.chartOptions.xaxis.types[i].disabled =
          this.chartOptions.xaxis.types[i].value == 'category';
      }
    } else {
      for (let i = 0; i < this.chartOptions.xaxis.types.length; i++) {
        this.chartOptions.xaxis.types[i].disabled = false;
      }
    }
  }

  resetProgressBar(value, index) {
    if (value == false) {
      this._chartConfig.flexiTiles.blocks[index].selectedProgressTag[0] = {
        isAdvance: false,
        name: '',
        group: null,
        aggregation: null,
        tag: null,
        selectedUnit: null,
        conversionFactor: '1',
        unit: null,
        unitInfo: null,
        color: null,
        position: 'left',
        threshold: false,
        thresholdValue: 100,
        benchmark: true,
        benchmarkValue: 100,
        isInverse: false,
        isComparisonRequired: false,
        type: this.chartConfig.cType,
        function: {
          name: null,
          tag1: null,
          tag2: null,
          shift: null,
          operator: null,
          isCustom: false,
          tag3: null,
          frequency: null
        }
      };
      if (
        this._chartConfig.flexiTiles.blocks[index].selectedProgressTag.length >
        1
      ) {
        this._chartConfig.flexiTiles.blocks[index].selectedProgressTag.pop();
      }
    }
  }

  addProgressTag(value, index) {
    if (value == false) {
      this._chartConfig.flexiTiles.blocks[index].selectedProgressTag.push({
        isAdvance: false,
        name: '',
        group: null,
        aggregation: null,
        tag: null,
        selectedUnit: null,
        conversionFactor: '1',
        unit: null,
        unitInfo: null,
        color: undefined,
        position: 'left',
        threshold: false,
        thresholdValue: 100,
        benchmark: undefined,
        benchmarkValue: undefined,
        isInverse: false,
        isComparisonRequired: false,
        type: this.chartConfig.cType,
        function: {
          name: null,
          tag1: null,
          tag2: null,
          shift: null,
          operator: null,
          isCustom: false,
          tag3: null,
          frequency: null
        }
      });
    } else {
      this._chartConfig.flexiTiles.blocks[index].selectedProgressTag.pop();
    }
  }

  handleAdvanceClickFlexi(tagIndex, blockNumber, id) {
    if (this._chartConfig.hasOwnProperty('flexiTiles')) {
      // for (let i = 0; i < this._chartConfig.flexiTiles.blocks.length; i++) {
      if (
        this._chartConfig.flexiTiles.blocks[blockNumber].isShowProgressBar &&
        id == 'pro'
      ) {
        // for (let k = 0; k < this._chartConfig.flexiTiles.blocks[i].selectedProgressTag.length; k++) {
        this._chartConfig.flexiTiles.blocks[blockNumber].selectedProgressTag[
          tagIndex
        ].function = {
          name: null,
          tag1: this._chartConfig.flexiTiles.blocks[blockNumber]
            .selectedProgressTag[tagIndex].tag,
          tag2: null,
          operator: null,
          shift: null,
          isCustom: false,
          tag3: null,
          frequency: null
        };
        // }
      } else {
        this._chartConfig.flexiTiles.blocks[blockNumber].tags[
          tagIndex
        ].function = {
          name: null,
          tag1: this._chartConfig.flexiTiles.blocks[blockNumber].tags[tagIndex]
            .tag,
          tag2: null,
          operator: null,
          shift: null,
          isCustom: false,
          tag3: null,
          frequency: null
        };
      }
      // for (let j = 0; j < this._chartConfig.flexiTiles.blocks[i].tags.length; j++) {
      // }
      // }
    }
  }

  handleAdvanceClick(index) {
    //this.updateXaxisCategoryOptionsForAdvanced(); // Time series enable function commented as now it is  working for category also
    if (this._chartConfig.hasOwnProperty('yaxis')) {
      // for (let i = 0; i < this._chartConfig.yaxis.length; i++) {
      //   if(!this._chartConfig.yaxis[i].isAdvance
      this._chartConfig.yaxis[index].function = {
        name: null,
        tag1: this._chartConfig.yaxis[index].tag,
        tag2: null,
        operator: null,
        shift: null,
        isCustom: false,
        tag3: null,
        frequency: null
      };
      // }
    }
  }

  setImage(event) {
    this._chartConfig.img = event.url;
    this.showImagePicker = false;
    this.imagePickerState.emit(this.showImagePicker);
  }

  colorChange(event, series) {
    series['color'] = event['value'];
    series['colorReference'] = event['reference'];
  }

  updateColorYaxisColor() {
    this.chartOptions.yaxis['colors'] = this.global._appConfigurations[
      'colors'
    ];
    if (this.chartConfig.cType != 'markLine') {
      if (this._chartConfig.isModeBus) {
        this.chartOptions['modBuscolors'] = this.global._appConfigurations[
          'modbusColors'
        ];
        this.updateColor(this._chartConfig.write_register, 'modbusColors');
      } else {
        this.updateColor(this._chartConfig.yaxis, 'colors');
      }
    } else {
      for (let i = 0; i < this._chartConfig.visualMap.pieces.length; i++) {
        this.global._appConfigurations['colors'].forEach((element) => {
          if (
            !this._chartConfig.visualMap.pieces[i].hasOwnProperty(
              'colorReference'
            )
          ) {
            this._chartConfig.visualMap.pieces[i][
              'color'
            ] = this.global._appConfigurations['colors'][0]['value'];
            this._chartConfig.visualMap.pieces[i][
              'colorReference'
            ] = this.global._appConfigurations['colors'][0]['reference'];
          }
        });
      }
    }
  }

  updateColor(incomingData, reference) {
    for (let i = 0; i < incomingData.length; i++) {
      this.global._appConfigurations[reference].forEach((element) => {
        if (!incomingData[i].hasOwnProperty('colorReference')) {
          incomingData[i]['color'] = this.global._appConfigurations[
            reference
          ][0]['value'];
          incomingData[i]['colorReference'] = this.global._appConfigurations[
            reference
          ][0]['reference'];
        }
      });
    }
  }
  chooseImage() {
    this.showImagePicker = true;
    this.imagePickerState.emit(this.showImagePicker);
  }
  frequencyChanged(event, series, index) {
    if (event && event['value'] == 'shift') {
      this._chartConfig.yaxis[index].function.name = null;
    }
  }
  priorityShowHide(event, state) {
    if (state == 'priority') {
      this._chartConfig.showPriorityList = event;
      this._chartConfig.showTable = this._chartConfig.showPriorityList
        ? this._chartConfig.showTable
        : !this._chartConfig.showPriorityList;
    } else if (state == 'table') {
      this._chartConfig.showTable = event;
      this._chartConfig.showPriorityList = this._chartConfig.showTable
        ? this._chartConfig.showPriorityList
        : !this._chartConfig.showTable;
    }
  }

  validateConfigInputs(chartConfInputValue){
    if(chartConfInputValue){
      return true;
    } else {
      return false;
    }
  }
  sortingValidation(chartConf){
    const compareCheck_tagCountCheck:boolean = this.validateConfigInputs(!chartConf.filter.compare.comparison && chartConf.yaxis.length < 2)
    const datatypeGroupByCheck:boolean = this.validateConfigInputs(chartConf.xaxis.aggregation !== null);
    const tagwiseFilterSelectionCheck:boolean = this.validateConfigInputs(chartConf.isReadYaxisFilter);
    const filterCountCheck:boolean = this.validateConfigInputs(chartConf.filter.filtersData.length === 1 && ((chartConf.filter.filtersData[0].value && chartConf.filter.filtersData[0].value.length < 2) || (chartConf.filter.filtersData[0].selectedIds && chartConf.filter.filtersData[0].selectedIds.length < 2)));
    switch(chartConf.xaxis.type){
      case 'timeSeries':
        const regularFilterSelection:boolean = this.validateConfigInputs(!tagwiseFilterSelectionCheck && compareCheck_tagCountCheck && datatypeGroupByCheck && filterCountCheck);
        const tagwiseFilterSelection:boolean = this.validateConfigInputs(tagwiseFilterSelectionCheck && compareCheck_tagCountCheck && datatypeGroupByCheck && chartConf.yaxis[0].devices.length < 2);
        if(regularFilterSelection){
          return true;
        } else if(tagwiseFilterSelection){
          return true;
        } else {
          return false;
        }
      case 'category':
        if(compareCheck_tagCountCheck){
          return true;
        } else {
          return false;
        }
    }
  }
  toggleSortEnableDisable(chartInput){
    const toggleSort:boolean = this.sortingValidation(chartInput);
    if(toggleSort){
      this.disableSort = false;
    } else {
      this.disableSort = true;
      this._chartConfig.xaxis.sort= 'default';
    }
  }
  filterSelectionToggle = (isEmptyFilterlist) => {
    if (isEmptyFilterlist) {
      this.toggleSortEnableDisable(this._chartConfig);
      this._chartConfig.filter.filterList = [];
      this._chartConfig.filter.filtersData = [];
      this.chartOptions.filter.types.forEach((element) => {
        element.disabled = false;
      });
      if (this._chartConfig.xaxis.type === 'category') {
        this._chartConfig.xaxis.dimensionalTag = 'devices';
      }
    } else {
      this.toggleSortEnableDisable(this._chartConfig);
      this._chartConfig.yaxis.forEach((element) => {
        element.devices = [];
        element.deviceGroups = [];
      });
    }
  };
}
