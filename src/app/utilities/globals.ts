import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AppService } from '../services/app.service';
import { Config } from '../config/config';
import { Subject, Observable } from 'rxjs';
import { AppTokenService } from '../services/app-token.service';
import { Title } from '@angular/platform-browser';
@Injectable()
export class globals {
  constructor(
    public router: Router,
    private _appService: AppService,
    private _appTokenService: AppTokenService,
    private _titleService: Title
  ) {}

  public get Download(): any {
    return this._download;
  }
  public set Download(value: any) {
    this._download = value;
  }
  public get _appConfigurations(): any {
    return this._AppConfigurations;
  }
  public set _appConfigurations(value: any) {
    this._AppConfigurations = value;
  }
  public get userId(): any {
    return this._appTokenService.userId;
  }
  public set userId(value: any) {
    this._userId = value;
  }
  public get deploymentMode() {
    return this._deploymentMode;
  }
  public get deploymentModeAPI() {
    return this._deploymentModeAPI;
  }

  public set deploymentMode(deploymentMode: string) {
    this._deploymentMode = deploymentMode;
    if (this.deploymentMode === 'KL') {
      this._deploymentModeAPI = Config.API;
    } else if (this.deploymentMode === 'EL') {
      this._deploymentModeAPI = Config.API;
    }
  }
  private _userId: any;
  private _userName: any = ' ';
  private _keyForEncDec = 'thisIsASecretKey';
  private _AppConfigurations: any = {};
  private _deploymentMode = 'EL';
  private _download = false;
  private _deploymentModeAPI = Config.API;
  public _deploymentModeAPIKL = Config.API;

  encryptionKey() {
    return this._keyForEncDec;
  }

  /*Return UserID from cookies
   */
  onLoadDataLogin() {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.split('=');
      if (eqPos[0] == 'user_id') {
        this._userId = eqPos[1];
      }
      const name = cookie.substr(1, 0);
    }
  }

  /*triggering DOM modals */
  openModal() {
    const element = document.createElement('div');
    element.setAttribute('id', 'modalBackdropId');
    element.setAttribute('class', 'modal-backdrop fade  show');
    document.body.appendChild(element);
  }

  /*Closinng DOM modals */
  closeModal() {
    document.getElementById('modalBackdropId').remove();
  }

  /*  User Id return  */
  getCurrentUserId() {
    this._userId = this._appTokenService.userId;
    return this._userId;
  }

  /*  Site Id return  */
  getCurrentUserSiteId() {
    return this._appTokenService.siteId;
  }

  /* System Admin logged in */
  isSystemAdminLoggedIn() {
    return this._appTokenService.isSystemAdmin;
  }

  /*  Super User logged in  */
  isSuperUser() {
    return this._appTokenService.isSuperUser;
  }

  /*  Client Id return  */
  getCurrentUserClientId() {
    return this._appTokenService.clientId;
  }

  /*Check the count in license for a feature. 
    return true if allowed.
    false if not.
   */

  allowedCountLicense(feature: string) {
    const site_id = this.getCurrentUserSiteId();
    // this.onLoadDataLogin();
    const user_id = this.userId;
    let isAllowed: string = 'false';
    const dataToSend = {
      site_id: site_id,
      user_id: user_id,
      feature: feature
    };

    this._appService
      .allowedCountLicense(dataToSend)
      .subscribe((allowedCount) => {
        isAllowed = allowedCount;
      });
    return isAllowed;
  }

  getTimerSettings(siteID, comp): Observable<any> {
    let timerValue;
    const subject = new Subject<any>();
    this._appService.getTimerSettings().subscribe((data) => {
      if (data.length > 0) {
        const actualData = data[0].data[0];
        if (siteID !== '' || siteID === null) {
          const val = actualData[siteID];
          if (val !== undefined) {
            timerValue = val[comp];
            subject.next(timerValue);
          } else {
            timerValue = actualData.default[comp];
            subject.next(timerValue);
          }
        } else {
          timerValue = actualData.default[comp];
          subject.next(timerValue);
        }
      } else {
        subject.next(null);
      }
    });
    return subject.asObservable();
  }

  public setTitle(newTitle: string) {
    this._titleService.setTitle(
      newTitle + ' ' + this._appConfigurations['currentVersion']
    );
  }
}
