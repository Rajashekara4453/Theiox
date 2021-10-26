import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ITreeOptions } from 'angular-tree-component';
import { globals } from '../../../../../utilities/globals';
import { AppService } from '../../../../../../app/services/app.service';
import { ToastrService } from '../../../../../components/toastr/toastr.service';
import { data } from 'jquery';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { validateBasis } from '@angular/flex-layout';
@Component({
  selector: 'kl-live-chart-config',
  templateUrl: './live-chart-config.component.html',
  styleUrls: ['./live-chart-config.component.scss']
})
export class LiveChartConfigComponent implements OnInit {
  @Input('chartConfig') chartConfig; // chart configurations form parent component
  @Output('chartConfigChange') chartConfigChange = new EventEmitter(); // emitter for sending updated chart options to parent component
  emittedCount = 0;
  tempData = {
    'data': '',
    key: 0
  };
  isClicked: boolean;
  filestring: string;
  files: any;
  @Input() showImagePicker: boolean = false;
  isShowBenchmarkBlock: boolean = true;
  isShowGaugeBenchmarkBlock: boolean = true;
  kpiBenchmarkCount = 2;
  gaugeBenchmarkCount = 3;
  controlsData: any;
  actionsTable:any[];
  actionDataTable: { assets: any[]; tags: any[]; write_value: any; disabledInput: boolean; }[];
  @Input() get showPreview() { // for getting chart preview toggle button status
    return this.showPrevBtn;
  };
  @Input('chartOptions') chartOptions; // chart options from parent component
  @Output() showPreviewChange: EventEmitter<boolean> = new EventEmitter<boolean>(); // emitter for updating preview toggle button change
  @Output() imagePickerState = new EventEmitter();
  public showPrevBtn: boolean; // for enable or disable preview button 
  public isCheckBox: Boolean = false; // for storing checkbox enabled or disabled
  set showPreview(v: boolean) { // set method for updating chart preview toggle button
    this.showPrevBtn = v;
    this.showPreviewChange.emit(this.showPrevBtn);
  }
  reactiveForm :FormGroup;
  assetActions:any=[];
  public treeOptions: ITreeOptions = { // Tree stucture for hierarchy data
    useCheckbox: true,
    useTriState: true,
    useVirtualScroll: true,
    nodeHeight: 22
  };

  imagePickerSettings = {
    isContentProjection: false,
    isSingleSelection: true,
    isUploadEnabled: false
  }
  actionsCount:number=5;
  conditionsCount:number=5;
  configOptionData = {  // for assets and tags data assigning
    assets:[],
    tags:[],
    relay_operation:null
 }
 write_register :[]
 tagsDDSettings = {
  primaryKey: 'value',
  labelKey: 'label',
  singleSelection: false, 
  text: "Select",
  selectAllText: 'Select All',
  unSelectAllText: 'Unselect All',
  enableCheckAll: true,
  enableSearchFilter: true,
  enableFilterSelectAll: true,
  badgeShowLimit:2,
  filterSelectAllText: "Select Filtered Tags",
  filterUnSelectAllText:"Unselect Filtered Tags"
}

configdata =  {
  
  action_name:null,
  description: null,
  labels:[],
  
  type:"dashboard", 
  schedule: {
    schedule: false,
    dayType: "month",
    minutes: [
      
    ],
    hours: [
    
    ],
    months: [
     
    ],

    day: [],
    date:[],

    startDateVal:new Date(),
     startDate:null,
   
    endDateVal:new Date(),
     endDate: null
  },
  actions: [
    {
      assets: [
        
      ],
      tags: [
        
      ],
      write_value: null,
      disabledInput: false,
    }
  ]
}
configurationdata=  {
  action_name:null,
  description: null,
  labels:[],
  
  type:"dashboard", 
  schedule: {
    schedule: false,
    dayType: "month",
    minutes: [
      
    ],
    hours: [
    
    ],
    months: [
     
    ],

    day: [],
    date:[],

    startDateVal:new Date(),
     startDate:null,
   
    endDateVal:new Date(),
     endDate: null
  },
  actions: [
    {
      assets: [
        
      ],
      tags: [
        
      ],
      write_value: null,
      disabledInput: false,
    }
  ]
}
  constructor(private appService: AppService, private toastLoad: ToastrService, private global: globals) { 
      }

  ngOnInit() {
    try {
      if (this.chartConfig.cType === 'gauge' || this.chartConfig.isProgressbar || this.chartConfig.cType === 'tiles' || this.chartConfig.cType === 'modbus_write_widget' || this._chartConfig.isNormaltile || this._chartConfig.chartType === 'pie') {
        this.isCheckBox = true;
        this._chartConfig['sectorColors'] = [[0.2, '#91c7ae'], [0.8, '#63869e'], [1, '#c23531']]
      };
      if (!this._chartConfig['grid']) {
        this._chartConfig['grid'] = {
          xGridLine: false,
          yGridLine: true,
        }
      }
      this.updateFilterListMetadata();
      this.disableOrEnableFilterTypes();
      this.getChartMetaEdit('tags');
      this.revertOptions();
      //  for asset control widget next itreation modification need to be done
        if(!this.chartConfig.hasOwnProperty('widget_id')){
          this.actionsData('one');
          }
       this.chartOptions['assetActionColors'] = this.global._appConfigurations['modbusColors'];
       this.chartOptions.assetControls.condition=this.chartOptions.benchmark.conditions;
    } catch (error) {
      //console.log(error);
    }
  }

  ngOnChanges() {
    try {
      if (this.chartConfig.cType === 'gauge' || this.chartConfig.cType === 'harmonics' || this.chartConfig.cType === 'tiles' || this._chartConfig.chartType === 'pie') {
        this.isCheckBox = true;
        if (!this._chartConfig['sectorColors']) {
          this._chartConfig['sectorColors'] = [[0.2, '#91c7ae'], [0.8, '#63869e'], [1, '#c23531']]
        }
      }
      if (!this._chartConfig['grid']) {
        this._chartConfig['grid'] = {
          xGridLine: false,
          yGridLine: true,
        }
      }
      this.chartConfig.cData.chartOptions.format = 'DD-MM-YYYY HH:MM:SS'
      this.disableOrEnableFilterTypes();
      this.updateFilterListMetadata();
      this.updateColorYaxisColor();
      this.updateAssetsColor();  /* for asset control live widget modification  */
      if (this.chartConfig.isNormaltile || this.chartConfig.isGauge || this.chartConfig.isProgressbar) {
        this.updatePriorityList();
      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Add Y-axis series 
   */
  addYaxisAction() {
    try {
      let yConf: any = {};
      switch (this.chartConfig.cType) {
        case 'line':
        case 'bar':
        case 'area':
        case 'table':
        case 'map':
        case 'tiles':
        case 'scatter':
        case 'harmonics':
          yConf = {
            name: '',
            group: null,
            aggregation: null,
            tag: null,
            unit: null,
            color: "null",
            colorReference: "color 0",
            position: 'left',
            threshold: false,
            thresholdValue: 100,
            benchmark: false,
            benchmarkValue: 100,
            type: this.chartConfig.cType
          };
          break;
      }
      if (['gauge', 'table', 'tiles','map'].indexOf(this.chartConfig.wcType) > -1) {
        delete yConf.position;
        delete yConf.threshold;
        delete yConf.thresholdValue;
        delete yConf.benchmark;
        delete yConf.benchmarkValue;
        delete yConf.color;
      }
      this._chartConfig['yaxis'] ? this._chartConfig['yaxis'].push(yConf) : this._chartConfig['yaxis'] = [yConf];
      this.disableOrEnableFilterTypes();
    } catch (error) {
      //console.log(error);
    }
  }
  addBenchmarkAction() {
    try {
      let newBenchmark = {
        id: '',
        color: '',
        icon: '',
        priority: '',
        iconReference: '',
        value: null,
        isShowValue: null,
        isShowMax: null,
        isDelete: null
      };
      if (!this._chartConfig.hasOwnProperty('benchmark')) { this._chartConfig['benchmark'] = [] };
      newBenchmark = this.chartOptions.benchmark.priorityTypes[0];
      newBenchmark['maxValue'] = this._chartConfig.maxValue;
      newBenchmark['priority'] = this.chartOptions.benchmark.priorityTypes[0]['label'];
      newBenchmark['value'] = null;
      newBenchmark['condition'] = {
        "value": "==",
        "label": "=="
      }
      if (this._chartConfig.chartType == 'gauge' || this.chartConfig.isProgressbar) {
        if (this._chartConfig.benchmark.length == 0) {
          for (let i = 0; i < 2; i++) {
            let obj = { ...newBenchmark };
            if (i == 0) {
              obj.isDelete = false;
              obj.isShowMax = true;
              obj.isShowValue = false;
            }
            if (i == 1) {
              obj.isDelete = true;
              obj.isShowValue = true;
              obj.isShowMax = false;
            }
            this._chartConfig['benchmark'].push(obj);
          } 
        }
        else {
          newBenchmark.isShowValue = true;
          newBenchmark.isShowMax = false;
          newBenchmark.isDelete = true;
          newBenchmark['isShowValue']
          this._chartConfig['benchmark'].push(newBenchmark);
          this.isShowBenchmarkBlock = this._chartConfig['benchmark'].length < this.gaugeBenchmarkCount ? true : false;
          this.disableOrEnableFilterTypes();
        }
      }
      else {
        this._chartConfig['benchmark'].push(newBenchmark);
        this.isShowBenchmarkBlock = this._chartConfig['benchmark'].length < this.kpiBenchmarkCount ? true : false;
        this.disableOrEnableFilterTypes();
      }
    }
    catch (error) {

    }
  }
  changePriority(series, gaugeSeries, index,) {
    if (this._chartConfig.chartType == 'gauge' || this.chartConfig.isProgressbar) {
      this._chartConfig.benchmark[index] = {
        id: series.id,
        color: series.color,
        icon: series.icon,
        priority: series.label,
        iconReference: series.iconReference,
        value: gaugeSeries.value,
        isDelete: gaugeSeries.isDelete,
        isShowMax: gaugeSeries.isShowMax,
        isShowValue: gaugeSeries.isShowValue
      }
    }
    else {
      this._chartConfig.benchmark[index] = {
        id: series.id,
        color: series.color,
        icon: series.icon,
        priority: series.label,
        iconReference: series.iconReference,
        value: this._chartConfig.benchmark[index].value,
        condition: this._chartConfig.benchmark[index].condition
      }
    }
  }

  deleteBenchmark(index) {
    try {
      if (index > -1) {
        this._chartConfig['benchmark'].splice(index, 1);
        this.isShowBenchmarkBlock = this._chartConfig.isNormaltile? this._chartConfig['benchmark'].length < this.kpiBenchmarkCount : this._chartConfig['benchmark'].length < this.gaugeBenchmarkCount ? true : false;
        this.disableOrEnableFilterTypes();
      }
      if ((this.chartConfig.cType === 'gauge'|| this.chartConfig.isProgressbar) && this._chartConfig['benchmark'].length == 1) {
        this._chartConfig['benchmark'] = [];

      }
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Delete Y-axis series 
   * @param index index to be deleted
   */
  deleteYaxisSeries(index) {
    try {
      if (index > -1) {
        this._chartConfig['yaxis'].splice(index, 1);
      }
      this.disableOrEnableFilterTypes();
    } catch (error) {
      //console.log(error);
    }
  }

  moveUp(itemindextomove, movetoindex) {
    const one = this._chartConfig.yaxis[movetoindex];
    this._chartConfig.yaxis[movetoindex] = this._chartConfig.yaxis[itemindextomove];
    this._chartConfig.yaxis[itemindextomove] = one;
  }



  clearColor(color, index) {
    this._chartConfig.yaxis[index].color = null;
  }



  /**
   * attributes to be showed/hidden
   * @param attrName attribute to be hide/show
   */
  isAttributeShow(attrName) {
    try {
      if (!attrName) return;
      let isShow = true;
      switch (attrName) {
        case 'color': isShow = this._chartConfig['chartType'] == 'table' || this._chartConfig['chartType'] == 'map'  || this._chartConfig['chartType'] == 'gauge' || this.chartConfig.isProgressbar  || this._chartConfig.isTile || this._chartConfig.isNormaltile ? false : true; break;
        case 'benchmark': isShow = this._chartConfig['chartType'] == 'table' || this._chartConfig['chartType'] == 'map'  || this._chartConfig['chartType'] == 'gauge' || this.chartConfig.isProgressbar || this._chartConfig.isTile || this._chartConfig.isNormaltile ? false : true; break;
        case 'threshold': isShow = this._chartConfig['chartType'] == 'table' || this._chartConfig['chartType'] == 'map'  || this._chartConfig['chartType'] == 'gauge' || this.chartConfig.isProgressbar|| this._chartConfig.isTile || this._chartConfig.isNormaltile ? false : true; break;
        case 'position': isShow = ['gauge', 'table','map'].indexOf(this._chartConfig['chartType']) === -1 && !this.chartConfig.isProgressbar && !this._chartConfig.isTile && !this._chartConfig.isNormaltile ? true : false; break;
        case 'yaxisAddBtn': isShow = this._chartConfig.isTile || this._chartConfig.isNormaltile || this._chartConfig['chartType'] == 'gauge' || this.chartConfig.isProgressbar ? false : true; break;
        case 'yaxisDeleteBtn': isShow = ['gauge'].indexOf(this._chartConfig['chartType']) === -1 && !this._chartConfig.isTile && !this._chartConfig.isNormaltile ? true : false; break;
        case 'grid': isShow = ['pie', 'table', 'gauge','map'].indexOf(this._chartConfig['chartType']) === -1 && !this._chartConfig.isNormaltile ? true : false; break;
        case 'xaxisFromat': isShow = ['gauge', 'table'].indexOf(this._chartConfig['chartType']) === -1 ? true : false; break;
        case 'legend': isShow = ['gauge', 'table','map'].indexOf(this._chartConfig['chartType']) === -1 && !this._chartConfig.isNormaltile ? true : false; break;
        case 'unitConverter': isShow = ['digital'].indexOf(this._chartConfig['chartType']) === -1 ? true : false; break;
      }
      return isShow;
    } catch (error) {
      //console.log(error);
    }
  }

  track(index) {
    return index;
  }

  /**
   * To enable/disable filter types
   */
  disableOrEnableFilterTypes() {
    try {
      if (!this._chartConfig || !this._chartConfig.filter) {
        return;
      }
      for (let item of this.chartOptions.filter.types) {
        const filterMapp = {
          "Sites": "Organisation",
          "Hierarchy": "Organisation Hierarchy",
          "Devices": "Assets",
          "Device Group": "Asset Group",
        }
        this._chartConfig.filter.filterList.forEach(efl => {
          efl.title = filterMapp.hasOwnProperty(efl.title) ? filterMapp[efl.title] : efl.title;
        });
        const res = this._chartConfig.filter.filterList.filter(fl => fl.title === item.label);
        if (res && res.length > 0) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
        if (item.value === 'tagGroups' || ((this._chartConfig.chartType === 'gauge' || this._chartConfig.chartType === 'map' || this._chartConfig.chartType === 'tiles') && (item.value === 'tagGroups' || item.value === "hierarchy" || item.value === "deviceGroups" || item.value === "sites"))) {
          item.disabled = true;
        }
      }
      this.updateChartConfig();
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * To avoid reference errors
   * @param obj object to be copied/create new reference  
   */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  // reverting chartOptions changes made for PUE widget filter type into sets 
  revertOptions() {
    const dta = this.chartOptions.filter.types;
    // this.chartOptions.filter.types.forEach((element,index) => {
    for (let element = 0; element < this.chartOptions.filter.types.length; element++) {
      if ((dta[element].value == 'devices' || dta[element].value == 'device_group' || dta[element].value == 'site')
        && (dta[element].label.includes('(Set 1)') || dta[element].label.includes('(Set 2)'))) {
        if (dta[element].label.includes('(Set 2)')) {
          this.chartOptions.filter.types.splice(element, 1);
          element--;
        } else {
          dta[element].label = dta[element].label.substring(0, dta[element].label.length - 7);
        }
      }
      if (this.chartConfig.cType != 'alarm' && (dta[element].label.includes('Alarm')
        || dta[element].label.includes('Acknowledge') || dta[element].label.includes('Count'))) {
        this.chartOptions.filter.types.splice(element, 1);
        element--;
      }
    }
    // });
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
      this.chartOptions.filter.types.forEach(element => {
        element.isShow = this.chartOptions.filter['filterTypeBackup'][element.value]; 
      });
      if((this._chartConfig.chartType =='gauge' || this._chartConfig.chartType =='map'  || this.chartConfig.isProgressbar|| this._chartConfig.chartType =='harmonics' || this._chartConfig.isNormaltile || this._chartConfig.chartType =='modbus_write_widget') && this._chartConfig.autoRefreshType == 'realTime') 
      {
       this.chartOptions.filter.types.forEach(element => {
         if(element.value!== 'devices') {
           element.disabled = true;
           element.isShow = false;
         }
       });
     }
      chartInput.filter.filterList = [];
      for (let eachFilter of chartInput.filter.filtersData) {
        let key = eachFilter.id;
        if (eachFilter.type === 'tree') {
          key = 'hierarchy';
        }
        const mapping = {
          'hierarchy': 'site',
          'deviceGroups': 'device_group',
          'tagGroups': 'tag_group',
          'devices': 'devices',
          'sites': 'site_list',
        };
        const res = this.chartOptions.filter.types.filter(el => el.value === mapping[key])
        if (res.length > 0) {
          const filterTypeMeta: any = res[0];
          const item = {
            title: filterTypeMeta.label,
            id: filterTypeMeta.value,
            value: eachFilter.value,
            overwrite: eachFilter.overwrite,
            type: filterTypeMeta.type,
            list: []
          };
        
          if (eachFilter.type === 'tree') {
            item.value = eachFilter;
          }
          if (this.chartOptions.yaxis.tags.length == 0) {
            this.getChartMetaEdit('tags');
          }
          // if (this.chartOptions.filter.filterMeta[filterTypeMeta.value]) {
          //   item.list = this.chartOptions.filter.filterMeta[filterTypeMeta.value];
          // }
          // chartInput.filter.filterList.push(item);
        }
      }
      // this._chartConfig = chartInput;
      // this.disableOrEnableFilterTypes();
    } catch (error) {
      //console.log(error);
    }
  }


  emittedTreeData(treeData) {
    this.tempData = {
      'data': treeData,
      key: this.emittedCount + 1,
    };
  }
  /**
   * Method for updating filter tab configuration into chart config
   */
  updateChartConfig() {
    try {
      let count = 0;
      const chartInput = this.getCopy(this._chartConfig);
      const filter = chartInput.filter;
      if (filter.filterList.length > 0) {
        for (count == 0; count < filter.filterList.length; count++) {
          if ((filter.filterList[count].type == 'tree' && !filter.filterList[count].hasOwnProperty('treeMode')) ||
            (filter.filterList[count].type == 'tree' && filter.filterList[count].hasOwnProperty('treeMode'))) {
            if ((this.tempData.key >= 0 || this.tempData.data !== filter.filterList[count].treeMode) && this.tempData.data !== '') {
              filter.filterList[count]['treeMode'] = this.tempData['data'];
            }
          }
        }
      }
      delete filter.custom;
      filter['filtersData'] = []
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
            filter['filtersData'].push(tempDta);
          }
        }
      }
      chartInput.filter = filter;
      this._chartConfig = chartInput;
      this.updateChartConfOptions();
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method for deleting filter cateogy or group inside filter tab
   * @param index filter option index to delete
   */
  deleteFilterRow(index) {
    try {
      if (index > -1) {
        this._chartConfig['filter']['filterList'].splice(index, 1);
      }
      this.disableOrEnableFilterTypes();
    } catch (error) {
      //console.log(error);
    }
  }

  /**
   * Method called when there is a unit selection on yaxis(series)
   * @param series yaxis series data
   */
  unitChangeAction(series) {
    try {
      if (!series.unitInfo) {
        series.unit = series.selectedUnit;
      }
      series.unit = series.unitInfo && series.unitInfo.label ? series.unitInfo.label : '';
      series.conversionFactor = series.unitInfo && series.unitInfo.factor ? series.unitInfo.factor : 1;
      this.disableOrEnableFilterTypes();
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Method to get the convert to units info based on selected tag and unit
   * @param series yaxis series info
   */
  getUnitList(series) {
    try {
      return series.tag && series.tag.unit && series.tag.unit.value ? this.chartOptions.yaxis.units[series.tag.unit.value] : []
    } catch (error) {
      //console.log(error);
    }
  }

  onFocus() {
    if (this.chartConfig.cData.chartOptions.filter.filterList.length == 0) {
      this.toastLoad.toast('error', 'Error', 'Please select atleast one filter', true);
    }
  }
  /**
   * Method called on selection of tag.
   * for assigning unit corresponding to the selected tag
   * @param series 
   */
  tagChangeAction(series) {
    try {
      if (!this.chartOptions.yaxis.tags || !series.tag) {
        series.unit = '';
      }
      if (series.aggregation === null) {
        series.selectedUnit = series.tag.unit ? series.tag.unit.label : '';
        series.unit = series.tag.unit ? series.tag.unit.label : '';
        series.unitInfo = series.tag.unit ? series.tag.unit : null;
        series.conversionFactor = series.unitInfo.factor ? series.unitInfo.factor : 1;
        series.name = !series.name || series.name == '' ? series.tag.label || '' : series.name;
      } else {
        // To do: for multiple tag selection
      }
      this.disableOrEnableFilterTypes();
    } catch (error) {
      //console.log(error);
    }
  }


  /**
   * Method for adding filter data based on the selected filter type
   */
  addFilter(type, isLoad?: Boolean) {
    try {
      if (!type) {
        return;
      }
      this.isClicked = true;
      this["isClickedFilter" + type.label] = true;
      this.getChartMeta(type);
      if (!isLoad) {
        this.disableOrEnableFilterTypes();
      }
    } catch (error) {
      //console.log(error);
    }
  }

  addReloadFilter(dta) {
    this.getChartMetaEdit(dta.id);
  }
  getChartMeta(selectedFilterType) {
    try {
      const input = {
        "fetch_meta_data_by": [selectedFilterType.value, "tags"],
        "filter": [{ "site_id": this.global.getCurrentUserSiteId() },
        { "user_id": this.global.userId }]
      };
      const mapping = {
        'site': 'hierarchy',
        'device_group': 'deviceGroups',
        'tag_group': 'tagGroups',
        'devices': 'devices',
        'site_list': 'sites',
        "shift": 'shift'
      };
      const item = {
        title: selectedFilterType.label,
        id: mapping[selectedFilterType.value],
        value: [],
        overwrite: (this._chartConfig.chartType =='modbus_write_widget')?false:true,
        type: selectedFilterType.type,
        list: []
      };
      //input['filter'] = [];
      //input['filter'].push({ 'site_id': this.global.getCurrentUserSiteId() });
      const promise = new Promise((resolve) => {
        this.appService.getChartConfigMetaData(input).subscribe((data) => {
          if (data && data.status === 'success') {
            data = data.data;
            resolve(data);
            // api call for getting all filter metadata
            this.chartOptions.yaxis.tags = data['tags'];
            this.chartOptions.yaxis.devices=data['devices']
            this.chartOptions.filter.filterMeta = {
              hierarchy: data['site'],
              deviceGroups: data['device_group'],
              devices: data['devices'],
              tagGroups: data['tag_group'],
              sites: data['site_list'],
              shift: data['shift']
            };

            if (this.chartOptions.filter.filterMeta[mapping[selectedFilterType.value]]) {
              item.list = this.chartOptions.filter.filterMeta[mapping[selectedFilterType.value]];
            }
            const chartInput = this.getCopy(this._chartConfig);
            chartInput.filter.filterList.push(item);
            this._chartConfig = this.getCopy(chartInput);
            this.disableOrEnableFilterTypes();
            this.isClicked = false;
            this["isClickedFilter" + item.title] = false;
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




  getChartMetaEdit(type) {
    try {
      const mapping = {
        'hierarchy': 'site',
        'deviceGroups': 'device_group',
        'tagGroups': 'tag_group',
        'devices': 'devices',
        'sites': 'site_list',
        "shift": 'shift',
        "tags": 'tags'
      };
      const input = {
        "fetch_meta_data_by": [mapping[type]],
        "filter": [{ "site_id": this.global.getCurrentUserSiteId() }, { "user_id": this.global.userId }]
      };

      const item = {
        title: type.title,
        id: mapping[type.id],
        value: [],
        overwrite: true,
        type: type.type,
        list: []
      };
      //input['filter'] = [];
      //input['filter'].push({ 'site_id': this.global.getCurrentUserSiteId() });
      const promise = new Promise((resolve) => {
        this.appService.getChartConfigMetaData(input).subscribe((data) => {
          if (data && data.status === 'success') {

            data = data.data;
            resolve(data);
            // api call for getting all filter metadata
            if (data.hasOwnProperty('tags')) {
              this.chartOptions.yaxis.tags = data['tags'];
            }
            this._chartConfig.filter.filterList.forEach(element => {
              if (element.id == type) {
                if (element.type != 'tree') {
                  element.list = data[mapping[type]];
                  element.value.forEach(element1 => {
                    element.list.forEach(element3 => {
                      if (element1.label == element3.label && element1.checked) {
                        element3.checked = true;
                      }
                    });
                  });
                } else if (element.type == 'tree') {
                  element.list = data[mapping[type]];
                  element.value.metadata = data[mapping[type]];
                }
              }
            });

            if (this.chartOptions.filter.filterMeta[mapping[type]]) {
              item.list = this.chartOptions.filter.filterMeta[mapping[type]];
            }
            const chartInput = this.getCopy(this._chartConfig);
            //chartInput.filter.filterList.push(item);
            this._chartConfig = this.getCopy(chartInput);
            this.disableOrEnableFilterTypes();
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

  getFiles(event) {
    if (event.target.files[0].size > 256000) {
      this.toastLoad.toast('error', 'Error', 'Select File less then 256KB', true);
      event.target.value = "";
      this._chartConfig.reportFormat.logo = "";
    }
    else if (event.target.files[0].type != "image/jpeg" && event.target.files[0].type != "image/png") {
      this.toastLoad.toast('error', 'Error', 'Select jpeg/png File', true);
      event.target.value = "";
      this._chartConfig.reportFormat.logo = "";
    } else {
      this.files = event.target.files;
      const reader = new FileReader();
      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(this.files[0]);
    }
  }

  handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);  // Converting binary string data.
    this._chartConfig.img = 'data:image/png;base64,' + this.filestring;
  }

  /**
   * Method for updating the latest options into parent component
   */
  updateChartConfOptions() {
    this.chartConfigChange.emit(this.chartConfig);
  }

  /**
   * Getter for getting chart options
   */
  get _chartConfig() {
    return this.chartConfig && this.chartConfig['cData'] ? this.chartConfig['cData']['chartOptions'] : undefined;
  }

  /**
   * Method for setting all the chart options into the variable
   */
  set _chartConfig(value) {
    this.chartConfig['cData']['chartOptions'] = value;
  }

  /**
   * Data emitted from custom multiselect/hierarchy 
   * @param data selected data
   * @param id id of selected filter type
   */
  emittedData(data, id) {
    try {
      this._chartConfig.filter.filterList.forEach(element => {
        if (element.id === id) {
          if (data.hasOwnProperty('treeData') && data.treeData.type == 'tree') {
            element.value = data.treeData;
          } else {
            element.value = data;
          }
        }
      });
      this.disableOrEnableFilterTypes();
    } catch (error) {
      //console.log(error);
    }
  }

  colorChange(event, series,modbus?:string) {
    series['color'] = event['value'];
    series['colorReference'] = event['reference'];
    if(this.chartConfig.isModeBus) {
      this.updateAssetControl(modbus,series)
    }

  }

  updateAssetControl(whichArray,data) {
    if(whichArray=='one' && this._chartConfig.isActionEnabled) {
      // this._chartConfig.controlsData[0].color = data.color;
      this._chartConfig.controlsData[0].value = data.id;
    } else if(whichArray=='two' && this._chartConfig.isAction){
      // this._chartConfig.controlsData[1].color = data.color;
      this._chartConfig.controlsData[1].value = data.id;
    }
    // this.colorUpdateeOnActionChange();
  }

  updateColorYaxisColor() {
    this.chartOptions.yaxis['colors'] = this.global._appConfigurations['colors'];
    for (let i = 0; i < this._chartConfig.yaxis.length; i++) {
      this.global._appConfigurations['colors'].forEach(element => {
        if (!this._chartConfig.yaxis[i].hasOwnProperty('colorReference')) {
          this._chartConfig.yaxis[i]['color'] = this.global._appConfigurations['colors'][0]['value'];
          this._chartConfig.yaxis[i]['colorReference'] = this.global._appConfigurations['colors'][0]['reference'];
        }
      });
    }
  }
  setImage(event) {
    this._chartConfig.img = event.url;
    this.showImagePicker = false;
    this.imagePickerState.emit(this.showImagePicker);
  }

  chooseImage() {
    this.showImagePicker = true;
    this.imagePickerState.emit(this.showImagePicker);
  }

  updatePriorityList() {
    this.chartOptions.benchmark.priorityTypes.forEach(element => {
      this.chartConfig.cData.chartOptions.benchmark.forEach(element1 => {
        if (element1.id == element.id) {
          element1['color'] = element['color'];
          element1['icon'] = element['icon']
        }
      });
    });
    this.isShowBenchmarkBlock = this._chartConfig['benchmark'].length < this.kpiBenchmarkCount ? true : false;
    if (this.chartConfig.isGauge || this.chartConfig.isProgressbar) {
      this.isShowBenchmarkBlock = this._chartConfig['benchmark'].length < this.gaugeBenchmarkCount ? true : false;
    }
  }
//  asset control to get the devices and tags next itreation modification
    getNewAssetTag(){
        const input = {
          fetch_meta_data_by: ["devices", "tags"],
          filter: [
            { site_id: this.global.getCurrentUserSiteId() },
            { user_id: this.global.getCurrentUserId() },
          ],
          cType: 'modbus_write_widget',
        };
      const promise = new Promise((resolve) =>{
      this.appService.getChartConfigMetaData(input).subscribe((responsedata) =>{
      if(responsedata && responsedata.status ==='success'){

        responsedata=responsedata.data
        resolve(responsedata);
        this.configOptionData.assets = responsedata.devices; 
            this.configOptionData.tags = responsedata.tags; 

      }
      else{
        resolve(false);
      }
     
    });
    return promise;   
      });
   
    }
    getAssetDevices(){
      const input = {
        fetch_meta_data_by: ["devices", "tags"],
        filter: [
          { site_id: this.global.getCurrentUserSiteId() },
          { user_id: this.global.getCurrentUserId() },
        ],
      };
        const promise = new Promise((resolve) =>{
        this.appService.getChartConfigMetaData(input).subscribe((responsedata) =>{
        if(responsedata && responsedata.status ==='success'){
      responsedata=responsedata.data
      resolve(responsedata);
      this.chartOptions.yaxis.devices = responsedata.devices; 
      this.chartOptions.yaxis.tags = responsedata.tags; 

    }
    else{
      resolve(false);
    }
   
  });
  return promise;   
    });

    }
   
     removeAction(index){
      this.configdata.actions.splice(index,1);
     }
     removeAddAction(index){
      this.configurationdata.actions.splice(index,1);
     }
     deleteCondition(index){
      this._chartConfig.assetControls.splice(index,1);  
     }
     addAssetCondition(){
      let assetConditioObj={
        value:null,
        toValue:null,
        fromValue:null,
        color:'0',
        condition:'==',
        isRangeValue:false
      }
  this._chartConfig['assetControls'].push(assetConditioObj);
     }
    //asset control color refrence for configuration
     updateAssetsColor() {
        this.global._appConfigurations['modbusColors'].forEach(element => {
          if (!this._chartConfig.write_register[0].hasOwnProperty('colorReference') || !this._chartConfig.write_register_actions[0].hasOwnProperty('colorReference')) {
            this._chartConfig.write_register[0]['colorReference'] = this.global._appConfigurations['modbusColors'][0]['reference'];
            this._chartConfig.write_register_actions[0]['colorReference'] = this.global._appConfigurations['modbusColors'][0]['reference'];
          }
        });
    }
    // asset control on opening the modal to get data
    openActionModal(){
      this.getNewAssetTag();
      if(this._chartConfig['write_register'][0].labelActionId){
      this.editAssetConfig()
      }
      this.configdata.actions=[{
        assets:[],
        tags:[],
        write_value: null,
        disabledInput: false
      }]
      document.getElementById('exampleModalLong').click();
   
    }
    openModal(){
      this.getNewAssetTag();
      if(this._chartConfig['write_register_actions'][0].labelActionId){
        this.editAssetConfigAction()
        }
        this.configurationdata.actions=[{
          assets:[],
          tags:[],
          write_value: null,
          disabledInput: false
        }]
       document.getElementById('openModalButton').click();
    }
    // asset control to add the objects in the modal next iterartion
    addActions(){
      let actionsObj={
        assets:[],
        tags:[],
        write_value: null,
        disabledInput: false
      }
      this.configdata.actions.push(actionsObj);
    }
    addActionsData(){
      let actionsObj={
        assets:[],
        tags:[],
         write_value: null,
         disabledInput: false
      }
      this.configurationdata.actions.push(actionsObj);
    }
   
       // asset control live widget to cancel the modal one
     actionModalCancel(){
      this.configdata.actions=[{
        assets:[],
        tags:[],
        write_value: null,
        disabledInput: false
      }];
     }
    // asset control live widget to cancel the modal one
     actionCancel(){
      this.configdata.actions=[{
        assets:[],
        tags:[],
        write_value: null,
        disabledInput: false

      }];
     }
     trackBy(index) { return index }
     // asset control widget for first configure modal in actions section for next iteration 
    createActionId(){
      this._chartConfig['actionsTable'] = {
        "bodyContent":[],
        "headerContent":[]
      }
      this.appService
      .saveAssetControlConfig(this.configdata)
      .subscribe((data) => {
        if (data.status == "success") {
          this._chartConfig['write_register'][0]['labelActionId']="";
       this._chartConfig['write_register'][0]['labelActionId']=data.asset_action_id;
          this._chartConfig['actionsTable']['bodyContent']= this.configdata.actions;
          this._chartConfig['actionsTable']['headerContent']=[{
            "label":"Asset",
            "key":"assets"
          },
          {
            "label":"Tag",
            "key":"tags"
          },
        {
          "label":"Value",
          "key":"write_value"
        }
      ]
    
          this.toastLoad.toast("success", "Success", "Action Created Sucessfully", true);
       
        } else {
          this.toastLoad.toast("error", "Error", "Submission Failed", true);
        }
      });
      
    }
    // asset control widget for second configure modal in actions section for next iteration 
    createActionIdModal(){
      this._chartConfig['actionDataTable'] = {
        "bodyContent":[],
        "headerContent":[]
      }
      this.appService
      .saveAssetControlConfig(this.configurationdata)
      .subscribe((data) => {
        if (data.status == "success") {
          this._chartConfig['write_register_actions'][0]['labelActionId']="";
       this._chartConfig['write_register_actions'][0]['labelActionId']=data.asset_action_id;
          this._chartConfig['actionDataTable']['bodyContent']= this.configurationdata.actions;
          this._chartConfig['actionDataTable']['headerContent']=[{
            "label":"Asset",
            "key":"assets"
          },
          {
            "label":"Tag",
            "key":"tags"
          },
        {
          "label":"Value",
          "key":"write_value"
        }
      ]
      
          this.toastLoad.toast("success", "Success", "Action Created Sucessfully", true);
         
        } else {
          this.toastLoad.toast("error", "Error", "Submission Failed", true);
        }
      });
  
    }
    trackByActionValue(i: number, item: any) {
      return i;
    }
    
    editAssetConfig(){
      let objGet = {
        "asset_action_id": '',
        "type": "dashboard"
        };
        objGet.asset_action_id=this._chartConfig['write_register'][0].labelActionId;
        try {
          this.appService.editAssetControlData(objGet).subscribe(data => {
            if (data!={} && !data.hasOwnProperty('message')) {
              this.configdata = data
            } else { 
              this.toastLoad.toast('error','Error','Failed To Load Data ',true)
            }  
    })
        } catch (error) {
          console.log(error);
        
        }

    }

    // for asset control widget on edit  of the widget
    editAssetConfigAction() {
      let objGet = {
        "asset_action_id": '',
        "type": "dashboard"
        };
        objGet.asset_action_id=this._chartConfig['write_register_actions'][0].labelActionId;
        try {
          this.appService.editAssetControlData(objGet).subscribe(data => {
            if (data!={} && !data.hasOwnProperty('message')) {
              this.configurationdata = data;
            } else {
              this.toastLoad.toast('error','Error',data.message,true)
            }
    
    })
        } catch (error) {
          console.log(error);
        }
    }

    // < for asset control comparator dropdown based on condition >>
    actionsData(whichArray){
      if(this._chartConfig.isAction && this._chartConfig.isActionEnabled){
        this._chartConfig.controlsData = [];
       const one =  {
          "value":  "0",
          "label":   this._chartConfig['write_register'][0].label
        }
        const two =  {
          "value":  "1",
          "label":   this._chartConfig['write_register_actions'][0].label
        }
        this._chartConfig.controlsData.push(one);
        this._chartConfig.controlsData.push(two)
      } 
      else if(!this._chartConfig.isActionEnabled && !this._chartConfig.isAction ){
        this._chartConfig.controlsData = []
      }
      else {
        if(whichArray=='one') {
          if(this._chartConfig.isActionEnabled){
            this._chartConfig.controlsData = [];
            this._chartConfig.controlsData.push({
                "value":  "0",
                "label":   this._chartConfig['write_register'][0].label
              });}
          else if(!this._chartConfig.isAction){
            this._chartConfig.controlsData = []
          } else {
            this._chartConfig.controlsData.splice(0,1)
          }
        } else if(whichArray=='two') {
          if(this._chartConfig.isAction){
            this._chartConfig.controlsData.push({
                "value":   "1",
                "label":   this._chartConfig['write_register_actions'][0].label
                            });
            }
         else if(!this._chartConfig.isAction){
            this._chartConfig.controlsData.splice(1,1)

          }
        } 
        this.update();
      }     
    }


    update() {
      this._chartConfig.controlsData = [...this._chartConfig.controlsData]
      for(let i=0;i<this._chartConfig.assetControls.length;i++){
        for(let k=0;k<this._chartConfig.controlsData.length;k++){
          this._chartConfig.assetControls[i].color=this._chartConfig.controlsData[k].value;
        }
      }
    }
    conditionCheck(index){
          if(this._chartConfig.assetControls[index].condition=="!=" || this._chartConfig.assetControls[index].condition=="=="){
            this._chartConfig.assetControls[index].isRangeValue=false
          }
          else{
            this._chartConfig.assetControls[index].isRangeValue=true;
            
          }

  
    

    }
    
}
