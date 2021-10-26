import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { AppService } from '../../../../services/app.service';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'kl-alarm-priority-types',
  templateUrl: './alarm-priority-types.component.html',
  styleUrls: ['./alarm-priority-types.component.scss']
})
export class AlarmPriorityTypesComponent implements OnInit {

  @ViewChild('alarmPriorityTypeForm') alarmPriorityTypeForm: NgForm;
  @ViewChild('name') name:NgModel;
  @ViewChild('unit') unit:NgModel;
  sideMenus: object;
  selectedAlarmPriorityType: any;
  isUpdate: boolean = false;
  title:String;
  headerContent: Object;
  currentAccess;
  
  colorMap = [
    "#E9002D",
    "#FFAA00",
    " #00B000",
    "#009ADE",
    "#AF58BA",
    "#9400D3",
    "#4B0082",
    "#A0B1BA",
    "#A6761D"
]
  defaultColor =  "#EE4040";
  constructor(private appService: AppService, private _toastLoad: ToastrService, private authService: AuthGuard, private global: globals) { }

  ngOnInit() {
    this.addNewAlarmPriorityType();
    this.getAlarmPriorityTypesList();
    this.getLabels();
    this.appService.getPriorityLevels().subscribe((data)=>{
      this.headerContent = data;
    })
    this.currentAccess = this.authService.getMenuObject.accessLevel;    
  }
  getLabels() {
    this.authService.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    })
  }
  getAlarmPriorityTypesList() {
    let objGet = {};
    if(this.global.deploymentMode == 'EL'){
      objGet['filter'] = [];
      objGet['filter'].push({'site_id' : this.global.getCurrentUserSiteId()});
    }
    this.appService.getAlarmPriorityTypes(this.global.deploymentModeAPI.ALARM_PRIORITY_TYPE_GET, objGet).subscribe(data => {
      this.sideMenus = data;
      this.sideMenus["menuheading"] = "Alarm Priority Types";
      this.sideMenus["buttonlabel"] = "Create Alarm Priority Type";
      this.sideMenus["placeholder"] = "Search for Alarm Priority Type";
    });
  }

  handleAlarmPriorityTypeClick(e: any) {
    this.selectedAlarmPriorityType = JSON.parse(JSON.stringify(e));
    this.title = 'Edit '+this.selectedAlarmPriorityType.name;
    if(this.colorMap.includes(this.selectedAlarmPriorityType['priorityColor'])){this.selectedAlarmPriorityType['priorityColor'] =this.defaultColor;}
    this.isUpdate = true;
  }

  addNewAlarmPriorityType() {
    this.getLabels();
    this.isUpdate = false;
    // this.alarmPriorityTypeForm.reset();
    this.selectedAlarmPriorityType = {
      "name": "",
      "description": "",
      "priorityColor" : "",
      "priorityType" : 1,
      "icon":"critical"
    };
    this.selectedAlarmPriorityType['priorityColor'] = this.defaultColor;
  }

  handleAlarmPriorityTypeAddedOrUpdated() {
    this.getAlarmPriorityTypesList();
    this.addNewAlarmPriorityType();
  }

  saveAlarmPriorityType() {
    this.selectedAlarmPriorityType['site_id'] = this.global.getCurrentUserSiteId();
    this.selectedAlarmPriorityType['client_id'] = this.global.getCurrentUserClientId();
    document.getElementById('saveAlarmPriorityType').setAttribute('disabled', 'true');
    this.appService.saveAlarmPriorityType(this.selectedAlarmPriorityType).subscribe(data => {
      if(data.status == "success"){
        this.addNewAlarmPriorityType();
        this._toastLoad.toast("success", "Success", this.selectedAlarmPriorityType.hasOwnProperty('id') ? "Updated Successfully" : "Created Successfully", true);
      }else{
        this._toastLoad.toast('error', 'Error', this.selectedAlarmPriorityType.hasOwnProperty('id') ? "Updation Failed" : "Creation Failed", true);
      }
      this.handleAlarmPriorityTypeAddedOrUpdated();
    });
  }

  deleteAlarmPriorityType() {
    document.getElementById('deleteAlarmPriorityType').setAttribute('disabled', 'true');
    this.appService.deleteAlarmPriorityType(this.selectedAlarmPriorityType.id).subscribe(data => {
      if(data.status == "success"){
        this._toastLoad.toast("success", "Success", "Deleted Successfully", true);
      }else{
        this._toastLoad.toast('error', 'Error', "Deletion Failed", true);
      }
      this.handleAlarmPriorityTypeAddedOrUpdated();
      document.getElementById('deleteAlarmPriorityType').removeAttribute('disabled');
    });
  }

  allowAccess(acess:string){
    return this.authService.allowAccess(acess);
  }
  resetForm(){
    this.addNewAlarmPriorityType();
  }

}
