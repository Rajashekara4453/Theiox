import { Injectable } from '@angular/core';
import { AuthService } from '../pages/auth/auth.service';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DataStoreService } from './data-store.service';
import { UtilityFunctions } from '../utilities/utility-func';

@Injectable({
  providedIn: 'root'
})
export class AccessMenuService {
  constructor(
    private _authService: AuthService,
    public _route: Router,
    private _dataStore: DataStoreService,
    private _utility: UtilityFunctions
  ) {}

  jsonMenus: any = [];
  userPermissions: any;
  isSystemAdmin: boolean = false;
  isSuperUser: boolean = false;
  isJSONReady: boolean = false;
  userInfo_Permissions: any;
  defaultRoute = '/dashboard';

  landOnIndex = 0;

  // Method to get user specific permissions
  getUserPermissions() {
    try {
      const userDetails = this._authService.decryptUserDetails();
      this.userPermissions = userDetails['userRolePermissions'];
      this.isSuperUser = userDetails['isSuperUser'];
      return true;
    } catch (error) {
      console.log(error);
    }
  }

  // Method to get static menu JSON and further process it based on system admin Login and user login.
  processJSON(routeTo?): Observable<any> {
    const subject = new BehaviorSubject<any>('default');
    if (this._dataStore.isSystemAdmin) {
      return this.filterJSONForSALogin(routeTo);
    } else if (this._dataStore.isSuperUser) {
      return this.filterJSONForSuperUser(routeTo);
    } else {
      this.jsonMenus = this._dataStore.authorizedMenuJSON;
      const storeLocalStorage$: Observable<any> = this.storeLocalStorage(
        this._dataStore.userInfo,
        this.jsonMenus
      );
      storeLocalStorage$.subscribe((response) => {
        if (response) {
          return this.landingPage(routeTo);
        }
      });
      // }
    }
    return subject.asObservable();
  }

  // Method to give all access to SALogin in static menu JSON
  filterJSONForSALogin(routeTo) {
    try {
      const subject = new BehaviorSubject('default');
      this.jsonMenus = this._dataStore.authorizedMenuJSON;
      for (let i = 0; i < this.jsonMenus.length; i++) {
        const menu = this.jsonMenus[i];
        const accessKeys = this.jsonMenus[i]['accessLevel'];
        if (
          menu.hasOwnProperty('isAccessOnlyAdmin') &&
          menu.hasOwnProperty('isShowLeftSideBar') &&
          menu['isAccessOnlyAdmin']
        ) {
          menu['isShowLeftSideBar'] = true;
        }
        Object.keys(accessKeys).forEach((v) => (accessKeys[v] = true));
      }
      const storeLocalStorage$: Observable<any> = this.storeLocalStorage(
        this._dataStore.userInfo,
        this.jsonMenus
      );
      storeLocalStorage$.subscribe((response) => {
        if (response) {
          return this.landingPage(routeTo);
        }
      });
      return subject.asObservable();
    } catch (error) {
      console.log(error);
    }
  }

  // Method to give all access to Super User in static menu JSON except those menus with isAccessOnlyAdmin = true
  filterJSONForSuperUser(routeTo) {
    try {
      const subject = new BehaviorSubject('default');
      this.jsonMenus = this._dataStore.authorizedMenuJSON;
      for (let i = 0; i < this.jsonMenus.length; i++) {
        const menu = this.jsonMenus[i];
        const accessKeys = this.jsonMenus[i]['accessLevel'];
        if (
          menu.hasOwnProperty('isAccessOnlyAdmin') &&
          menu['isAccessOnlyAdmin']
        ) {
          Object.keys(accessKeys).forEach((v) => (accessKeys[v] = false));
        } else {
          Object.keys(accessKeys).forEach((v) => (accessKeys[v] = true));
          menu['isShowLeftSideBar'] = true;
        }
      }
      const storeLocalStorage$: Observable<any> = this.storeLocalStorage(
        this._dataStore.userInfo,
        this.jsonMenus
      );
      storeLocalStorage$.subscribe((response) => {
        if (response) {
          return this.landingPage(routeTo);
        }
      });
      return subject.asObservable();
    } catch (error) {
      console.log(error);
    }
  }
  // Storing user data in local storage.
  storeLocalStorage(userData, userRole) {
    userData['userRolePermissions'] = userRole;
    this.userInfo_Permissions = userData;
    const encryptedUserObj = this._utility.encryptIntially(userData);
    localStorage.setItem('userDetails', encryptedUserObj);
    return of(true);
  }

  // Method to filter the objects based on the user permissions (access)
  filterJSONBasedOnAccess(routeTo) {
    try {
      for (let i = 0; i < this.jsonMenus.length; i++) {
        const menu = this.jsonMenus[i];
        for (const accessTicket in this.userPermissions) {
          if (
            menu.hasOwnProperty('ticket') &&
            menu['ticket'] === accessTicket
          ) {
            menu['isTicketFound'] = true;
            const accessKeysObject = this.userPermissions[accessTicket];
            if (accessKeysObject['view']) {
              for (const key in accessKeysObject) {
                if (accessKeysObject.hasOwnProperty(key)) {
                  const element = accessKeysObject[key];
                  if (
                    menu['accessLevel'].hasOwnProperty(key) &&
                    menu['accessLevel'][key] !== 'name' &&
                    menu['accessLevel'][key] !== 'id' &&
                    menu['accessLevel'][key] !== 'url'
                  ) {
                    menu['accessLevel'][key] = element;
                    if (accessKeysObject.hasOwnProperty('count')) {
                      menu['accessLevel']['count'] = accessKeysObject['count'];
                    }
                  }
                }
              }
              break;
            } else if (!accessKeysObject['view']) {
              this.jsonMenus.splice(i, 1);
              if (i !== 0) {
                i = i - 1;
              } else {
                i = -1;
              }
              break;
            }
          } else {
            menu['isTicketFound'] = false;
          }
        }
        if (menu.hasOwnProperty('ticket')) {
          if (
            menu.hasOwnProperty('isTicketFound') &&
            menu['ticket'] !== 'default' &&
            !menu['isTicketFound']
          ) {
            this.jsonMenus.splice(i, 1);
            if (i !== 0) {
              i = i - 1;
            } else {
              i = -1;
            }
          } else if (menu['ticket'] === 'default') {
            Object.keys(menu['accessLevel']).forEach(
              (v) => (menu['accessLevel'][v] = true)
            );
          }
        }
      }
      this.isJSONReady = true;
      if (routeTo !== undefined) {
        this._route.navigate([routeTo]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /* Method to land on first available page to view for the user. */
  landingPage(routeTo?) {
    const subject = new BehaviorSubject('default');

    this.isJSONReady = true;
    if (routeTo !== undefined) {
      this._route.navigate([routeTo]);
    } else {
      // this._route.navigate([this.defaultRoute]);
      if (
        this.jsonMenus[this.landOnIndex].hasOwnProperty('accessLevel') &&
        this.jsonMenus[this.landOnIndex]['accessLevel']['view'] &&
        this.jsonMenus[this.landOnIndex].hasOwnProperty('url') &&
        this.jsonMenus[this.landOnIndex]['url'] !== ''
      ) {
        this._route.navigate([this.jsonMenus[this.landOnIndex]['url']]);
        this.landOnIndex = 0;
      } else {
        this.landOnIndex++;
        this.landingPage(routeTo);
      }
    }
    return subject.next('jsonReady');
  }
}
