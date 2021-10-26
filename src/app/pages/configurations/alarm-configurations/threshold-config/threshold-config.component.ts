import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { NgForm } from '@angular/forms';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-threshold-config',
  templateUrl: './threshold-config.component.html',
  styleUrls: ['./threshold-config.component.scss']
})
export class ThresholdConfigComponent implements OnInit {
  @ViewChild('thresholdForm') thresholdForm: NgForm;
  sideMenus: any;
  getThresholdsObj: any;
  selectedThreshold: any;
  isUpdate: boolean = false;
  Thresholds: Array<any> = [];
  title: String;
  constructor(private appService: AppService, private _toastLoad: ToastrService, private authService: AuthGuard, private global: globals) { }

  ngOnInit() {
    this.getThresholds();
    this.addNewThreshold();
    this.getLabels();
  };
  getLabels() {
    this.authService.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    })
  }
  getThresholds() {
    let objGet = {};
    if (this.global.deploymentMode == 'EL') {
      objGet['filter'] = [];
      objGet['filter'].push({ 'site_id': this.global.getCurrentUserSiteId() });
    }
    this.appService.getThresholds(this.global.deploymentModeAPI.THRESHOLD_GET, objGet).subscribe(data => {
      this.getThresholdsObj = data;
      this.getThresholdsObj['menuheading'] = 'Thresholds';
      this.getThresholdsObj['buttonlabel'] = 'Create  Threshold';
      this.getThresholdsObj['placeholder'] = 'Search for Threshold';
    });
  }

  handleThresholdClick(e: any) {
    this.selectedThreshold = JSON.parse(JSON.stringify(e));
    this.title = this.selectedThreshold.name;
    this.isUpdate = true;
  }

  handleEventUpdate(ev: any) {
    this.getThresholds();
    this.isUpdate = false;

  }

  addNewThreshold() {
    // this.title = 'Create Threshold'
    this.getLabels();
    this.isUpdate = false;
    this.thresholdForm.reset();
    this.selectedThreshold = {
      "name": "",
      "value": "",
      "description": "",
      "id": ""
    };
  }

  saveOrUpdateThresholdLevel() {
    this.selectedThreshold['site_id'] = this.global.getCurrentUserSiteId();
    this.selectedThreshold['client_id'] = this.global.getCurrentUserClientId();
    document.getElementById('saveOrUpdateThresholdLevel').setAttribute('disabled', 'true');
    this.appService.saveOrUpdateThreshold(this.selectedThreshold).subscribe(data => {
      if (data.status === 'success') {
        this._toastLoad.toast('success', 'Success', this.selectedThreshold.id != "" ? 'Updated Successfully' : 'Created Successfully', true);
        this.addNewThreshold();
      } else {
        this._toastLoad.toast('error', 'Error', this.selectedThreshold.id != "" ? 'Updation Failed' : 'Creation Failed', true);
      }
      this.getThresholds();
    });
  }

  deleteThreshold() {
    document.getElementById('deleteThreshold').setAttribute('disabled', 'true');
    this.appService.deleteThreshold(this.selectedThreshold).subscribe(data => {
      if (data.status === 'success') {
        this._toastLoad.toast('success', 'Success', 'Deleted Successfully', true);
        this.addNewThreshold();
      } else {
        this._toastLoad.toast('error', 'Error', 'Deletion Failed', true);
      }
      this.getThresholds();
      document.getElementById('deleteThreshold').removeAttribute('disabled');
    });
  }

  allowAccess(acess: string) {
    return this.authService.allowAccess(acess);
  }
  resetForm() {
    this.addNewThreshold();
  }
}
