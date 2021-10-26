import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';
import { DataStoreService } from '../../services/data-store.service';
import { AppTokenService } from '../../services/app-token.service';
import { globals } from '../../utilities/globals';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService,
    private _router: Router,
    private _appTokenService: AppTokenService,
    private _dataStore: DataStoreService,
    private _globals: globals) {

  }

  private urlState: string;
  private objAcessPermission: any;
  private accessibleMenus: any = [];
  private menuLabel: string;
  private menuAccess: any = {};
  subjectLabel = new BehaviorSubject<any>('Title');
  subjectIconLabel = new BehaviorSubject<any>('iconLabel');
  subjectIconLabelFromUrl: any = {};
  public componentAccessLevel: any = {};
  menuObject: any = {};

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    try {
      this.urlState = state.url;
      this.urlState = this.urlState.replace('/', '');
      let allowRouting = false;
      let checkfordata;

      // checking authorizedMenuJSON is availability
      if (this._dataStore.authorizedMenuJSON === undefined) { // authorizedMenuJSON not available yet

        // waiting for data by running a timer
          checkfordata = setInterval(() => {
          if (this._dataStore.authorizedMenuJSON !== undefined) {
            this._router.navigate([state.url.split('?')[0]],{ queryParams: next.queryParams });
            clearInterval(checkfordata);
            // console.log('set interval...');
          }
        }, 1000);

      } else if (this._dataStore.authorizedMenuJSON.length < 1) {
        this._router.navigate(['/login']);
      } else { // authorizedMenuJSON is available
        allowRouting = this.checkRoutable(this.urlState);
        if (allowRouting) {
          clearInterval(checkfordata);
          return true;
        } else {
          clearInterval(checkfordata);
          this._router.navigate(['/un-authorized']);
          return false;
        }
      }

    } catch (error) {
      console.log(error);
      this._router.navigate(['/un-authorized']);
      return false;
    }
  }

  // Method to check allowed routes.
  checkRoutable(routeURL) {
    let isURLMatched: boolean = false;
    this.accessibleMenus = this._dataStore.authorizedMenuJSON;
    for (let i = 0; i < this.accessibleMenus.length; i++) {
      const menu = this.accessibleMenus[i];

      if (menu.hasOwnProperty('url') && routeURL === menu['url'] && menu['accessLevel']['view']) {
        isURLMatched = true;
        this.setMenuData(menu);
        break;
      } else if (menu.hasOwnProperty('reference') && menu['reference'] === 'dashboard' ||
        menu.hasOwnProperty('ticket') && (menu['ticket'] === 'gateways' || menu['ticket'] === 'alarmEvents' || menu['ticket'] === 'assetControl' || menu['ticket'] === 'alarmConfigurations')) {
          // introduce reference for channel menu.json
        if (routeURL.includes(menu['url'])&& menu['accessLevel']['view']) {
          isURLMatched = true;
          this.setMenuData(menu);
          break;
        }
      }
    }
    return isURLMatched;
  }

  setMenuData(menu) {

    // menu labels
    this.menuLabel = menu['name'];
    this.subjectLabel.next(this.menuLabel);
    this._globals.setTitle(this.menuLabel + ' - ' + this._globals._appConfigurations['title']);

    // menu labels + icons
    this.subjectIconLabelFromUrl = {
      icon: menu['icon'],
      label: menu['name'],
    };
    this.subjectIconLabel.next(this.subjectIconLabelFromUrl);

    // menu access
    this.menuAccess = menu['accessLevel'];

    // full menu
    this.menuObject = menu;
  }

  // Method to get Labels (names) of the Page.
  getMenuLabel() {
    return this.subjectLabel.asObservable();
  }

  // Method to get Labels (names) of the Page.
  getMenuIconAndLabel() {
    return this.subjectIconLabel.asObservable();
  }

  // Method to get Labels (names) of the Page by passing URL.
  getMenuIconAndLabelUrl(url) {
    if (this.checkRoutable(url)) {
      return this.subjectIconLabelFromUrl;
    }
  }

  // Method to get access of the Page.
  public get getMenuAccessLevel() {
    return this.menuAccess;
  }

  // Method to get access of the Page.
  public get getMenuObject() {
    return this.menuObject;
  }

  public allowAccess(accessType: string) {
    return this.callService('', accessType);
  }

  public allowAccessComponent(compName: string, accessType = '') {
    return this.callServiceComponent(compName, accessType);
  }

  // Method to get Access for a component without routing
  public getComponentAccess(id: number, ticket: string, accessKey: string) {
    const accessibleMenus = this._appTokenService.jsonMenus;
    for (let i = 0; i < accessibleMenus.length; i++) {
      const menu = accessibleMenus[i];
      if (menu['id'] === id && menu['ticket'] === ticket) {
        if (accessKey) {
          return menu['accessLevel'][accessKey]
        } else {
          return menu['accessLevel'];
        }
      }
    }
  }

  accessObjectAll() {
    try {
      // this.objAcessPermission = this._authService.decryptUserDetails();
      this.objAcessPermission = this._appTokenService.userInfo_Permissions;
      const userRolePermissions = this.objAcessPermission['userRolePermissions'];
      if (userRolePermissions.length > 0) {
        return userRolePermissions;
      }
    } catch (error) {
      return false;
    }
  }

  private callService(compName: String, accessType: string) {
    try {
      this.objAcessPermission = this._appTokenService.userInfo_Permissions;
      const userRolePermissions = this.objAcessPermission['userRolePermissions'];
      if (accessType === '' || accessType === undefined) {
        return this.getMenuAccessLevel;
      } else {
        return this.getMenuAccessLevel[accessType];
      }
      // this.isNotAvailable = false;
      // if (this.objAcessPermission.isSuperUser || this.objAcessPermission.userRolePermissions[0] === '') {
      //   return this.getMenuAccessLevel;
      // } else if (this.objAcessPermission.userRolePermissions.length > 0) {
      //   return this.getMenuAccessLevel;
      // }
      // else if (this.objAcessPermission.userRolePermissions != null) {
      //   // tslint:disable-next-line: forin
      //   for (const key in this.objAcessPermission.userRolePermissions) {
      //     const input = this.objAcessPermission.userRolePermissions[key];
      //     if (input.url === this.urlState || key === compName) {
      //       if (accessType !== '') {
      //         return input[accessType];
      //       }
      //       return input;
      //     }
      //   }
      // }
      // this.isNotAvailable = true;
      // return false;
    } catch (error) {
      return false;
    }

  }

  private callServiceComponent(compName: String, accessType: string) {
    try {

      this.objAcessPermission = this._appTokenService.userInfo_Permissions;
      const userRolePermissions = this.objAcessPermission['userRolePermissions'];
      if (compName === undefined || compName === '') {
        console.log('Incorrect parameter..');
      } else {
        for (let i = 0; i < userRolePermissions.length; i++) {
          const element = userRolePermissions[i];
          if (element['ticket'] === compName) {
            if (accessType === undefined || accessType === '') {
              return element['accessLevel'];
            } else {
              return element['accessLevel'][accessType];
            }
          }
        }
      }
    } catch (error) {
      return false;
    }

  }

  accessUserObject() {
    try {
      // this.objAcessPermission = this._authService.decryptUserDetails();
      this.objAcessPermission = this._appTokenService.userInfo_Permissions;
      if (this.objAcessPermission != null) {
        return this.objAcessPermission;
      }
    } catch (error) {
      return false;
    }
  }
}
