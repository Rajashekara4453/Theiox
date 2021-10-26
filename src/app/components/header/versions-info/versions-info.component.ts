import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../toastr/toastr.service';
import { globals } from '../../../utilities/globals';

@Component({
  selector: 'kl-versions-info',
  templateUrl: './versions-info.component.html',
  styleUrls: ['./versions-info.component.scss']
})
export class VersionsInfoComponent implements OnInit {
  versionData: any;
  versionArray: any = [];
  deploymentMode: string = 'EL';

  constructor(
    private _appService: AppService,
    private _toastLoad: ToastrService,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.getVersions();
  }

  getVersions() {
    this.versionArray = [];
    // this.deploymentMode = this._globals.deploymentMode;
    const dataToSend = {};
    // this.versionArray.push({
    //   displayName:  "UI VERSION",
    //   version: 'v 0.0.7',});

    this.deploymentMode = this._globals.deploymentMode;
    switch (this.deploymentMode) {
      case 'EL':
        this._appService.getVersions(dataToSend).subscribe((data) => {
          this.versionData = data.data.versions;

          for (const key in this.versionData) {
            if (this.versionData.hasOwnProperty(key)) {
              const element = this.versionData[key];
              if (
                element['displayName'] !== '' &&
                element['displayName'] !== undefined
              ) {
                this.versionArray.push(element);
              } else {
                // console.log(" Incorrect Keys in JSON or Value does not exists..")
                // this._toastLoad.toast('info', 'Information', "Incorrect Keys in JSON or Value does not exists..", true);
              }
            }
          }
        });
        break;
    }
  }

  // Saving Version info

  // saveVersions() {
  //   const dataToSend = {data : this.versionInfo}

  //   this._appService.saveVersions(dataToSend).subscribe((data)=>{
  //     console.log(data);
  //     // success or failure
  //     this.getVersions();
  //   })
}
