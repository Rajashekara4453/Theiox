import { globals } from "./../../../utilities/globals";
import { Component, OnInit } from '@angular/core';
import { AppService } from "../../../services/app.service";
import { AuthGuard } from "../../auth/auth.guard";
import { ActivatedRoute, Router} from "@angular/router";
import { ToastrService } from "../../../components/toastr/toastr.service";



@Component({
  selector: 'kl-asset-control',
  templateUrl: './asset-control.component.html',
  styleUrls: ['./asset-control.component.scss']
})
export class AssetControlComponent implements OnInit {

  time_settings = {
		bigBanner: false,
		timePicker: false,
		format: 'dd-MM-yyyy',
    defaultOpen: false,
    closeOnSelect:true
  }
   //todo: label
  scheduleDDSetting = {
  primaryKey: 'id',
    singleSelection: false,
    text: "Select",
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    badgeShowLimit: 2,

  }

  labelDDSettings = {
  primaryKey: 'id',
    singleSelection: false,
    text: "Select",
   enableCheckAll: false,
    addNewItemOnFilter: true,
    addNewButtonText:'Add',
     badgeShowLimit:2,
    enableSearchFilter: true,

}

deviceDDSetting = {
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
    filterSelectAllText: "Select Filtered Devices",
    filterUnSelectAllText: "Unselect Filtered Devices",
    lazyLoading: true,
 searchAutofocus: false,
  autoPosition: true,

  }
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
    filterUnSelectAllText: "Unselect Filtered Tags",
    searchAutofocus: false,
autoPosition: true,
  }
  selectedlabel=[]
  configdata =  {

  action_name:null,
  description: null,
  labels:[],

  type:"action",
  schedule: {
    schedule: true,
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
      action_label:null
    }
  ]
}

//todo assetControlID
assetControlID=null
  configOptionData = {
     devices : [],
  tags : [],
  days :[],
  months : [],
  hours :[],
  minutes : [],
  weekdays : [],
  labels : [],

  }
  isToaster: boolean = false;

dateTimeTag = ["tag_1473"];


  daytype = [
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
  ]
  pageAccessFor: any
  isPageLoading: boolean = false;


  paramsObject: any={};
  Schedule: any = {};
  pageUrl: string='';

  constructor(private _appService: AppService, private global: globals, private activatedRoute: ActivatedRoute, private _router: Router,
    private authGuard: AuthGuard, private _toastLoad: ToastrService) {
      this.activatedRoute.queryParams.subscribe(params => {
        this.paramsObject=params;
        this.Schedule = params['param1'];
    });
    this.assetControlID = this.activatedRoute.snapshot.params.id;
    const menuObject = this.authGuard.getMenuObject;
    this.pageUrl=menuObject['url'];
    this.pageAccessFor=menuObject['accessLevel'];
    }
    
  ngOnInit() {
    if(this.assetControlID){
      this.editConfig()
    }
    this.loadDropDownData();
  }
  getFormattedDateTime(date, format?): string {
    try {
      let dateVal = '';
      const day = (date.getDate() > 9) ? date.getDate() : ('0' + date.getDate());
      let month = date.getMonth() + 1;
      month = (month > 9) ? month : ('0' + month);
      const year = date.getFullYear();
      const HH = (date.getHours() > 9) ? date.getHours() : '0' + date.getHours();
      const MM = (date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes();
      const SS = (date.getSeconds() > 9) ? date.getSeconds() : '0' + date.getSeconds();
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
            dateVal = day + '-' + month + '-' + year + ' ' + HH + ':' + MM + ':' + SS;
            break;
          case 'YYYY-MM-DD HH:MM:SS':
            dateVal = year + '-' + month + '-' + day + ' ' + HH + ':' + MM + ':' + SS;
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

  loadDropDownData() {
   this.getTagAsset();
    this.getDaysInfo();
    this.getMonthsInfo();
    this.getHoursInfo();
    this.getMinutesInfo();
    this.getWeekdaysInfo();
    this.getLabelsInfo()

  }
count=1000
  onAddItem(customLabel) {
  this.count++;
    this.configOptionData.labels.push({"id": this.count,"itemName":customLabel});
    this.selectedlabel.push({"id": this.count,"itemName":customLabel});

}
  scheduleScroll() {
    if (document.getElementById('scrollId') && this.paramsObject && this.paramsObject.schedule && this.paramsObject.schedule.includes("true")) {
      document.getElementById('scrollId').scrollIntoView({behavior: "smooth", block: "start", inline: "nearest" });
    }
  }
  addActions() {
    let action_obj =

      {
      assets: [

      ],
      tags: [

      ],
      write_value: null,
      disabledInput: false,
      action_label:null
    }

    this.configdata.actions.push(action_obj)


  }

  cloneAction(index) {
    let actionObj = JSON.parse(JSON.stringify(this.configdata.actions[index]))
    this.configdata.actions.splice(index,0,actionObj)
   }

  removeAction(index) {

    this.configdata.actions.splice(index,1)
  }
  updateScheduleData() {
    try {
      if (this.configdata && this.configdata.schedule.schedule) {
        this.configdata.schedule.schedule = true;
      } else {
        this.configdata.schedule.schedule = false;
      }
    } catch (error) {
      console.log(error);
    }
  }

       actionValidation() {
    this.configdata.actions.forEach((val, i) => {
      if (val.assets.length === 0) {
        this._toastLoad.toast("error", "Error", "Please Select Assets", true);
        this.isToaster = true;
      } else if (val.tags.length === 0) {
        this._toastLoad.toast("error", "Error", "Please Select Tags", true);
        this.isToaster = true;
      } else if (val.disabledInput == false) {
        if (val.write_value == null || val.write_value == "") {
          this._toastLoad.toast(
            "error",
            "Error",
            "please Enter Value For Action",
            true
          );
          this.isToaster = true;
        }
      }
    });
  }
  scheduleValidation():boolean {
    let valid = true
    if (this.configdata.schedule.minutes.length== 0) {
        valid = false
    } else
    if (this.configdata.schedule.months.length == 0) {
     valid = false
    }  else
    if (this.configdata.schedule.hours.length == 0) {
      valid = false
    }

  return valid
  }

 scheduleTypeValidation() {
    if (this.configdata.schedule.schedule) {
      if (this.configdata.schedule.dayType == "month") {
        let valid = false;
        valid = this.scheduleValidation();
        if (!valid) {
          this._toastLoad.toast(
            "error",
            "Error",
            "Please Select The Schedule",
            true
          );
          this.isToaster = true;
        }
      } else if (this.configdata.schedule.dayType == "date") {
        let valid = false;
        valid = this.scheduleValidation();
        if (!valid) {
          this._toastLoad.toast(
            "error",
            "Error",
            "Please Select The Schedule",
            true
          );
          this.isToaster = true;
        } else {
          if (this.configdata.schedule.date.length === 0) {
            this._toastLoad.toast(
              "error",
              "Error",
              "Please Select The Schedule",
              true
            );
            this.isToaster = true;
          }
        }
      } else if (this.configdata.schedule.dayType == "day") {
        let valid = false;
        valid = this.scheduleValidation();
        if (valid==false) {
          this.isToaster = true;
          this._toastLoad.toast(
            "error",
            "Error",
            "Please Select The Schedule",
            true
          )
        } else {
          if (this.configdata.schedule.day.length === 0) {
            this._toastLoad.toast(
              "error",
              "Error",
              "Please Select The Schedule",
              true
            );
            this.isToaster = true;
          }
        }
      }
    }
  }

  dateValidation() {
    let fromDate = new Date(this.configdata.schedule.startDateVal);
    let toDate = new Date(this.configdata.schedule.endDateVal);
    if (fromDate.getTime() > toDate.getTime()) {
       this._toastLoad.toast('warning', 'Warning', 'From date should be less than or equal to To date', true);
        this.isToaster = true;
    }  }
  onSubmit() {
    this.isToaster=false
    this.configdata.schedule.startDate = this.getFormattedDateTime(new Date(this.configdata.schedule.startDateVal), 'DD-MM-YYYY')
    this.configdata.schedule.endDate = this.getFormattedDateTime(new Date(this.configdata.schedule.endDateVal), 'DD-MM-YYYY')

    // console.log(this.configdata.schedule.startDate,this.configdata.schedule.endDate);


/** ------validation------   **/


    for (let each of this.selectedlabel) {
            const contains=this.configdata.labels.includes(each['itemName'])
      if (!contains) {
        this.configdata.labels.push(each['itemName']);
      }

    }
    if (
      this.configdata.action_name == null ||
      this.configdata.action_name == ""
    ) {
      this._toastLoad.toast("error", "Error", "Please Enter Name", true);
      this.isToaster = true;
    }

    this.actionValidation();

    this.scheduleTypeValidation();
   this.dateValidation()
    this.saveConfig()


 }
    cancel() {
    this._router.navigate([this.pageUrl]);
  }
  deleteConfiguration() {
    let objGet = {
      "asset_action_id": this.assetControlID,
    };
    this._appService.deleteAssetControlData(objGet).subscribe(data => {

      if (data.status == 'success') {
        this._toastLoad.toast('success', 'Success', 'Action deleted successfully', true);
        this.isToaster = true;
        this._router.navigate([this.pageUrl]);
      }
      else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.isToaster = true;
      }

    })

  }

saveConfig() {
  if (this.isToaster == false) {
      console.log(this.configdata);
      this._appService
        .saveAssetControlConfig(this.configdata)
        .subscribe((data) => {
          if (data.status == "success") {
            this._toastLoad.toast("success", "Success", "Saved Sucessfully", true);
            this._router.navigate([this.pageUrl]);
          } else {
            this._toastLoad.toast("error", "Error", data.message, true);
          }
        });
    }
  }

  onItemSelect($event,i) {
   const data = $event;
    length = this.configdata.actions[i].tags.length;
    delete this.configdata.actions[i].tags[length - 1].unit;
    delete this.configdata.actions[i].tags[length - 1].type;
    if (data.value == this.dateTimeTag[0] ) {
      this.configdata.actions[i].disabledInput = true;
    } else {
      this.configdata.actions[i].disabledInput = false;
    }

  }
  OnItemDeSelect($event,i) {
     const data = $event;

    if (data.value == this.dateTimeTag[0]) {
      this.configdata.actions[i].disabledInput = false;

      if (this.configdata.actions[i].tags.length == 1) {
        if (
          this.configdata.actions[i].tags[0].value == this.dateTimeTag[0]
        ) {
          this.configdata.actions[i].disabledInput = true;
        }
      }
    } else {
      if (this.configdata.actions[i].tags.length <= 2) {
        switch (this.configdata.actions[i].tags.length) {
          case 1:
            if (
              this.configdata.actions[i].tags[0].value == this.dateTimeTag[0]
            ) {
              this.configdata.actions[i].disabledInput = true;
            }
            break;

          case 2:
            if (
              this.configdata.actions[i].tags[0].value == this.dateTimeTag[0]
            ) {
              if (
                this.configdata.actions[i].tags[1].value ==this.dateTimeTag[0]
              ) {
                this.configdata.actions[i].disabledInput = true;
              }
            } else {
              this.configdata.actions[i].disabledInput = false;
            }
            break;
        }
      }
    }

  }

  onDeSelectAll(event, keyType, index?:number) {
    switch (keyType) {
      case 'minutes':
        this.configdata.schedule.minutes=event
        break;
      case 'hours':
        this.configdata.schedule.hours=event
        break;
      case 'day':
        this.configdata.schedule.day = event;
        break;
      case 'date':
        this.configdata.schedule.date = event;
        break;
      case 'month':
        this.configdata.schedule.months = event;
        break;
      case 'tags':
        this.configdata.actions[index].tags=event
        break;
      case 'assets':
        this.configdata.actions[index].assets=event
        break;
      case 'label':
        this.selectedlabel=event
        break;

    }

  }

  getDaysInfo() {
    this._appService.getDaysInfo().subscribe((data) => {
      this.configOptionData.days = data;
    });

  }

  getMonthsInfo() {
    this._appService.getAssetMonthsInfo().subscribe(data => {
      this.configOptionData.months=data
    })

  }
  getHoursInfo() {
    this._appService.getHoursInfo().subscribe((data) => {
      this.configOptionData.hours = data;
    });

  }

  getMinutesInfo() {
    this._appService.getMinutesInfo().subscribe((data) => {
      this.configOptionData.minutes = data;
    });

  }

  getWeekdaysInfo() {
    this._appService.getAssetWeekdaysInfo().subscribe(data => {
      this.configOptionData.weekdays=data
    })

  }

  getLabelsInfo() {
    this._appService.getAssetControlLabel().subscribe((data) => {
      this.configOptionData.labels = data;
    });

  }

  trackByActionValue(i: number, item: any) {
    return i;
  }

  getTagAsset() {
    this.isPageLoading = true
    const input = {
      fetch_meta_data_by: ["devices", "tags"],
      filter: [
        { site_id: this.global.getCurrentUserSiteId() },
        { user_id: this.global.getCurrentUserId() },
      ],
      cType: 'modbus_write_widget',
    };

    this._appService.getChartConfigMetaData(input).subscribe((responsedata) => {
      if (responsedata.status = 'success') {
        this.configOptionData.devices = responsedata.data.devices;

        this.configOptionData.tags = responsedata.data.tags;
        this.isPageLoading = false;

      } else {
        this._toastLoad.toast('warning', 'Warning', responsedata.message, true);
      }
        this.scheduleScroll();
    });
  }
  editConfig() {
    if (this.assetControlID!=null) {
      this.isPageLoading=true;
    let objGet = {
      "asset_action_id": this.assetControlID,
      "type": "action"
      };
      try {
        this._appService.editAssetControlData(objGet).subscribe(data => {
          if (data!={} && !data.hasOwnProperty('message')) {
            this.configdata = data
            this.isPageLoading = false;
            this.getselectedLabels(this.configdata);
            this.scheduleScroll();
          } else {
              this.isPageLoading = false;
            this._toastLoad.toast('error','Error',data.message,true)
          }

  })
      } catch (error) {
        console.log(error);
        this.isPageLoading=false;
      }
    }
  }
  getselectedLabels(configdata) {
    let count = 1000
    if (configdata.labels.length > 0) {
          for(let eachlabel of configdata.labels) {
            this.selectedlabel.push({ id: count++, itemName: eachlabel })
    }

    }

    this.configdata.labels=[]
   }



}
