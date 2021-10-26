import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { Config } from '../../../../config/config';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-alarm-configuration',
  templateUrl: './alarm-configuration.component.html',
  styleUrls: ['./alarm-configuration.component.scss']
})
export class AlarmConfigurationComponent implements OnInit {
  alarmConf: object;
  alarmId: string = '';
  headerContent: object;
  settings: Array<any> = [];
  tagsForRuleset: Array<any> = [];
  public step_number: any;
  toasterMessage:string;
  isPageLoading:boolean;
  holdAllLevels: any;
  /* -------Monaco editor variable-------- */
  public calcSuggestions = [];
  _calcParameterSuggColor = {
    tokenizer: []
  };
  public alarm_rule: any = {
    code: 'Asset: [Asset Name]\n[Tag Name]: [Tag Value]\n[Time Stamp]'
  };

  alarmCategoryList = [
    {
      label:'Live',
      value:'live'
    },
    {
      label:'Hourly',
      value:'hour'
    },
    {
      label:'Daily',
      value:'day'
    },
    {
      label:'Shift wise',
      value:'shift'
    },
    {
      label:'End of 15m',
      value:'15min'
    },
    {
      label:'End of 30m',
      value:'30min'
    },
    {
      label:'End of the hour',
      value:'eoh'
    },
    {
      label:'End of the day',
      value:'eod'
    },
    {
      label:'End of the shift',
      value:'eos'
    }
  ];
  alarmDurations = [
    {
      label:'Delta Sum',
      value:'deltasum'
    },
    {
      label:'Sum',
      value:'sum'
    }
  ]
  constructor(private appService: AppService, private route: ActivatedRoute, private router: Router, private _toastLoad: ToastrService, private authService: AuthGuard, private global: globals) {
    this.settings = [
      {
        stepnumber: 1, label: 'General Info', active: true,show:true
      },
      {
        stepnumber: 2, label: 'Rule Set', active: false,show:true
      },
      {
        stepnumber: 3, label: 'Action', active: false,show:true
      },
    ];
    this.step_number = 1;
  }

  ngOnInit() {
    this.isPageLoading = true;
    this.getAlarmId();
    this.getAlarmConf();
    this.setCalcSuggestions(); //get method suggetion for rule builder
  }

  getAlarmId() {
    this.route.params.subscribe(data => {
      this.alarmId = data['id'];
    });
  }

  getAlarmConf() {
    let objGet = {};
    objGet['id'] = this.alarmId.split("&").length == 2 ? this.alarmId.split("&")[1] : this.alarmId;
    if(this.global.deploymentMode == 'EL'){
      objGet['filter'] = [];
      objGet['filter'].push({'site_id' : this.global.getCurrentUserSiteId()});
    }
    this.appService.getAlarmConf(this.global.deploymentModeAPI.ALARM_CONFIGURATION_GET, objGet).subscribe(data => {
      this.isPageLoading = false;
      if (data.hasOwnProperty("data") && data.data.status == "success") {
        this.headerContent = data.data.headerContent;
        if (this.alarmId == "new") {
          this.alarmConf = {
            "alarmName": "",
            "alarmDescription": "",
            "alarmType": "Alarm",
            "alarmCategory":"live",
            "alarmDuration":"deltasum",
            "priority": null,
            "isTypeIsAlarm": true,
            "alarmTemplate": "Asset: [Asset Name]\n[Tag Name]: [Tag Value]\n[Time Stamp]",
            "alarm_sms_template_id":"1",
            "acknowledgement": false,
            "devices": [],
            "ruleSets": [
              {
                "rules": [
                  {
                    "leftHandSide": {
                      "tag": null
                    },
                    "condition": "",
                    "rightHandSide": {
                      "compareOption": "customValue",
                      "customValue": null,
                      "threshold": null,
                      "tag": null,
                    },
                    "resetValue": {
                      "isResetValueRequired": false,
                      "compareOption": "customValue",
                      "customValue": null,
                      "tag": null,
                      "threshold": null,
                      "tolerenceValue": null,
                      "pTolerenceValue": null
                    }
                  }
                ],
                "ruleAndOrOperationData": {
                  "isOr": false,
                  "isAnd": true
                }
              }
            ],
            "ruleSetAndOrOperationData": {
              "isOr": false,
              "isAnd": true
            },
            "levels": [
              {
                "suppress": "00:00",
                "notificationProfiles": [
                  {
                    "usersOrUserGroup": [],
                    "notificationProfile": [],
                    "notificationTone": "",
                    "isNotificationToneShow": false
                  }
                ],
                "commands": []
              }
            ]
          }
          this.holdAllLevels = JSON.parse(JSON.stringify(this.alarmConf['levels']));
        } else {
          this.alarmConf = data.data.bodyContent;
          this.holdAllLevels = JSON.parse(JSON.stringify(this.alarmConf['levels']));
          this.alarm_rule.code = this.alarmConf['alarmTemplate'];
          if(this.alarmConf['alarmType'] === 'Status') {
            this.onAlarmTypeChange('Status');
          }
        }
      }
      else {
        this.headerContent = {
          "devicesAndGroups": [],
          "alarmPriorityTypes": [],
          "tags": [],
          "thresholds": [],
          "usersAndUsersGroup": [],
          "commandDevices": [],
          "commandTags": []
        }
        this.alarmConf = {
          "alarmName": "",
          "alarmDescription": "",
          "alarmType": "",
          "priority": null,
          "isTypeIsAlarm": false,
          "alarmTemplate": "",
          "acknowledgement": false,
          "devices": [],
          "ruleSets": [
            {
              "rules": [
                {
                  "leftHandSide": {
                    "tag": null
                  },
                  "condition": "",
                  "rightHandSide": {
                    "compareOption": "customValue",
                    "customValue": null,
                    "threshold": null,
                    "tag": null,
                  },
                  "resetValue": {
                    "isResetValueRequired": false,
                    "compareOption": "customValue",
                    "customValue": null,
                    "tag": null,
                    "threshold": null,
                    "tolerenceValue": null,
                    "pTolerenceValue": null
                  }
                }
              ],
              "ruleAndOrOperationData": {
                "isOr": false,
                "isAnd": true
              }
            }
          ],
          "ruleSetAndOrOperationData": {
            "isOr": false,
            "isAnd": true
          },
          "levels": [
            {
              "suppress": "00:00",
              "notificationProfiles": [
                {
                  "usersOrUserGroup": [],
                  "notificationProfile": [],
                  "notificationTone": "",
                  "isNotificationToneShow": false
                }
              ],
              "commands": []
            }
          ]
        }
      }
    },
    (error) => {
      this.isPageLoading = false;
    });
  }

  andClicked() {
    this.alarmConf["isAnd"] = true;
    this.alarmConf["isOr"] = false;
  }

  orClicked() {
    this.alarmConf["isOr"] = true;
    this.alarmConf["isAnd"] = false;
  }

  onAlarmTypeChange(type: any) {
    this.alarmConf["isTypeIsAlarm"] = type === "Alarm" ? true : false;
    if(type === "Status") {
      this.alarmConf['alarmCategory'] = 'live';
      this.settings.forEach((element)=>{
        if(element.stepnumber == 2) {
          element.show = false;
        }
      })
    } else {
      this.settings.forEach((element)=>{
        if(element.stepnumber == 2) {
          element.show = true;
        }
      })
    }
    if(type !== "Status") {
        if(this.alarmConf['ruleSets'].length === 0) {
           this.alarmConf['ruleSets'][0] = {
          "rules": [
            {
              "leftHandSide": {
                "tag": null
              },
              "condition": "",
              "rightHandSide": {
                "compareOption": "customValue",
                "customValue": null,
                "threshold": null,
                "tag": null,
              },
              "resetValue": {
                "isResetValueRequired": false,
                "compareOption": "customValue",
                "customValue": null,
                "tag": null,
                "threshold": null,
                "tolerenceValue": null,
                "pTolerenceValue": null
              }
            }
          ],
          "ruleAndOrOperationData": {
            "isOr": false,
            "isAnd": true
          }
        };
      }
    }
  }

  onCategoryChange() {
    if(this.alarmConf['alarmCategory'] === '15min' 
    || this.alarmConf['alarmCategory'] === '30min' 
    || this.alarmConf['alarmCategory'] === 'eod' 
    || this.alarmConf['alarmCategory'] === 'eoh' 
    || this.alarmConf['alarmCategory'] === 'eos') 
    {
      this.alarmConf['levels'] = [];
      this.alarmConf['levels'][0] = {
        "suppress": "00:00",
        "notificationProfiles": [
          {
            "usersOrUserGroup": [],
            "notificationProfile": [],
            "notificationTone": "",
            "isNotificationToneShow": false
          }
        ],
        "commands": []
      }
    }
    else {
      this.alarmConf['levels'] = this.holdAllLevels;
    }
  } 

  modifyConfiguration(alarmConfiguration) {
    if(alarmConfiguration['alarmType'] === 'Status') {
      this.alarmConf['ruleSets'] = [];
      this.alarmConf['levels'].forEach(element => {
        element['commands'] = [];
      });
    }
  }

  saveAlarmConf() {
    if (!this.validateActionFields()) {
      this.modifyConfiguration(this.alarmConf);
      let objSave = {};
      objSave["id"] = this.alarmId.split("&").length == 2 ? "new" : this.alarmId;
      this.alarmConf["enabled"] = objSave["id"] == "new" ? true : (this.alarmConf.hasOwnProperty('enabled') ? this.alarmConf["enabled"] : true);
      this.alarmConf['site_id'] = this.global.getCurrentUserSiteId();
      this.alarmConf['client_id'] = this.global.getCurrentUserClientId();
      objSave["data"] = this.alarmConf;
      document.getElementById('saveOrUpdateAlarm').setAttribute('disabled', 'true');
      this.appService.saveAlarmConfig(objSave).subscribe(data => {
        if (data.status == "success") {
          this._toastLoad.toast("success", "Success", (this.alarmId.split("&").length == 1 && this.alarmId != "new") ? "Updated Successfully" : "Created Successfully", true);
          this.router.navigate(['/configurations/alarm/alarms']);
        } else {
          this._toastLoad.toast('error', 'Error', (this.alarmId.split("&").length == 1 && this.alarmId != "new") ? "Updation Failed" : "Creation Failed", true);
        }
        document.getElementById('saveOrUpdateAlarm').removeAttribute('disabled');
      });
    }
    else {
      this._toastLoad.toast('warning', 'Validation', this.toasterMessage, true);
    }
  }

  goToNextStep(stepNum: any) {
    if (this.step_number == 1) {
      if (!this.validateGeneralInfoFields()) {
        this.step_number = stepNum;
        if (this.step_number == 2) {
          this.getTagsForRuleset();
        }
      } else {
        this._toastLoad.toast('warning', 'Validation', 'Please Enter the required fields', true);
      }
    } else if (this.step_number == 2) {
      if (!this.validateRulesetFields()) {
        this.step_number = stepNum;
      } else {
        this._toastLoad.toast('warning', 'Validation', 'Please Enter the required fields', true);
      }
    }
  }

  goToPrevious(stepNum: any) {
    this.step_number = stepNum;
  }

  getTagsForRuleset() {
    this.isPageLoading = true;
    let objGet = {};
    objGet['data'] = this.alarmConf['devices'];
    if(this.global.deploymentMode == 'EL'){
      objGet['filter'] = [];
      objGet['filter'].push({'site_id' : this.global.getCurrentUserSiteId()});
    }
    this.appService.getTagsForRuleset(this.global.deploymentModeAPI.ALARM_CONFIGURATION_GET_TAGS, objGet).subscribe(data => {
      this.isPageLoading = false;
      this.tagsForRuleset = data.data;
    },
    (error) => {
      this.isPageLoading = false;
    });
  }

  getstepnumber(step) {
    this.step_number = step.stepnumber;
  }

  validateGeneralInfoFields(): boolean {
    let isValid: boolean = false;
    Object.keys(this.alarmConf).forEach(element => {
      if (typeof this.alarmConf[element] != "object") {
        if (element != "alarmDescription" && element != "alarmType" && element != "acknowledgement" && element != "priority" && element != "isTypeIsAlarm" && element != "enabled" &&
        element != 'isdeleted' && element != "id" && element != "site_id" && element != "edited" && element != "client_id") {
          isValid = (this.alarmConf[element] != "" && this.alarmConf[element] != null && isValid == false) ? false : true;
        }
        else if (element == "alarmType") {
          isValid = (this.alarmConf[element] != "" && isValid == false) ? false : true;
          if (this.alarmConf[element] == "Alarm" && this.alarmConf['alarmCategory'] !='15min' && this.alarmConf['alarmCategory'] !='30min' && this.alarmConf['alarmCategory'] !='eod' && this.alarmConf['alarmCategory'] !='eoh' && this.alarmConf['alarmCategory'] !='eos') isValid = (this.alarmConf["priority"] != null && this.alarmConf["priority"] != "" && isValid == false) ? false : true;
        }
      }
      else {
        if (element == "devices") {
          isValid = (this.alarmConf[element].length > 0 && isValid == false) ? false : true;
        }
      }
    });
    return isValid;
  }

  validateRulesetFields(): boolean {
    let isValid: boolean = false;
    this.alarmConf["ruleSets"].forEach(rulesSet => {
      rulesSet.rules.forEach(rule => {
        Object.keys(rule).forEach(key => {
          if (typeof rule[key] != "object") {
            if (this.alarmConf['alarmCategory'] !='15min' && this.alarmConf['alarmCategory'] !='30min' && this.alarmConf['alarmCategory'] != 'eod' &&
              this.alarmConf['alarmCategory'] != 'eoh' && this.alarmConf['alarmCategory'] != 'eos') {
              isValid = (rule[key] != "" && rule[key] != null && isValid == false) ? false : true;
            }
          } else {
            if (key != "resetValue" && key != "leftHandSide" && this.alarmConf['alarmCategory'] !='15min' && this.alarmConf['alarmCategory'] !='30min' && this.alarmConf['alarmCategory'] !='eod' && this.alarmConf['alarmCategory'] !='eoh' && this.alarmConf['alarmCategory'] !='eos') {
              isValid = (rule[key]['compareOption'] != "" && rule[key]['compareOption'] != null && isValid == false) ? false : true;
              if (rule[key]['compareOption'] != "" && rule[key]['compareOption'] != "") isValid = (rule[key][rule[key]['compareOption']] != "" && rule[key][rule[key]['compareOption']] != null && isValid == false) ? false : true;
            }
            else if (key == "leftHandSide") {
              isValid = (rule[key]['tag'] != "" && rule[key]['tag'] != null && isValid == false) ? false : true;
            }
            else {
              if (rule[key]["isResetValueRequired"] == true && this.alarmConf['alarmCategory'] !='15min' && this.alarmConf['alarmCategory'] !='30min' && this.alarmConf['alarmCategory'] !='eod' && this.alarmConf['alarmCategory'] !='eoh' && this.alarmConf['alarmCategory'] !='eos') {
                isValid = (rule[key]['compareOption'] != "" && rule[key]['compareOption'] != null && isValid == false) ? false : true;
                if (rule[key]['compareOption'] != "" && rule[key]['compareOption'] != null) isValid = (rule[key][rule[key]['compareOption']] != "" && rule[key][rule[key]['compareOption']] != null && isValid == false) ? false : true;
              }
            }
          }
        });
      });
    });
    return isValid;
  }

  validateActionFields(): boolean {
    this.toasterMessage = "Please Enter the required fields";
    let isValid: boolean = false;
    this.alarmConf["levels"].forEach(level => {
      Object.keys(level).forEach(key => {
        if (typeof level[key] != "object") {
          if(key === 'suppress' && level[key].split(":")[1] > 59) {
            isValid = true;
            this.toasterMessage = "Seconds should not exceed 59";
          }
          isValid = (level[key] != "" && level[key] != null && isValid == false) ? false : true;
        } else {
          if (key == "commands") {
            if (this.alarmConf["alarmType"] !== 'Status') {
              level[key].forEach(eachObj => {
                Object.keys(eachObj).forEach(eachKey => {
                  if(eachKey=='device' || eachKey=='tag'){
                    isValid = (eachObj[eachKey].length != 0 && eachObj[eachKey] != null && isValid == false) ? false : true;
                  } 
                  if(eachKey!='label') {
                    isValid = (eachObj[eachKey] != "" && eachObj[eachKey] != null && isValid == false) ? false : true;
                  }
                });
              });
            }
          }
          else {
            level[key].forEach(eachObj => {
              Object.keys(eachObj).forEach(eachKey => {
                if (typeof eachObj[eachKey] != "object") {
                  if (eachObj['isNotificationToneShow'] == true && eachKey == "notificationTone") {
                    isValid = (eachObj[eachKey] != "" && eachObj[eachKey] != null && isValid == false) ? false : true;
                  }
                  if(eachKey === "notificationProfile" || eachKey === "usersOrUserGroup") {
                    eachObj[eachKey] === "" ? isValid = true : false;
                  }
                }
                else {
                  isValid = (eachObj[eachKey].length > 0 && isValid == false) ? false : true;
                }
              });
            });
          }
        }
      });
    });
    return isValid;
  }

  cancelAlarmConfig() {
    this.router.navigate(['/configurations/alarm/alarms']);
  }

  /* =======================Monaco Editor Methods============================== */
  /** 
  * Method for send editor suggestion into monaco editor component(child)
  */
  setCalcSuggestions() {

    this.calcSuggestions = [
      // {
      //   label: 'Site Name',
      //   kind: 14, // monaco.languages.CompletionItemKind.Snippet,
      //   detail: '',
      //   id: "",
      //   documentation: '',
      //   insertText: {
      //     value: ['[Site Name]'].join('\n')
      //   }
      // },
      {
        label: 'Asset Name',
        kind: 14,
        detail: '',
        id: "",
        documentation: '',
        insertText: {
          value: ['[Asset Name]'].join('\n')
        }
      },
      {
        label: 'Tag Name',
        kind: 14,
        detail: '',
        id: "",
        documentation: '',
        insertText: {
          value: ['[Tag Name]'].join('\n')
        }
      },
      {
        label: 'Time Stamp',
        kind: 14,
        detail: '',
        id: "",
        documentation: '',
        insertText: {
          value: ['[Time Stamp]'].join('\n')
        }
      },
      {
        label: 'Tag Value',
        kind: 14,
        detail: '',
        id: "",
        documentation: '',
        insertText: {
          value: ['[Tag Value]'].join('\n')
        }
      },
      {
        label: 'Status',
        kind: 14,
        detail: '',
        id: "",
        documentation: '',
        insertText: {
          value: ['[Status]'].join('\n')
        }
      },
    ];
    let isColorSet = this.setColorToParameter();
  }
  /**
  * Method for assinging different custom colors to each attributes
  */
  setColorToParameter() {
    Config.setColorCodes();
    let colorIndex = 1;
    const colorList = Config.COLOR_LIST;
    for (const sugg of this.calcSuggestions) {
      const label = sugg.label;
      this._calcParameterSuggColor.tokenizer.push({
        regex: new RegExp(label),
        action: {
          token: String(colorList[colorIndex]),
        }
      });
      colorIndex += 1;
    }
    return true;
  }
  /**
  * 
  * Method for validating alarm template
  */
  validateAlarmTemplate() {
    this.alarmConf['alarmTemplate'];
  }

  /**
  * Method for capturing all changes in calculation builder editor
  * @param event data
  */
  updateFormulaInfo(event, calcItem) {
    try {
      this.alarmConf['alarmTemplate'] = event.code;
    } catch (error) {
      console.log(error);
    }
  }

  allowAccess(acess:string){
    return this.authService.allowAccess(acess);
  }

}
