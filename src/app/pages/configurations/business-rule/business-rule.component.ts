import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as esprima from 'esprima';
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/config';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { globals } from '../../../utilities/globals';
@Component({
  selector: 'kl-business-rule',
  templateUrl: './business-rule.component.html',
  styleUrls: ['./business-rule.component.scss']
})
export class BusinessRuleComponent implements OnInit {
  public ruleListRowID: any;
  public settings: any;
  public step_number: any;
  public devicetype: any;
  public dTypeOptions: any;
  public scheduleTypeOptions: any;
  public DeviceMinute: any;
  public daysOptions: any;
  public monthsOptions: any;
  public hoursOptions: any;
  public functionListOption: any;
  public ruleFrquencyOptions: any;
  public weekdayoptions: any;
  public tagByIdOptions: any;
  public scheduleDayOptions: any;
  public deviceListOption: any;
  public parameter_Options: any;
  public parameter_GroupOptions: any;
  public deviceGroupOptions: any;
  public minuteOptions: any;
  public closeResult: string;
  public frequencyoptions: any;
  public completeTagName: any;
  public completetagId: any;
  public CustomTagArrayList: any;
  public DFrequency: any;
  public menus: any;
  public heading: any;
  public nodes = [];
  public options = {};
  public data;
  public data$ = new Subject<any>();
  public table_data: any;
  public deviceRuleArr: any = {};
  public MultiselectedItems = [];
  public settingsForDevice = {};
  public settingsForDeviceGroup = {};
  /* -------Editor option------- */
  public editorOptions: any;
  public code: string = 'max(5, 9)';
  public jsonSuggetions: any;
  public preventDuplicateSuggetion: any;
  editorSuggestInstance: monaco.IDisposable;
  public setEditorProviders: boolean = true;

  private arithmeticOperatorList = {
    '+': { symbol: '+', title: 'Add', value: '+' },
    '-': { symbol: '-', title: 'Subtract', value: '-' },
    '*': { symbol: '*', title: 'Multiply', value: '*' },
    '%': { symbol: '%', title: 'Modulus', value: '%' },
    '^': { symbol: '^', title: 'Exponent', value: '**' },
    '/': { symbol: '/', title: 'Divide', value: '/' },
    '==': { symbol: '==', title: 'Equal to', value: '===' },
    '===': { symbol: '==', title: 'Equal to', value: '===' },
    '<': { symbol: '<', title: 'Greater than', value: '<' },
    '<=': { symbol: '<=', title: 'Greater than or equal to', value: '<=' },
    '>': { symbol: '>', title: 'Less than', value: '>' },
    '>=': { symbol: '>=', title: 'Less than or equal to', value: '>=' },
    '&&': { symbol: '&&', title: 'And', value: '&&' },
    '||': { symbol: '||', title: 'Or', value: '||' }
  };
  private _calcuationValidObject: Object = {
    status: '',
    message: ''
  };
  private _previewConfig: any = {
    roundOff: 'none',
    decimalPoints: 2
  };
  private _calcSuggAll: Object = {};
  public calcSuggestions = [];
  calcResults: any;
  private _formulaInfo: any = { code: '' };
  _codeDetails: { code: any; convertedCode: any; parsedVal: any };
  private _previewValue: Number;
  public _calcFormulaList = [
    {
      code: '',
      parsedCode: '',
      _previewValue: '',
      calcuationValidObject: {
        status: false,
        message: 'Enter your rule below'
      },
      customtagName: null,
      tagParameterId: null,
      tagFunction: null,
      tagFrequency: null,
      completeTagName: null,
      completeTagId: null,
      temp: {}
    }
  ];
  public isErrorInRuleArr: boolean = false;
  public ruleFormulaListToSend = [];
  public ErrorInRuleNumber: number = undefined;
  _calcParameterSuggColor = {
    tokenizer: []
  };
  isSuggetionReady = false;
  /* ---------------------Date Picker-------------------------- */
  public Datesettings = {
    bigBanner: false,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: false
  };

  public DateTimesettings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy',
    defaultOpen: false
  };
  settingsForFreq: object = {};
  no_table_data: boolean;
  tagsArray = [];
  deviceSuggestionArray;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    public _toastLoad: ToastrService,
    private authService: AuthGuard,
    private global: globals
  ) {
    /* ------------------------------------------------------------------- */
    this.settings = [
      { stepnumber: 1, label: 'Basic Configuration', active: true },
      { stepnumber: 2, label: 'Rule Creation', active: false }
    ];
    /* ------------------------------------------------------------------- */
    this.http.get('./assets/build-data/rule-engine/minute.json').subscribe(
      (res) => {
        this.minuteOptions = res;
      },
      (error) => {
        // console.log("error while fetching minute json");
      }
    );
    /* ------------------------------------------------------------------- */
    this.http.get('./assets/build-data/rule-engine/hours.json').subscribe(
      (res) => {
        this.hoursOptions = res;
      },
      (error) => {
        // console.log("error while fetching hours json");
      }
    );
    /* ----------------------------------------------------------------- */
    this.http.get('./assets/build-data/rule-engine/days.json').subscribe(
      (res) => {
        this.daysOptions = res;
      },
      (error) => {
        // console.log("error while fetching days json");
      }
    );
    /* ------------------------------------------------------------------- */
    this.http.get('./assets/build-data/rule-engine/months.json').subscribe(
      (res) => {
        this.monthsOptions = res;
      },
      (error) => {
        // console.log("error while fetching months json");
      }
    );
    /* --------------------------------------------------------------------- */
    this.http.get('./assets/build-data/rule-engine/weekday.json').subscribe(
      (res) => {
        this.weekdayoptions = res;
      },
      (error) => {
        // console.log("error while fetching weekday json");
      }
    );
    /* ----------------------------------------------------------------------- */
    this.appService.getAllBusinessRuleMetaData().subscribe(
      (res) => {
        if (res.status == 'success') {
          this.deviceListOption = res.devices;
          this.deviceGroupOptions = res.device_group;
          this.parameter_Options = res.tag;
          this.parameter_GroupOptions = res.tag_group;
        } else {
          // console.log("error while fetching metadata");
        }
      },
      (error) => {
        // console.log("error while fetching metadata");
      }
    );
    /* ----------------------------------------------------------------------- */
    this.http.get('./assets/build-data/rule-engine/functions.json').subscribe(
      (res) => {
        this.functionListOption = res;
      },
      (error) => {
        // console.log("error while fetching function json");
      }
    );
    /* ------------------------------------------------------------------------- */
    this.http
      .get('./assets/build-data/rule-engine/time_frequency.json')
      .subscribe(
        (res) => {
          this.ruleFrquencyOptions = res;
        },
        (error) => {
          // console.log("error while fetching frequency json");
        }
      );
  }
  /* ---------------------------ngOnInit started here------------------------------ */
  ngOnInit() {
    this.setCalcSuggestions(''); //get method suggetion for rule builder
    this.getTableData({}); // get rule table data onload of page
    this.setEmptyFormDataForRule(); // set empty json for form
    this.step_number = -1;
    this.dTypeOptions = [
      {
        label: 'Manual',
        value: 'Manual'
      },
      {
        label: 'Schedule',
        value: 'Schedule'
      }
    ];
    this.scheduleTypeOptions = [
      {
        label: 'One Time',
        value: 'onetime'
      },
      {
        label: 'Recurring',
        value: 'recurring'
      }
    ];
    this.scheduleDayOptions = [
      {
        label: 'Week',
        value: 'week'
      },
      {
        label: 'Month',
        value: 'month'
      }
    ];

    this.settingsForDevice = {
      singleSelection: false,
      text: 'Select Devices',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 2,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered Device',
      filterUnSelectAllText: 'Un-select the Filtered Device'
    };
    this.settingsForDeviceGroup = {
      singleSelection: false,
      text: 'Select Devices Group',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 2,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered Device Group',
      filterUnSelectAllText: 'Un-select the Filtered Device Group'
    };
    this.settingsForFreq = {
      singleSelection: false,
      text: 'Select',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered data',
      filterUnSelectAllText: 'Un-select the Filtered data'
    };
  }
  /* ---------------------------ngOnInit ends here------------------------------ */
  /**
   * Method for assigning the empty json
   */
  setEmptyFormDataForRule() {
    this.deviceRuleArr = {
      business_rule_engine_id: '',
      ruleName: '',
      deviceDescription: '',
      Selected_device: null,
      Selected_device_group: null,
      Selected_ruleType: null,
      schedule: {
        schedule_Type: null,
        scheduleMinute: null,
        scheduleHours: null,
        scheduleDay_Type: null,
        scheduleday: null,
        scheduleMonths: null,
        onetimeSchedule_DateAndTime: new Date(),
        duration_startDate: new Date(),
        duration_endDate: new Date()
      },
      manual: {
        parameterModel: null,
        parameterGroup: null
      },
      calcFormulaList: [
        {
          code: '',
          parsedCode: {
            type: 'Program',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'BinaryExpression',
                  operator: '*',
                  left: {
                    type: 'Literal',
                    value: 1,
                    raw: '2'
                  },
                  right: {
                    type: 'CallExpression',
                    callee: {
                      type: 'Identifier',
                      name: 'deltaSum'
                    },
                    arguments: [
                      {
                        type: 'Literal',
                        value: 20,
                        raw: '20'
                      },
                      {
                        type: 'Identifier',
                        name: '',
                        deviceName: ''
                      }
                    ]
                  }
                }
              }
            ],
            sourceType: 'script'
          },
          _previewValue: '',
          calcuationValidObject: {
            status: false,
            message: 'Enter your rule below'
          },
          customtagName: null,
          tagParameterId: null,
          tagFunction: null,
          tagFrequency: null,
          completeTagName: null,
          completetagId: null,
          temp: {}
        }
      ]
    };
  }
  /**
   * Method For Fetch Data For Device Table
   * first call form onInit
   */
  getTableData(data) {
    this.appService.getBusinessRuleTableDataAndRowData(data).subscribe(
      (res) => {
        // console.log("get table data",res);
        if (res.status == 'success') {
          this.no_table_data = true;
          this.table_data = res;
        } else {
          this.no_table_data = false;
          this._toastLoad.toast(
            'error',
            'Error',
            'Error while fetching data',
            true
          );
        }
      },
      (error) => {
        //console.log("error while fetching table", error);
        this._toastLoad.toast(
          'error',
          'Error',
          'Error while fetching data',
          true
        );
      }
    );
  }
  /* ------------------------------------------------- */
  reset_ruleType(type) {
    if (type === 'Real Time') {
      this.deviceRuleArr.schedule = {
        schedule_Type: null,
        scheduleMinute: null,
        scheduleHours: null,
        scheduleDay_Type: null,
        scheduleday: null,
        scheduleMonths: null,
        onetimeSchedule_DateAndTime: new Date().getTime(),
        duration_startDate: new Date().getTime(),
        duration_endDate: new Date().getTime()
      };
      this.deviceRuleArr.manual = {
        parameterModel: null,
        parameterGroup: null
      };
    } else if (type === 'Manual') {
      this.deviceRuleArr.schedule = {
        schedule_Type: null,
        scheduleMinute: null,
        scheduleHours: null,
        scheduleDay_Type: null,
        scheduleday: null,
        scheduleMonths: null,
        onetimeSchedule_DateAndTime: new Date().getTime(),
        duration_startDate: new Date().getTime(),
        duration_endDate: new Date().getTime()
      };
    } else if (type === 'Schedule') {
      this.deviceRuleArr.manual = {
        parameterModel: null,
        parameterGroup: null
      };
    } else {
      this.deviceRuleArr.schedule = {
        schedule_Type: null,
        scheduleMinute: null,
        scheduleHours: null,
        scheduleDay_Type: null,
        scheduleday: null,
        scheduleMonths: null,
        onetimeSchedule_DateAndTime: new Date().getTime(),
        duration_startDate: new Date().getTime(),
        duration_endDate: new Date().getTime()
      };
      this.deviceRuleArr.manual = {
        parameterModel: null,
        parameterGroup: null
      };
    }
  }
  /* ----------------------------------------------------- */
  reset_schedule_Type(type) {
    if (type == 'onetime') {
      this.deviceRuleArr.schedule = {
        schedule_Type: 'onetime',
        scheduleMinute: null,
        scheduleHours: null,
        scheduleDay_Type: null,
        scheduleday: null,
        scheduleMonths: null,
        onetimeSchedule_DateAndTime: new Date().getTime(),
        duration_startDate: new Date().getTime(),
        duration_endDate: new Date().getTime()
      };
    } else if (type == 'recurring') {
      this.deviceRuleArr.schedule = {
        schedule_Type: 'recurring',
        scheduleMinute: null,
        scheduleHours: null,
        scheduleDay_Type: null,
        scheduleday: null,
        scheduleMonths: null,
        onetimeSchedule_DateAndTime: new Date().getTime(),
        duration_startDate: new Date().getTime(),
        duration_endDate: new Date().getTime()
      };
    } else {
      this.deviceRuleArr.schedule = {
        schedule_Type: null,
        scheduleMinute: null,
        scheduleHours: null,
        scheduleDay_Type: null,
        scheduleday: null,
        scheduleMonths: null,
        onetimeSchedule_DateAndTime: new Date().getTime(),
        duration_startDate: new Date().getTime(),
        duration_endDate: new Date().getTime()
      };
    }
  }
  /**
   *
   * Method for Save Rule Form
   * based on condition, assign empty string to models
   */
  SaveRule() {
    let tagFrequencyCheck = false;
    if (this.deviceRuleArr.Selected_ruleType === 'Schedule') {
      if (this.deviceRuleArr.schedule.schedule_Type === 'onetime') {
        this.deviceRuleArr.schedule.duration_startDate = Math.round(
          new Date(
            this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime
          ).getTime() / 1000
        );
        this.deviceRuleArr.schedule.duration_endDate = Math.round(
          new Date(
            this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime
          ).getTime() / 1000
        );
        this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime = Math.round(
          new Date(
            this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime
          ).getTime() / 1000
        );
      } else if (this.deviceRuleArr.schedule.schedule_Type === 'recurring') {
        this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime = Math.round(
          new Date().getTime() / 1000
        );
        this.deviceRuleArr.schedule.duration_startDate = Math.round(
          new Date(this.deviceRuleArr.schedule.duration_startDate).getTime() /
            1000
        );
        this.deviceRuleArr.schedule.duration_endDate = Math.round(
          new Date(this.deviceRuleArr.schedule.duration_endDate).getTime() /
            1000
        );
      }
    } else if (
      this.deviceRuleArr.schedule.schedule_Type === null ||
      this.deviceRuleArr.Selected_ruleType === null
    ) {
      this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime = Math.round(
        new Date().getTime() / 1000
      );
      this.deviceRuleArr.schedule.duration_startDate = Math.round(
        new Date().getTime() / 1000
      );
      this.deviceRuleArr.schedule.duration_endDate = Math.round(
        new Date().getTime() / 1000
      );
    }

    if (this.ruleFormulaListToSend.length != 0) {
      this.deviceRuleArr.calcFormulaList = this.ruleFormulaListToSend;
      for (let j = 0; j < this.deviceRuleArr.calcFormulaList.length; j++) {
        if (
          this.deviceRuleArr.calcFormulaList[j].tagFunction !== 'None' &&
          this.deviceRuleArr.calcFormulaList[j].tagFrequency !== null &&
          this.deviceRuleArr.calcFormulaList[j].tagFrequency !== ''
        ) {
          tagFrequencyCheck = true;
        } else if (
          this.deviceRuleArr.calcFormulaList[j].tagFunction === 'None'
        ) {
          tagFrequencyCheck = true;
        }
      }
    } else {
      for (let j = 0; j < this.deviceRuleArr.calcFormulaList.length; j++) {
        this.deviceRuleArr.calcFormulaList[j].temp = {};
        if (
          this.deviceRuleArr.calcFormulaList[j].tagFunction !== 'None' &&
          this.deviceRuleArr.calcFormulaList[j].tagFrequency !== null &&
          this.deviceRuleArr.calcFormulaList[j].tagFrequency !== ''
        ) {
          tagFrequencyCheck = true;
        }
      }
    }
    // console.log("Post Rule Data:", this.deviceRuleArr);
    // console.log("Post Rule Data:", JSON.stringify(this.deviceRuleArr));
    this.errorInRuleNumber();
    // if(this.isErrorInRuleArr == false && tagFrequencyCheck === true){
    document.getElementById('saveRule').setAttribute('disabled', 'true');
    this.appService.saveAndEditBusinessRuleForm(this.deviceRuleArr).subscribe(
      (res) => {
        if (res.status == 'success') {
          //console.log("save new rule", res);
          this._toastLoad.toast('success', 'Saved', res.message, true);
          this.showTable();
        } else {
          this._toastLoad.toast('error', 'Error', res.message, true);
        }
        document.getElementById('saveRule').removeAttribute('disabled');
      },
      (error) => {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error while saving rule, Try again.',
          true
        );
        //console.log("error while saving form", error);
        document.getElementById('saveRule').removeAttribute('disabled');
      }
    );
    // }else {
    //   this._toastLoad.toast('error', 'Error in rule', 'Please validate to save rule.', true);
    // }
  }
  /**
   * Method for show the rule data table
   * and assign new empty json
   */
  showTable() {
    this.step_number = -1;
    this.setEmptyFormDataForRule();
    this.getTableData({});
    this._calcFormulaList = this.deviceRuleArr.calcFormulaList;
  }
  /**
   * Method for show rule form
   */
  addNewRuleForm() {
    this.step_number = 1;
    this.setEmptyFormDataForRule();
    this.isErrorInRuleArr = false;
    this.ErrorInRuleNumber = undefined;
    //this._toastLoad.toast('error', 'Error', 'Error while loading Site list', true);
  }
  /**
   * Method for editing the rule form
   * @param id for rule id which needs to edit from list
   */

  editRule(id) {
    const objGet = {};
    objGet['business_rule_engine_id'] = id;

    this.appService.getBusinessRuleTableDataAndRowData(objGet).subscribe(
      (res) => {
        // console.log("read rule data", res);
        if (res.status == 'success') {
          this.deviceRuleArr = res;
          // if(res.schedule.duration_startDate){
          //   this.deviceRuleArr.schedule.duration_startDate = res.schedule.duration_startDate*1000;
          // }
          res.schedule.duration_startDate
            ? (this.deviceRuleArr.schedule.duration_startDate = new Date(
                res.schedule.duration_startDate * 1000
              ))
            : (this.deviceRuleArr.schedule.duration_startDate = new Date().getTime());
          // if(res.schedule.duration_endDate){
          //   this.deviceRuleArr.schedule.duration_endDate = res.schedule.duration_endDate *1000;
          // }
          res.schedule.duration_endDate
            ? (this.deviceRuleArr.schedule.duration_endDate = new Date(
                res.schedule.duration_endDate * 1000
              ))
            : (this.deviceRuleArr.schedule.duration_endDate = new Date().getTime());
          // if(res.schedule.onetimeSchedule_DateAndTime){
          //   this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime = res.schedule.onetimeSchedule_DateAndTime*1000;
          // }
          res.schedule.onetimeSchedule_DateAndTime
            ? (this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime = new Date(
                res.schedule.onetimeSchedule_DateAndTime * 1000
              ))
            : (this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime = new Date().getTime());
          this._calcFormulaList = this.deviceRuleArr.calcFormulaList;
          for (let i = 0; i < this._calcFormulaList.length; i++) {
            this._calcFormulaList[i].temp = {
              code: this._calcFormulaList[i].code,
              convertedCode: undefined,
              parsedVal: undefined
            };
          }
          this.step_number = 1;
        } else {
          // console.log("error while editing rule");
        }
      },
      (error) => {
        // console.log("error while fetching rule data json");
      }
    );
  }
  /**
   *
   * @param id rule data id form table
   */
  delete(id) {
    this.ruleListRowID = id;
  }
  /**
   * Method for delete the rule form
   * @param id for rule id which needs to delete from list
   */
  Conf_deleteRule() {
    document
      .getElementById('deleteRule' + this.ruleListRowID)
      .setAttribute('disabled', 'true');
    this.appService.deleteBusinessRuleById(this.ruleListRowID).subscribe(
      (res) => {
        if (res.status == 'success') {
          //console.log("save new rule", res);
          this._toastLoad.toast('success', 'Saved', res.message, true);
          this.getTableData({});
        } else {
          this._toastLoad.toast('error', 'Error', res.message, true);
        }
      },
      (error) => {
        // console.log("error while deleting form", error);
        this._toastLoad.toast('error', 'Error', error.message, true);
      }
    );
  }

  gotoNextStep(val) {
    this.setEditorProviders = true;
    this.step_number = val;
    this.getDevicesSuggestions();
  }
  filter(search) {
    this.data$.next(this.data.filter((_) => _.name.includes(search)));
  }
  getstepnumber(step) {
    this.step_number = step.stepnumber;
    // assign same dates in milliseconds
    // this.deviceRuleArr.schedule.duration_startDate= new Date( this.deviceRuleArr.schedule.duration_startDate * 1000);
    // this.deviceRuleArr.schedule.duration_endDate=   new Date( this.deviceRuleArr.schedule.duration_endDate * 1000);
    // this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime=  new Date( this.deviceRuleArr.schedule.onetimeSchedule_DateAndTime * 1000);
  }

  clearCustomName(model, index) {
    if (model != 'none') {
      this._calcFormulaList[index].customtagName = null;
    } else {
      this._calcFormulaList[index].tagFrequency = null;
    }
  }

  /* --------------------------------------------------------------------------------------- */
  /* -------------------------Monaco Editor Methods Starts Here----------------------------- */
  /* --------------------------------------------------------------------------------------- */
  /* --------------------------------------------------------------------------------------- */
  get formulaInfo(): any {
    return this.getCopy(this._formulaInfo);
  }
  get calcuationValidObject(): any {
    return this._calcuationValidObject;
  }

  setCalcuationValidObject(_status, _message, obj) {
    // this._calcuationValidObject["status"] = _status;
    // this._calcuationValidObject["message"] = _message;
    obj['calcuationValidObject']['status'] = _status;
    obj['calcuationValidObject']['message'] = _message;
  }
  setPreviewValue(_resp, obj) {
    try {
      if (_resp.status && (Number(_resp.value) || _resp.value === 0)) {
        this.calculatePreviewValue(_resp.value, obj);
        this.setCalcuationValidObject(true, 'Valid Equation', obj);
      } else if (_resp != 'NA') {
        this.calculatePreviewValue('NA', obj);
        this.setCalcuationValidObject(
          false,
          'Invalid Equation - Please check equation syntax.',
          obj
        );
      } else {
        this.calculatePreviewValue('NA', obj);
      }
    } catch (error) {
      // console.log(error);
    }
  }
  calculatePreviewValue(_value, obj) {
    try {
      // this._previewValue = this.formattedValue(_value);
      obj['_previewValue'] = _value;
    } catch (error) {
      // console.log(error);
    }
  }
  formattedValue(_value) {
    try {
      let _interValue: Number;
      if (this._previewConfig.roundOff === 'up') {
        _interValue = Math.ceil(_value);
      } else if (this._previewConfig.roundOff === 'down') {
        _interValue = Math.floor(_value);
      } else {
        _interValue = _value.toFixed(this._previewConfig.decimalPoints);
      }
      return _interValue;
    } catch (error) {
      return _value;
    }
  }
  /**
   * Method for add new rule box
   */
  addRule() {
    this.setEditorProviders = false;
    this._calcFormulaList.push({
      code: '',
      parsedCode: '',
      _previewValue: 'NA',
      calcuationValidObject: {
        status: false,
        message: 'Enter your rule below'
      },
      customtagName: null,
      tagParameterId: null,
      tagFunction: null,
      tagFrequency: null,
      completeTagName: null,
      completeTagId: null,
      temp: {}
    });
  }
  /**
   * Method for delete a rule box
   */
  deleteRuleFromList(indexOfRule) {
    if (this._calcFormulaList.length > 1) {
      this._calcFormulaList.splice(indexOfRule, 1);
    }
  }
  /**
   * Method for save rule box after validation
   */
  ValidateFormulaArr() {
    this.setEditorProviders = false;
    this.ruleFormulaListToSend = [];
    this.validateAndExecuteScript();
    this.isErrorInRuleArr = this.errorInRuleNumber();
    if (this.isErrorInRuleArr == false) {
      const checkDuplicate = true;
      if (checkDuplicate) {
        this.ErrorInRuleNumber = undefined;
        for (const item of this._calcFormulaList) {
          const Obj = {
            code: item['temp']['code'],
            parsedCode:
              item.hasOwnProperty('parsedCode') && item.parsedCode != ''
                ? JSON.parse(item.parsedCode)
                : '',
            _previewValue: item._previewValue,
            calcuationValidObject: {
              status: item.calcuationValidObject.status,
              message: item.calcuationValidObject.message
            },
            customtagName: item.customtagName,
            tagParameterId: item.tagParameterId,
            tagFunction: item.tagFunction,
            tagFrequency: item.tagFrequency,
            completeTagName: item.completeTagName,
            completeTagId: item.completeTagId,
            temp: {}
          };
          this.ruleFormulaListToSend.push(Obj);
        }
      }
    } else {
      // console.log("error in rule");
    }
  }
  /**
   * Method for check error in line number
   */
  errorInRuleNumber() {
    this.isErrorInRuleArr = false;
    for (let i = 0; i < this._calcFormulaList.length; i++) {
      if (this._calcFormulaList[i].calcuationValidObject.status == false) {
        this.isErrorInRuleArr = true;
        this.ErrorInRuleNumber = this._calcFormulaList.length - i;
        break;
      } else {
        this.isErrorInRuleArr = false;
        this.ErrorInRuleNumber = undefined;
      }
    }
    return this.isErrorInRuleArr;
  }
  getDevicesSuggestions() {
    this.deviceSuggestionArray = JSON.parse(
      JSON.stringify(this.deviceListOption)
    );
    this.calcSuggestions = [
      {
        label: 'if',
        kind: 14, // monaco.languages.CompletionItemKind.Snippet,
        detail: '',
        id: '',
        documentation: '',
        insertText: {
          value: ['if ( ${1} ) {', '\t$0', '}'].join('\n')
        }
      },
      {
        label: 'else if',
        kind: 14,
        detail: '',
        id: '',
        documentation: '',
        insertText: {
          value: ['else if ( ${1} ) {', '\t$0', '}'].join('\n')
        }
      },
      {
        label: 'else',
        kind: 14,
        id: '',
        detail: '',
        documentation: '',
        insertText: {
          value: ['else {', '\t$0', '}'].join('\n')
        }
      },
      {
        label: 'max',
        kind: 14,
        id: '',
        detail: 'max accepts two arguments. ex:max(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'max(${1},${2})'
        }
      },
      {
        label: 'deltaSum',
        kind: 14,
        id: '',
        detail:
          'deltasum accepts two arguments. ex:deltasum(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'deltaSum(${1},${2})'
        }
      },
      {
        label: 'movingAvg',
        kind: 14,
        id: '',
        detail:
          'moovingavg accepts two arguments. ex:moovingavg(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'movingAvg(${1},${2})'
        }
      },
      {
        label: 'min',
        kind: 14,
        id: '',
        detail: 'min accepts two arguments. ex:min(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'min(${1},${2})'
        }
      },
      {
        label: 'sum',
        kind: 14,
        id: '',
        detail: 'sum accepts two arguments. ex:sum(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'sum(${1},${2})'
        }
      },
      {
        label: 'count',
        kind: 14,
        id: '',
        detail:
          'count accepts four argument- minute/shift , tag name, operators, value/tag name. operators = "equalto", "notEqualto", "lessthan", "lessthanEqualto","greaterthan","greaterthanEqualto" ',
        documentation: 'ex: count(30, WP Total, +, 1)',
        insertText: {
          value: 'count(${1}, ${2}, ${3}, ${4})'
        }
      },
      {
        label: 'avg',
        kind: 14,
        id: '',
        detail: 'avg accepts two arguments. ex:avg(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'avg(${1},${2})'
        }
      },
      {
        label: 'averageFrequency',
        kind: 14,
        id: '',
        detail:
          'averageFrequency accepts two arguments. ex:averageFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'averageFrequency(${1},${2})'
        }
      },
      {
        label: 'maxFrequency',
        kind: 14,
        id: '',
        detail:
          'maxFrequency accepts two arguments. ex:maxFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'maxFrequency(${1},${2})'
        }
      },
      {
        label: 'minFrequency',
        kind: 14,
        id: '',
        detail:
          'minFrequency accepts two arguments. ex:minFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'minFrequency(${1},${2})'
        }
      },
      {
        label: 'sumFrequency',
        kind: 14,
        id: '',
        detail:
          'sumFrequency accepts two arguments. ex:sumFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'sumFrequency(${1},${2})'
        }
      },
      {
        label: 'power',
        kind: 14,
        id: '',
        detail: 'power accepts two arguments. ex:power(value/tag, tag/value).',
        documentation: '',
        insertText: {
          value: 'power(${1},${2})'
        }
      },
      {
        label: 'sqrt',
        kind: 14,
        id: '',
        detail: 'sqrt accepts one arguments. ex:sqrt(value/tag_name).',
        documentation: '',
        insertText: {
          value: 'sqrt(${1})'
        }
      },
      {
        label: 'currentShift',
        kind: 14,
        id: '',
        detail: 'currentShift accepts no arguments. ex:currentShift().',
        documentation: '',
        insertText: {
          value: 'currentShift()'
        }
      },
      {
        label: 'runningShift',
        kind: 14,
        id: '',
        detail: 'runningShift accepts no arguments. ex:runningShift().',
        documentation: '',
        insertText: {
          value: 'runningShift()'
        }
      },
      {
        label: 'previousShift',
        kind: 14,
        id: '',
        detail: 'previousShift accepts no arguments. ex:previousShift().',
        documentation: '',
        insertText: {
          value: 'previousShift()'
        }
      },
      {
        label: 'currentTimeStamp',
        kind: 14,
        id: '',
        detail: 'currentTimeStamp accepts no arguments. ex:currentTimeStamp().',
        documentation: '',
        insertText: {
          value: 'currentTimeStamp()'
        }
      },
      {
        label: 'previousDataPoint',
        kind: 14,
        id: '',
        detail:
          'previousDataPoint accepts one arguments. ex:previousDataPoint(tag_name).',
        documentation: '',
        insertText: {
          value: 'previousDataPoint(${1})'
        }
      }
    ];
    this.deviceSuggestionArray.forEach((item) => {
      item['detail'] = '';
      item['documentation'] = '';
      item['id'] = item.id;
      item['label'] = item.itemName;
      const insertText = {
        value: '[' + item.itemName + ']'
      };
      item['insertText'] = insertText;
      item.kind = 8;
      delete item.itemName;
    });
    this.calcSuggestions = this.calcSuggestions.concat(
      this.deviceSuggestionArray
    );
  }
  /**
   * Method for send editor suggestion into monaco editor component(child)
   */
  setCalcSuggestions(data) {
    this.calcSuggestions = [
      {
        label: 'if',
        kind: 14, // monaco.languages.CompletionItemKind.Snippet,
        detail: '',
        id: '',
        documentation: '',
        insertText: {
          value: ['if ( ${1} ) {', '\t$0', '}'].join('\n')
        }
      },
      {
        label: 'else if',
        kind: 14,
        detail: '',
        id: '',
        documentation: '',
        insertText: {
          value: ['else if ( ${1} ) {', '\t$0', '}'].join('\n')
        }
      },
      {
        label: 'else',
        kind: 14,
        id: '',
        detail: '',
        documentation: '',
        insertText: {
          value: ['else {', '\t$0', '}'].join('\n')
        }
      },
      {
        label: 'max',
        kind: 14,
        id: '',
        detail: 'max accepts two arguments. ex:max(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'max(${1},${2})'
        }
      },
      {
        label: 'deltaSum',
        kind: 14,
        id: '',
        detail:
          'deltasum accepts two arguments. ex:deltasum(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'deltaSum(${1},${2})'
        }
      },
      {
        label: 'movingAvg',
        kind: 14,
        id: '',
        detail:
          'moovingavg accepts two arguments. ex:moovingavg(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'movingAvg(${1},${2})'
        }
      },
      {
        label: 'min',
        kind: 14,
        id: '',
        detail: 'min accepts two arguments. ex:min(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'min(${1},${2})'
        }
      },
      {
        label: 'sum',
        kind: 14,
        id: '',
        detail: 'sum accepts two arguments. ex:sum(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'sum(${1},${2})'
        }
      },
      {
        label: 'count',
        kind: 14,
        id: '',
        detail:
          'count accepts four argument- minute/shift , tag name, operators, value/tag name. operators = "equalto", "notEqualto", "lessthan", "lessthanEqualto","greaterthan","greaterthanEqualto" ',
        documentation: 'ex: count(30, WP Total, +, 1)',
        insertText: {
          value: 'count(${1}, ${2}, ${3}, ${4})'
        }
      },
      {
        label: 'avg',
        kind: 14,
        id: '',
        detail: 'avg accepts two arguments. ex:avg(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'avg(${1},${2})'
        }
      },
      {
        label: 'averageFrequency',
        kind: 14,
        id: '',
        detail:
          'averageFrequency accepts two arguments. ex:averageFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'averageFrequency(${1},${2})'
        }
      },
      {
        label: 'maxFrequency',
        kind: 14,
        id: '',
        detail:
          'maxFrequency accepts two arguments. ex:maxFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'maxFrequency(${1},${2})'
        }
      },
      {
        label: 'minFrequency',
        kind: 14,
        id: '',
        detail:
          'minFrequency accepts two arguments. ex:minFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'minFrequency(${1},${2})'
        }
      },
      {
        label: 'sumFrequency',
        kind: 14,
        id: '',
        detail:
          'sumFrequency accepts two arguments. ex:sumFrequency(minute/shift, tag name).',
        documentation: '',
        insertText: {
          value: 'sumFrequency(${1},${2})'
        }
      },
      {
        label: 'power',
        kind: 14,
        id: '',
        detail: 'power accepts two arguments. ex:power(value/tag, tag/value).',
        documentation: '',
        insertText: {
          value: 'power(${1},${2})'
        }
      },
      {
        label: 'sqrt',
        kind: 14,
        id: '',
        detail: 'sqrt accepts one arguments. ex:sqrt(value/tag_name).',
        documentation: '',
        insertText: {
          value: 'sqrt(${1})'
        }
      },
      {
        label: 'currentShift',
        kind: 14,
        id: '',
        detail: 'currentShift accepts no arguments. ex:currentShift().',
        documentation: '',
        insertText: {
          value: 'currentShift()'
        }
      },
      {
        label: 'runningShift',
        kind: 14,
        id: '',
        detail: 'runningShift accepts no arguments. ex:runningShift().',
        documentation: '',
        insertText: {
          value: 'runningShift()'
        }
      },
      {
        label: 'previousShift',
        kind: 14,
        id: '',
        detail: 'previousShift accepts no arguments. ex:previousShift().',
        documentation: '',
        insertText: {
          value: 'previousShift()'
        }
      },
      {
        label: 'currentTimeStamp',
        kind: 14,
        id: '',
        detail: 'currentTimeStamp accepts no arguments. ex:currentTimeStamp().',
        documentation: '',
        insertText: {
          value: 'currentTimeStamp()'
        }
      },
      {
        label: 'previousDataPoint',
        kind: 14,
        id: '',
        detail:
          'previousDataPoint accepts one arguments. ex:previousDataPoint(tag_name).',
        documentation: '',
        insertText: {
          value: 'previousDataPoint(${1})'
        }
      }
    ];
    /* --------------------------------------------------------------------------- */
    const input = {
      device_id: [data]
    };
    this.appService.getAllBusinessMonacoSuggetion(input).subscribe(
      (res) => {
        if (res.status == 'success') {
          this.tagsArray = res.data;
          this.tagsArray.forEach((item) => {
            (item['id'] = item.tag_id), (item['label'] = item.tag_name);
            item.insertText.value = '[' + item.insertText['value'] + ']';
            item.kind = 8;
            // delete item.device_name;
            // delete item.device_id;
            // delete item.tag_name;
            // delete item.tag_id;
          });
          //   this.tagsArray.forEach(item => {
          //     item.insertText.value = "["+ item.insertText.value + "]";
          //     item.kind = 8;
          // });
          this.calcSuggestions = this.calcSuggestions.concat(this.tagsArray);
          this.appService.getBusinessLookupSuggession().subscribe(
            (look_up) => {
              for (let ind = 0; ind < look_up.data.length; ind++) {
                look_up.data[ind]['insertText']['value'] =
                  '[' + look_up.data[ind]['insertText']['value'] + ']';
              }
              this.calcSuggestions = this.calcSuggestions.concat(look_up.data);
              const isColorSet = this.setColorToParameter();
              if (isColorSet) {
                this.isSuggetionReady = true;
              }
            },
            (error) => {
              // console.log('Error while fetching lookup suggetion');
            }
          );
        } else {
          // console.log("Error while fetching tag suggetion", res);
        }
      },
      (error) => {
        // console.log("Error while fetching tag suggetion ");
      }
    );
  }

  /**
   * Method for assinging different custom colors to each attributes
   */
  setColorToParameter() {
    Config.setColorCodes();

    let colorIndex = 1;
    this._calcParameterSuggColor.tokenizer = [
      {
        regex: /([if]|[else]{4})/,
        action: {
          token: 'custom-keywords'
        }
      },
      {
        regex: /([sum]{3}|[count]{4}|[min]{3}|[max]{3}|[avg]{3}|[log]{3}|[ln]{2})/,
        action: {
          token: 'custom-keywords'
        }
      },
      {
        regex: /[0-9\-]/,
        action: {
          token: 'custom-keywords'
        }
      },
      {
        regex: /[\{|\}]/,
        action: {
          token: 'custom-keywords'
        }
      },
      {
        regex: /[|\>|\<|\-|\&|\+|\*]/,
        action: {
          token: 'custom-keywords'
        }
      }
    ];
    const colorList = Config.COLOR_LIST;
    //console.log(colorList);
    for (const sugg of this.calcSuggestions) {
      if (sugg.id && sugg.id !== '') {
        const label = sugg.label;
        this._calcParameterSuggColor.tokenizer.push({
          regex: new RegExp(label),
          action: {
            token: String(colorList[colorIndex])
          }
        });
        colorIndex += 1;
      }
    }
    // console.log("sugg", JSON.stringify(this.calcSuggestions));
    // console.log("color check", this._calcParameterSuggColor);
    return true;
  }
  /**
   * Method for coverting all suggestion values to there corresponding id's from suggetion list
   * @param formula calculation code
   */
  getConvertedFormula(formula) {
    formula = formula || '';
    try {
      const skipList = [
        'if',
        'else',
        'else if',
        'count',
        'max',
        'min',
        'sum',
        'avg',
        'averageFrequency',
        'maxFrequency',
        'minFrequency',
        'sumFrequency',
        'power',
        'deltaSum',
        'movingAvg',
        'sqrt',
        'currentShift',
        'runningShift',
        'previousShift',
        'currentTimeStamp',
        'previousDataPoint'
      ];
      this.deviceSuggestionArray.forEach((sugg) => {
        if (skipList.indexOf(sugg.label) < 0) {
          formula = formula.split(sugg.insertText.value).join(sugg.id);
        }
      });
      this.calcSuggestions.forEach((sugg) => {
        if (skipList.indexOf(sugg.label) < 0) {
          formula = formula.split(sugg.insertText.value).join(sugg.id);
        }
      });
      formula = formula.split('×').join('*'); // for replacing multiply symbol
      return formula;
    } catch (error) {
      //console.log(error);
      return formula;
    }
  }
  /**
   * Method for validating and executing script which is defined in the calculation builder
   */
  validateAndExecuteScript() {
    this.CustomTagArrayList = [];
    this._calcFormulaList.forEach((item) => {
      const convertedCode = this.getConvertedFormula(
        this.getCopy(item['temp']['code'] || item.code)
      );

      try {
        const checkIfvalid = this.isSyntaxValid(convertedCode, item);
        //console.log("check if valid object", checkIfvalid);

        if (checkIfvalid) {
          if (!item.tagParameterId || !item.tagFunction) {
            this.setCalcuationValidObject(
              false,
              'Please fill all details correctly.',
              item
            );
          } else {
            this.parameter_Options.forEach((element) => {
              if (item.tagParameterId == element.value) {
                item.completeTagName = element.label;
              }
            });
            item.completeTagId = item.tagParameterId;
            if (item.tagFunction === 'None') {
              item.completeTagName = item.completeTagName;
              item.completeTagId = item.completeTagId;
            } else if (item.tagFunction !== 'None') {
              item.completeTagName =
                item.completeTagName +
                ' ' +
                item.tagFunction +
                ' ' +
                item.tagFrequency;
              item.completeTagId =
                item.completeTagId +
                '_' +
                item.tagFunction +
                '_' +
                item.tagFrequency;
            }
          }
        }
      } catch (error) {
        // console.log("error", error);
        this.setCalcuationValidObject(
          false,
          error.description || 'Not Valid',
          item
        );
        this.setPreviewValue('NA', item);
        //console.log("_calcFormulaList", this._calcFormulaList);
        //console.log("_calcuationValidObject", this._calcuationValidObject);
      }
    });
  }
  /**
   * Methos for check if code is valid
   */
  isSyntaxValid(code, item) {
    try {
      let valid: Boolean = true;
      if (valid) {
        try {
          const parsedVal = esprima.parseScript(code);
          valid = this.checkScriptValidOrNot(parsedVal, item);
          if (valid) {
            item.parsedCode = JSON.stringify(parsedVal);
          }
          // console.log("_calcFormulaList", this._calcFormulaList);
        } catch (error) {
          // console.log(error);
          this.setCalcuationValidObject(
            false,
            error.description || 'Not Valid',
            item
          );
          valid = false;
        }
      }
      return valid;
    } catch (error) {
      // console.log(error);
      return false;
    }
  }
  /**
   * Method for checking the script is valid or not
   * @param parsedJson parsed json value of script
   * return boolean value
   */
  checkScriptValidOrNot(parsedJson, item) {
    try {
      let isValid: Boolean = true;
      if (!parsedJson || !parsedJson.body) {
        isValid = false;
        this.setCalcuationValidObject(false, 'Invalid script', item);
        return isValid;
      }
      if (parsedJson.body.length > 1) {
        isValid = false;
        this.setCalcuationValidObject(false, 'Invalid script', item);
        return;
      } else if (parsedJson.body.length == 0) {
        isValid = false;
        this.setCalcuationValidObject(false, 'Warning, incomplete rule.', item);
        return;
      } else if (parsedJson.body[0].type === 'IfStatement') {
        isValid = this.checkExpressionsValidOrNot(
          this.getCopy(parsedJson.body[0].test),
          item
        );
        if (isValid) {
          isValid = this.checkScriptValidOrNot(
            this.getCopy(parsedJson.body[0].consequent),
            item
          );
          if (isValid && parsedJson.body[0] && parsedJson.body[0].alternate) {
            const elseJson = parsedJson.body[0].alternate.hasOwnProperty('body')
              ? parsedJson.body[0].alternate
              : { body: [parsedJson.body[0].alternate] };
            isValid = this.checkScriptValidOrNot(this.getCopy(elseJson), item);
          }
        }
      } else if (parsedJson.body[0].type === 'BlockStatement') {
        isValid = this.checkExpressionsValidOrNot(
          this.getCopy(parsedJson.body[0].expression),
          item
        );
      } else if (parsedJson.body[0].type === 'ExpressionStatement') {
        isValid = this.checkExpressionsValidOrNot(
          parsedJson.body[0].expression,
          item
        );
      }
      return isValid;
    } catch (error) {
      // console.log(error);
      return false;
    }
  }
  /**
   * Method for check expression
   * @param expression contain- arguments, callee, type
   * @param item current item in editor array
   * returns boolean value
   */
  checkExpressionsValidOrNot(expression, item) {
    let isValid: Boolean = true;
    const customMethodList = [
      'max',
      'min',
      'sum',
      'count',
      'avg',
      'averageFrequency',
      'maxFrequency',
      'minFrequency',
      'sumFrequency',
      'power',
      'deltaSum',
      'movingAvg',
      'sqrt',
      'currentShift',
      'runningShift',
      'previousShift',
      'currentTimeStamp',
      'previousDataPoint'
    ];
    if (expression.type == 'CallExpression') {
      if (customMethodList.indexOf(expression.callee.name) < 0) {
        isValid = false;
        this.setCalcuationValidObject(
          false,
          'Invalid method' + expression.callee.name,
          item
        );
      } else {
        if (expression.callee.name != 'count') {
          if (
            customMethodList.indexOf(expression.callee.name) > -1 &&
            expression.arguments.length != 0 &&
            expression.arguments.length != 1 &&
            expression.arguments.length != 2
          ) {
            isValid = false;
            const arg = expression.callee.name == 'sqrt' ? 1 : 2;
            this.setCalcuationValidObject(
              false,
              "'" +
                expression.callee.name +
                "' support exactly " +
                arg +
                ' arguments',
              item
            );
          } else if (
            expression.arguments.length == 2 &&
            expression.callee.name != 'sqrt' &&
            expression.callee.name != 'previousDataPoint'
          ) {
            const isArgumentValid = this.checkArgumentsValidOrnot(
              expression.arguments,
              expression.callee.name
            );
            if (isArgumentValid) {
              isValid = true;
              this.setCalcuationValidObject(true, 'Correct , Valid rule', item);
            } else {
              isValid = false;
              this.setCalcuationValidObject(
                false,
                expression.callee.name != 'power'
                  ? "'" +
                      expression.callee.name +
                      "' First argumnt shoud be 'minute/shift' and second argument should be 'Tag name' "
                  : "'" +
                      expression.callee.name +
                      "' First argumnt shoud be 'value/tag' and second argument should be 'tag/value' ",
                item
              );
            }
          } else if (
            expression.arguments.length == 1 &&
            (expression.callee.name == 'sqrt' ||
              expression.callee.name == 'previousDataPoint')
          ) {
            const isArgumentValid = this.checkArgumentsValidOrnot(
              expression.arguments,
              expression.callee.name
            );
            if (isArgumentValid) {
              isValid = true;
              this.setCalcuationValidObject(true, 'Correct , Valid rule', item);
            } else {
              isValid = false;
              this.setCalcuationValidObject(
                false,
                expression.callee.name == 'sqrt'
                  ? "'" +
                      expression.callee.name +
                      "' First argumnt shoud be 'value / Tag name' "
                  : "'" +
                      expression.callee.name +
                      "' First argumnt shoud be 'Tag name' ",
                item
              );
            }
          } else if (
            expression.arguments.length == 0 &&
            (expression.callee.name == 'currentShift' ||
              expression.callee.name == 'runningShift' ||
              expression.callee.name == 'previousShift' ||
              expression.callee.name == 'currentTimeStamp')
          ) {
            isValid = true;
            this.setCalcuationValidObject(true, 'Correct , Valid rule', item);
          }
        } else if (expression.callee.name == 'count') {
          if (
            customMethodList.indexOf(expression.callee.name) > -1 &&
            expression.arguments.length != 4
          ) {
            isValid = false;
            this.setCalcuationValidObject(
              false,
              "'" +
                expression.callee.name +
                "' support exactly 4 arguments. ex: (minute/shift, tag name, operators, value/tag name)",
              item
            );
          } else if (expression.arguments.length == 4) {
            const isArgumentValid = this.checkArgumentsValidOrnot(
              expression.arguments,
              expression.callee.name
            );
            if (isArgumentValid) {
              isValid = true;
              this.setCalcuationValidObject(true, 'Correct , Valid rule', item);
            } else {
              isValid = false;
              this.setCalcuationValidObject(
                false,
                "'" +
                  expression.callee.name +
                  "' First argument shoud be 'minute/shift', second argument should be 'Tag name', third argument shoud be operators and fourth argument shoud be value/tag name",
                item
              );
            }
          }
        }
      }
    } else if (
      expression.type == 'BinaryExpression' ||
      expression.type == 'LogicalExpression'
    ) {
      if (!this.arithmeticOperatorList[expression.operator]) {
        isValid = false;
        this.setCalcuationValidObject(
          false,
          'Invalid operator ' + expression.operator, //if user enters invalid tag name
          item
        );
      } else {
        isValid = this.checkExpressionsValidOrNot(expression.left, item);
        if (isValid) {
          isValid = this.checkExpressionsValidOrNot(expression.right, item);
          if (isValid) {
            this.setCalcuationValidObject(true, 'Valid Rule', item);
          }
        }
      }
    } else if (expression.type == 'Identifier') {
      const temp = this.checkIfCorrectTag(expression);
      if (!temp) {
        this.setCalcuationValidObject(
          false,
          'Invalid attribute ' + expression.name,
          item
        );
        //this.setPreviewValue("NA" , item);
        isValid = false;
      }
    } else if (expression.type == 'UnaryExpression') {
      if (expression.operator == '-' || expression.operator == '+') {
        isValid = this.checkExpressionsValidOrNot(expression.argument, item);
      } else {
        isValid = false;
        this.setCalcuationValidObject(
          false,
          'Invalid operator ' + expression.operator,
          item
        );
      }
    }
    return isValid;
  }
  /**
   * Method for check if arguments are valid or not(literal/identifier, identifier)
   * @param argArray is method argument array
   * returns boolean value
   */
  checkArgumentsValidOrnot(argArray, methodName) {
    let isValid: Boolean = true;
    if (argArray.length == 1) {
      isValid =
        methodName == 'sqrt'
          ? argArray[0].type == 'Literal' || argArray[0].type == 'Identifier'
            ? argArray[0].type == 'Identifier'
              ? this.checkIfCorrectTag(argArray[0])
              : true
            : false
          : argArray[0].type == 'Identifier'
          ? this.checkIfCorrectTag(argArray[0])
          : false;
    }
    if (argArray.length == 2) {
      if (methodName != 'power') {
        if (argArray[0].type == 'Literal' || argArray[0].type == 'Identifier') {
          if (argArray[0].type == 'Identifier') {
            isValid = this.checkIfCorrectTag(argArray[0]);

            if (argArray[1].type == 'Identifier' && isValid == true) {
              isValid = this.checkIfCorrectTag(argArray[1]);
            } else {
              isValid = false;
            }
          } else {
            if (argArray[1].type == 'Identifier') {
              isValid = this.checkIfCorrectTag(argArray[1]);
            } else {
              isValid = false;
            }
          }
          return isValid;
        } else {
          isValid = false;
        }
      } else {
        isValid =
          argArray[0].type == 'Literal' || argArray[0].type == 'Identifier'
            ? argArray[0].type == 'Identifier'
              ? this.checkIfCorrectTag(argArray[0])
              : true
            : false;
        isValid =
          isValid == true &&
          (argArray[1].type == 'Identifier' || argArray[1].type == 'Literal')
            ? argArray[1].type == 'Identifier'
              ? this.checkIfCorrectTag(argArray[1])
              : true
            : false;
      }
    } else if (argArray.length == 3) {
      if (argArray[0].type == 'Literal' || argArray[0].type == 'Identifier') {
        if (argArray[0].type == 'Identifier') {
          isValid = this.checkIfCorrectTag(argArray[0]);

          if (argArray[1].type == 'Identifier' && isValid == true) {
            isValid = this.checkIfCorrectTag(argArray[1]);
            if (argArray[2].type == 'Literal' && isValid == true) {
              if (
                argArray[2].value === 0 ||
                argArray[2].value === 1 ||
                argArray[2].value === null
              ) {
                isValid = true;
              } else {
                isValid = false;
              }
            } else {
              isValid = false;
            }
          } else {
            isValid = false;
          }
        } else {
          if (argArray[1].type == 'Identifier') {
            isValid = this.checkIfCorrectTag(argArray[1]);
            if (argArray[2].type == 'Literal' && isValid == true) {
              if (
                argArray[2].value === 0 ||
                argArray[2].value === 1 ||
                argArray[2].value == null
              ) {
                isValid = true;
              } else {
                isValid = false;
              }
            } else {
              isValid = false;
            }
          } else {
            isValid = false;
          }
        }
        return isValid;
      } else {
        isValid = false;
      }
    } else if (argArray.length == 4) {
      if (methodName == 'count') {
        const customOperators = [
          'equalto',
          'notEqualto',
          'lessthan',
          'lessthanEqualto',
          'greaterthan',
          'greaterthanEqualto'
        ];
        isValid =
          argArray[0].type == 'Literal' || argArray[0].type == 'Identifier'
            ? argArray[0].type == 'Identifier'
              ? this.checkIfCorrectTag(argArray[0])
              : true
            : false;
        isValid =
          isValid == true && argArray[1].type == 'Identifier'
            ? this.checkIfCorrectTag(argArray[1])
            : false;
        isValid =
          isValid == true &&
          argArray[2].type == 'Literal' &&
          typeof this.getCopy(argArray[2].raw) == 'string'
            ? customOperators.indexOf(argArray[2].value) != -1
              ? true
              : false
            : false;
        isValid =
          isValid == true &&
          (argArray[3].type == 'Identifier' || argArray[3].type == 'Literal')
            ? argArray[3].type == 'Identifier'
              ? this.checkIfCorrectTag(argArray[3])
              : true
            : false;
      }
    }

    return isValid;
  }

  /**
   * Method for check if tag is correct or not
   * @param parsedVal  tag id
   * return boolean value
   */
  checkIfCorrectTag(tagId) {
    let isValid: Boolean = false;
    for (let i = 0; i < this.calcSuggestions.length; i++) {
      if (tagId.name == this.calcSuggestions[i].id) {
        isValid = true;
        break;
      }
    }
    return isValid;
  }

  /**
   * Method for executing the parsed json passed
   * @param parsedVal parsed JSON
   */
  executeScript(parsedVal, obj) {
    let val: any = 'NA';
    try {
      if (!parsedVal || (parsedVal && parsedVal.body.length === 0)) {
        val = '';
        return val;
      }
      if (parsedVal.body.length > 1) {
        this.setCalcuationValidObject(
          false,
          'Invalid script, Only one formula supported',
          obj
        );
        this.setPreviewValue('NA', obj);
        return val;
      }
      for (const script of parsedVal.body) {
        if (script.type === 'IfStatement') {
          const formula = this.evaluateConditions(script.test, obj);

          const result = this.createFormulaNew(formula, obj);
          if (result && result !== 'NA') {
            if (script.consequent) {
              val = this.executeScript(script.consequent, obj);
            } else {
              val = '';
            }
            break;
          } else {
            if (script && script.alternate) {
              const elseJson = script.alternate.hasOwnProperty('body')
                ? script.alternate
                : { body: [script.alternate] };
              val = this.executeScript(elseJson, obj);
            } else {
              val = '';
            }
            break;
          }
        } else if (script.type === 'BlockStatement') {
          val = this.executeScript(script.consequent, obj);
          break;
        } else if (script.type === 'ExpressionStatement') {
          const customMethod = [
            'sum',
            'max',
            'min',
            'avg',
            'averageFrequency',
            'maxFrequency',
            'minFrequency',
            'sumFrequency',
            'power',
            'deltaSum',
            'movingAvg',
            'sqrt',
            'currentShift',
            'runningShift',
            'previousShift',
            'currentTimeStamp',
            'previousDataPoint'
          ];
          if (
            script.expression.type === 'Identifier' &&
            customMethod.indexOf(script.expression.name) == -1
          ) {
            val = 'Invalid Method';
            break;
          } else {
            const formula = this.evaluateConditions(script.expression, obj);
            val = this.createFormulaNew(formula, obj);
            break;
          }
        }
      }
      return val;
    } catch (error) {
      // console.log(error);
      return val;
    }
  }
  /**
   * Method for evaluating binary operations and expressions
   * @param expressionJson parsed json
   */
  evaluateConditions(expressionJson, obj) {
    let expression = [];
    try {
      if (expressionJson && expressionJson.type === 'BinaryExpression') {
        const leftSideTemp = JSON.parse(JSON.stringify(expressionJson.left));
        expression = expression.concat(this.getExpJson(leftSideTemp, obj));
        expression.push({
          symbol: expressionJson.operator,
          title: expressionJson.operator,
          value: expressionJson.operator,
          type: 'operation'
        });
        const rightSideTemp = JSON.parse(JSON.stringify(expressionJson.right));
        expression = expression.concat(this.getExpJson(rightSideTemp, obj));
      } else if (
        expressionJson &&
        (expressionJson.type === 'CallExpression' ||
          expressionJson.type === 'MemberExpression' ||
          expressionJson.type === 'Literal' ||
          expressionJson.type === 'Identifier')
      ) {
        const abc = this.getExpJson(expressionJson, obj);
        expression = expression.concat(this.getExpJson(expressionJson, obj));
      }
      return expression;
    } catch (error) {
      // console.log(error);
      return expression;
    }
  }

  /**
   * Method for converting the parsed values into list of expressions
   * @param exp parsed value to create expressions
   */
  getExpJson(exp, obj) {
    let expression = [];
    try {
      if (exp.type === 'MemberExpression') {
        const temp = this.getFullParameterId(exp);
        const val = this.getParameterInJson(temp);
        if (val) {
          expression.push(val);
        }
      } else if (exp.type === 'BinaryExpression') {
        expression.push({
          symbol: '(',
          title: 'Right parenthesis',
          value: '(',
          type: 'operation'
        });
        expression = expression.concat(this.evaluateConditions(exp, obj));
        expression.push({
          symbol: ')',
          title: 'Left parenthesis',
          value: ')',
          type: 'operation'
        });
      } else if (exp.type === 'Literal') {
        expression.push({
          value: exp.value,
          type: 'constant',
          symbol: 'C',
          title: 'Constants'
        });
      } else if (exp.type === 'Identifier') {
        // for (const oper of this.operatorList) {
        //   if(exp.name === oper.symbol){
        //     expression.push({
        //       symbol: oper.symbol,
        //       title: oper.title,
        //       value: oper.value,
        //       type: 'operation'
        //     });
        //   }
        // }
        expression.push({
          value: 'NA',
          type: 'constant',
          symbol: 'C',
          title: 'Constants'
        });
      } else if (exp.type == 'CallExpression') {
        // for executing the custom methods
        const customMethod = [
          'sum',
          'max',
          'min',
          'avg',
          'averageFrequency',
          'maxFrequency',
          'minFrequency',
          'sumFrequency',
          'power',
          'deltaSum',
          'movingAvg',
          'sqrt',
          'currentShift',
          'runningShift',
          'previousShift',
          'currentTimeStamp',
          'previousDataPoint'
        ];
        if (
          exp.callee.type === 'Identifier' &&
          customMethod.indexOf(exp.callee.name) > -1
        ) {
          expression.push(
            this.getCustomMethodResult(exp.arguments, exp.callee.name, obj)
          );
        }
      }
      return expression;
    } catch (error) {
      // console.log(error);
      return expression;
    }
  }

  sendResultToEditorComponent() {
    this.calcResults = {
      calcuationValidObject: this.calcuationValidObject,
      previewValue: this._previewValue
    };
  }

  // configurations/business-rule
  /**
   * Method for creating a deep copy of a json
   * @param obj json to create copy
   */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
  }
  /**
   * Method for capturing all changes in calculation builder editor
   * @param event data
   */
  updateFormulaInfo(event, calcItem) {
    // this.sendResultToEditorComponent();
    try {
      const input = 'device_instance_278';
      // console.log(JSON.stringify(event));
      if (event.code.includes('.') && this.tagsArray.length == 0) {
        // let str = event.code;
        // str = str.slice(0, str.length - 1);
        // this.deviceListOption.forEach(item => {
        //   if(str == item.insertText.value) {
        //     input = item.id;
        //   }
        // })
        this.setCalcSuggestions(input);
      }
      if (!event.code.includes('.')) {
        this.calcSuggestions = [];
        this.calcSuggestions = this.calcSuggestions.concat(
          this.deviceSuggestionArray
        );
      }
      if (calcItem.code !== event.code) {
        this.setCalcuationValidObject(
          false,
          'Change detected in formula. Click validate button to validate and execute',
          calcItem
        );
        this.setPreviewValue('NA', calcItem);
        //console.log(this._calcuationValidObject);
      }
      // this._codeDetails = {
      //   code: event.code,
      //   convertedCode: undefined,
      //   parsedVal: undefined
      // };
      calcItem['temp'] = {
        code: event.code,
        convertedCode: undefined,
        parsedVal: undefined
      };
      //console.log(this._codeDetails);
    } catch (error) {
      // console.log(error);
    }
  }

  /**
   * Method for creating formua from @_formulaObjectList,
   * mapping the values to equation, validating the equation , performing the calculation and returns the result.
   * It is a new method cloned from the existing method and the formula list is passed into the this for calculation
   */
  createFormulaNew(formulaList, obj) {
    try {
      const _expressionStack = [];
      let _attibCheckFlag = false;
      let _numericCheckFlag = true;
      const _oprndTyeList = [
        'parameter',
        'equipParam',
        'equipments',
        'solution',
        'material'
      ];
      let result = '';
      if (formulaList && formulaList.length > 0) {
        formulaList.forEach((_element) => {
          if (_oprndTyeList.lastIndexOf(_element.type) > -1) {
            if (
              Number(_element.oprtnValue) ||
              Number(_element.oprtnValue) === 0
            ) {
              _expressionStack.push(`(${Number(_element.oprtnValue)})`);
            } else {
              _expressionStack.push(0);
              _attibCheckFlag = true;
            }
            if (_element.oprtnValue === null) {
              _expressionStack.push('NA');
            }
          }
          if (_element.type === 'operation')
            _expressionStack.push(_element.value);
          if (_element.type === 'constant') {
            Number(_element.value) || Number(_element.value) === 0
              ? _expressionStack.push(`(${Number(_element.value)})`)
              : (_numericCheckFlag = false);
          }
        });
        const Valid = this.calculateExpression(_expressionStack.join(' '));
        if (_numericCheckFlag && !_attibCheckFlag) {
          this.setPreviewValue(
            this.calculateExpression(_expressionStack.join(' ')),
            obj
          );
          result = Valid.status ? Valid.value : 'NA';
        } else if (
          _numericCheckFlag &&
          _attibCheckFlag &&
          Valid.status &&
          (Number(Valid.value) || Valid.value === 0)
        ) {
          this.setCalcuationValidObject(true, 'Valid Equation', obj);
          this.setPreviewValue('NA', obj);
          result = 'NA';
        } else {
          this.setCalcuationValidObject(
            false,
            'Invalid Equation - Please check whether added parameters/constants are numeric or not.',
            obj
          );
          this.setPreviewValue('NA', obj);
          result = 'NA';
        }
      } else {
        this.setCalcuationValidObject(true, 'Valid Equation', obj);
        this.setPreviewValue('NA', obj);
        result = 'NA';
      }
      return result;
    } catch (error) {
      // console.log(error);
      return 'NA';
    }
  }
  /**
   * Method for executing the expression
   * @param _expression expression(ex. 10+10)
   */
  calculateExpression(_expression) {
    try {
      return {
        status: true,
        value: Function('"use strict";return (' + _expression + ')')()
      };
    } catch (error) {
      return {
        status: false
      };
    }
  }

  /**
   * Get the execution result of custom methods like SUM,MAX,MIN,AVG etc.
   * @param arg arguments passed inside the custm method
   * @param type custom method name
   */
  getCustomMethodResult(arg, type, obj) {
    try {
      let exp = [];
      const val: any = {
        value: 0,
        type: 'constant',
        symbol: 'C',
        title: 'Constants'
      };
      if (
        type == 'avg' ||
        type == 'averageFrequency' ||
        type == 'maxFrequency' ||
        type == 'minFrequency' ||
        type == 'sumFrequency' ||
        type == 'power' ||
        type == 'currentShift' ||
        type == 'runningShift' ||
        type == 'previousShift' ||
        type == 'currentTimeStamp' ||
        type == 'previousDataPoint'
      ) {
        exp.push({
          symbol: '(',
          title: 'Right parenthesis',
          value: '(',
          type: 'operation'
        });
      }
      for (const ele of arg) {
        exp = exp.concat(this.getExpJson(ele, obj));
        if (
          type == 'sum' ||
          type == 'avg' ||
          type == 'averageFrequency' ||
          type == 'maxFrequency' ||
          type == 'minFrequency' ||
          type == 'sumFrequency' ||
          type == 'currentShift' ||
          type == 'runningShift' ||
          type == 'previousShift' ||
          type == 'currentTimeStamp' ||
          type == 'previousDataPoint'
        ) {
          exp.push({
            symbol: '+',
            title: 'Create ition',
            value: '+',
            type: 'operation'
          });
        }
      }
      if (
        type == 'sum' ||
        type == 'avg' ||
        type == 'averageFrequency' ||
        type == 'maxFrequency' ||
        type == 'minFrequency' ||
        type == 'sumFrequency' ||
        type == 'power' ||
        type == 'currentShift' ||
        type == 'runningShift' ||
        type == 'previousShift' ||
        type == 'currentTimeStamp' ||
        type == 'previousDataPoint'
      ) {
        exp.pop();
      }
      if (
        type == 'avg' ||
        type == 'averageFrequency' ||
        type == 'maxFrequency' ||
        type == 'minFrequency' ||
        type == 'sumFrequency' ||
        type == 'power' ||
        type == 'currentShift' ||
        type == 'runningShift' ||
        type == 'previousShift' ||
        type == 'currentTimeStamp' ||
        type == 'previousDataPoint'
      ) {
        exp.push({
          symbol: ')',
          title: 'Left parenthesis',
          value: ')',
          type: 'operation'
        });
        exp.push({
          symbol: '/',
          title: 'Divide',
          value: '/',
          type: 'operation'
        });
        exp.push({
          value: arg.length,
          type: 'constant',
          symbol: 'C',
          title: 'Constants'
        });
      }
      if (
        exp.length > 1 &&
        (type == 'sum' ||
          type == 'avg' ||
          type == 'averageFrequency' ||
          type == 'maxFrequency' ||
          type == 'minFrequency' ||
          type == 'sumFrequency' ||
          type == 'power' ||
          type == 'currentShift' ||
          type == 'runningShift' ||
          type == 'previousShift' ||
          type == 'currentTimeStamp' ||
          type == 'previousDataPoint')
      ) {
        val.value = this.createFormulaNew(exp, obj); // execute sum/avg custommethods
      } else if (type == 'max') {
        val.value = this.getMaxOrMinValue(exp, 'max');
      } else if (type == 'min') {
        val.value = this.getMaxOrMinValue(exp, 'min');
      }
      return val;
    } catch (error) {
      // console.log(error);
      return 'NA';
    }
  }
  /**
   * Used to calculate the max/min value for max()/min() method
   * @param values values
   * @param type max/min
   */
  getMaxOrMinValue(values, type) {
    let res: any = 'NA';
    try {
      const arr: any = [];
      for (const val of values) {
        if (Number(val.value) || val.value === 0) {
          arr.push(Number(val.value));
        }
      }
      // console.log(arr);
      if (type == 'max') {
        res = Math.max.apply(null, arr); // Math.max(arr);
      } else if (type == 'min') {
        res = Math.min.apply(null, arr); // Math.min(arr);
      }
      return res;
    } catch (error) {
      // console.log(error);
      return res;
    }
  }
  /**
   * Method for returning the details of particular selected suggestions
   * @param param unique id of suggestion
   */
  getParameterInJson(param) {
    const data = this._calcSuggAll[param];
    if (data) {
      delete data.all;
      delete data.id;
      delete data.label;
      delete data.details;
    }
    return data;
  }

  /**
   * For creating and returning the parameter/equipment/material id for the parsed json
   * @param parsedVal parsed json value
   */
  getFullParameterId(parsedVal) {
    let temp = '';
    let condition = parsedVal.type === 'MemberExpression' ? true : false;
    while (condition) {
      if (parsedVal.type === 'MemberExpression') {
        if (temp === '') {
          temp += parsedVal.property.name;
        } else {
          temp = parsedVal.property.name + '.' + temp;
        }
        condition = true;
      } else if (parsedVal.type === 'Identifier') {
        if (temp === '') {
          temp += parsedVal.name;
        } else {
          temp = parsedVal.name + '.' + temp;
        }
        condition = false;
      } else {
        condition = false;
      }
      parsedVal = parsedVal.object;
      if (!parsedVal) {
        condition = false;
      }
    }
    return temp;
  }

  ngOnDestroy() {
    if (this.editorSuggestInstance) {
      this.editorSuggestInstance.dispose();
    }
  }

  allowAccess(acess: string) {
    return this.authService.allowAccess(acess);
  }
}
