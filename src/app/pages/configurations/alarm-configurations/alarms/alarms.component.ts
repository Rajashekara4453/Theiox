import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../../pages/auth/auth.guard';
import { globals } from '../../../../utilities/globals';
import { Router } from '@angular/router';

@Component({
  selector: 'kl-alarms',
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.scss'],
})
export class AlarmsComponent implements OnInit {
  headerContent: object = {};
  alarms: Array<any> = new Array();
  isCollapsed: boolean = false;
  headerCols: object;
  selectedAlarm: number;
  public queryString: String = '';
  deleteAlarmId: string;
  currentAccess;
  isPageLoading:boolean
  constructor(private appService: AppService, private authService: AuthGuard, private _toastLoad: ToastrService, private global: globals,
    private _router:Router) { }

  ngOnInit() {
    this.isPageLoading = true;
    this.currentAccess = this.authService.getMenuObject.accessLevel;    
    this.getAlarmList();
  }

  getAlarmList() {
    let objGet = {};
    if(this.global.deploymentMode == 'EL'){
      objGet['filter'] = [];
      objGet['filter'].push({'site_id' : this.global.getCurrentUserSiteId()});
    }
    this.appService.getAlarmList(this.global.deploymentModeAPI.ALARM_LIST_GET, objGet).subscribe(data => {
      this.headerCols = [
        {
          "key": "alarmName",
          "name": "Name",
        },
        {
          "key": "alarmType",
          "name": "Type",
        },
        {
          "key": "priority",
          "name": "Priority",
        },
        {
          "key": "devices",
          "name": "Assets",
        },
        {
          "key": "enabled",
          "name": "Enable",
        }
      ];
      this.alarms = data.body_content;
      this.headerContent = data.header_content;
      this.isPageLoading = false;
    },
    (error) => {
      this.isPageLoading = false;
    });
  }

  deleteAlarm(id: string) {
    document.getElementById('deleteAlarm'+id).setAttribute('disabled', 'true');
    this.appService.deleteAlarmConfig(id).subscribe(data => {
      if (data.status == "success") {
        this._toastLoad.toast("success", "Success", "Deleted Successfully", true);
      } else {
        this._toastLoad.toast('error', 'Error', "Deletion Failed", true);
      }
      this.getAlarmList();
    });
  }

  getDevicesOfAlarms(devicesList: Array<string>): string {
    // console.log('devices list: ', devicesList);
    let commaSeparatedDevices: string = "";
    for (let i = 0; i < devicesList.length; i++) {
      commaSeparatedDevices = commaSeparatedDevices + this.headerContent['device'][devicesList[i]];
      if (i < devicesList.length - 1) commaSeparatedDevices = commaSeparatedDevices + ", ";
    }
    return commaSeparatedDevices;
  }

  enableOrDisableAlarm(alarm:any){
    let obj:object = {};
    obj["id"] = alarm["id"];
    obj["enabled"] = alarm["enabled"];
    this.appService.enableOrDisableAlarm(obj).subscribe(data => {
      if (data.status == "success") {
        this._toastLoad.toast("success", "Success", data.message, true);
      } else {
        this._toastLoad.toast('error', 'Error',  data.message, true);
      }
      this.getAlarmList();
    });
  }

  allowAccess(acess:string){
    return this.authService.allowAccess(acess);
  }

  onCreate(mode:string, routeParams) {
    if(mode !== undefined && routeParams !== undefined) {
      this._router.navigate(['/configurations/alarm/alarms/addorupdatealarms', routeParams]);
    }
  }
}
