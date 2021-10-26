import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityFunctions } from '../../utilities/utility-func';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _download = false;

  constructor(private _router: Router,
              private _utility: UtilityFunctions) { }
  sendToken(token: string) {
    localStorage.setItem('loggedUser', token);
  }
  storeUserDetails(userObj: string) {
    localStorage.clear();
    const encryptedUserObj = this._utility.encryptIntially(userObj);
    localStorage.setItem('userDetails', encryptedUserObj);
  }
  getToken() {
    return localStorage.getItem('loggedUser');
  }
  isLoggednIn() {
    return this.getToken() !== null;
  }
  logout() {
    localStorage.removeItem('loggedUser');
    this._router.navigate(['/login']);
  }
  decryptUserDetails() {
    const decryptedUserObj = JSON.parse(this._utility.decrypt(localStorage.getItem('userDetails')));
    return decryptedUserObj;
    // return this._accessMenuService.userInfo_Permissions;
  }

  getCurrentUserSiteId() {
    try {
      const getLocalStorageObj = this.decryptUserDetails();
      if (getLocalStorageObj != null && getLocalStorageObj.site_id != null) {
        return getLocalStorageObj.site_id;
      } else {
        return '';
      }
    } catch (error) {
    }
  }

  serviceUserId(){
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.split('=');
      if (eqPos[0] == 'user_id') {
        return  eqPos[1];
      }
    }
  }

  public get Download(): any {
    return this._download;
  }
  public set Download(value: any) {
    this._download = value;
  }

   /*Client Id return
 */
  getCurrentUserClientId() {
  try {
    const getLocalStorageObj = this.decryptUserDetails();
    if (getLocalStorageObj != null && getLocalStorageObj.client_id != null) {
      return getLocalStorageObj.client_id;
    } else {
      return '';
    }
  } catch (error) {
  }
}
}
