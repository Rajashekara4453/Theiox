import { Injectable } from '@angular/core';
import { AppTokenService } from './app-token.service';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  constructor(private _appTokenService: AppTokenService) {}

  public get userInfo() {
    return this._appTokenService.userDetails;
  }

  public get userRoleID() {
    return this._appTokenService.userRoleId;
  }

  public get authorizedMenuJSON() {
    return this._appTokenService.authorizedMenuJSON;
  }

  public get siteID() {
    return this._appTokenService.siteId;
  }

  public get cilentID() {
    return this._appTokenService.clientId;
  }

  public get userID() {
    return this._appTokenService.userId;
  }

  public get isSystemAdmin() {
    return this._appTokenService.isSystemAdmin;
  }

  public get isSuperUser() {
    return this._appTokenService.isSuperUser;
  }

  public get userInfoPermissions() {
    return this._appTokenService.userInfo_Permissions;
  }
}
